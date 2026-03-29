'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';

// ----------------------------------------------------------------------

interface PassportSendDialogProps {
  open: boolean;
  onClose: () => void;
  passportNumber: string;
  holderName: string;
  defaultEmail?: string;
}

export default function PassportSendDialog({
  open,
  onClose,
  passportNumber,
  holderName,
  defaultEmail = '',
}: PassportSendDialogProps) {
  const theme = useTheme();
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/passport/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          passportNumber,
          holderName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send passport');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail(defaultEmail);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send passport');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
      setEmail(defaultEmail);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:email-outline" sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h6">Send Passport</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Send a PDF copy via email
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            Passport request submitted. In a production environment, a PDF would be generated and sent to {email}.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 2 }}>
              This feature is currently in demo mode. To enable actual email delivery, integrate with a service like Resend, SendGrid, or nodemailer.
            </Alert>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Enter the email address where you would like to send your Reasonable Adjustments Passport. In production, a PDF attachment will be included.
              </Typography>

              <TextField
                fullWidth
                label="Recipient Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                disabled={loading}
                autoFocus
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}
                >
                  Sending passport for:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {holderName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}
                >
                  {passportNumber}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={loading || !email}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:paper-plane-fill" />}
          >
            {loading ? 'Sending...' : 'Send Passport'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
