'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import {
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
  IDocumentUpload,
  formatFileSize,
} from '@/types/document';

// ----------------------------------------------------------------------

interface DocumentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (input: IDocumentUpload) => Promise<unknown>;
  onSuccess: () => void;
}

export default function DocumentUploadDialog({
  open,
  onClose,
  onUpload,
  onSuccess,
}: DocumentUploadDialogProps) {
  const theme = useTheme();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('other');
    setError(null);
    setUploading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  }, [uploading, resetForm, onClose]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null);

    if (rejectedFiles && (rejectedFiles as Array<unknown>).length > 0) {
      setError('Only PDF files up to 10MB are accepted.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: uploading,
  });

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      setError('Please provide a file and title.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload({
        file,
        name: title.trim(),
        category,
      });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon="solar:cloud-upload-bold" width={28} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h6">Upload Document</Typography>
            <Typography variant="body2" color="text.secondary">
              Secure, encrypted storage for your medical documents
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Security Notice */}
          <Alert
            severity="info"
            icon={<Iconify icon="solar:shield-check-bold" width={20} />}
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              border: 'none',
            }}
          >
            <Typography variant="body2">
              Your document will be encrypted and stored securely. Only you can access it unless
              you explicitly share it.
            </Typography>
          </Alert>

          {/* Dropzone */}
          <Box
            {...getRootProps()}
            sx={{
              p: 4,
              outline: 'none',
              borderRadius: 1.5,
              cursor: uploading ? 'not-allowed' : 'pointer',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: alpha(theme.palette.grey[500], 0.04),
              border: `2px dashed ${alpha(theme.palette.grey[500], 0.24)}`,
              transition: theme.transitions.create(['border-color', 'background-color']),
              '&:hover': !uploading && {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              ...(isDragActive && {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }),
              ...(isDragReject && {
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              }),
              ...(uploading && {
                opacity: 0.5,
              }),
            }}
          >
            <input {...getInputProps()} />

            {file ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  }}
                >
                  <Iconify icon="solar:document-bold" width={32} sx={{ color: 'error.main' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={uploading}
                >
                  <Iconify icon="mingcute:close-line" width={20} />
                </IconButton>
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={1.5}>
                <Iconify
                  icon="solar:cloud-upload-bold-duotone"
                  width={56}
                  sx={{ color: 'primary.main', opacity: 0.6 }}
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1">
                    Drop your PDF here or{' '}
                    <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                      browse
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF files only, max 10MB
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>

          {/* Title */}
          <TextField
            fullWidth
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., GP Assessment Letter"
            disabled={uploading}
            required
          />

          {/* Category */}
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              disabled={uploading}
            >
              {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {DOCUMENT_CATEGORY_LABELS[cat]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document..."
            multiline
            rows={2}
            disabled={uploading}
          />

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Box>
              <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Uploading and encrypting your document...
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={uploading || !file || !title.trim()}
          startIcon={
            uploading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:cloud-upload-fill" />
          }
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
