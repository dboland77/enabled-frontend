'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

import Iconify from '@/components/iconify';
import EmptyContent from '@/components/empty-content';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useDisabilities } from '@/hooks/use-disabilities';

import DisabilityList from '../disability-list';
import NHSContainerLogo from '../NHSContainerLogo';

export default function DisabilityCardsView() {
  const settings = useSettingsContext();

  const { disabilities, loading: disabilitiesLoading, error } = useDisabilities();

  const notFound = !disabilitiesLoading && !disabilities.length;

  if (disabilitiesLoading) {
    return <ProgressBar />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Link href="https://www.nhs.uk/" target="_blank" rel="noreferrer">
        <Box
          sx={{
            width: '250px',
            height: '10px',
            margin: '0 auto',
          }}
        >
          <NHSContainerLogo />
        </Box>
      </Link>

      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Home', href: '/dashboard' },
          {
            name: 'Disability',
            href: '/dashboard/disability',
          },
          { name: 'Cards' },
        ]}
        action={
          <Button
            href={'/dashboard/disability/new'}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Disability Record
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        All Disabilites
      </Stack>

      {notFound && <EmptyContent filled title="No Data" sx={{ py: 10 }} />}

      <DisabilityList disabilities={disabilities} />
    </Container>
  );
}
