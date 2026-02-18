import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from '@/routes/paths';
import Iconify from '@/components/iconify';
import { getDisabilities } from '@/slices';
import { RouterLink } from '@/routes/components';
import EmptyContent from '@/components/empty-content';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import DisabilityList from '../disability-list';
import NHSContainerLogo from '../NHSContainerLogo';

export default function DisabilityCardsView() {
  const settings = useSettingsContext();
  const dispatch = useAppDispatch();
  const { disabilities } = useAppSelector((state) => state.disabilities);

  const notFound = !disabilities.length;

  useEffect(() => {
    dispatch(getDisabilities());
  }, [dispatch]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
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
          { name: 'Home', href: paths.dashboard.root },
          {
            name: 'Disability',
            href: paths.dashboard.disability.root,
          },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.disability.new}
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
