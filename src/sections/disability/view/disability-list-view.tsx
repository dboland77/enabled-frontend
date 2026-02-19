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

import { useRouter } from 'next/navigation';
import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import { useBoolean } from '@/hooks/use-boolean';
import ProgressBar from '@/components/progress-bar';
import { ConfirmDialog } from '@/components/custom-dialog';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '@/components/table';

import AdjustmentRequestTableRow from '../disability-table-row';

const TABLE_HEAD = [
  { id: 'Adjustment', label: 'Adjustment' },
  { id: 'adjustmentType', label: 'Type' },
  { id: 'status', label: 'Status' },
];
//TODO - change this to state
const adjustmentRequests = [
  {
    id: 'dfd',
    title: 'test',
    detail: 'detail test',
    createdAt: '',
    adjustmentType: 'adj type',
    requiredDate: new Date().toISOString(),
    workfunction: 'test function',
    benefit: 'ben1',
    location: 'here',
    disability: 'd1',
    status: null,
  },
];

const adjustmentRequestsLoading = false;

export default function AdjustmentRequestListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState(adjustmentRequests);

  // useEffect(() => {
  //   if (id) {
  //   }
  // }, [id, dispatch]);

  const dataFiltered = tableData.length > 0 ? tableData : [];

  const notFound = !(dataFiltered.length > 0);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const handleDeleteRow = async (rowId: string) => {
    const deleteRow = tableData.filter((row) => row.id !== rowId);
    setTableData(deleteRow);
    table.onUpdatePageDeleteRow(dataInPage.length);
  };

  const handleDeleteRows = async () => {
    const keepRows = tableData.filter((row) => !table.selected.includes(row.id));

    const deleteRows = tableData.filter((row) => table.selected.includes(row.id)).map((r) => r.id);

    setTableData(keepRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  };

  const handleEditRow = useCallback(
    (rowId: string) => {
      router.push('/dashboard/adjustmentRequests/edit(rowId)');
    },
    [router]
  );

  return adjustmentRequestsLoading ? (
    <ProgressBar />
  ) : (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="My Adjustment Requests"
          links={[
            { name: 'Home', href: '/dashboard' },
            { name: 'Adjustment Requests', href: '/dashboard/adjustmentRequests' },
            { name: 'List' },
          ]}
          action={
            <Button
              href={'/dashboard/adjustmentRequests/new'}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Adjustment Request
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

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
                      <AdjustmentRequestTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
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
