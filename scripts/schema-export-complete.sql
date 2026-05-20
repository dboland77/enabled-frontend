-- =============================================================================
-- Complete Supabase Schema Export
-- =============================================================================
-- This script recreates your entire Supabase database schema.
-- Use this to set up a new database or restore your schema.
-- Run in order: tables first, then RLS policies, then foreign keys/indexes
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CORE TABLES
-- =============================================================================

-- Roles lookup table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  role_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Departments lookup table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name TEXT NOT NULL,
  department_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profile (
  userId UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT,
  lastname TEXT,
  job_title TEXT,
  role TEXT,
  department TEXT,
  line_manager_id UUID,
  is_disabled BOOLEAN DEFAULT false,
  is_first_login BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================================================
-- 2. DISABILITY & LIMITATIONS TABLES
-- =============================================================================

-- Disabilities lookup
CREATE TABLE IF NOT EXISTS disabilities (
  id UUID PRIMARY KEY,
  disability_name VARCHAR NOT NULL,
  disability_nhs_slug VARCHAR,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User disabilities junction table
CREATE TABLE IF NOT EXISTS user_disabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disability_id UUID NOT NULL REFERENCES disabilities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, disability_id)
);

-- Limitations
CREATE TABLE IF NOT EXISTS limitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  severity_levels TEXT[] DEFAULT ARRAY['mild', 'moderate', 'severe'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Disability-Limitation junction
CREATE TABLE IF NOT EXISTS disability_limitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disability_id UUID NOT NULL REFERENCES disabilities(id),
  limitation_id UUID NOT NULL REFERENCES limitations(id),
  is_common BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adjustments lookup
CREATE TABLE IF NOT EXISTS adjustments (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disability-Adjustment junction
CREATE TABLE IF NOT EXISTS disability_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disability_id UUID NOT NULL REFERENCES disabilities(id),
  adjustment_id UUID NOT NULL REFERENCES adjustments(id),
  relevance_score INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Limitation-Adjustment junction
CREATE TABLE IF NOT EXISTS limitation_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  limitation_id UUID NOT NULL REFERENCES limitations(id),
  adjustment_id UUID NOT NULL REFERENCES adjustments(id),
  relevance_score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Adjustments (approved by user)
CREATE TABLE IF NOT EXISTS user_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adjustment_id UUID NOT NULL REFERENCES adjustments(id),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID,
  notes TEXT
);

-- =============================================================================
-- 3. ADJUSTMENT REQUESTS & APPROVALS
-- =============================================================================

-- Adjustment requests
CREATE TABLE IF NOT EXISTS adjustment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  detail TEXT,
  adjustment_type TEXT,
  work_function TEXT,
  location TEXT,
  required_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approver_id TEXT,
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  requester_name TEXT,
  requester_email TEXT,
  approver_name TEXT
);

-- Adjustment request items
CREATE TABLE IF NOT EXISTS adjustment_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES adjustment_requests(id),
  adjustment_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adjustment request history/audit trail
CREATE TABLE IF NOT EXISTS adjustment_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES adjustment_requests(id),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================================================
-- 4. DOCUMENTS & SHARING
-- =============================================================================

-- Documents storage metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document sharing
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id),
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  permission_type TEXT DEFAULT 'view',
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, shared_with_user_id)
);

-- =============================================================================
-- 5. NOTIFICATIONS & ACTIVITY
-- =============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'system',
  category TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  related_request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Notification activity tracking
CREATE TABLE IF NOT EXISTS notification_activity (
  id TEXT PRIMARY KEY,
  activityType USER-DEFINED NOT NULL,
  time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  userId UUID NOT NULL,
  sourceId UUID NOT NULL
);

-- =============================================================================
-- 6. LEGACY/REFERENCE TABLES (can be removed if not needed)
-- =============================================================================

-- Legacy limitations data (from original import)
CREATE TABLE IF NOT EXISTS limitations_OG (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  limitation TEXT NOT NULL,
  disability TEXT NOT NULL
);

-- Managers reference (if using role-based access)
CREATE TABLE IF NOT EXISTS managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role USER-DEFINED DEFAULT 'MANAGER'
);

-- =============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_disabilities_user_id ON user_disabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_disabilities_disability_id ON user_disabilities(disability_id);
CREATE INDEX IF NOT EXISTS idx_user_adjustments_user_id ON user_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_requests_user_id ON adjustment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_requests_status ON adjustment_requests(status);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with_user_id ON document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_disability_limitations_disability_id ON disability_limitations(disability_id);
CREATE INDEX IF NOT EXISTS idx_disability_adjustments_disability_id ON disability_adjustments(disability_id);

-- =============================================================================
-- 8. FOREIGN KEY CONSTRAINTS (may already exist)
-- =============================================================================

-- Add FK constraints for user_disabilities if not already present
ALTER TABLE user_disabilities
DROP CONSTRAINT IF EXISTS user_disabilities_disability_id_fkey;

ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_disability_id_fkey
FOREIGN KEY (disability_id) 
REFERENCES disabilities(id)
ON DELETE CASCADE;

ALTER TABLE user_disabilities
DROP CONSTRAINT IF EXISTS user_disabilities_user_id_fkey;

ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Row Level Security (RLS) policies are NOT included in this script
--    Apply them separately using your existing RLS policy scripts
-- 2. USER-DEFINED types (like AccessRole) may need to be created separately
-- 3. Storage buckets (documents, user-documents) are not SQL-based
--    Configure them manually in Supabase Storage dashboard
-- 4. Auth.users table is managed by Supabase and doesn't need to be created
-- 5. This script creates the structure only - data migration is separate
-- =============================================================================
