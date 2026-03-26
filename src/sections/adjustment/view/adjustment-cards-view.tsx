'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';

import Iconify from '@/components/iconify';
import EmptyContent from '@/components/empty-content';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useAdjustments } from '@/hooks/use-adjustments';
import { IAdjustmentCard } from '@/types/adjustment';

import AdjustmentCardList from '../adjustment-card-list';

const ITEMS_PER_PAGE = 6;

export default function AdjustmentCardsView() {
  const settings = useSettingsContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { adjustments, loading: adjustmentsLoading, error } = useAdjustments();

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  // Map adjustments to card format
  const adjustmentCards: IAdjustmentCard[] = adjustments.map((adj) => ({
    id: adj.id,
    title: adj.title,
    category: adj.category,
    description: adj.description,
  }));

  const filteredCards = adjustmentCards.filter((card) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(q) ||
      card.category.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
  const paginatedCards = filteredCards.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
        <>
          <AdjustmentCardList adjustments={paginatedCards} />

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
