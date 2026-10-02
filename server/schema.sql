-- ==============================================================================
-- PROJECT SEENTA: LOST AND FOUND MANAGEMENT SYSTEM (PUP BIÑAN CAMPUS)
-- DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  role_title TEXT NOT NULL DEFAULT 'PUP Student',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOST ITEMS TABLE (Phase 2)
CREATE TABLE IF NOT EXISTS lost_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  last_known_location TEXT NOT NULL,
  date_lost DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Matched', 'Recovered', 'Closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FOUND ITEMS INVENTORY TABLE (Phase 2 - Surrendered to Security)
CREATE TABLE IF NOT EXISTS found_items (
  id TEXT PRIMARY KEY,
  logged_by_user_id TEXT REFERENCES users(id),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Good',
  vault_slot TEXT NOT NULL DEFAULT 'Vault A-01',
  status TEXT NOT NULL DEFAULT 'In Vault', -- 'In Vault', 'Claimed', 'Archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLAIMS TABLE (Phase 3)
CREATE TABLE IF NOT EXISTS claim_requests (
  id TEXT PRIMARY KEY,
  found_item_id TEXT REFERENCES found_items(id) ON DELETE CASCADE,
  claimant_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  proof_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Audit', -- 'Pending Audit', 'Approved for Pickup', 'Handed Over', 'Rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by_officer TEXT
);

-- 5. IMMUTABLE AUDIT TRAIL LOGS TABLE (Phase 3 - SYS-SEEN-0004)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  officer_name TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  item_id TEXT,
  record_hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DEFAULT SEED USERS (PUP Biñan Campus)
-- ==============================================================================
INSERT INTO users (id, full_name, first_name, last_name, email, student_id, contact_number, password, role, role_title)
VALUES 
  (
    'usr_student_01', 
    'Dela Cruz, Juan M.', 
    'Juan', 
    'Dela Cruz', 
    'juan.delacruz@iskolarngbayan.pup.edu.ph', 
    '2024-01452', 
    '09171234567', 
    'password123', 
    'student', 
    'PUP Student'
  ),
  (
    'usr_faculty_01', 
    'Santos, Maria C.', 
    'Maria', 
    'Santos', 
    'maria.santos@pup.edu.ph', 
    'FAC-2018-091', 
    '09189876543', 
    'password123', 
    'faculty', 
    'Faculty / Professor'
  ),
  (
    'usr_admin_01', 
    'Bautista, Renato D.', 
    'Renato', 
    'Bautista', 
    'security.binan@pup.edu.ph', 
    'SEC-2020-004', 
    '09195551234', 
    'admin123', 
    'admin', 
    'Campus Security Staff'
  )
ON CONFLICT (email) DO NOTHING;
