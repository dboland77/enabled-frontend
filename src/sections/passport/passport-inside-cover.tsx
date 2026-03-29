'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

// ----------------------------------------------------------------------

interface PassportInsideCoverProps {
  variant: 'front' | 'back';
}

const PassportInsideCover = forwardRef<HTMLDivElement, PassportInsideCoverProps>(({ variant }, ref) => {
  const theme = useTheme();

  if (variant === 'front') {
    return (
      <Box
        ref={ref}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#FAF8F5',
          p: 2.5,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Decorative pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, ${theme.palette.primary.main} 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Important notice */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.dark,
              letterSpacing: 2,
              fontSize: '10px',
              mb: 2,
              display: 'block',
            }}
          >
            Important Information
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '10px',
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            This passport documents reasonable adjustments that have been approved for the holder. Present this document to employers, HR departments, or other relevant parties when transitioning to new roles or workplaces.
          </Typography>

          <Box
            sx={{
              width: '40%',
              height: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              mx: 'auto',
              my: 2,
            }}
          />

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '10px',
              lineHeight: 1.6,
            }}
          >
            Each approved adjustment is stamped and dated by the authorizing official.
          </Typography>
        </Box>

        {/* Corner decorations */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
          <Box
            key={corner}
            sx={{
              position: 'absolute',
              width: 20,
              height: 20,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderStyle: 'solid',
              borderWidth: 0,
              ...(corner === 'top-left' && { top: 12, left: 12, borderTopWidth: 1, borderLeftWidth: 1 }),
              ...(corner === 'top-right' && { top: 12, right: 12, borderTopWidth: 1, borderRightWidth: 1 }),
              ...(corner === 'bottom-left' && { bottom: 12, left: 12, borderBottomWidth: 1, borderLeftWidth: 1 }),
              ...(corner === 'bottom-right' && { bottom: 12, right: 12, borderBottomWidth: 1, borderRightWidth: 1 }),
            }}
          />
        ))}
      </Box>
    );
  }

  // Back inside cover - notes/info page
  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#FAF8F5',
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Decorative pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${theme.palette.primary.main} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <Typography
        variant="overline"
        sx={{
          color: theme.palette.primary.dark,
          letterSpacing: 2,
          fontSize: '10px',
          mb: 2,
          textAlign: 'center',
        }}
      >
        Notes
      </Typography>

      {/* Lined area for notes */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 19px,
            ${alpha(theme.palette.primary.main, 0.15)} 19px,
            ${alpha(theme.palette.primary.main, 0.15)} 20px
          )`,
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
            borderColor: alpha(theme.palette.primary.main, 0.2),
            borderStyle: 'solid',
            borderWidth: 0,
            ...(corner === 'top-left' && { top: 12, left: 12, borderTopWidth: 1, borderLeftWidth: 1 }),
            ...(corner === 'top-right' && { top: 12, right: 12, borderTopWidth: 1, borderRightWidth: 1 }),
            ...(corner === 'bottom-left' && { bottom: 12, left: 12, borderBottomWidth: 1, borderLeftWidth: 1 }),
            ...(corner === 'bottom-right' && { bottom: 12, right: 12, borderBottomWidth: 1, borderRightWidth: 1 }),
          }}
        />
      ))}
    </Box>
  );
});

PassportInsideCover.displayName = 'PassportInsideCover';

export default PassportInsideCover;
