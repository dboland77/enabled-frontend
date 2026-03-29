'use client';

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

import AppWelcome from './WelcomeWidget';

export default function HomeView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  const isFirstLogin = profile?.is_first_login ?? true;
  const firstname = profile?.firstname ?? '';
  const lastname = profile?.lastname ?? '';
  const hasName = firstname || lastname;

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

  const theme = useTheme();

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

        {/* Wizard CTA Card */}
        {!isFirstLogin && hasName && (
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
                    Get personalized workplace adjustment recommendations based on your disabilities and limitations
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
