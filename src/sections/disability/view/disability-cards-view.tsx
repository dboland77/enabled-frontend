'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';

import Iconify from '@/components/iconify';
import EmptyContent from '@/components/empty-content';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useDisabilities } from '@/hooks/use-disabilities';

import DisabilityList from '../disability-list';
import NHSContainerLogo from '../NHSContainerLogo';

const ITEMS_PER_PAGE = 6;

export default function DisabilityCardsView() {
  const settings = useSettingsContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { disabilities, loading: disabilitiesLoading, error } = useDisabilities();

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  const filteredDisabilities = disabilities.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.disability_name.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.disability_nhs_slug?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredDisabilities.length / ITEMS_PER_PAGE);
  const paginatedDisabilities = filteredDisabilities.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const notFound = !disabilitiesLoading && filteredDisabilities.length === 0;

  if (disabilitiesLoading) {
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
        heading="Disability Cards"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'Disability', href: '/dashboard/disability' },
          { name: 'Cards' },
        ]}
        action={
          <Button
            href={'/dashboard/disability/new'}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Disability Record
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack sx={{ mb: { xs: 3, md: 5 } }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search disabilities..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Link href="https://www.nhs.uk/" target="_blank" rel="noreferrer">
          <NHSContainerLogo />
        </Link>
      </Stack>

      {notFound ? (
        <EmptyContent filled title="No disabilities found" sx={{ py: 10 }} />
      ) : (
        <>
          <DisabilityList disabilities={paginatedDisabilities} />

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
