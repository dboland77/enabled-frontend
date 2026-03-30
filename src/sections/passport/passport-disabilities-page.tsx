'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';

import { forwardRef } from 'react';

import { IDisabilityItem } from '@/types/disability';
import Iconify from '@/components/iconify';

// ----------------------------------------------------------------------

interface PassportDisabilitiesPageProps {
  disabilities: IDisabilityItem[];
  pageNumber: number;
}

const PassportDisabilitiesPage = forwardRef<HTMLDivElement, PassportDisabilitiesPageProps>(
  ({ disabilities, pageNumber }, ref) => {
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
              ${theme.palette.primary.main},
              ${theme.palette.primary.main} 1px,
              transparent 1px,
              transparent 20px
            ),
            repeating-linear-gradient(
              90deg,
              ${theme.palette.primary.main},
              ${theme.palette.primary.main} 1px,
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
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Iconify 
              icon="mdi:medical-bag" 
              width={18} 
              sx={{ color: theme.palette.info.main }}
            />
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.dark,
                letterSpacing: 2,
                fontSize: '10px',
              }}
            >
              My Conditions
            </Typography>
          </Box>
        </Box>

        {/* Disabilities list */}
        {disabilities.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 80px)',
              color: theme.palette.text.secondary,
            }}
          >
            <Iconify 
              icon="mdi:clipboard-text-outline" 
              width={40} 
              sx={{ mb: 1, opacity: 0.5 }}
            />
            <Typography variant="body2" sx={{ fontSize: '11px' }}>
              No conditions recorded
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {disabilities.map((disability) => (
              <Box
                key={disability.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderLeft: `3px solid ${theme.palette.info.main}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '11px',
                    mb: 0.5,
                  }}
                >
                  {disability.disability_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={disability.category}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9px',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.dark,
                    }}
                  />
                  {disability.subcategory && (
                    <Chip
                      label={disability.subcategory}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '9px',
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        color: theme.palette.text.secondary,
                      }}
                    />
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

PassportDisabilitiesPage.displayName = 'PassportDisabilitiesPage';

export default PassportDisabilitiesPage;
