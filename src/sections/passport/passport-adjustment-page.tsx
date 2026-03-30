'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';

import { format } from 'date-fns';
import { forwardRef, useMemo } from 'react';

import { IAdjustmentRequestItem } from '@/types/adjustmentRequest';
import { getApproverInitials } from '@/types/passport';
import PassportStamp from './passport-stamp';

// ----------------------------------------------------------------------

interface PassportAdjustmentPageProps {
  adjustment: IAdjustmentRequestItem;
  pageNumber: number;
}

const PassportAdjustmentPage = forwardRef<HTMLDivElement, PassportAdjustmentPageProps>(
  ({ adjustment, pageNumber }, ref) => {
    const theme = useTheme();

    // Generate a consistent rotation for this stamp based on the adjustment ID
    const stampRotation = useMemo(() => {
      const hash = adjustment.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 11) - 5; // Range: -5 to 5 degrees
    }, [adjustment.id]);

    const approverInitials = getApproverInitials(adjustment.approverName);

    return (
      <Box
        ref={ref}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#FAF8F5',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
            mb: 1.5,
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.dark,
              letterSpacing: 2,
              fontSize: '9px',
            }}
          >
            Approved Adjustment
          </Typography>
        </Box>

        {/* Adjustment title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
            fontSize: '13px',
            lineHeight: 1.3,
          }}
        >
          {adjustment.title || 'Untitled Adjustment'}
        </Typography>

        {/* Type chip */}
        {adjustment.adjustmentType && (
          <Box sx={{ mb: 1.5 }}>
            <Chip
              label={adjustment.adjustmentType}
              size="small"
              sx={{
                height: 20,
                fontSize: '9px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.dark,
              }}
            />
          </Box>
        )}

        {/* Details */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {adjustment.detail && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Details
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '10px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {adjustment.detail}
              </Typography>
            </Box>
          )}

          {/* Location & Work Function */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            {adjustment.location && (
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Location
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.primary, fontSize: '10px' }}
                >
                  {adjustment.location}
                </Typography>
              </Box>
            )}
            {adjustment.workfunction && (
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Work Function
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.primary, fontSize: '10px' }}
                >
                  {adjustment.workfunction}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Approval info */}
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Approved By
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '10px',
                  }}
                >
                  {adjustment.approverName || 'Authorised Approver'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Date
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '10px',
                  }}
                >
                  {adjustment.respondedAt
                    ? format(new Date(adjustment.respondedAt), 'dd MMM yyyy')
                    : format(new Date(adjustment.createdAt), 'dd MMM yyyy')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stamp - positioned at bottom right */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 8,
            zIndex: 1,
          }}
        >
          <PassportStamp
            approvalDate={adjustment.respondedAt || adjustment.createdAt}
            approverInitials={approverInitials}
            rotation={stampRotation}
          />
        </Box>

        {/* Page number */}
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 12,
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

PassportAdjustmentPage.displayName = 'PassportAdjustmentPage';

export default PassportAdjustmentPage;
