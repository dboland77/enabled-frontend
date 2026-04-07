'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IDocumentWithShares } from '@/types/document';

import DocumentCard from './DocumentCard';

// ----------------------------------------------------------------------

interface SharedDocumentsListProps {
  documents: IDocumentWithShares[];
  onPreview: (doc: IDocumentWithShares) => void;
  getSignedUrl: (storagePath: string) => Promise<string>;
}

export default function SharedDocumentsList({
  documents,
  onPreview,
}: SharedDocumentsListProps) {
  const theme = useTheme();

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
            backgroundColor: alpha(theme.palette.info.main, 0.08),
          }}
        >
          <Iconify
            icon="solar:users-group-rounded-bold-duotone"
            width={48}
            sx={{ color: 'info.main' }}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No shared documents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
            Documents that others share with you will appear here. You will be able to view them
            securely.
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
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
          isOwner={false}
        />
      ))}
    </Box>
  );
}
