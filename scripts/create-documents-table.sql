-- ============================================================================
-- SECURE DOCUMENTS TABLE
-- Stores metadata for user-uploaded medical documents
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create document category type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_category') THEN
        CREATE TYPE document_category AS ENUM (
            'medical_records',
            'assessments',
            'letters',
            'other'
        );
    END IF;
END
$$;

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
-- RLS POLICIES FOR DOCUMENTS
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
-- HELPER FUNCTION: Update timestamp on document modification
-- ============================================================================

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
