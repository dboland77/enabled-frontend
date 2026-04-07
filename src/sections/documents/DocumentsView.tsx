'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { useSnackbar } from '@/components/snackbar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useDocuments, useDocumentShares } from '@/hooks/use-documents';
import { IDocumentWithShares } from '@/types/document';

import DocumentList from './DocumentList';
import SharedDocumentsList from './SharedDocumentsList';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentPreviewDialog from './DocumentPreviewDialog';
import DocumentShareDialog from './DocumentShareDialog';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'my-documents', label: 'My Documents', icon: 'solar:folder-with-files-bold' },
  { value: 'shared-with-me', label: 'Shared With Me', icon: 'solar:users-group-rounded-bold' },
];

export default function DocumentsView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState('my-documents');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<IDocumentWithShares | null>(null);
  const [shareDocument, setShareDocument] = useState<IDocumentWithShares | null>(null);

  const {
    documents,
    sharedDocuments,
    loading,
    error,
    refetch,
    uploadDocument,
    deleteDocument,
    getSignedUrl,
  } = useDocuments();

  const { shareDocument: shareWithUser, revokeShare, fetchEligibleRecipients } = useDocumentShares();

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setUploadDialogOpen(false);
    enqueueSnackbar('Document uploaded successfully', { variant: 'success' });
    refetch();
  }, [enqueueSnackbar, refetch]);

  const handleDelete = useCallback(
    async (document: IDocumentWithShares) => {
      try {
        await deleteDocument(document.id);
        enqueueSnackbar('Document deleted successfully', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(err instanceof Error ? err.message : 'Failed to delete document', {
          variant: 'error',
        });
      }
    },
    [deleteDocument, enqueueSnackbar]
  );

  const handlePreview = useCallback((document: IDocumentWithShares) => {
    setPreviewDocument(document);
  }, []);

  const handleShare = useCallback((document: IDocumentWithShares) => {
    setShareDocument(document);
  }, []);

  const handleShareUpdate = useCallback(() => {
    refetch();
    enqueueSnackbar('Document sharing updated', { variant: 'success' });
  }, [refetch, enqueueSnackbar]);

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <Iconify icon="solar:danger-triangle-bold" width={64} sx={{ color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="error.main">
            {error}
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="My Documents"
          links={[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Documents' }]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Security Notice */}
        <Alert
          severity="info"
          icon={<Iconify icon="solar:shield-check-bold" width={24} />}
          sx={{
            mb: 3,
            backgroundColor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
                Your documents are encrypted and stored securely
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only you can see your documents unless you explicitly share them with approvers or managers.
              </Typography>
            </Box>
            <Iconify icon="solar:lock-keyhole-bold" width={32} sx={{ color: 'info.main', flexShrink: 0, ml: 2 }} />
          </Stack>
        </Alert>

        <Card>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              px: 2.5,
              boxShadow: (th) => `inset 0 -2px 0 0 ${th.palette.divider}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon={tab.icon} width={20} />
                    <span>{tab.label}</span>
                    <Box
                      component="span"
                      sx={{
                        ml: 0.5,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 0.75,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: (th) =>
                          tab.value === currentTab
                            ? alpha(th.palette.primary.main, 0.16)
                            : alpha(th.palette.grey[500], 0.16),
                        color: (th) =>
                          tab.value === currentTab ? th.palette.primary.main : th.palette.text.secondary,
                      }}
                    >
                      {tab.value === 'my-documents' ? documents.length : sharedDocuments.length}
                    </Box>
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {currentTab === 'my-documents' && (
              <DocumentList
                documents={documents}
                onPreview={handlePreview}
                onShare={handleShare}
                onDelete={handleDelete}
                onUpload={() => setUploadDialogOpen(true)}
              />
            )}

            {currentTab === 'shared-with-me' && (
              <SharedDocumentsList
                documents={sharedDocuments}
                onPreview={handlePreview}
                getSignedUrl={getSignedUrl}
              />
            )}
          </Box>
        </Card>
      </Container>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={uploadDocument}
        onSuccess={handleUploadSuccess}
      />

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        open={!!previewDocument}
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
        getSignedUrl={getSignedUrl}
      />

      {/* Share Dialog */}
      <DocumentShareDialog
        open={!!shareDocument}
        document={shareDocument}
        onClose={() => setShareDocument(null)}
        onShare={shareWithUser}
        onRevoke={revokeShare}
        onUpdate={handleShareUpdate}
        fetchEligibleRecipients={fetchEligibleRecipients}
      />
    </>
  );
}
