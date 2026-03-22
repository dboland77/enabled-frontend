'use client';

import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';

import Iconify from '@/components/iconify';
import EmptyContent from '@/components/empty-content';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useAdjustments } from '@/hooks/use-adjustments';
import { IAdjustmentCard } from '@/types/adjustment';

import AdjustmentCardList from '../adjustment-card-list';

export default function AdjustmentCardsView() {
  const settings = useSettingsContext();

  const [searchQuery, setSearchQuery] = useState('');

  const { adjustments, loading: adjustmentsLoading, error } = useAdjustments();

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // Map adjustments to card format (handle nullable fields)
  const adjustmentCards: IAdjustmentCard[] = adjustments.map((adj) => ({
    id: adj.id,
    title: adj.title || '',
    type: adj.type || '',
    detail: adj.detail || '',
  }));

  const filteredCards = adjustmentCards.filter((card) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(q) ||
      card.type.toLowerCase().includes(q) ||
      card.detail.toLowerCase().includes(q)
    );
  });

  const notFound = !adjustmentsLoading && filteredCards.length === 0;

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

      <Stack sx={{ mb: { xs: 3, md: 5 } }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search adjustments..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {notFound ? (
        <EmptyContent filled title="No adjustments found" sx={{ py: 10 }} />
      ) : (
        <AdjustmentCardList adjustments={filteredCards} />
      )}
    </Container>
  );
}
