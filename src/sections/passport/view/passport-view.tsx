'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { usePassport } from '@/hooks/use-passport';

import PassportBook from '../passport-book';
import PassportEmpty from '../passport-empty';
import PassportSendDialog from '../passport-send-dialog';
import PassportFullscreenModal from '../passport-fullscreen-modal';

// ----------------------------------------------------------------------

export default function PassportView() {
  const theme = useTheme();
  const { passportData, loading, error } = usePassport();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Show empty state if no approved adjustments
  if (!passportData || passportData.approvedAdjustments.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <PassportEmpty />
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            My Passport
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Your official Reasonable Adjustments Passport with {passportData.approvedAdjustments.length}{' '}
            approved adjustment{passportData.approvedAdjustments.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:expand-fill" />}
            onClick={() => setFullscreenOpen(true)}
          >
            Fullscreen
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:email-outline" />}
            onClick={() => setSendDialogOpen(true)}
          >
            Send Passport
          </Button>
        </Box>
      </Box>

      {/* Passport book */}
      <Card
        sx={{
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.grey[500], 0.04),
          backgroundImage: `radial-gradient(${alpha(theme.palette.grey[500], 0.1)} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <PassportBook data={passportData} />
      </Card>

      {/* Info cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mt: 3,
        }}
      >
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:passport" sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Passport Number
              </Typography>
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                {passportData.passportNumber}
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: theme.palette.success.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Approved Adjustments
              </Typography>
              <Typography variant="subtitle2">
                {passportData.approvedAdjustments.length}
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="eva:calendar-fill" sx={{ color: theme.palette.info.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Last Updated
              </Typography>
              <Typography variant="subtitle2">
                {new Date(passportData.lastUpdated).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Send dialog */}
      <PassportSendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        passportNumber={passportData.passportNumber}
        holderName={passportData.holder.fullName}
        defaultEmail={passportData.holder.email}
      />

      {/* Fullscreen modal */}
      <PassportFullscreenModal
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        data={passportData}
      />
    </Box>
  );
}
