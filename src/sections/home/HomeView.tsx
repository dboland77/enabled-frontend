'use client';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';

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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid>
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
      </Grid>
    </Container>
  );
}
