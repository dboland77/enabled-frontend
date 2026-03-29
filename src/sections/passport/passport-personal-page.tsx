'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { alpha, useTheme } from '@mui/material/styles';

import { format } from 'date-fns';
import { forwardRef } from 'react';

import { IPassportHolder } from '@/types/passport';

// ----------------------------------------------------------------------

interface PassportPersonalPageProps {
  holder: IPassportHolder;
  passportNumber: string;
  totalApprovedAdjustments: number;
}

const PassportPersonalPage = forwardRef<HTMLDivElement, PassportPersonalPageProps>(
  ({ holder, passportNumber, totalApprovedAdjustments }, ref) => {
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
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.dark,
              letterSpacing: 2,
              fontSize: '10px',
            }}
          >
            Personal Information
          </Typography>
        </Box>

        {/* Photo section */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 100,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              flexShrink: 0,
            }}
          >
            <Avatar
              src={holder.avatarUrl}
              alt={holder.fullName}
              sx={{
                width: 72,
                height: 92,
                borderRadius: 0,
                fontSize: 24,
                bgcolor: theme.palette.primary.lighter,
                color: theme.palette.primary.dark,
              }}
            >
              {holder.fullName?.charAt(0) || 'U'}
            </Avatar>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Full Name
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {holder.fullName || 'Not specified'}
              </Typography>
            </Box>

            {/* Email */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Email
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {holder.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Passport details */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Passport No.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.dark,
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
            >
              {passportNumber}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Issue Date
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '11px',
              }}
            >
              {format(holder.issueDate, 'dd MMM yyyy')}
            </Typography>
          </Box>
        </Box>

        {/* Summary */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Approved Adjustments
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            {totalApprovedAdjustments}
          </Typography>
        </Box>

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
          1
        </Typography>
      </Box>
    );
  }
);

PassportPersonalPage.displayName = 'PassportPersonalPage';

export default PassportPersonalPage;
