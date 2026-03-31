'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IUserProfileCover } from '@/types/user';

// ----------------------------------------------------------------------

// SVG pattern for decorative background
const PATTERN_SVG = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.15"/>
    </pattern>
    <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 10 Q10 0, 20 10 T40 10" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#dots)"/>
  <rect width="100" height="100" fill="url(#waves)"/>
</svg>
`;

interface ProfileCoverProps extends IUserProfileCover {
  isEditMode?: boolean;
  onToggleEdit?: () => void;
  completionPercentage?: number;
}

export default function ProfileCover({ 
  name, 
  avatarUrl, 
  role, 
  isEditMode = false,
  onToggleEdit,
  completionPercentage = 0,
}: ProfileCoverProps) {
  const theme = useTheme();

  // Generate a warm, welcoming gradient
  const gradientColors = {
    start: theme.palette.primary.main,
    middle: theme.palette.primary.dark,
    end: alpha(theme.palette.primary.darker, 0.95),
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: 1,
        overflow: 'hidden',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.middle} 50%, ${gradientColors.end} 100%)`,
      }}
    >
      {/* Decorative pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVG.replace(/currentColor/g, theme.palette.common.white))}")`,
          backgroundSize: '200px 200px',
          opacity: 0.6,
        }}
      />

      {/* Floating decorative shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, 0.05),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: '30%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, 0.03),
        }}
      />

      {/* Edit/View toggle button */}
      {onToggleEdit && (
        <Tooltip 
          title={isEditMode ? 'Switch to view mode' : 'Edit your profile'} 
          arrow 
          placement="left"
        >
          <IconButton
            onClick={onToggleEdit}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              bgcolor: alpha(theme.palette.common.white, 0.15),
              backdropFilter: 'blur(8px)',
              color: 'common.white',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.25),
                transform: 'scale(1.05)',
              },
            }}
          >
            <Iconify 
              icon={isEditMode ? 'solar:eye-bold' : 'solar:pen-bold'} 
              width={20} 
            />
          </IconButton>
        </Tooltip>
      )}

      {/* Profile completion indicator */}
      {completionPercentage > 0 && completionPercentage < 100 && (
        <Tooltip 
          title={`Profile ${completionPercentage}% complete. Add more details to help us support you better!`} 
          arrow 
          placement="bottom"
        >
          <Chip
            icon={<Iconify icon="solar:chart-bold" width={16} />}
            label={`${completionPercentage}% Complete`}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              bgcolor: alpha(theme.palette.common.white, 0.15),
              backdropFilter: 'blur(8px)',
              color: 'common.white',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        </Tooltip>
      )}

      {/* Main content */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'center', md: 'flex-end' }}
        sx={{
          position: 'relative',
          zIndex: 5,
          height: 1,
          px: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
          pt: { xs: 4, md: 0 },
        }}
      >
        {/* Avatar with status ring */}
        <Tooltip title="Looking great!" arrow placement="top">
          <Box
            sx={{
              position: 'relative',
              mb: { xs: 2, md: 0 },
            }}
          >
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                border: `4px solid ${theme.palette.common.white}`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {name?.charAt(0)}
            </Avatar>
            {/* Online status indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'success.main',
                border: `2px solid ${theme.palette.common.white}`,
              }}
            />
          </Box>
        </Tooltip>

        {/* Name and role */}
        <Stack
          sx={{
            ml: { md: 3 },
            textAlign: { xs: 'center', md: 'left' },
            color: 'common.white',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            {name || 'Welcome!'}
          </Typography>
          
          {role && (
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mt: 0.5 }}
            >
              <Iconify icon="solar:briefcase-bold" width={18} sx={{ opacity: 0.8 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  textTransform: 'capitalize',
                }}
              >
                {role}
              </Typography>
            </Stack>
          )}

          {/* Friendly welcome message */}
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1,
              opacity: 0.7,
              maxWidth: 300,
            }}
          >
            {isEditMode 
              ? 'Update your information below to help us support you better.'
              : 'Your profile helps us provide personalized support.'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
