import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// -------------------------------------------------------------
// Direct Password Verification (Plain Text Mode)
// -------------------------------------------------------------

function hashPassword(password) {
  return password; // Stored as plain text as requested
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || typeof storedPassword !== 'string') return false;
  // Direct plain text comparison
  if (password === storedPassword) return true;
  // Fallback for legacy hashes during transition
  if (storedPassword.includes(':')) {
    try {
      const [salt, key] = storedPassword.split(':');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }
  return false;
}

// -------------------------------------------------------------
// Server-Side OTP & Rate Limiting Storage
// -------------------------------------------------------------

const activeOTPs = new Map(); // email -> { code, expiresAt, attempts }
const emailRateLimits = new Map(); // email -> [timestamps]

function checkRateLimit(email) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 4;

  const timestamps = (emailRateLimits.get(email) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxAttempts) {
    return false;
  }
  timestamps.push(now);
  emailRateLimits.set(email, timestamps);
  return true;
}

// -------------------------------------------------------------
// Configure Nodemailer Transporter
// -------------------------------------------------------------

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (user && pass) {
    if ((user && user.endsWith('@gmail.com')) || (host && host.includes('gmail'))) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }

    if (
      (host && (host.includes('outlook') || host.includes('office365'))) ||
      (user && (user.endsWith('@pup.edu.ph') || user.endsWith('@iskolarngbayan.pup.edu.ph') || user.endsWith('@outlook.com') || user.endsWith('@hotmail.com')))
    ) {
      return nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass },
        tls: {
          minVersion: 'TLSv1.2',
          ciphers: 'SSLv3'
        }
      });
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: { user, pass }
    });
  }

  return null;
}

// -------------------------------------------------------------
// Database & Authentication Endpoints
// -------------------------------------------------------------

// 1. Get all users (Safe view without passwords)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    const safeUsers = users.map((user) => {
      const { password: _p, ...safe } = user;
      return safe;
    });
    res.json(safeUsers);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// 2. Register a new user into the database
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, fullName, studentId, contactNumber, role, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isStudent = cleanEmail.endsWith('@iskolarngbayan.pup.edu.ph');
    const isFacultyOrSecurity = cleanEmail.endsWith('@pup.edu.ph');

    if (!isStudent && !isFacultyOrSecurity) {
      return res.status(400).json({
        error: 'Registration is restricted strictly to official PUP Webmail accounts (@iskolarngbayan.pup.edu.ph or @pup.edu.ph).'
      });
    }

    // Server-Side OTP verification check if OTP was passed
    if (otp) {
      const record = activeOTPs.get(cleanEmail);
      if (!record || record.code !== otp.trim()) {
        return res.status(400).json({ error: 'Invalid or expired OTP verification code.' });
      }
      activeOTPs.delete(cleanEmail); // Consume OTP upon successful verification
    }

    const secureHash = hashPassword(password);

    const newUser = await db.createUser({
      email: cleanEmail,
      password: secureHash,
      firstName,
      lastName,
      fullName: fullName || `${lastName}, ${firstName}`,
      studentId,
      contactNumber,
      role
    });

    console.log(`[Database] User registered: ${newUser.email} (${newUser.role})`);

    const { password: _p, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('[Registration Error]', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 3. Log in against the database
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({
        error: 'No account registered with this university email.',
        notRegistered: true
      });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        error: 'Incorrect password for this university email.'
      });
    }

    console.log(`[Database] User authenticated: ${user.email} (${user.role})`);

    const { password: _p, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server authentication error.' });
  }
});

// 3b. Check if an email is registered in the database
app.get('/api/auth/check-email', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await db.findUserByEmail(cleanEmail);
    res.json({ exists: !!user, role: user?.role || null });
  } catch (err) {
    console.error('Check email error:', err.message);
    res.status(500).json({ error: 'Failed to verify email existence.' });
  }
});

// 4. Verify OTP on server
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ valid: false, error: 'Email and OTP code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = activeOTPs.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ valid: false, error: 'No OTP code found. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    activeOTPs.delete(cleanEmail);
    return res.status(400).json({ valid: false, error: 'OTP has expired. Please request a fresh code.' });
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      activeOTPs.delete(cleanEmail);
      return res.status(400).json({ valid: false, error: 'Maximum attempts reached. Please request a fresh code.' });
    }
    return res.status(400).json({ valid: false, error: `Invalid code. (${5 - record.attempts} attempts remaining)` });
  }

  // Code is verified
  res.json({ valid: true, message: 'OTP verified successfully.' });
});

