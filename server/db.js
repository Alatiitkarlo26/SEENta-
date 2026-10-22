import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FOUND_POSTS_FILE = path.join(DATA_DIR, 'found_posts.json');
const LOST_REPORTS_FILE = path.join(DATA_DIR, 'lost_reports.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

import dns from 'dns';
import { Agent, fetch as undiciFetch } from 'undici';
import dotenv from 'dotenv';
dotenv.config();

// Resilient undici Agent to ensure reliable connection to Supabase cloud endpoints
const resilientAgent = new Agent({
  connect: {
    lookup: (hostname, opts, cb) => {
      if (hostname.includes('supabase.co')) {
        return cb(null, [{ address: '104.18.42.230', family: 4 }]);
      }
      dns.lookup(hostname, opts, (err, address, family) => {
        if (err) return cb(err);
        cb(null, [{ address, family }]);
      });
    }
  }
});

const resilientFetch = (url, options = {}) => {
  return undiciFetch(url, { ...options, dispatcher: resilientAgent });
};

// Initialize Supabase client if configured
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      global: { fetch: resilientFetch }
    });
    console.log('[Database Driver] ☁️ Connected to SUPABASE Cloud Database!');
    console.log(`[Database Driver] Supabase URL: ${supabaseUrl}`);
  } catch (err) {
    console.warn('[Database Driver] Supabase client init failed, falling back to local file:', err.message);
  }
} else {
  console.log('[Database Driver] 📁 Using local server/data/users.json (Add SUPABASE_URL to .env to use cloud)');
}

