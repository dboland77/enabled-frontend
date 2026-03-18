'use client';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
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
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '@/components/table';

const TABLE_HEAD = [
  { id: 'disability_name', label: 'Name' },
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

  // Sync tableData with disabilities from hook
  useEffect(() => {
    setTableData(disabilities);
  }, [disabilities]);

  const dataFiltered = tableData.length > 0 ? tableData : [];

  const notFound = !disabilitiesLoading && !(dataFiltered.length > 0);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

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
                        <TableCell>{row.disability_nhs_slug}</TableCell>
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

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

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
