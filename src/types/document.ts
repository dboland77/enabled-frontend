// Document category types
export type DocumentCategory = 'medical_records' | 'assessments' | 'letters' | 'other';

// Document category labels for display
export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  medical_records: 'Medical Records',
  assessments: 'Assessments',
  letters: 'Letters',
  other: 'Other',
};

// Document category colors for display
export const DOCUMENT_CATEGORY_COLORS: Record<DocumentCategory, 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'> = {
  medical_records: 'error',
  assessments: 'info',
  letters: 'primary',
  other: 'default',
};

// Permission types for document sharing
export type DocumentPermission = 'view' | 'download';

// Main document interface
export interface IDocument {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

// Document with share information (for documents shared with the user)
export interface IDocumentWithShares extends IDocument {
  shares?: IDocumentShare[];
  shared_by?: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

// Document share interface
export interface IDocumentShare {
  id: string;
  document_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  permission: DocumentPermission;
  created_at: string;
  revoked_at: string | null;
  // Joined data
  shared_with_user?: {
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}

// Eligible recipient for document sharing
export interface IEligibleRecipient {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  job_title: string | null;
}

// Document upload input
export interface IDocumentUpload {
  title: string;
  description?: string;
  category: DocumentCategory;
  file: File;
}

// Document share input
export interface IDocumentShareInput {
  document_id: string;
  shared_with_user_id: string;
  permission?: DocumentPermission;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
