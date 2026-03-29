'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { format } from 'date-fns';

// ----------------------------------------------------------------------

interface PassportStampProps {
  approvalDate: string;
  approverInitials: string;
  rotation?: number;
}

export default function PassportStamp({ approvalDate, approverInitials, rotation = 0 }: PassportStampProps) {
  const theme = useTheme();
  
  // Format date for display
  const formattedDate = (() => {
    try {
      return format(new Date(approvalDate), 'dd MMM yyyy').toUpperCase();
    } catch {
      return approvalDate;
    }
  })();

  return (
    <Box
      sx={{
        position: 'relative',
        width: 120,
        height: 120,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: `rotate(${rotation}deg) scale(1.05)`,
        },
      }}
    >
      {/* Outer circle */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `3px solid ${alpha('#8B0000', 0.85)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: alpha('#8B0000', 0.08),
          boxShadow: `inset 0 0 10px ${alpha('#8B0000', 0.15)}`,
        }}
      >
        {/* Inner decorative circle */}
        <Box
          sx={{
            position: 'absolute',
            inset: 6,
            borderRadius: '50%',
            border: `1.5px solid ${alpha('#8B0000', 0.6)}`,
          }}
        />

        {/* APPROVED text - curved at top */}
        <Typography
          sx={{
            position: 'absolute',
            top: 12,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: alpha('#8B0000', 0.9),
            textTransform: 'uppercase',
          }}
        >
          Approved
        </Typography>

        {/* Star decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            display: 'flex',
            gap: 0.5,
            color: alpha('#8B0000', 0.7),
            fontSize: '8px',
          }}
        >
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </Box>

        {/* Date */}
        <Typography
          sx={{
            fontSize: '9px',
            fontWeight: 600,
            color: alpha('#8B0000', 0.85),
            mt: 1,
          }}
        >
          {formattedDate}
        </Typography>

        {/* Approver initials */}
        <Box
          sx={{
            mt: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            border: `1px solid ${alpha('#8B0000', 0.5)}`,
            bgcolor: alpha('#8B0000', 0.05),
          }}
        >
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: alpha('#8B0000', 0.9),
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {approverInitials}
          </Typography>
        </Box>

        {/* Bottom decoration */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 14,
            display: 'flex',
            gap: 0.5,
            color: alpha('#8B0000', 0.7),
            fontSize: '8px',
          }}
        >
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </Box>
      </Box>

      {/* Ink texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 30% 30%, transparent 60%, ${alpha('#8B0000', 0.1)} 100%)`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
