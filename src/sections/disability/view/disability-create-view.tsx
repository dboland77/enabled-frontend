import Container from '@mui/material/Container';

import { paths } from 'src/frontend/routes/paths';
import { useSettingsContext } from 'src/frontend/components/settings';
import CustomBreadcrumbs from 'src/frontend/components/custom-breadcrumbs';

import DisabilityNewEditForm from '../disability-new-edit-form';

export default function DisabilityCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new disability"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Disability',
            href: paths.dashboard.disability.root,
          },
          { name: 'New Disability' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DisabilityNewEditForm />
    </Container>
  );
}
