import Container from '@mui/material/Container';

import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import CreateAdjustmentForm from '../adjustment-form';

export default function AdjustmentCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create A New Adjustment"
        links={[
          {
            name: 'Home',
            href: '/dashboard',
          },
          {
            name: 'Adjustments',
            href: '/dashboard/adjustments',
          },
          { name: 'New Adjustment' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CreateAdjustmentForm />
    </Container>
  );
}
