import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Initialize Supabase client if configured
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database Driver] ☁️ Connected to SUPABASE Cloud Database!');
  } catch (err) {
    console.warn('[Database Driver] Supabase client init failed, falling back to local file:', err.message);
  }
} else {
  console.log('[Database Driver] 📁 Using local server/data/users.json (Add SUPABASE_URL to .env to use cloud)');
}

async function ensureLocalDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Local database initialization error:', err.message);
  }
}

export const db = {
  isCloud() {
    return !!supabase;
  },

  async getUsers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('[Supabase Error] getUsers failed:', err.message);
      }
    }

    // Local file fallback
    await ensureLocalDataFile();
    try {
      const content = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error('Failed to read users.json:', err.message);
      return [];
    }
  },

  async saveUsers(users) {
    await ensureLocalDataFile();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return users;
  },

  async findUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (error) throw error;
        return data || null;
      } catch (err) {
        console.error('[Supabase Error] findUserByEmail failed:', err.message);
      }
    }

    const users = await this.getUsers();
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        return data || null;
      } catch (err) {
        console.error('[Supabase Error] findUserById failed:', err.message);
      }
    }

    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser(userData) {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check existing
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this university email already exists in the database.');
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      full_name: userData.fullName || `${userData.lastName}, ${userData.firstName}`,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      email: cleanEmail,
      student_id: userData.studentId,
      contact_number: userData.contactNumber,
      password: userData.password,
      role: userData.role || (cleanEmail.endsWith('@pup.edu.ph') ? (cleanEmail.startsWith('security') ? 'admin' : 'faculty') : 'student'),
      role_title: userData.roleTitle || (cleanEmail.endsWith('@pup.edu.ph') ? (cleanEmail.startsWith('security') ? 'Campus Security Staff' : 'Faculty / Professor') : 'PUP Student'),
      is_verified: true,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').insert([newUser]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] createUser failed:', err.message);
        throw new Error(`Cloud database insert failed: ${err.message}`);
      }
    }

    // Local file fallback
    const users = await this.getUsers();
    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  },

  async updateUser(id, updates) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] updateUser failed:', err.message);
        throw new Error(`Cloud database update failed: ${err.message}`);
      }
    }

    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error('User not found.');
    }

    users[index] = { ...users[index], ...updates };
    await this.saveUsers(users);
    return users[index];
  },

  async deleteUser(id) {
    if (supabase) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Supabase Error] deleteUser failed:', err.message);
        throw new Error(`Cloud database delete failed: ${err.message}`);
      }
    }

    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) {
      throw new Error('User not found.');
    }
    await this.saveUsers(filtered);
    return { success: true };
  }
};