// 5. Update a user in the database
app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = hashPassword(updates.password);
    }
    const updated = await db.updateUser(req.params.id, updates);
    const { password: _p, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// 6. Delete a user from the database
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted from database.' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Status & OTP Sending Endpoints
// -------------------------------------------------------------

app.get('/api/status', async (req, res) => {
  const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  const isCloud = db.isCloud();
  const users = await db.getUsers();
  res.json({
    status: 'online',
    database: isCloud ? 'supabase_cloud' : 'local_json',
    databaseLocation: isCloud ? 'Supabase Cloud (PostgreSQL)' : 'server/data/users.json',
    totalUsers: users.length,
    smtpConfigured: isConfigured,
    senderEmail: isConfigured ? process.env.SMTP_USER : 'Not configured (Simulated mode active)',
    host: process.env.SMTP_HOST || 'default'
  });
});

app.post('/api/send-otp', async (req, res) => {
  const { email, otp, recipientName } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Rate Limiting Check
  if (!checkRateLimit(cleanEmail)) {
    return res.status(429).json({
      success: false,
      error: 'Too many OTP requests. Please wait 5 minutes before trying again.'
    });
  }

  // Store OTP on server (5-minute TTL)
  activeOTPs.set(cleanEmail, {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0
  });

  const transporter = createTransporter();

  if (transporter) {
    try {
      // Anti-Spam & Deliverability Optimization for Microsoft Outlook / Office 365:
      // 1. Generic sender name prevents Microsoft Anti-Phishing User Impersonation detection
      const fromSender = process.env.SMTP_FROM || `"SEENta Verification" <${process.env.SMTP_USER}>`;

      // 2. Standard transactional subject line avoids Bayesian bulk filters
      const subject = `Your SEENta verification code is ${otp}`;

      // 3. Complete plain text alternative matching HTML structure
      const textBody = [
        `Mabuhay, ${recipientName || 'Iskolar'}!`,
        '',
        `Your 6-digit verification code for Project SEENta is: ${otp}`,
        '',
        'This code is valid for 5 minutes. Never share this code with anyone.',
        '',
        'If you did not request this registration, please disregard this email or report to the Campus Security Office.',
        '',
        'Politeknikong Unibersidad ng Pilipinas — Sangay ng Biñan',
        'Official Peer-to-Peer Lost & Found Clearinghouse'
      ].join('\n');

      // 4. Outlook Word-rendering engine table-based layout
      const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SEENta Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #800000; padding: 18px 24px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="42" valign="middle">
                    <div style="background-color: #ffffff; color: #800000; font-weight: 900; font-size: 16px; border-radius: 8px; width: 36px; height: 36px; line-height: 36px; text-align: center; font-family: monospace;">
                      ST
                    </div>
                  </td>
                  <td valign="middle" style="padding-left: 12px;">
                    <div style="color: #ffffff; font-size: 16px; font-weight: 800; letter-spacing: 0.5px;">Project SEENta</div>
                    <div style="color: #fef08a; font-size: 11px; font-weight: 500;">PUP Biñan Campus • P2P Lost &amp; Found</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px 20px 24px; text-align: left;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 600;">
                Mabuhay, ${recipientName || 'Iskolar'}!
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                You are verifying your account for the <strong>Project SEENta Peer-to-Peer Lost and Found Management System</strong>. Please enter the single-use verification code below:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px;">
                <tr>
                  <td align="center" style="padding: 20px 16px;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-bottom: 6px;">
                      Single-Use Security Code
                    </div>
                    <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #800000; font-family: 'Courier New', Courier, monospace; padding-left: 10px;">
                      ${otp}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      ⏱️ Valid for <strong>5 minutes</strong> • Single use only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0; background-color: #fef2f2; border-left: 4px solid #800000; border-radius: 4px;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 11px; color: #7f1d1d; line-height: 1.5;">
                    <strong>Security Reminder:</strong> Never share this code with anyone. Campus administrators and security staff will never ask for your code.
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                If you did not request this verification code, please ignore this email or report to the Campus Security Office.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8; line-height: 1.4;">
                Politeknikong Unibersidad ng Pilipinas — Sangay ng Biñan<br/>
                Zapote, Biñan City, Laguna • Official Student Clearinghouse
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from: fromSender,
        replyTo: process.env.SMTP_USER,
        to: cleanEmail,
        subject,
        text: textBody,
        html: htmlBody,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'Auto-Submitted': 'auto-generated',
          'X-Auto-Response-Suppress': 'All',
          'X-Mailer': 'SEENta-Mailer/2.0'
        }
      });

      console.log(`[SMTP Live] Email delivered to: ${cleanEmail} (MessageId: ${info.messageId})`);
      return res.json({
        success: true,
        delivered: true,
        mode: 'live_smtp',
        message: `Real email successfully sent to your Outlook address (${cleanEmail})!`
      });
    } catch (err) {
      console.error('[SMTP Error]', err.message);
      return res.status(500).json({
        success: false,
        error: `SMTP delivery failed: ${err.message}. Please verify your SMTP settings in .env.`
      });
    }
  }

  console.log(`[Simulated Dispatch] OTP for ${cleanEmail} is: ${otp}`);
  return res.json({
    success: true,
    delivered: false,
    mode: 'simulated',
    message: `SMTP not configured in .env yet. Simulated OTP is: ${otp}`
  });
});

// =========================================================================
// FOUND ITEM POSTS ENDPOINTS (FR-SEEN-0003, UC-003)
// =========================================================================

