'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { useRouter } from 'next/navigation';
import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import { useBoolean } from '@/hooks/use-boolean';
import ProgressBar from '@/components/progress-bar';
import { ConfirmDialog } from '@/components/custom-dialog';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useDisabilities } from '@/hooks/use-disabilities';
import { IDisabilityItem } from '@/types/disability';

import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '@/components/table';

const TABLE_HEAD = [
  { id: 'disability_name', label: 'Name' },
  { id: 'category', label: 'Category' },
  { id: 'disability_nhs_slug', label: 'NHS Slug' },
  { id: '', label: '' },
];

export default function DisabilityListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const { disabilities, loading: disabilitiesLoading, error, deleteDisability, refetch } = useDisabilities();

  const [tableData, setTableData] = useState<IDisabilityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setTableData(disabilities);
  }, [disabilities]);

  const categoryOptions = useMemo(() => {
    const categories = tableData.map((row) => row.category);
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
        row.disability_name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.disability_nhs_slug?.toLowerCase().includes(q)
      );
    })();
    const matchesCategory = !categoryFilter || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const notFound = !disabilitiesLoading && !(dataFiltered.length > 0);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleDeleteRow = async (rowId: string) => {
    const success = await deleteDisability(rowId);
    if (success) {
      table.onUpdatePageDeleteRow(dataInPage.length);
    }
  };

  const handleDeleteRows = async () => {
    const deleteRows = tableData.filter((row) => table.selected.includes(row.id)).map((r) => r.id);
    
    for (const id of deleteRows) {
      await deleteDisability(id);
    }

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  };

  const handleEditRow = useCallback(
    (rowId: string) => {
      router.push(`/dashboard/disability/${rowId}/edit`);
    },
    [router]
  );

  return disabilitiesLoading ? (
    <ProgressBar />
  ) : (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Disabilities"
          links={[
            { name: 'Home', href: '/dashboard' },
            { name: 'Disability', href: '/dashboard/disability' },
            { name: 'List' },
          ]}
          action={
            <Button
              href={'/dashboard/disability/new'}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Disability
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
              placeholder="Search by name or NHS slug..."
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
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
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
                      <TableRow key={row.id} hover selected={table.selected.includes(row.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={table.selected.includes(row.id)}
                            onClick={() => table.onSelectRow(row.id)}
                          />
                        </TableCell>
                        <TableCell>{row.disability_name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          {row.disability_nhs_slug ? (
                            <Link
                              href={`https://www.nhs.uk/conditions/${row.disability_nhs_slug}`}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                              color="text.secondary"
                            >
                              {row.disability_nhs_slug}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleEditRow(row.id)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRow(row.id)} color="error">
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
