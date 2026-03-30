'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

import { IPassportLimitation } from '@/types/passport';
import Iconify from '@/components/iconify';

// ----------------------------------------------------------------------

interface PassportLimitationsPageProps {
  limitations: IPassportLimitation[];
  pageNumber: number;
}

const PassportLimitationsPage = forwardRef<HTMLDivElement, PassportLimitationsPageProps>(
  ({ limitations, pageNumber }, ref) => {
    const theme = useTheme();

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
        }}
      >
        {/* Watermark pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              ${theme.palette.warning.main},
              ${theme.palette.warning.main} 1px,
              transparent 1px,
              transparent 20px
            ),
            repeating-linear-gradient(
              90deg,
              ${theme.palette.warning.main},
              ${theme.palette.warning.main} 1px,
              transparent 1px,
              transparent 20px
            )`,
          }}
        />

        {/* Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 2,
            pb: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Iconify 
              icon="mdi:alert-circle-outline" 
              width={18} 
              sx={{ color: theme.palette.warning.main }}
            />
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.warning.dark,
                letterSpacing: 2,
                fontSize: '10px',
              }}
            >
              I Struggle With
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '9px',
              display: 'block',
              mt: 0.5,
            }}
          >
            Areas where I may need additional support
          </Typography>
        </Box>

        {/* Limitations list */}
        {limitations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 100px)',
              color: theme.palette.text.secondary,
            }}
          >
            <Iconify 
              icon="mdi:hand-heart-outline" 
              width={40} 
              sx={{ mb: 1, opacity: 0.5 }}
            />
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              No limitations recorded
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '9px', mt: 0.5 }}>
              Add items to help others understand your needs
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {limitations.map((limitation, index) => (
              <Box
                key={limitation.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                {/* Number badge */}
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                    color: theme.palette.warning.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: '11px',
                      lineHeight: 1.4,
                    }}
                  >
                    {limitation.description}
                  </Typography>
                  {limitation.category && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '9px',
                        display: 'block',
                        mt: 0.5,
                      }}
                    >
                      {limitation.category}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Page number */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 12,
            fontSize: '10px',
            color: theme.palette.text.disabled,
          }}
        >
          {pageNumber}
        </Typography>
      </Box>
    );
  }
);

PassportLimitationsPage.displayName = 'PassportLimitationsPage';

export default PassportLimitationsPage;
