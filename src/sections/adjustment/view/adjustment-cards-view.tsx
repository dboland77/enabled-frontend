import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/frontend/routes/paths';
import Iconify from 'src/frontend/components/iconify';
import { RouterLink } from 'src/frontend/routes/components';
import { useSettingsContext } from 'src/frontend/components/settings';
import CustomBreadcrumbs from 'src/frontend/components/custom-breadcrumbs';

import AdjustmentCardList from '../adjustment-card-list';

export default function AdjustmentCardsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Adjustment Cards"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Adjustments', href: paths.dashboard.adjustments.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.adjustments.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Adjustment
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AdjustmentCardList adjustments={[]} />
    </Container>
  );
}
