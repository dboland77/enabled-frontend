'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
  IDocument,
  IDocumentWithShares,
  IDocumentShare,
  IEligibleRecipient,
  IDocumentUpload,
  DocumentCategory,
} from '@/types/document';

// ----------------------------------------------------------------------

const DOCUMENTS_CACHE_KEY = 'user-documents';
const SHARED_DOCUMENTS_CACHE_KEY = 'shared-documents';

// Fetcher function for user's own documents
async function fetchUserDocuments(): Promise<IDocumentWithShares[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Fetch documents owned by the user
  const { data: documents, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (docsError) {
    throw new Error(docsError.message);
  }

  // Fetch shares for each document
  const docsWithShares: IDocumentWithShares[] = await Promise.all(
    (documents || []).map(async (doc) => {
      const { data: shares } = await supabase
        .from('document_shares')
        .select(`
          id,
          document_id,
          shared_with_user_id,
          shared_by_user_id,
          permission_type,
          shared_at
        `)
        .eq('document_id', doc.id);

      // Get user details for each share
      const sharesWithUsers = await Promise.all(
        (shares || []).map(async (share) => {
          const { data: profile } = await supabase
            .from('user_profile')
            .select('firstname, lastname, role')
            .eq('userId', share.shared_with_user_id)
            .single();

          const { data: authUser } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', share.shared_with_user_id)
            .single();

          return {
            ...share,
            shared_with_user: profile
              ? {
                  firstname: profile.firstname,
                  lastname: profile.lastname,
                  email: authUser?.email || '',
                  role: profile.role || '',
                }
              : undefined,
          };
        })
      );

      return {
        ...doc,
        shares: sharesWithUsers,
      };
    })
  );

  return docsWithShares;
}

  // Fetch documents shared with the user
async function fetchSharedDocuments(): Promise<IDocumentWithShares[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  // Fetch active shares for this user
  const { data: shares, error: sharesError } = await supabase
    .from('document_shares')
    .select(`
      id,
      document_id,
      shared_by_user_id,
      permission_type,
      shared_at,
      documents (
        id,
        user_id,
        name,
        category,
        file_path,
        file_size_bytes,
        mime_type,
        uploaded_at,
        created_at,
        updated_at
      )
    `)
    .eq('shared_with_user_id', user.id)
    .order('shared_at', { ascending: false });

  if (sharesError) {
    throw new Error(sharesError.message);
  }

  // Transform and add owner info
  const docsWithOwners: IDocumentWithShares[] = await Promise.all(
    (shares || []).map(async (share) => {
      const doc = share.documents as unknown as IDocument;
      
      // Get the document owner's info
      const { data: ownerProfile } = await supabase
        .from('user_profile')
        .select('firstname, lastname')
        .eq('userId', share.shared_by_user_id)
        .single();

      return {
        ...doc,
        shared_by: ownerProfile
          ? {
              firstname: ownerProfile.firstname,
              lastname: ownerProfile.lastname,
              email: '',
            }
          : undefined,
      };
    })
  );

  return docsWithOwners;
}

export function useDocuments() {
  const supabase = createClient();

  // Fetch user's own documents
  const {
    data: documents,
    error: documentsError,
    isLoading: documentsLoading,
  } = useSWR<IDocumentWithShares[]>(DOCUMENTS_CACHE_KEY, fetchUserDocuments, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
  });

  // Fetch documents shared with user
  const {
    data: sharedDocuments,
    error: sharedError,
    isLoading: sharedLoading,
  } = useSWR<IDocumentWithShares[]>(SHARED_DOCUMENTS_CACHE_KEY, fetchSharedDocuments, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
  });

  // Refresh documents
  const refetch = useCallback(() => {
    mutate(DOCUMENTS_CACHE_KEY);
    mutate(SHARED_DOCUMENTS_CACHE_KEY);
  }, []);

  // Upload a new document
  const uploadDocument = useCallback(
    async (input: IDocumentUpload): Promise<IDocument> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Generate unique file path
      const fileExt = input.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, input.file, {
          contentType: input.file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Create document record
      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: input.title,
          category: input.category,
          file_path: storagePath,
          file_size_bytes: input.file.size,
          mime_type: input.file.type,
        })
        .select()
        .single();

      if (dbError) {
        // Try to clean up uploaded file
        await supabase.storage.from('documents').remove([storagePath]);
        throw new Error(`Failed to save document: ${dbError.message}`);
      }

      // Refresh cache
      mutate(DOCUMENTS_CACHE_KEY);

      return doc;
    },
    [supabase]
  );

  // Delete a document
  const deleteDocument = useCallback(
    async (documentId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Get the document to find storage path
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage deletion failed:', storageError);
      }

      // Delete document record (shares will cascade delete)
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw new Error(`Failed to delete document: ${dbError.message}`);

      // Refresh cache
      mutate(DOCUMENTS_CACHE_KEY);
    },
    [supabase]
  );

      // Update document metadata
    async (
      documentId: string,
      updates: { title?: string; category?: DocumentCategory }
    ) => {
      const { error } = await supabase
        .from('documents')
        .update({
          name: updates.title,
          category: updates.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw new Error(`Failed to update document: ${error.message}`);

      mutate(DOCUMENTS_CACHE_KEY);
    },

  // Get signed URL for viewing/downloading
  const getSignedUrl = useCallback(
    async (storagePath: string, expiresIn: number = 3600): Promise<string> => {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, expiresIn);

      if (error) throw new Error(`Failed to get download URL: ${error.message}`);

      return data.signedUrl;
    },
    [supabase]
  );

  return {
    documents: documents || [],
    sharedDocuments: sharedDocuments || [],
    loading: documentsLoading || sharedLoading,
    error: documentsError?.message || sharedError?.message || null,
    refetch,
    uploadDocument,
    deleteDocument,
    updateDocument,
    getSignedUrl,
  };
}

