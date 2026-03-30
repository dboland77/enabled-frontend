'use client';

import { useEffect, useRef } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

import Iconify from '@/components/iconify';
import { SeoIllustration } from '@/assets/illustrations';
import { useSettingsContext } from '@/components/settings';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType, NotificationCategory } from '@/types/notification';

import AppWelcome from './WelcomeWidget';

export default function HomeView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const theme = useTheme();
  const { profile, loading } = useUserProfile();
  const { notifications, createNotification } = useNotifications();
  const notificationsCreatedRef = useRef(false);

  const isFirstLogin = profile?.is_first_login ?? true;
  const firstname = profile?.firstname ?? '';
  const lastname = profile?.lastname ?? '';
  const hasName = firstname || lastname;
  const isProfileComplete = !isFirstLogin && hasName;

  // Create onboarding notifications on first visit
  useEffect(() => {
    const createOnboardingNotifications = async () => {
      if (loading || !profile?.userId || notificationsCreatedRef.current) return;

      // Check if we already have these notification types
      const hasCompleteProfileNotification = notifications.some(
        (n) => n.type === NotificationType.COMPLETE_PROFILE
      );
      const hasTryWizardNotification = notifications.some(
        (n) => n.type === NotificationType.TRY_WIZARD
      );

      notificationsCreatedRef.current = true;

      // Create "Complete Profile" notification if profile is incomplete and no notification exists
      if (!isProfileComplete && !hasCompleteProfileNotification) {
        try {
          await createNotification({
            userId: profile.userId,
            title: 'Complete Your Profile',
            message:
              'Please fill in your profile information including your job details and accessibility requirements to get started.',
            type: NotificationType.COMPLETE_PROFILE,
            category: NotificationCategory.SYSTEM,
          });
        } catch (error) {
          console.error('Failed to create profile notification:', error);
        }
      }

      // Create "Try the Wizard" notification if no notification exists
      if (!hasTryWizardNotification) {
        try {
          await createNotification({
            userId: profile.userId,
            title: 'Try the Adjustment Wizard',
            message:
              'Get personalised workplace adjustment recommendations based on your disabilities and limitations using our guided wizard.',
            type: NotificationType.TRY_WIZARD,
            category: NotificationCategory.SYSTEM,
          });
        } catch (error) {
          console.error('Failed to create wizard notification:', error);
        }
      }
    };

    createOnboardingNotifications();
  }, [loading, profile, isProfileComplete, notifications, createNotification]);

  const getWelcomeTitle = () => {
    if (isFirstLogin || !hasName) {
      return 'Welcome! Please complete your profile.';
    }
    return `Welcome back, ${firstname} ${lastname}!`;
  };

  const getWelcomeDescription = () => {
    if (isFirstLogin || !hasName) {
      return 'To get started, please fill in your profile information including your job details and any accessibility requirements.';
    }
    return 'View your dashboard to manage your profile, disabilities, and workplace adjustments.';
  };

  const handleActionClick = () => {
    if (isFirstLogin || !hasName) {
      router.push('/dashboard/user/profile');
    } else {
      router.push('/dashboard/user/adjustmentRequests');
    }
  };

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <AppWelcome
            title={getWelcomeTitle()}
            description={getWelcomeDescription()}
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary" onClick={handleActionClick}>
                {isFirstLogin || !hasName ? 'Complete Profile' : 'View Adjustments'}
              </Button>
            }
          />
        </Grid>

        {/* Wizard CTA Card - Always shown for all users */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[8],
                borderColor: theme.palette.primary.main,
              },
            }}
            onClick={() => router.push('/dashboard/adjustments/wizard')}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  flexShrink: 0,
                }}
              >
                <Iconify icon="mdi:magic-staff" width={32} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Adjustment Wizard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get personalised workplace adjustment recommendations based on your disabilities
                  and limitations
                </Typography>
              </Box>
              <Iconify
                icon="eva:arrow-forward-fill"
                width={24}
                sx={{ color: 'text.disabled', flexShrink: 0 }}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Complete Profile CTA Card - Only shown for incomplete profiles */}
        {!isProfileComplete && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.dark, 0.04)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.warning.main,
                },
              }}
              onClick={() => router.push('/dashboard/user/profile')}
            >
              <Stack direction="row" alignItems="center" spacing={3}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.warning.main, 0.12),
                    color: theme.palette.warning.main,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="solar:user-circle-bold" width={32} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Complete Your Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your job details and accessibility requirements to unlock all features
                  </Typography>
                </Box>
                <Iconify
                  icon="eva:arrow-forward-fill"
                  width={24}
                  sx={{ color: 'text.disabled', flexShrink: 0 }}
                />
              </Stack>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
