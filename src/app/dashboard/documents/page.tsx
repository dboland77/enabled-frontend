import { DocumentsView } from '@/sections/documents';

export const metadata = {
  title: 'My Documents',
  description: 'Upload and manage your medical documents securely',
};

export default function DocumentsPage() {
  return <DocumentsView />;
}