// Separate hook for managing document shares
export function useDocumentShares() {
  const supabase = createClient();

  // Fetch eligible recipients for sharing
  const fetchEligibleRecipients = useCallback(async (): Promise<IEligibleRecipient[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Call the database function to get eligible recipients
    const { data, error } = await supabase.rpc('get_eligible_document_recipients', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Failed to fetch eligible recipients:', error);
      return [];
    }

    return data || [];
  }, [supabase]);

  // Share a document with a user
  const shareDocument = useCallback(
    async (documentId: string, sharedWithUserId: string, permission: 'view' | 'download' = 'view') => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Use upsert to handle re-sharing (update revoked_at to null)
      const { error } = await supabase.from('document_shares').upsert(
        {
          document_id: documentId,
          shared_with_user_id: sharedWithUserId,
          shared_by_user_id: user.id,
          permission,
          revoked_at: null,
        },
        {
          onConflict: 'document_id,shared_with_user_id',
        }
      );

      if (error) throw new Error(`Failed to share document: ${error.message}`);

      mutate(DOCUMENTS_CACHE_KEY);
    },
    [supabase]
  );

  // Revoke document access
  const revokeShare = useCallback(
    async (documentId: string, sharedWithUserId: string) => {
      const { error } = await supabase
        .from('document_shares')
        .update({ revoked_at: new Date().toISOString() })
        .eq('document_id', documentId)
        .eq('shared_with_user_id', sharedWithUserId);

      if (error) throw new Error(`Failed to revoke share: ${error.message}`);

      mutate(DOCUMENTS_CACHE_KEY);
    },
    [supabase]
  );

  // Get shares for a specific document
  const getDocumentShares = useCallback(
    async (documentId: string): Promise<IDocumentShare[]> => {
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', documentId)
        .is('revoked_at', null);

      if (error) throw new Error(`Failed to fetch shares: ${error.message}`);

      return data || [];
    },
    [supabase]
  );

  return {
    fetchEligibleRecipients,
    shareDocument,
    revokeShare,
    getDocumentShares,
  };
}
