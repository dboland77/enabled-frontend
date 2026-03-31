-- ============================================================================
-- DOCUMENT SHARES TABLE
-- Tracks which users have access to which documents
-- Run this in your Supabase SQL Editor AFTER create-documents-table.sql
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
-- RLS POLICIES FOR DOCUMENT_SHARES
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
-- HELPER FUNCTION: Get eligible share recipients for a user
-- Returns users who can receive document shares (approvers/managers assigned to the user)
-- ============================================================================

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
