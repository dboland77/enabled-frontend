'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import Label from '@/components/label';
import {
  IDocumentWithShares,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_COLORS,
  formatFileSize,
} from '@/types/document';
import { fDate } from '@/utils/format-time';

// ----------------------------------------------------------------------

interface DocumentCardProps {
  document: IDocumentWithShares;
  onPreview: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}

export default function DocumentCard({
  document,
  onPreview,
  onShare,
  onDelete,
  isOwner,
}: DocumentCardProps) {
  const theme = useTheme();

  const activeShares = document.shares || [];
  const hasShares = activeShares.length > 0;

  return (
    <Card
      sx={{
        p: 2.5,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        '&:hover': {
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
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
          <Iconify icon="solar:document-bold" width={28} sx={{ color: 'error.main' }} />
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Document">
            <IconButton size="small" onClick={onPreview} sx={{ color: 'primary.main' }}>
              <Iconify icon="solar:eye-bold" width={20} />
            </IconButton>
          </Tooltip>
          {isOwner && onShare && (
            <Tooltip title="Manage Sharing">
              <IconButton size="small" onClick={onShare} sx={{ color: 'info.main' }}>
                <Iconify icon="solar:share-bold" width={20} />
              </IconButton>
            </Tooltip>
          )}
          {isOwner && onDelete && (
            <Tooltip title="Delete Document">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                <Iconify icon="solar:trash-bin-trash-bold" width={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Title & Description */}
      <Typography
        variant="subtitle1"
        sx={{
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {document.name}
      </Typography>

      {/* Category & Meta */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Label
          variant="soft"
          color={DOCUMENT_CATEGORY_COLORS[document.category]}
          sx={{ textTransform: 'capitalize' }}
        >
          {DOCUMENT_CATEGORY_LABELS[document.category]}
        </Label>
        <Typography variant="caption" color="text.disabled">
          {formatFileSize(document.file_size_bytes)}
        </Typography>
      </Stack>

      {/* Footer */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pt: 2,
          borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.24)}`,
        }}
      >
        {/* Date */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify icon="solar:calendar-linear" width={16} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            {fDate(document.created_at)}
          </Typography>
        </Stack>

        {/* Shared By (for shared documents) or Shared With (for owned documents) */}
        {!isOwner && document.shared_by && (
          <Tooltip title={`Shared by ${document.shared_by.firstname} ${document.shared_by.lastname}`}>
            <Chip
              size="small"
              avatar={
                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                  {document.shared_by.firstname?.[0]}
                </Avatar>
              }
              label={`From ${document.shared_by.firstname}`}
              variant="outlined"
              sx={{ height: 24 }}
            />
          </Tooltip>
        )}

        {isOwner && hasShares && (
          <Tooltip
            title={`Shared with ${activeShares
              .map((s) => s.shared_with_user?.firstname || 'User')
              .join(', ')}`}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                {activeShares.map((share) => (
                  <Avatar key={share.id} sx={{ bgcolor: 'primary.main' }}>
                    {share.shared_with_user?.firstname?.[0] || '?'}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Iconify icon="solar:share-bold" width={14} sx={{ color: 'info.main' }} />
            </Stack>
          </Tooltip>
        )}

        {isOwner && !hasShares && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:lock-keyhole-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              Private
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
