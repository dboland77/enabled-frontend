-- ============================================================================
-- COMPLETE DOCUMENTS SETUP
-- Creates documents table, shares table, and all RLS policies
-- Run this single script in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE DOCUMENTS TABLE (without cross-table RLS policies)
-- ============================================================================

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('medical_records', 'assessments', 'letters', 'other')),
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/pdf',
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;

-- ============================================================================
-- STEP 2: CREATE DOCUMENT_SHARES TABLE
-- ============================================================================

-- Create document_shares table
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'download')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ, -- NULL means active, timestamp means revoked
    UNIQUE(document_id, shared_with_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with ON document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_by ON document_shares(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_active ON document_shares(document_id, shared_with_user_id) WHERE revoked_at IS NULL;

-- Enable RLS
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON document_shares TO authenticated;

-- ============================================================================
-- STEP 3: RLS POLICIES FOR DOCUMENTS (now that both tables exist)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view documents shared with them" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;

-- Policy: Users can SELECT their own documents
CREATE POLICY "Users can view their own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can SELECT documents shared with them (via document_shares)
CREATE POLICY "Users can view documents shared with them"
ON documents
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM document_shares ds
        WHERE ds.document_id = documents.id
        AND ds.shared_with_user_id = auth.uid()
        AND ds.revoked_at IS NULL
    )
);

-- Policy: Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON documents
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profile up
        WHERE up."userId" = auth.uid()
        AND up.role = 'admin'
    )
);

-- Policy: Users can INSERT their own documents
CREATE POLICY "Users can insert their own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own documents
CREATE POLICY "Users can update their own documents"
ON documents
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can DELETE their own documents
CREATE POLICY "Users can delete their own documents"
ON documents
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: RLS POLICIES FOR DOCUMENT_SHARES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Document owners can view shares" ON document_shares;
DROP POLICY IF EXISTS "Shared users can view their shares" ON document_shares;
DROP POLICY IF EXISTS "Document owners can create shares" ON document_shares;
DROP POLICY IF EXISTS "Document owners can revoke shares" ON document_shares;
DROP POLICY IF EXISTS "Admins can view all shares" ON document_shares;

-- Policy: Document owners can view all shares for their documents
CREATE POLICY "Document owners can view shares"
ON document_shares
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = document_shares.document_id
        AND d.user_id = auth.uid()
    )
);

-- Policy: Users can view shares where they are the recipient
CREATE POLICY "Shared users can view their shares"
ON document_shares
FOR SELECT
USING (shared_with_user_id = auth.uid() AND revoked_at IS NULL);

-- Policy: Document owners can create shares
CREATE POLICY "Document owners can create shares"
ON document_shares
FOR INSERT
WITH CHECK (
    shared_by_user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = document_shares.document_id
        AND d.user_id = auth.uid()
    )
);

-- Policy: Document owners can update (revoke) shares
CREATE POLICY "Document owners can revoke shares"
ON document_shares
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = document_shares.document_id
        AND d.user_id = auth.uid()
    )
);

-- Policy: Admins can view all shares
CREATE POLICY "Admins can view all shares"
ON document_shares
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profile up
        WHERE up."userId" = auth.uid()
        AND up.role = 'admin'
    )
);

-- ============================================================================
-- STEP 5: HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp on document modification
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS trigger_update_document_timestamp ON documents;
CREATE TRIGGER trigger_update_document_timestamp
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_timestamp();

-- Get eligible share recipients for a user
-- Returns users who can receive document shares (approvers/managers/admins)
CREATE OR REPLACE FUNCTION get_eligible_document_recipients(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    firstname TEXT,
    lastname TEXT,
    role TEXT,
    job_title TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Get approvers/managers assigned to the user's adjustment requests
    SELECT DISTINCT 
        au.id AS user_id,
        au.email,
        up.firstname,
        up.lastname,
        up.role,
        up.job_title
    FROM adjustment_requests ar
    JOIN auth.users au ON au.id::text = ar.approver_id
    JOIN user_profile up ON up."userId" = au.id
    WHERE ar.user_id = p_user_id
    
    UNION
    
    -- Also include the user's line manager if set
    SELECT 
        au.id AS user_id,
        au.email,
        up.firstname,
        up.lastname,
        up.role,
        up.job_title
    FROM user_profile current_user_profile
    JOIN auth.users au ON au.id = current_user_profile.line_manager_id
    JOIN user_profile up ON up."userId" = au.id
    WHERE current_user_profile."userId" = p_user_id
    AND current_user_profile.line_manager_id IS NOT NULL
    
    UNION
    
    -- Include all admins and approvers (they may need access)
    SELECT 
        au.id AS user_id,
        au.email,
        up.firstname,
        up.lastname,
        up.role,
        up.job_title
    FROM user_profile up
    JOIN auth.users au ON au.id = up."userId"
    WHERE up.role IN ('admin', 'approver', 'manager')
    AND up."userId" != p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_eligible_document_recipients TO authenticated;

-- ============================================================================
-- COMPLETE! Your documents system is now ready.
-- ============================================================================
