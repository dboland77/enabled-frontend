'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { useUserProfile, UserDisability, UserAdjustment } from '@/hooks/use-user-profile';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

interface InfoItemProps {
  icon: string;
  label: string;
  value: string | null | undefined;
  tooltip?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
}

function InfoItem({ icon, label, value, tooltip, color = 'primary' }: InfoItemProps) {
  const theme = useTheme();
  
  const content = (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette[color].main, 0.08),
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette[color].main, 0.12),
          transform: 'translateX(4px)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette[color].main, 0.16),
          color: theme.palette[color].main,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value || 'Not specified'}
        </Typography>
      </Box>
    </Stack>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top">
      {content}
    </Tooltip>
  ) : content;
}

// ----------------------------------------------------------------------

export default function ProfileReadView() {
  const theme = useTheme();
  const { profile, loading, fetchUserDisabilities, fetchUserAdjustments } = useUserProfile();
  
  const [userDisabilities, setUserDisabilities] = useState<UserDisability[]>([]);
  const [userAdjustments, setUserAdjustments] = useState<UserAdjustment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoadingData(true);
      try {
        const [disabilities, adjustments] = await Promise.all([
          fetchUserDisabilities(),
          fetchUserAdjustments(),
        ]);
        setUserDisabilities(disabilities);
        setUserAdjustments(adjustments);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadUserData();
  }, [fetchUserDisabilities, fetchUserAdjustments]);

  if (loading || loadingData) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading your profile...</Typography>
      </Card>
    );
  }

  const fullName = `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim();

  return (
    <Grid container spacing={3}>
      {/* Personal Information Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:user-bold" width={18} />
            </Box>
            <Typography variant="h6">Personal Details</Typography>
          </Stack>

          <Stack spacing={2}>
            <InfoItem 
              icon="solar:user-id-bold" 
              label="Full Name" 
              value={fullName}
              tooltip="Your display name across the platform"
              color="primary"
            />
            <InfoItem 
              icon="solar:letter-bold" 
              label="Email" 
              value={profile?.email}
              tooltip="Used for notifications and account recovery"
              color="info"
            />
          </Stack>
        </Card>
      </Grid>

      {/* Job Information Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: 'secondary.main',
              }}
            >
              <Iconify icon="solar:briefcase-bold" width={18} />
            </Box>
            <Typography variant="h6">Work Information</Typography>
          </Stack>

          <Stack spacing={2}>
            <InfoItem 
              icon="solar:case-round-bold" 
              label="Job Title" 
              value={profile?.job_title}
              tooltip="Your current position"
              color="secondary"
            />
            <InfoItem 
              icon="solar:buildings-bold" 
              label="Department" 
              value={profile?.department}
              tooltip="Your team or department"
              color="warning"
            />
            <InfoItem 
              icon="solar:shield-user-bold" 
              label="Role" 
              value={profile?.role}
              tooltip="Your access level in the system"
              color="success"
            />
          </Stack>
        </Card>
      </Grid>

      {/* Disabilities Card */}
      {profile?.is_disabled && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.info.main, 0.12),
                  color: 'info.main',
                }}
              >
                <Iconify icon="solar:heart-pulse-bold" width={18} />
              </Box>
              <Typography variant="h6">Disability Information</Typography>
              <Tooltip title="This information helps us provide appropriate support and accommodations" arrow>
                <Box sx={{ display: 'flex', cursor: 'help' }}>
                  <Iconify icon="solar:info-circle-bold" width={18} color="text.secondary" />
                </Box>
              </Tooltip>
            </Stack>

            {userDisabilities.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {userDisabilities.map((disability) => (
                  <Tooltip 
                    key={disability.id} 
                    title="Click Edit to manage your disabilities"
                    arrow
                  >
                    <Chip
                      label={disability.disability_name}
                      color="info"
                      variant="soft"
                      icon={<Iconify icon="solar:accessibility-bold" width={16} />}
                    />
                  </Tooltip>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="body2">
                No disabilities recorded. Switch to edit mode to add information.
              </Typography>
            )}
          </Card>
        </Grid>
      )}

      {/* Approved Adjustments Card */}
      <Grid size={{ xs: 12, md: profile?.is_disabled ? 6 : 12 }}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: 'success.main',
              }}
            >
              <Iconify icon="solar:verified-check-bold" width={18} />
            </Box>
            <Typography variant="h6">Approved Adjustments</Typography>
            <Chip 
              label={userAdjustments.length} 
              size="small" 
              color="success" 
              variant="soft"
            />
          </Stack>

          {userAdjustments.length > 0 ? (
            <Stack spacing={2}>
              {userAdjustments.map((adjustment) => (
                <Tooltip 
                  key={adjustment.id}
                  title={adjustment.adjustment_detail || 'No additional details'}
                  arrow
                  placement="left"
                >
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      cursor: 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'success.main',
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          color: 'success.main',
                        }}
                      >
                        <Iconify icon="solar:check-circle-bold" width={20} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {adjustment.adjustment_title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {adjustment.adjustment_type} &bull; Approved {new Date(adjustment.approved_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Tooltip>
              ))}
            </Stack>
          ) : (
            <Box 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                borderRadius: 2,
              }}
            >
              <Iconify 
                icon="solar:document-add-bold" 
                width={48} 
                sx={{ color: 'text.disabled', mb: 1 }} 
              />
              <Typography color="text.secondary" variant="body2">
                No approved adjustments yet.
              </Typography>
              <Typography color="text.disabled" variant="caption">
                Request adjustments through the Adjustments section.
              </Typography>
            </Box>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
