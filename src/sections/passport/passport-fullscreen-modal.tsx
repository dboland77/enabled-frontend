'use client';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import Iconify from '@/components/iconify';
import { IPassportData } from '@/types/passport';

import PassportBook from './passport-book';

// ----------------------------------------------------------------------

interface PassportFullscreenModalProps {
  open: boolean;
  onClose: () => void;
  data: IPassportData;
}

// Base dimensions of the passport book at scale=1
const BASE_BOOK_WIDTH = 560;  // two pages side-by-side
const BASE_BOOK_HEIGHT = 420; // page height + controls

export default function PassportFullscreenModal({
  open,
  onClose,
  data,
}: PassportFullscreenModalProps) {
  const theme = useTheme();
  const [scale, setScale] = useState(1);

  // Recalculate scale whenever the modal opens or window resizes
  useEffect(() => {
    if (!open) return;

    const calculateScale = () => {
      const availableW = window.innerWidth * 0.9;
      const availableH = window.innerHeight * 0.88; // leave room for close button
      const scaleW = availableW / BASE_BOOK_WIDTH;
      const scaleH = availableH / BASE_BOOK_HEIGHT;
      setScale(Math.min(scaleW, scaleH, 2.4)); // cap at 2.4× to keep quality
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [open]);

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
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          outline: 'none',
        }}
      >
        {/* Close button — always anchored top-right */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            bgcolor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            zIndex: 10,
          }}
        >
          <Iconify icon="eva:close-fill" width={24} />
        </IconButton>

        {/* Scaled passport */}
        <PassportBook data={data} scale={scale} />
      </Box>
    </Modal>
  );
}