// 1. Get all found item posts (with filters for search, category, status, finderId)
app.get('/api/items/found', async (req, res) => {
  try {
    const { category, search, status, finderId } = req.query;
    const posts = await db.getFoundPosts({ category, search, status, finderId });
    res.json({ success: true, count: posts.length, items: posts });
  } catch (err) {
    console.error('Error fetching found item posts:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve found item posts.' });
  }
});

// 2. Get single found post by ID
app.get('/api/items/found/:id', async (req, res) => {
  try {
    const post = await db.getFoundPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Found item post not found.' });
    }
    res.json({ success: true, item: post });
  } catch (err) {
    console.error('Error fetching found post details:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve post details.' });
  }
});

// 3. Create a new found item post (includes automated matching check)
app.post('/api/items/found', async (req, res) => {
  try {
    const {
      finderId,
      finder_id,
      itemName,
      item_name,
      category,
      description,
      color,
      size,
      locationFound,
      location_found,
      dateFound,
      date_found,
      timeFound,
      time_found,
      condition,
      photoUrls,
      photos
    } = req.body;

    const actualFinderId = finderId || finder_id;
    const actualItemName = itemName || item_name;
    const actualLocation = locationFound || location_found;
    const actualDate = dateFound || date_found;

    if (!actualFinderId || !actualItemName || !category || !actualLocation || !actualDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: finderId, itemName, category, locationFound, and dateFound are mandatory.'
      });
    }

    const postData = {
      finderId: actualFinderId,
      itemName: actualItemName,
      category,
      description,
      color,
      size,
      locationFound: actualLocation,
      dateFound: actualDate,
      timeFound: timeFound || time_found,
      condition: condition || 'Good'
    };

    const urls = Array.isArray(photoUrls) ? photoUrls : (Array.isArray(photos) ? photos : []);
    const createdPost = await db.createFoundPost(postData, urls);

    res.status(201).json({
      success: true,
      message: 'Found item posted successfully to SEENta campus feed!',
      item: createdPost
    });
  } catch (err) {
    console.error('Error creating found item post:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to create found item post.' });
  }
});

// =========================================================================
// LOST ITEM REPORTS ENDPOINTS (FR-SEEN-0002, UC-002)
// =========================================================================

// 1. Get all lost item reports (with filters for search, category, status, userId)
app.get('/api/items/lost', async (req, res) => {
  try {
    const { category, search, status, userId } = req.query;
    const reports = await db.getLostReports({ category, search, status, userId });
    res.json({ success: true, count: reports.length, items: reports });
  } catch (err) {
    console.error('Error fetching lost item reports:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve lost item reports.' });
  }
});

// 2. Get single lost item report by ID
app.get('/api/items/lost/:id', async (req, res) => {
  try {
    const report = await db.getLostReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Lost item report not found.' });
    }
    res.json({ success: true, item: report });
  } catch (err) {
    console.error('Error fetching lost report details:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve report details.' });
  }
});

// 3. Create a new lost item report (includes automated matching check)
app.post('/api/items/lost', async (req, res) => {
  try {
    const {
      userId,
      user_id,
      itemName,
      item_name,
      category,
      description,
      color,
      size,
      lastKnownLocation,
      last_known_location,
      dateLost,
      date_lost,
      photoUrl,
      photo_url
    } = req.body;

    const actualUserId = userId || user_id;
    const actualItemName = itemName || item_name;
    const actualLocation = lastKnownLocation || last_known_location;
    const actualDate = dateLost || date_lost;

    if (!actualUserId || !actualItemName || !category || !actualLocation || !actualDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, itemName, category, lastKnownLocation, and dateLost are mandatory.'
      });
    }

    const reportData = {
      userId: actualUserId,
      itemName: actualItemName,
      category,
      description,
      color,
      size,
      lastKnownLocation: actualLocation,
      dateLost: actualDate,
      photoUrl: photoUrl || photo_url
    };

    const createdReport = await db.createLostReport(reportData);

    res.status(201).json({
      success: true,
      message: 'Missing item report filed successfully on SEENta!',
      item: createdReport
    });
  } catch (err) {
    console.error('Error filing lost item report:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to file lost item report.' });
  }
});

// =========================================================================
// NOTIFICATIONS ENDPOINTS (SYS-SEEN-0002, Dual-Sided In-App Alerts)
// =========================================================================

// 1. Get user notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Query parameter userId is required.' });
    }
    const notifs = await db.getNotifications(userId);
    res.json({ success: true, count: notifs.length, notifications: notifs });
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
});

// 2. Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const updated = await db.markNotificationRead(req.params.id);
    res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Error marking notification read:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
});

// 3. Mark all notifications as read for a user
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Field userId is required.' });
    }
    await db.markAllNotificationsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications read:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update notifications.' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` SEENta Mailer & DB API listening on port ${PORT}`);
    console.log(` Database: ${db.isCloud() ? 'Supabase Cloud (PostgreSQL)' : 'server/data/users.json'}`);
    console.log(` Password Storage: Plain Text (Direct Store & Verify)`);
    console.log(` OTP Security: Server-side enforced with rate limits`);
    console.log(` Check status at: http://localhost:${PORT}/api/status`);
    console.log(`===============================================`);
  });
}

export default app;
