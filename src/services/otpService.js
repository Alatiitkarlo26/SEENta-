/**
 * OTP Service for Project SEENta
 * Dispatches real emails via the backend Nodemailer SMTP service,
 * while maintaining a seamless local fallback.
 */

const STORAGE_KEY = 'seenta_active_otps';
const EMAIL_LOG_KEY = 'seenta_sent_emails';
const API_URL = 'http://localhost:5000/api';

function getStoredOTPs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStoredOTPs(otps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(otps));
  } catch (e) {
    console.error('Failed to save OTP to localStorage', e);
  }
}

function getStoredEmails() {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_LOG_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStoredEmail(emailData) {
  try {
    const list = getStoredEmails();
    list.unshift(emailData);
    localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(list.slice(0, 20)));
  } catch (e) {
    console.error('Failed to save email log', e);
  }
}

export const otpService = {
  /**
   * Check if the real SMTP backend is online and configured
   */
  async checkBackendStatus() {
    try {
      const res = await fetch(`${API_URL}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running or offline
    }
    return { status: 'offline', smtpConfigured: false };
  },

  /**
   * Dispatches OTP. Attempts real SMTP transmission via the backend API,
   * with local simulation fallback.
   */
  async sendOTP(email, recipientName = 'User') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const otps = getStoredOTPs();
    otps[email.toLowerCase()] = {
      code: otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    };
    saveStoredOTPs(otps);

    let isLiveDelivered = false;
    let liveMessage = '';

    // Attempt actual HTTP dispatch to the Node.js mailer backend
    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, recipientName }),
        signal: AbortSignal.timeout(7000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.delivered) {
          isLiveDelivered = true;
          liveMessage = data.message;
        }
      }
    } catch (err) {
      console.warn('Backend mailer unreachable, using local OTP store:', err.message);
    }

    // Save formatted simulation log
    const emailPayload = {
      id: 'msg_' + Date.now(),
      to: email,
      recipientName,
      subject: `[SEENta PUP Biñan] ${otp} is your verification code`,
      otp,
      isLiveDelivered,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 540px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; align-items: center; border-bottom: 2px solid #800000; padding-bottom: 12px; margin-bottom: 16px;">
            <div style="background-color: #800000; color: #ffffff; padding: 6px 12px; font-weight: bold; border-radius: 4px; font-size: 16px;">SEENta</div>
            <div style="margin-left: 12px; font-size: 13px; color: #64748b;">PUP Biñan Campus • Lost & Found System</div>
          </div>
          <p style="font-size: 15px;">Mabuhay, <strong>${recipientName}</strong>!</p>
          <p style="font-size: 14px; line-height: 1.5; color: #334155;">
            You are registering for an account on the <strong>Project SEENta Lost and Found Management System</strong> using your official PUP Webmail.
          </p>
          <div style="text-align: center; margin: 24px 0; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 600;">Your 6-Digit OTP Code</span>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #800000; margin-top: 6px;">${otp}</div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">This code will expire in <strong>5 minutes</strong>. Never share this code with anyone.</p>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
            If you did not request this verification, please ignore this email or contact the PUP Biñan Campus Security Office.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            Politeknikong Unibersidad ng Pilipinas — Sangay ng Biñan • Zapote, Biñan City, Laguna
          </p>
        </div>
      `
    };

    saveStoredEmail(emailPayload);

    return {
      success: true,
      otp,
      expiresAt,
      isLiveDelivered,
      message: isLiveDelivered ? liveMessage : `OTP generated for ${email}`
    };
  },

  async verifyOTP(email, enteredCode) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = enteredCode.trim();

    // 1. Prioritize Server-Side Verification
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode })
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        return { valid: true };
      }
      if (data.error) {
        return { valid: false, error: data.error };
      }
    } catch {
      // Backend unreachable, fallback to client memory
    }

    // 2. Client-side fallback check
    const otps = getStoredOTPs();
    const record = otps[cleanEmail];

    if (!record) {
      return { valid: false, error: 'No OTP requested for this email. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      delete otps[cleanEmail];
      saveStoredOTPs(otps);
      return { valid: false, error: 'OTP has expired. Please click "Resend Code" to receive a new one.' };
    }

    if (record.code !== cleanCode) {
      record.attempts = (record.attempts || 0) + 1;
      saveStoredOTPs(otps);
      if (record.attempts >= 5) {
        delete otps[cleanEmail];
        saveStoredOTPs(otps);
        return { valid: false, error: 'Too many incorrect attempts. Please request a fresh OTP.' };
      }
      return { valid: false, error: `Invalid OTP code. (${5 - record.attempts} attempts remaining)` };
    }

    delete otps[cleanEmail];
    saveStoredOTPs(otps);
    return { valid: true };
  },

  getLatestEmail(email = null) {
    const emails = getStoredEmails();
    if (!email) return emails[0] || null;
    return emails.find((e) => e.to.toLowerCase() === email.toLowerCase()) || emails[0] || null;
  },

  getAllEmails() {
    return getStoredEmails();
  }
};
