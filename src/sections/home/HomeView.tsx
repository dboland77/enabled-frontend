import { useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { SeoIllustration } from '@/assets/illustrations';
import { useSettingsContext } from '@/components/settings';

import AppWelcome from './WelcomeWidget';

export default function HomeView() {
  const settings = useSettingsContext();

  const userId = '123435';
  const firstname = 'f';
  const lastname = 'l';

  // TODO - Move these calls to the right pages
  useEffect(() => {
    if (userId) {
    }
  }, [userId]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid>
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
