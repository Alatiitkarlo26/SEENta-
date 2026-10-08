-- ==============================================================================
-- PROJECT SEENTA: LOST AND FOUND MANAGEMENT SYSTEM (PUP BIÑAN CAMPUS)
-- DATABASE SCHEMA FOR SUPABASE (POSTGRESQL) - PEER-TO-PEER (P2P) MODEL
-- ==============================================================================
-- Revision: Versions A-C (October 3-4, 2026)
-- Target: Peer-to-Peer Community Model (Students & Faculty)
-- No admin gatekeepers: Finders, Claimants, and Original Owners coordinate directly.
-- ==============================================================================

-- Enable pgcrypto for UUID and cryptographic hashing support
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
-- Enforces verified institutional email domains (@iskolarngbayan.pup.edu.ph / @pup.edu.ph)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(gen_random_uuid()::text, 1, 12)),
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty')),
  role_title TEXT NOT NULL DEFAULT 'PUP Student',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_pup_email_domain CHECK (
    email LIKE '%@iskolarngbayan.pup.edu.ph' OR email LIKE '%@pup.edu.ph'
  )
);

-- ------------------------------------------------------------------------------
-- 2. LOST ITEM REPORTS TABLE (Self-service missing property reports)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lost_item_reports (
  id TEXT PRIMARY KEY DEFAULT ('lost_' || substr(gen_random_uuid()::text, 1, 12)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT,
  size TEXT,
  last_known_location TEXT NOT NULL,
  date_lost DATE NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Matched', 'Resolved', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. FOUND ITEM POSTS TABLE (Unattended belongings posted by Finders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS found_item_posts (
  id TEXT PRIMARY KEY DEFAULT ('found_' || substr(gen_random_uuid()::text, 1, 12)),
  finder_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT,
  size TEXT,
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL,
  time_found TIME,
  condition TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged')),
  status TEXT NOT NULL DEFAULT 'AvailableForClaim' CHECK (
    status IN ('AvailableForClaim', 'ClaimUnderReview', 'CoordinatingHandover', 'Reunited', 'Disputed', 'Archived')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. POST PHOTOS TABLE (Image proofs uploaded by Finders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_photos (
  id TEXT PRIMARY KEY DEFAULT ('photo_' || substr(gen_random_uuid()::text, 1, 12)),
  post_id TEXT NOT NULL REFERENCES found_item_posts(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PROOF OF OWNERSHIP CLAIMS TABLE (Challenge-response verification by Claimants)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proof_of_ownership_claims (
  id TEXT PRIMARY KEY DEFAULT ('claim_' || substr(gen_random_uuid()::text, 1, 12)),
  post_id TEXT NOT NULL REFERENCES found_item_posts(id) ON DELETE CASCADE,
  claimant_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proof_description TEXT NOT NULL, -- Specific details (scratches, lock screen, unique contents)
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'UnderReview' CHECK (status IN ('UnderReview', 'Approved', 'Rejected', 'Canceled')),
  rejection_reason TEXT,
  honesty_statement_agreed BOOLEAN DEFAULT true,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CLAIM ATTACHMENTS TABLE (Receipts, purchase proof, or reference photos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claim_attachments (
  id TEXT PRIMARY KEY DEFAULT ('att_' || substr(gen_random_uuid()::text, 1, 12)),
  claim_id TEXT NOT NULL REFERENCES proof_of_ownership_claims(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. MESSAGES TABLE (Direct coordination channel between Finder & approved Claimant)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || substr(gen_random_uuid()::text, 1, 12)),
  claim_id TEXT NOT NULL REFERENCES proof_of_ownership_claims(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TRANSACTION RECORDS TABLE (Dual-Sided Immutable Transaction History Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_records (
  id TEXT PRIMARY KEY DEFAULT ('tx_' || substr(gen_random_uuid()::text, 1, 12)),
  post_id TEXT NOT NULL REFERENCES found_item_posts(id) ON DELETE RESTRICT,
  claim_id TEXT NOT NULL REFERENCES proof_of_ownership_claims(id) ON DELETE RESTRICT,
  finder_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  claimant_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  campus_location TEXT NOT NULL, -- Campus safe-exchange zone (e.g. Quadrangle, Main Lobby)
  finder_confirmed BOOLEAN DEFAULT false,
  claimant_confirmed BOOLEAN DEFAULT false,
  finder_confirmed_at TIMESTAMPTZ,
  claimant_confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  ledger_hash TEXT NOT NULL, -- SHA-256 cryptographic signature linking both IDs & timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. DISPUTE REPORTS TABLE (Report Falsely Claimed Item Workflow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispute_reports (
  id TEXT PRIMARY KEY DEFAULT ('disp_' || substr(gen_random_uuid()::text, 1, 12)),
  transaction_id TEXT NOT NULL REFERENCES transaction_records(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL REFERENCES found_item_posts(id) ON DELETE CASCADE,
  reported_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Original Owner
  reason TEXT NOT NULL,
  evidence_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disputed' CHECK (status IN ('Disputed', 'UnderReview', 'Resolved', 'Dismissed')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. DISPUTE ATTACHMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispute_attachments (
  id TEXT PRIMARY KEY DEFAULT ('datt_' || substr(gen_random_uuid()::text, 1, 12)),
  dispute_id TEXT NOT NULL REFERENCES dispute_reports(id) ON DELETE CASCADE,
  attachment_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. FEEDBACK & RATINGS TABLE (Post-Return Mutual Community Feedback)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback_ratings (
  id TEXT PRIMARY KEY DEFAULT ('fb_' || substr(gen_random_uuid()::text, 1, 12)),
  transaction_id TEXT NOT NULL REFERENCES transaction_records(id) ON DELETE CASCADE,
  rater_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. NOTIFICATIONS TABLE (Automated Match & Custody Status Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || substr(gen_random_uuid()::text, 1, 12)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('MATCH', 'CLAIM_SUBMITTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'HANDOVER_SCHEDULED', 'HANDOVER_CONFIRMED', 'DISPUTE_FILED')
  ),
  reference_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_found_posts_category ON found_item_posts(category);
CREATE INDEX IF NOT EXISTS idx_found_posts_status ON found_item_posts(status);
CREATE INDEX IF NOT EXISTS idx_found_posts_finder ON found_item_posts(finder_id);
CREATE INDEX IF NOT EXISTS idx_lost_reports_user ON lost_item_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_reports_status ON lost_item_reports(status);
CREATE INDEX IF NOT EXISTS idx_claims_post ON proof_of_ownership_claims(post_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON proof_of_ownership_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_tx_finder ON transaction_records(finder_id);
CREATE INDEX IF NOT EXISTS idx_tx_claimant ON transaction_records(claimant_id);
CREATE INDEX IF NOT EXISTS idx_messages_claim ON messages(claim_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
