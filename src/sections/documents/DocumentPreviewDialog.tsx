'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import Label from '@/components/label';
import {
  IDocumentWithShares,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_COLORS,
  formatFileSize,
} from '@/types/document';

// ----------------------------------------------------------------------

interface DocumentPreviewDialogProps {
  open: boolean;
  document: IDocumentWithShares | null;
  onClose: () => void;
  getSignedUrl: (storagePath: string, expiresIn?: number) => Promise<string>;
}

export default function DocumentPreviewDialog({
  open,
  document,
  onClose,
  getSignedUrl,
}: DocumentPreviewDialogProps) {
  const theme = useTheme();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL when dialog opens
  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      setPdfUrl(null);

      getSignedUrl(document.storage_path, 3600) // 1 hour expiry
        .then(setPdfUrl)
        .catch((err) => setError(err.message || 'Failed to load document'))
        .finally(() => setLoading(false));
    }

    // Cleanup URL when dialog closes
    return () => {
      setPdfUrl(null);
    };
  }, [open, document, getSignedUrl]);

  const handleDownload = useCallback(async () => {
    if (!document) return;

    try {
      const url = await getSignedUrl(document.storage_path, 300); // 5 min expiry for download
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [document, getSignedUrl]);

  const handleOpenInNewTab = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          backgroundColor: alpha(theme.palette.grey[500], 0.04),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              }}
            >
              <Iconify icon="solar:document-bold" width={24} sx={{ color: 'error.main' }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h6">{document.title}</Typography>
                <Label
                  variant="soft"
                  color={DOCUMENT_CATEGORY_COLORS[document.category]}
                  sx={{ height: 22 }}
                >
                  {DOCUMENT_CATEGORY_LABELS[document.category]}
                </Label>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="caption" color="text.secondary">
                  {document.file_name}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatFileSize(document.file_size)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Security Badge */}
            <Tooltip title="Secure, encrypted viewing">
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
                  mr: 1,
                }}
              >
                <Iconify icon="solar:shield-check-bold" width={16} sx={{ color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  Secure
                </Typography>
              </Stack>
            </Tooltip>

            {/* Open in new tab */}
            <Tooltip title="Open in new tab">
              <IconButton onClick={handleOpenInNewTab} disabled={!pdfUrl || loading}>
                <Iconify icon="solar:square-arrow-right-up-bold" width={20} />
              </IconButton>
            </Tooltip>

            {/* Download */}
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} disabled={loading}>
                <Iconify icon="solar:download-bold" width={20} />
              </IconButton>
            </Tooltip>

            {/* Close */}
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading secure document preview...
            </Typography>
          </Stack>
        )}

        {error && (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, p: 4 }}>
            <Alert
              severity="error"
              sx={{ maxWidth: 400 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    getSignedUrl(document.storage_path, 3600)
                      .then(setPdfUrl)
                      .catch((err) => setError(err.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Stack>
        )}

        {pdfUrl && !loading && !error && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
            }}
          >
            {/* PDF Viewer using iframe with signed URL */}
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title={document.title}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
