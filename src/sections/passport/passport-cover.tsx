'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

// ----------------------------------------------------------------------

interface PassportCoverProps {
  variant: 'front' | 'back';
}

const PassportCover = forwardRef<HTMLDivElement, PassportCoverProps>(({ variant }, ref) => {
  const theme = useTheme();

  if (variant === 'front') {
    return (
      <Box
        ref={ref}
        sx={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Embossed texture pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )`,
          }}
        />

        {/* Top decorative border */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            height: 2,
            bgcolor: alpha('#D4AF37', 0.6),
            borderRadius: 1,
          }}
        />

        {/* Emblem/Logo area */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `3px solid ${alpha('#D4AF37', 0.8)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            position: 'relative',
            bgcolor: alpha('#D4AF37', 0.1),
          }}
        >
          {/* Inner circle */}
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `2px solid ${alpha('#D4AF37', 0.6)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Universal accessibility symbol */}
            <Typography
              sx={{
                fontSize: 28,
                color: alpha('#D4AF37', 0.9),
              }}
            >
              ♿
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            color: alpha('#D4AF37', 0.95),
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            textAlign: 'center',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Reasonable
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: alpha('#D4AF37', 0.95),
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            textAlign: 'center',
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Adjustments
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: alpha('#D4AF37', 1),
            fontWeight: 800,
            letterSpacing: 4,
            textTransform: 'uppercase',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          Passport
        </Typography>

        {/* Decorative line */}
        <Box
          sx={{
            width: '60%',
            height: 1,
            bgcolor: alpha('#D4AF37', 0.5),
            mt: 3,
            mb: 2,
          }}
        />

        {/* Subtitle */}
        <Typography
          variant="caption"
          sx={{
            color: alpha('#D4AF37', 0.7),
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Official Document
        </Typography>

        {/* Bottom decorative border */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            height: 2,
            bgcolor: alpha('#D4AF37', 0.6),
            borderRadius: 1,
          }}
        />

        {/* Corner decorations */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <Box
            key={corner}
            sx={{
              position: 'absolute',
              width: 20,
              height: 20,
              borderColor: alpha('#D4AF37', 0.5),
              borderStyle: 'solid',
              borderWidth: 0,
              ...(corner === 'top-left' && { top: 24, left: 24, borderTopWidth: 2, borderLeftWidth: 2 }),
              ...(corner === 'top-right' && { top: 24, right: 24, borderTopWidth: 2, borderRightWidth: 2 }),
              ...(corner === 'bottom-left' && { bottom: 24, left: 24, borderBottomWidth: 2, borderLeftWidth: 2 }),
              ...(corner === 'bottom-right' && { bottom: 24, right: 24, borderBottomWidth: 2, borderRightWidth: 2 }),
            }}
          />
        ))}
      </Box>
    );
  }

  // Back cover
  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
      }}
    >
      {/* Embossed texture pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.1) 2px,
            rgba(255,255,255,0.1) 4px
          )`,
        }}
      />

      {/* Contact info */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: alpha('#D4AF37', 0.8),
            letterSpacing: 1,
            display: 'block',
            mb: 1,
          }}
        >
          For assistance contact your
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: alpha('#D4AF37', 0.9),
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          HR Department
        </Typography>
      </Box>

      {/* Bottom branding */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha('#D4AF37', 0.6),
            letterSpacing: 1,
          }}
        >
          Powered by Enabled
        </Typography>
      </Box>
    </Box>
  );
});

PassportCover.displayName = 'PassportCover';

export default PassportCover;
