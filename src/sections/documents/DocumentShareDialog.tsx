'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import Label from '@/components/label';
import { IDocumentWithShares, IEligibleRecipient } from '@/types/document';

// ----------------------------------------------------------------------

interface DocumentShareDialogProps {
  open: boolean;
  document: IDocumentWithShares | null;
  onClose: () => void;
  onShare: (documentId: string, userId: string, permission?: 'view' | 'download') => Promise<void>;
  onRevoke: (documentId: string, userId: string) => Promise<void>;
  onUpdate: () => void;
  fetchEligibleRecipients: () => Promise<IEligibleRecipient[]>;
}

export default function DocumentShareDialog({
  open,
  document,
  onClose,
  onShare,
  onRevoke,
  onUpdate,
  fetchEligibleRecipients,
}: DocumentShareDialogProps) {
  const theme = useTheme();

  const [recipients, setRecipients] = useState<IEligibleRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current shares for this document
  const currentShares = document?.shares || [];
  const sharedUserIds = new Set(currentShares.map((s) => s.shared_with_user_id));

  // Fetch eligible recipients when dialog opens
  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      fetchEligibleRecipients()
        .then(setRecipients)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [open, document, fetchEligibleRecipients]);

  const handleToggleShare = useCallback(
    async (recipient: IEligibleRecipient) => {
      if (!document) return;

      setActionLoading(recipient.user_id);
      setError(null);

      try {
        if (sharedUserIds.has(recipient.user_id)) {
          // Revoke access
          await onRevoke(document.id, recipient.user_id);
        } else {
          // Grant access
          await onShare(document.id, recipient.user_id, 'view');
        }
        onUpdate();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
      } finally {
        setActionLoading(null);
      }
    },
    [document, sharedUserIds, onShare, onRevoke, onUpdate]
  );

  const handleClose = () => {
    if (!actionLoading) {
      setError(null);
      onClose();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'approver':
        return 'warning';
      case 'manager':
        return 'info';
      default:
        return 'default';
    }
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
              backgroundColor: alpha(theme.palette.info.main, 0.08),
            }}
          >
            <Iconify icon="solar:share-bold" width={28} sx={{ color: 'info.main' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Share Document</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {document?.name}
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
              Only your assigned approvers and managers can receive document access. You can revoke
              access at any time.
            </Typography>
          </Alert>

          {/* Current Shares */}
          {currentShares.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Currently Shared With
              </Typography>
              <Stack spacing={1}>
                {currentShares.map((share) => (
                  <Stack
                    key={share.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main', fontSize: '0.875rem' }}>
                        {share.shared_with_user?.firstname?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {share.shared_with_user?.firstname} {share.shared_with_user?.lastname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {share.shared_with_user?.role}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                      label="Has Access"
                      color="success"
                      variant="soft"
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {currentShares.length > 0 && recipients.length > 0 && <Divider />}

          {/* Available Recipients */}
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading eligible recipients...
              </Typography>
            </Stack>
          ) : recipients.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <Iconify
                icon="solar:users-group-rounded-bold-duotone"
                width={48}
                sx={{ color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No eligible recipients found. Approvers and managers will appear here once they are
                assigned to your adjustment requests.
              </Typography>
            </Stack>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                {currentShares.length > 0 ? 'Grant Access To Others' : 'Select Recipients'}
              </Typography>
              <Stack spacing={1}>
                {recipients
                  .filter((r) => !sharedUserIds.has(r.user_id))
                  .map((recipient) => (
                    <Stack
                      key={recipient.user_id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.grey[500], 0.04),
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: alpha(theme.palette.primary.main, 0.24),
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {recipient.firstname?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2">
                              {recipient.firstname} {recipient.lastname}
                            </Typography>
                            <Label variant="soft" color={getRoleColor(recipient.role)} sx={{ height: 20 }}>
                              {recipient.role}
                            </Label>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {recipient.job_title || recipient.email}
                          </Typography>
                        </Box>
                      </Stack>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={sharedUserIds.has(recipient.user_id)}
                            onChange={() => handleToggleShare(recipient)}
                            disabled={actionLoading === recipient.user_id}
                          />
                        }
                        label={
                          actionLoading === recipient.user_id ? (
                            <CircularProgress size={16} />
                          ) : (
                            'Grant Access'
                          )
                        }
                        sx={{ mr: 0 }}
                      />
                    </Stack>
                  ))}
              </Stack>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Revoke Section */}
          {currentShares.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Revoke Access
                </Typography>
                <Stack spacing={1}>
                  {currentShares.map((share) => (
                    <Stack
                      key={share.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.grey[500], 0.04),
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {share.shared_with_user?.firstname?.[0] || '?'}
                        </Avatar>
                        <Typography variant="subtitle2">
                          {share.shared_with_user?.firstname} {share.shared_with_user?.lastname}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          handleToggleShare({
                            user_id: share.shared_with_user_id,
                            firstname: share.shared_with_user?.firstname || '',
                            lastname: share.shared_with_user?.lastname || '',
                            email: share.shared_with_user?.email || '',
                            role: share.shared_with_user?.role || '',
                            job_title: null,
                          })
                        }
                        disabled={actionLoading === share.shared_with_user_id}
                        startIcon={
                          actionLoading === share.shared_with_user_id ? (
                            <CircularProgress size={14} />
                          ) : (
                            <Iconify icon="solar:close-circle-bold" width={16} />
                          )
                        }
                      >
                        Revoke
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={!!actionLoading}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
