'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IDocumentWithShares } from '@/types/document';

import DocumentCard from './DocumentCard';

// ----------------------------------------------------------------------

interface DocumentListProps {
  documents: IDocumentWithShares[];
  onPreview: (doc: IDocumentWithShares) => void;
  onShare: (doc: IDocumentWithShares) => void;
  onDelete: (doc: IDocumentWithShares) => void;
  onUpload: () => void;
}

export default function DocumentList({
  documents,
  onPreview,
  onShare,
  onDelete,
  onUpload,
}: DocumentListProps) {
  const theme = useTheme();
  const [deleteConfirm, setDeleteConfirm] = useState<IDocumentWithShares | null>(null);

  const handleDeleteClick = (doc: IDocumentWithShares) => {
    setDeleteConfirm(doc);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={3}
        sx={{
          py: 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Iconify
            icon="solar:folder-with-files-bold-duotone"
            width={48}
            sx={{ color: 'primary.main' }}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No documents yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360 }}>
            Upload your medical documents to keep them secure and share them with your approvers
            when needed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={onUpload}
          >
            Upload Your First Document
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onPreview={() => onPreview(doc)}
            onShare={() => onShare(doc)}
            onDelete={() => handleDeleteClick(doc)}
            isOwner
          />
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={24} sx={{ color: 'error.main' }} />
            </Box>
            <Typography variant="h6">Delete Document?</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action
            cannot be undone and will also remove all sharing permissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