async function ensureLocalDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const files = [
      { path: USERS_FILE, defaultContent: [] },
      { path: FOUND_POSTS_FILE, defaultContent: [] },
      { path: LOST_REPORTS_FILE, defaultContent: [] },
      { path: NOTIFICATIONS_FILE, defaultContent: [] }
    ];
    for (const f of files) {
      try {
        await fs.access(f.path);
      } catch {
        await fs.writeFile(f.path, JSON.stringify(f.defaultContent, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Local database initialization error:', err.message);
  }
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id,
    fullName: user.fullName || user.full_name || `${user.last_name || ''}, ${user.first_name || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
    full_name: user.full_name || user.fullName || '',
    firstName: user.firstName || user.first_name || '',
    first_name: user.first_name || user.firstName || '',
    lastName: user.lastName || user.last_name || '',
    last_name: user.last_name || user.lastName || '',
    email: (user.email || '').trim().toLowerCase(),
    studentId: user.studentId || user.student_id || '',
    student_id: user.student_id || user.studentId || '',
    contactNumber: user.contactNumber || user.contact_number || '',
    contact_number: user.contact_number || user.contactNumber || '',
    password: user.password,
    role: user.role || 'student',
    roleTitle: user.roleTitle || user.role_title || (user.role === 'admin' ? 'Campus Security Staff' : user.role === 'faculty' ? 'Faculty / Professor' : 'PUP Student'),
    role_title: user.role_title || user.roleTitle || (user.role === 'admin' ? 'Campus Security Staff' : user.role === 'faculty' ? 'Faculty / Professor' : 'PUP Student'),
    isVerified: user.isVerified ?? user.is_verified ?? true,
    is_verified: user.is_verified ?? user.isVerified ?? true,
    createdAt: user.createdAt || user.created_at || new Date().toISOString()
  };
}

async function readLocalJson(filePath, defaultVal = []) {
  try {
    await ensureLocalDataFile();
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content || JSON.stringify(defaultVal));
  } catch {
    return defaultVal;
  }
}

async function writeLocalJson(filePath, data) {
  await ensureLocalDataFile();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function uploadBase64ToStorage(input, folder = 'found', id = Date.now()) {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Already stored in our Supabase bucket
  if (input.includes('/storage/v1/object/public/item-photos/')) {
    return input;
  }

  if (!supabase) {
    return input; // In local mode without cloud
  }

  try {
    let buffer;
    let ext = 'jpg';
    let contentType = 'image/jpeg';

    if (input.startsWith('data:image/')) {
      const match = input.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) return input;
      const sub = match[1].toLowerCase().replace('jpeg', 'jpg');
      ext = sub === 'png' ? 'png' : sub === 'webp' ? 'webp' : 'jpg';
      contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      buffer = Buffer.from(match[2], 'base64');
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      const resp = await fetch(input);
      if (!resp.ok) return input;
      const cType = resp.headers.get('content-type') || 'image/jpeg';
      if (cType.includes('png')) ext = 'png';
      else if (cType.includes('webp')) ext = 'webp';
      else ext = 'jpg';
      contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const ab = await resp.arrayBuffer();
      buffer = Buffer.from(ab);
    } else {
      return input;
    }

    const fileName = `${folder}/${id}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('item-photos').upload(fileName, buffer, {
      contentType,
      upsert: true
    });

    if (uploadErr) {
      console.error('[Supabase Storage] Upload error:', uploadErr.message);
      return input;
    }

    const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(fileName);
    console.log(`[Supabase Storage] 📁 Image stored in bucket "item-photos"! URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error('[Supabase Storage] Error converting image to bucket:', err.message);
    return input;
  }
}

function calculateItemMatchScore(foundItem, lostItem) {
  if (!foundItem || !lostItem) return 0;
  // Category match is mandatory
  if (
    !foundItem.category ||
    !lostItem.category ||
    foundItem.category.trim().toLowerCase() !== lostItem.category.trim().toLowerCase()
  ) {
    return 0;
  }

  let score = 40; // exact category match

  const stopWords = new Set(['a', 'an', 'the', 'my', 'in', 'on', 'at', 'for', 'with', 'and', 'or', 'lost', 'found', 'pup', 'binan', 'item']);
  const extractTokens = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  };

  const tokensA = extractTokens(foundItem.item_name || foundItem.name);
  const tokensB = extractTokens(lostItem.item_name || lostItem.name);
  const commonTokens = tokensA.filter((t) => tokensB.includes(t));
  if (commonTokens.length > 0) {
    score += Math.min(30, commonTokens.length * 15);
  }

  // Color overlap
  if (foundItem.color && lostItem.color) {
    const cA = foundItem.color.trim().toLowerCase();
    const cB = lostItem.color.trim().toLowerCase();
    if (cA === cB || cA.includes(cB) || cB.includes(cA)) {
      score += 15;
    }
  }

  // Location overlap
  const locA = (foundItem.location_found || '').toLowerCase();
  const locB = (lostItem.last_known_location || '').toLowerCase();
  if (locA && locB) {
    const locTokensA = extractTokens(locA);
    const locTokensB = extractTokens(locB);
    const locOverlap = locTokensA.filter((t) => locTokensB.includes(t));
    if (locOverlap.length > 0 || locA.includes(locB) || locB.includes(locA)) {
      score += 15;
    }
  }

  return score;
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
        return (data || []).map(normalizeUser);
      } catch (err) {
        console.error('[Supabase Error] getUsers failed:', err.message);
      }
    }

    // Local file fallback
    await ensureLocalDataFile();
    try {
      const content = await fs.readFile(USERS_FILE, 'utf-8');
      const list = JSON.parse(content || '[]');
      return list.map(normalizeUser);
    } catch (err) {
      console.error('Failed to read users.json:', err.message);
      return [];
    }
  },

  async saveUsers(users) {
    await ensureLocalDataFile();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return users.map(normalizeUser);
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
        return normalizeUser(data);
      } catch (err) {
        console.error('[Supabase Error] findUserByEmail failed:', err.message);
      }
    }

    const users = await this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
    return normalizeUser(found);
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
        return normalizeUser(data);
      } catch (err) {
        console.error('[Supabase Error] findUserById failed:', err.message);
      }
    }

    const users = await this.getUsers();
    const found = users.find((u) => u.id === id) || null;
    return normalizeUser(found);
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
  },

  // =========================================================================
  // FOUND ITEM POSTS OPERATIONS (FR-SEEN-0003, UC-003)
  // =========================================================================
  async getFoundPosts(filters = {}) {
    const { category, search, status, finderId } = filters;

    if (supabase) {
      try {
        let query = supabase
          .from('found_item_posts')
          .select('*, finder:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id), photos:post_photos(*)')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }
        if (category && category !== 'All') {
          query = query.ilike('category', category);
        }
        if (finderId) {
          query = query.eq('finder_id', finderId);
        }
        if (search) {
          query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,location_found.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((post) => ({
          ...post,
          photos: (post.photos || []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        }));
      } catch (err) {
        console.error('[Supabase Error] getFoundPosts failed:', err.message);
      }
    }

    // Local fallback
    const posts = await readLocalJson(FOUND_POSTS_FILE);
    const users = await this.getUsers();
    let filtered = posts.map((post) => {
      const finder = users.find((u) => u.id === post.finder_id) || null;
      return {
        ...post,
        finder: finder ? {
          id: finder.id,
          full_name: finder.full_name,
          email: finder.email,
          role: finder.role,
          role_title: finder.role_title,
          student_id: finder.student_id,
          contact_number: finder.contact_number
        } : null,
        photos: post.photos || []
      };
    });

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (finderId) {
      filtered = filtered.filter((p) => p.finder_id === finderId);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.item_name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.location_found?.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getFoundPostById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('found_item_posts')
          .select('*, finder:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id), photos:post_photos(*)')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return {
          ...data,
          photos: (data.photos || []).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        };
      } catch (err) {
        console.error('[Supabase Error] getFoundPostById failed:', err.message);
      }
    }

    const posts = await this.getFoundPosts();
    return posts.find((p) => p.id === id) || null;
  },

  async createFoundPost(postData, photoUrls = []) {
    const postId = 'found_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newPost = {
      id: postId,
      finder_id: postData.finder_id || postData.finderId,
      item_name: (postData.item_name || postData.itemName || '').trim(),
      category: postData.category || 'General Items',
      description: (postData.description || '').trim(),
      color: (postData.color || '').trim(),
      size: (postData.size || '').trim(),
      location_found: (postData.location_found || postData.locationFound || '').trim(),
      date_found: postData.date_found || postData.dateFound || new Date().toISOString().split('T')[0],
      time_found: postData.time_found || postData.timeFound || null,
      condition: postData.condition || 'Good',
      status: 'AvailableForClaim',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const photos = [];
    for (let idx = 0; idx < (photoUrls || []).length; idx++) {
      const storedUrl = await uploadBase64ToStorage(photoUrls[idx], 'found', `${postId}_${idx}`);
      photos.push({
        id: 'photo_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
        post_id: postId,
        photo_url: storedUrl,
        is_primary: idx === 0,
        created_at: new Date().toISOString()
      });
    }

    if (supabase) {
      try {
        const { data: insertedPost, error: postErr } = await supabase
          .from('found_item_posts')
          .insert([newPost])
          .select('*, finder:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id)')
          .single();
        if (postErr) throw postErr;

        if (photos.length > 0) {
          const { error: photoErr } = await supabase.from('post_photos').insert(photos);
          if (photoErr) console.error('[Supabase Error] Photo insert error:', photoErr.message);
        }

        // Trigger Automated Matching Engine (SYS-SEEN-0002)
        await this.runMatchingEngineForFoundPost(insertedPost);

        return { ...insertedPost, photos };
      } catch (err) {
        console.error('[Supabase Error] createFoundPost failed:', err.message);
        throw new Error(`Failed to create found post in database: ${err.message}`);
      }
    }

    // Local fallback
    const posts = await readLocalJson(FOUND_POSTS_FILE);
    const postWithPhotos = { ...newPost, photos };
    posts.unshift(postWithPhotos);
    await writeLocalJson(FOUND_POSTS_FILE, posts);

    await this.runMatchingEngineForFoundPost(postWithPhotos);
    return postWithPhotos;
  },

  async updateFoundPostStatus(id, status) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('found_item_posts')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] updateFoundPostStatus failed:', err.message);
        throw err;
      }
    }

    const posts = await readLocalJson(FOUND_POSTS_FILE);
    const idx = posts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      posts[idx].status = status;
      posts[idx].updated_at = new Date().toISOString();
      await writeLocalJson(FOUND_POSTS_FILE, posts);
      return posts[idx];
    }
    return null;
  },

  // =========================================================================
  // LOST ITEM REPORTS OPERATIONS (FR-SEEN-0002, UC-002)
  // =========================================================================
  async getLostReports(filters = {}) {
    const { category, search, status, userId } = filters;

    if (supabase) {
      try {
        let query = supabase
          .from('lost_item_reports')
          .select('*, reporter:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id)')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }
        if (category && category !== 'All') {
          query = query.ilike('category', category);
        }
        if (userId) {
          query = query.eq('user_id', userId);
        }
        if (search) {
          query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,last_known_location.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('[Supabase Error] getLostReports failed:', err.message);
      }
    }

    // Local fallback
    const reports = await readLocalJson(LOST_REPORTS_FILE);
    const users = await this.getUsers();
    let filtered = reports.map((report) => {
      const reporter = users.find((u) => u.id === report.user_id) || null;
      return {
        ...report,
        reporter: reporter ? {
          id: reporter.id,
          full_name: reporter.full_name,
          email: reporter.email,
          role: reporter.role,
          role_title: reporter.role_title,
          student_id: reporter.student_id,
          contact_number: reporter.contact_number
        } : null
      };
    });

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((r) => r.category?.toLowerCase() === category.toLowerCase());
    }
    if (userId) {
      filtered = filtered.filter((r) => r.user_id === userId);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.item_name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.last_known_location?.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getLostReportById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lost_item_reports')
          .select('*, reporter:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id)')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] getLostReportById failed:', err.message);
      }
    }

    const reports = await this.getLostReports();
    return reports.find((r) => r.id === id) || null;
  },

  async createLostReport(reportData) {
    const reportId = 'lost_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    let processedPhotoUrl = reportData.photo_url || reportData.photoUrl || null;
    if (processedPhotoUrl && processedPhotoUrl.startsWith('data:image/')) {
      processedPhotoUrl = await uploadBase64ToStorage(processedPhotoUrl, 'lost', `${reportId}_ref`);
    }

    const newReport = {
      id: reportId,
      user_id: reportData.user_id || reportData.userId,
      item_name: (reportData.item_name || reportData.itemName || '').trim(),
      category: reportData.category || 'General Items',
      description: (reportData.description || '').trim(),
      color: (reportData.color || '').trim(),
      size: (reportData.size || '').trim(),
      last_known_location: (reportData.last_known_location || reportData.lastKnownLocation || '').trim(),
      date_lost: reportData.date_lost || reportData.dateLost || new Date().toISOString().split('T')[0],
      photo_url: processedPhotoUrl,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data: insertedReport, error } = await supabase
          .from('lost_item_reports')
          .insert([newReport])
          .select('*, reporter:users(id, full_name, first_name, last_name, email, role, role_title, contact_number, student_id)')
          .single();
        if (error) throw error;

        // Trigger Automated Matching Engine (SYS-SEEN-0002)
        await this.runMatchingEngineForLostReport(insertedReport);

        return insertedReport;
      } catch (err) {
        console.error('[Supabase Error] createLostReport failed:', err.message);
        throw new Error(`Failed to create lost item report in database: ${err.message}`);
      }
    }

    // Local fallback
    const reports = await readLocalJson(LOST_REPORTS_FILE);
    reports.unshift(newReport);
    await writeLocalJson(LOST_REPORTS_FILE, reports);

    await this.runMatchingEngineForLostReport(newReport);
    return newReport;
  },

  async updateLostReportStatus(id, status) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('lost_item_reports')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] updateLostReportStatus failed:', err.message);
      }
    }

    const reports = await readLocalJson(LOST_REPORTS_FILE);
    const idx = reports.findIndex((r) => r.id === id);
    if (idx !== -1) {
      reports[idx].status = status;
      await writeLocalJson(LOST_REPORTS_FILE, reports);
      return reports[idx];
    }
    return null;
  },

  // =========================================================================
  // AUTOMATED MATCHING ENGINE (SYS-SEEN-0002)
  // =========================================================================
  async runMatchingEngineForFoundPost(foundPost) {
    try {
      // Find active lost reports with matching category
      const activeLostReports = await this.getLostReports({ status: 'Active' });
      for (const lostReport of activeLostReports) {
        if (lostReport.user_id === foundPost.finder_id) continue; // Don't match self

        const score = calculateItemMatchScore(foundPost, lostReport);
        if (score >= 40) {
          console.log(`[Matching Engine] 🎯 Match found! Found: "${foundPost.item_name}" <=> Lost: "${lostReport.item_name}" (Score: ${score})`);

          // 1. Alert the owner of the lost report
          await this.createNotification({
            userId: lostReport.user_id,
            title: `Potential Match: ${foundPost.item_name}`,
            message: `A found item "${foundPost.item_name}" at "${foundPost.location_found}" matches your lost item report for "${lostReport.item_name}". Review details on SEENta!`,
            type: 'MATCH',
            referenceId: foundPost.id
          });

          // 2. Alert the finder of the found post
          await this.createNotification({
            userId: foundPost.finder_id,
            title: `Matching Lost Report: ${lostReport.item_name}`,
            message: `Your found item "${foundPost.item_name}" matches an active missing item report for "${lostReport.item_name}". The student has been alerted.`,
            type: 'MATCH',
            referenceId: lostReport.id
          });

          // 3. Update lost report status to 'Matched'
          await this.updateLostReportStatus(lostReport.id, 'Matched');
        }
      }
    } catch (err) {
      console.error('[Matching Engine Error in runMatchingEngineForFoundPost]:', err.message);
    }
  },

  async runMatchingEngineForLostReport(lostReport) {
    try {
      // Find available found posts
      const availableFoundPosts = await this.getFoundPosts({ status: 'AvailableForClaim' });
      for (const foundPost of availableFoundPosts) {
        if (foundPost.finder_id === lostReport.user_id) continue; // Don't match self

        const score = calculateItemMatchScore(foundPost, lostReport);
        if (score >= 40) {
          console.log(`[Matching Engine] 🎯 Match found! Lost: "${lostReport.item_name}" <=> Found: "${foundPost.item_name}" (Score: ${score})`);

          // 1. Alert the reporter of the lost report
          await this.createNotification({
            userId: lostReport.user_id,
            title: `Match Discovered: ${foundPost.item_name}`,
            message: `An item matching "${lostReport.item_name}" was found at "${foundPost.location_found}". Review the post to initiate a claim!`,
            type: 'MATCH',
            referenceId: foundPost.id
          });

          // 2. Alert the finder
          await this.createNotification({
            userId: foundPost.finder_id,
            title: `Matching Missing Item Report Filed`,
            message: `A new lost report for "${lostReport.item_name}" matches your found post "${foundPost.item_name}".`,
            type: 'MATCH',
            referenceId: lostReport.id
          });

          // 3. Mark lost report as 'Matched'
          await this.updateLostReportStatus(lostReport.id, 'Matched');
        }
      }
    } catch (err) {
      console.error('[Matching Engine Error in runMatchingEngineForLostReport]:', err.message);
    }
  },

  // =========================================================================
  // NOTIFICATIONS OPERATIONS (SYS-SEEN-0002, Dual-Sided Alerts)
  // =========================================================================
  async getNotifications(userId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('[Supabase Error] getNotifications failed:', err.message);
      }
    }

    const notifs = await readLocalJson(NOTIFICATIONS_FILE);
    return notifs
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createNotification(notifData) {
    const notif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: notifData.userId || notifData.user_id,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'MATCH',
      reference_id: notifData.referenceId || notifData.reference_id || null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('notifications').insert([notif]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] createNotification failed:', err.message);
      }
    }

    const notifs = await readLocalJson(NOTIFICATIONS_FILE);
    notifs.unshift(notif);
    await writeLocalJson(NOTIFICATIONS_FILE, notifs);
    return notif;
  },

  async markNotificationRead(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('[Supabase Error] markNotificationRead failed:', err.message);
      }
    }

    const notifs = await readLocalJson(NOTIFICATIONS_FILE);
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      await writeLocalJson(NOTIFICATIONS_FILE, notifs);
      return notifs[idx];
    }
    return null;
  },

  async markAllNotificationsRead(userId) {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('[Supabase Error] markAllNotificationsRead failed:', err.message);
      }
    }

    const notifs = await readLocalJson(NOTIFICATIONS_FILE);
    for (const n of notifs) {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    }
    await writeLocalJson(NOTIFICATIONS_FILE, notifs);
    return { success: true };
  }
};
