'use client';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

import Iconify from '@/components/iconify';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useAdjustments } from '@/hooks/use-adjustments';
import { IAdjustmentCard } from '@/types/adjustment';

import AdjustmentCardList from '../adjustment-card-list';

export default function AdjustmentCardsView() {
  const settings = useSettingsContext();
  
  const { adjustments, loading: adjustmentsLoading, error } = useAdjustments();

  // Map adjustments to card format (handle nullable fields)
  const adjustmentCards: IAdjustmentCard[] = adjustments.map((adj) => ({
    id: adj.id,
    adjustment_title: adj.adjustment_title || '',
    adjustment_type: adj.adjustment_type || '',
    adjustment_detail: adj.adjustment_detail || '',
  }));

  if (adjustmentsLoading) {
    return <ProgressBar />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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

      <AdjustmentCardList adjustments={adjustmentCards} />
    </Container>
  );
}
