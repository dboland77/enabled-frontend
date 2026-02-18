import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import Iconify from '@/components/iconify';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import AdjustmentCardList from '../adjustment-card-list';

export default function AdjustmentCardsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Adjustment Cards"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'Adjustments', href: '/dashboard/adjustments' },
          { name: 'Cards' },
        ]}
        action={
          <Button
            href={'/dashboard/adjustments/new'}
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
