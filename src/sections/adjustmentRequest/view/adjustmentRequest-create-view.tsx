import Container from '@mui/material/Container';

import { paths } from '@/routes/paths';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import AdjustmentRequestNewEditForm from '../adjustmentRequest-form';

export default function AdjustmentRequestCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Request a Workplace Adjustment"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Adjustment Requests',
            href: paths.dashboard.adjustmentRequests.root,
          },
          { name: 'Request Adjustment' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AdjustmentRequestNewEditForm />
    </Container>
  );
}
