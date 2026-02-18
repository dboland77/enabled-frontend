import Container from '@mui/material/Container';

import { paths } from 'src/frontend/routes/paths';
import { useSettingsContext } from 'src/frontend/components/settings';
import CustomBreadcrumbs from 'src/frontend/components/custom-breadcrumbs';

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
            href: paths.dashboard.root,
          },
          {
            name: 'Adjustments',
            href: paths.dashboard.adjustments.root,
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
