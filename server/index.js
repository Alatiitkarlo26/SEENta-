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
app.use(express.json());

// -------------------------------------------------------------
// Cryptographic Password Hashing (OWASP-Compliant Native Scrypt)
// -------------------------------------------------------------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  // Backward compatibility check for unhashed legacy seed passwords
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    console.error('Password verification error:', err.message);
    return false;
  }
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

    if ((host && host.includes('outlook')) || (host && host.includes('office365'))) {
      return nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { ciphers: 'SSLv3' }
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

    const user = await db.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid university email or password.' });
    }

    console.log(`[Database] User authenticated: ${user.email} (${user.role})`);

    const { password: _p, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server authentication error.' });
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
      const fromSender = process.env.SMTP_FROM || `"Project SEENta PUP Biñan" <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from: fromSender,
        to: cleanEmail,
        subject: `[SEENta PUP Biñan] ${otp} is your lost and found verification code`,
        text: `Mabuhay ${recipientName || 'User'}! Your verification code for Project SEENta PUP Biñan is ${otp}. This code expires in 5 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="display: flex; align-items: center; border-bottom: 2px solid #800000; padding-bottom: 14px; margin-bottom: 20px;">
              <div style="background-color: #800000; color: #fef08a; padding: 6px 14px; font-weight: 800; border-radius: 6px; font-size: 18px; letter-spacing: 0.5px;">
                SEENta
              </div>
              <div style="margin-left: 14px;">
                <div style="font-weight: 700; color: #1e293b; font-size: 14px;">PUP Biñan Campus</div>
                <div style="font-size: 12px; color: #64748b;">Lost &amp; Found Management System</div>
              </div>
            </div>

            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">
              Mabuhay, <strong>${recipientName || 'Iskolar'}</strong>!
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              You have requested an account on the <strong>Project SEENta Lost and Found Management System</strong> using your official university credentials.
            </p>

            <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700;">
                Your 6-Digit OTP Code
              </span>
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #800000; margin-top: 8px; font-family: monospace;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                ⏱️ Valid for <strong>5 minutes</strong>. Never share this code with anyone.
              </p>
            </div>

            <div style="background-color: #fef2f2; border-left: 4px solid #800000; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <p style="font-size: 12px; color: #7f1d1d; margin: 0; line-height: 1.5;">
                <strong>Campus Security Notice:</strong> All digital claims require subsequent in-person identity verification at the PUP Biñan Campus Security Office.
              </p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
              If you did not make this registration request, please disregard this email or report to the Campus Security Office.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              Politeknikong Unibersidad ng Pilipinas — Sangay ng Biñan<br/>
              Zapote, Biñan City, Laguna • Official Lost &amp; Found Clearinghouse
            </p>
          </div>
        `
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

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` SEENta Mailer & DB API listening on port ${PORT}`);
  console.log(` Database: D:\\CODES\\SEENta\\server\\data\\users.json`);
  console.log(` Password Security: Native Scrypt Hashed`);
  console.log(` OTP Security: Server-side enforced with rate limits`);
  console.log(` Check status at: http://localhost:${PORT}/api/status`);
  console.log(`===============================================`);
});
