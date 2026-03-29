'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

export default function PassportEmpty() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      {/* Passport illustration */}
      <Box
        sx={{
          width: 120,
          height: 160,
          borderRadius: 1,
          background: `linear-gradient(145deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[400]} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          position: 'relative',
          boxShadow: theme.shadows[8],
        }}
      >
        {/* Emblem placeholder */}
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: `2px dashed ${alpha(theme.palette.grey[600], 0.5)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <Iconify
            icon="mdi:passport"
            sx={{
              fontSize: 24,
              color: alpha(theme.palette.grey[600], 0.5),
            }}
          />
        </Box>
        <Box
          sx={{
            width: '60%',
            height: 4,
            bgcolor: alpha(theme.palette.grey[600], 0.3),
            borderRadius: 0.5,
            mb: 0.5,
          }}
        />
        <Box
          sx={{
            width: '40%',
            height: 4,
            bgcolor: alpha(theme.palette.grey[600], 0.3),
            borderRadius: 0.5,
          }}
        />
      </Box>

      <Typography variant="h5" sx={{ mb: 1 }}>
        No Approved Adjustments Yet
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: 400,
          mb: 3,
        }}
      >
        Your Reasonable Adjustments Passport will be created once you have at least one approved
        adjustment. Request an adjustment to get started.
      </Typography>

      <Button
        href="/dashboard/user/adjustmentRequests/new"
        variant="contained"
        startIcon={<Iconify icon="eva:plus-fill" />}
      >
        Request an Adjustment
      </Button>
    </Box>
  );
}
