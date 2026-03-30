'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { usePassport } from '@/hooks/use-passport';
import { usePassportDownload } from '@/hooks/use-passport-download';
import { useBoolean } from '@/hooks/use-boolean';

import PassportBook from '../passport-book';
import PassportEmpty from '../passport-empty';
import PassportSendDialog from '../passport-send-dialog';
import PassportFullscreenModal from '../passport-fullscreen-modal';

// ----------------------------------------------------------------------

export default function PassportView() {
  const theme = useTheme();
  const { passportData, loading, error, addLimitation, removeLimitation } = usePassport();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const { download, downloading } = usePassportDownload(passportData);
  
  // Limitations management
  const limitationsDialog = useBoolean();
  const [newLimitation, setNewLimitation] = useState('');
  const [addingLimitation, setAddingLimitation] = useState(false);

  const handleAddLimitation = async () => {
    if (!newLimitation.trim()) return;
    setAddingLimitation(true);
    const success = await addLimitation(newLimitation.trim());
    if (success) {
      setNewLimitation('');
    }
    setAddingLimitation(false);
  };

  const handleRemoveLimitation = async (id: string) => {
    await removeLimitation(id);
  };

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

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Iconify icon="mdi:alert-circle-outline" />}
            onClick={limitationsDialog.onTrue}
          >
            Manage Limitations
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:expand-fill" />}
            onClick={() => setFullscreenOpen(true)}
          >
            Fullscreen
          </Button>
          <Button
            variant="outlined"
            startIcon={
              downloading ? (
                <Iconify icon="eva:loader-outline" />
              ) : (
                <Iconify icon="eva:download-outline" />
              )
            }
            onClick={download}
            disabled={downloading}
          >
            {downloading ? 'Generating...' : 'Download PDF'}
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
                bgcolor: alpha(theme.palette.info.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:medical-bag" sx={{ color: theme.palette.info.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                My Conditions
              </Typography>
              <Typography variant="subtitle2">
                {passportData.disabilities?.length || 0}
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
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:alert-circle-outline" sx={{ color: theme.palette.warning.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                I Struggle With
              </Typography>
              <Typography variant="subtitle2">
                {passportData.limitations?.length || 0} items
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

      {/* Limitations Management Dialog */}
      <Dialog
        open={limitationsDialog.value}
        onClose={limitationsDialog.onFalse}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:alert-circle-outline" sx={{ color: theme.palette.warning.main }} />
            Manage &quot;I Struggle With&quot;
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
            Add things you find challenging at work. These will appear in your passport to help others understand your needs.
          </Typography>

          {/* Add new limitation */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Concentrating in noisy environments"
              value={newLimitation}
              onChange={(e) => setNewLimitation(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddLimitation();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddLimitation}
              disabled={!newLimitation.trim() || addingLimitation}
              sx={{ minWidth: 80 }}
            >
              {addingLimitation ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </Box>

          {/* Current limitations list */}
          {passportData.limitations && passportData.limitations.length > 0 ? (
            <List sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04), borderRadius: 1 }}>
              {passportData.limitations.map((limitation, index) => (
                <ListItem
                  key={limitation.id}
                  divider={index < passportData.limitations!.length - 1}
                >
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      mr: 2,
                      width: 28,
                      height: 28,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.dark,
                    }}
                  />
                  <ListItemText
                    primary={limitation.description}
                    secondary={limitation.category}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveLimitation(limitation.id)}
                      size="small"
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                borderRadius: 1,
              }}
            >
              <Iconify icon="mdi:hand-heart-outline" width={40} sx={{ mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">No limitations added yet</Typography>
              <Typography variant="caption">
                Add items above to help others understand your needs
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={limitationsDialog.onFalse}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
