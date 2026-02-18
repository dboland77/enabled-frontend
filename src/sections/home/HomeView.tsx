import { useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { SeoIllustration } from 'src/assets/illustrations';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { getUserProfile, getAdjustments } from '@/slices';
import { useSettingsContext } from '@/components/settings';

import AppWelcome from './WelcomeWidget';

export default function HomeView() {
  const settings = useSettingsContext();

  const dispatch = useAppDispatch();

  const userId = useAppSelector((state: any) => state.auth.id);
  const { firstname, lastname } = useAppSelector((state: any) => state.userProfile);

  // TODO - Move these calls to the right pages
  useEffect(() => {
    if (userId) {
      dispatch(getUserProfile(userId));
      dispatch(getAdjustments());
    }
  }, [userId, dispatch]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Welcome back 👋 \n ${firstname} ${lastname}`}
            description="If you are going to use a passage of Lorem Ipsum, you need to be sure it Lorems the Ipsum."
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary">
                Go Now
              </Button>
            }
          />
        </Grid>
      </Grid>
    </Container>
  );
}
