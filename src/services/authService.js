/**
 * Authentication Service for Project SEENta
 * Connects directly to the Backend Database (server/data/users.json via API)
 * with robust local fallback for resilience.
 */

const SESSION_STORAGE_KEY = 'seenta_session';
const API_URL = 'http://localhost:5000/api';

export const authService = {
  /**
   * Strictly validates institutional university domain
   */
  validateUniversityDomain(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, role: null, error: 'Email address is required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const studentDomain = '@iskolarngbayan.pup.edu.ph';
    const facultyDomain = '@pup.edu.ph';

    if (cleanEmail.endsWith(studentDomain)) {
      return {
        isValid: true,
        role: 'student',
        domain: studentDomain,
        roleLabel: 'PUP Student',
        message: 'Valid student institutional account (@iskolarngbayan.pup.edu.ph)'
      };
    }

    if (cleanEmail.endsWith(facultyDomain)) {
      const isAdminAccount = cleanEmail.startsWith('security') || cleanEmail.startsWith('admin');
      return {
        isValid: true,
        role: isAdminAccount ? 'admin' : 'faculty',
        domain: facultyDomain,
        roleLabel: isAdminAccount ? 'Campus Security Staff' : 'Faculty / Professor',
        message: 'Valid university institutional account (@pup.edu.ph)'
      };
    }

    return {
      isValid: false,
      role: null,
      error: 'Registration is restricted strictly to official PUP Webmail accounts (@iskolarngbayan.pup.edu.ph for students or @pup.edu.ph for faculty/staff).'
    };
  },

  validateIdNumber(idNumber) {
    if (!idNumber || idNumber.trim().length < 4) {
      return { isValid: false, error: 'Student or Employee ID must be at least 4 characters.' };
    }
    return { isValid: true };
  },

  validateContactNumber(contactNumber) {
    const clean = (contactNumber || '').replace(/[\s-]/g, '');
    const regex = /^(09|\+639)\d{9}$/;
    if (!regex.test(clean)) {
      return {
        isValid: false,
        error: 'Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).'
      };
    }
    return { isValid: true };
  },

  /**
   * Registers a new user into the Backend Database (server/data/users.json)
   */
  async register(userData) {
    const cleanEmail = userData.email.trim().toLowerCase();
    const domainCheck = this.validateUniversityDomain(cleanEmail);
    if (!domainCheck.isValid) {
      throw new Error(domainCheck.error);
    }

    const payload = {
      email: cleanEmail,
      password: userData.password,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName: userData.fullName || `${userData.lastName}, ${userData.firstName}`,
      studentId: userData.studentId?.trim(),
      contactNumber: userData.contactNumber?.trim(),
      role: userData.role || domainCheck.role
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed on backend server.');
      }

      // Save user session
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Backend registration error:', err.message);
      throw err;
    }
  },

  /**
   * Logs in against the Backend Database (server/data/users.json)
   */
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid university email or password.');
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Backend login error:', err.message);
      throw err;
    }
  },

  /**
   * Fetch all registered users from the backend database
   */
  async getAllUsers() {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Could not fetch users from backend database:', err);
    }
    return [];
  },

  /**
   * Get current authenticated user session from localStorage
   */
  getCurrentUser() {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};
