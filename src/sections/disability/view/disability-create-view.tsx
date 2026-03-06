import Container from '@mui/material/Container';

import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

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
            href: '/dashboard',
          },
          {
            name: 'Disability',
            href: '/dashboard/disability',
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
