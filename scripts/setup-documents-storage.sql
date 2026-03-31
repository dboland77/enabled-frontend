-- ============================================================================
-- SECURE DOCUMENTS STORAGE BUCKET
-- Creates a private bucket for user document uploads with RLS policies
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create the private storage bucket for user documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-documents',
    'user-documents',
    false, -- PRIVATE bucket - no public access
    10485760, -- 10MB max file size
    ARRAY['application/pdf']::text[] -- Only PDFs allowed
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf']::text[];

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view shared documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Policy: Users can upload documents to their own folder
-- Path format: user-documents/{user_id}/{filename}
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view documents shared with them
-- This checks the document_shares table for active shares
CREATE POLICY "Users can view shared documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'user-documents'
    AND EXISTS (
        SELECT 1 FROM documents d
        JOIN document_shares ds ON ds.document_id = d.id
        WHERE d.storage_path = name
        AND ds.shared_with_user_id = auth.uid()
        AND ds.revoked_at IS NULL
    )
);

-- Policy: Admins can view all documents
CREATE POLICY "Admins can view all documents storage"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'user-documents'
    AND EXISTS (
        SELECT 1 FROM user_profile up
        WHERE up."userId" = auth.uid()
        AND up.role = 'admin'
    )
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
