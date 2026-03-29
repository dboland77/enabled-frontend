'use client';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IPassportData } from '@/types/passport';

import PassportBook from './passport-book';

// ----------------------------------------------------------------------

interface PassportFullscreenModalProps {
  open: boolean;
  onClose: () => void;
  data: IPassportData;
}

export default function PassportFullscreenModal({
  open,
  onClose,
  data,
}: PassportFullscreenModalProps) {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '95vw',
          height: '95vh',
          maxWidth: 1200,
          maxHeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: theme.shadows[24],
          overflow: 'auto',
          p: 2,
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.1)',
            },
            zIndex: 10,
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>

        {/* Passport book */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <PassportBook data={data} />
        </Box>
      </Box>
    </Modal>
  );
}
