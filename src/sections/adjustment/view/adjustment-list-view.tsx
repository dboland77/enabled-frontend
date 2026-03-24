'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useAdjustments } from '@/hooks/use-adjustments';
import { IAdjustmentItem } from '@/types/adjustment';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '@/components/table';

import AdjustmentTableRow from '../adjustment-table-row';

const TABLE_HEAD = [
  { id: 'title', label: 'Adjustment' },
  { id: 'category', label: 'Category' },
  { id: 'description', label: 'Description' },
];

export default function AdjustmentListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const { adjustments, loading: adjustmentsLoading, error, deleteAdjustment, refetch } = useAdjustments();

  const [tableData, setTableData] = useState<IAdjustmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setTableData(adjustments);
  }, [adjustments]);

  const categoryOptions = useMemo(() => {
    const categories = tableData
      .map((row) => row.category)
      .filter((c): c is string => !!c);
    return Array.from(new Set(categories)).sort();
  }, [tableData]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    table.onResetPage();
  }, [table]);

  const handleCategoryFilter = useCallback((event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
    table.onResetPage();
  }, [table]);

  const dataFiltered = tableData.filter((row) => {
    const matchesSearch = !searchQuery || (() => {
      const q = searchQuery.toLowerCase();
      return (
        row.title?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q) ||
        row.description?.toLowerCase().includes(q)
      );
    })();
    const matchesCategory = !categoryFilter || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const notFound = !adjustmentsLoading && !(dataFiltered.length > 0);

  return adjustmentsLoading ? (
    <ProgressBar />
  ) : (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Adjustments Table"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'Adjustments', href: 'dashboard/adjustments' },
          { name: 'List' },
        ]}
        action={
          <Button
            href={'dashboard/adjustments/new'}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Adjustment
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by title, category or description..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 180, flexShrink: 0 }}>
            <InputLabel>Filter by category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter by category"
              onChange={handleCategoryFilter}
            >
              <MenuItem value="">All categories</MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={tableData.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                tableData.map((row) => row.id)
              )
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <AdjustmentTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
