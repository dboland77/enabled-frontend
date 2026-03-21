'use client';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Alert from '@mui/material/Alert';

import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useAdjustments } from '@/hooks/use-adjustments';
import { IAdjustmentItem } from '@/types/adjustment';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '@/components/table';

import AdjustmentTableRow from '../adjustment-table-row';

const TABLE_HEAD = [
  { id: 'title', label: 'Adjustment' },
  { id: 'type', label: 'Type' },
  { id: 'detail', label: 'Detail' },
];

export default function AdjustmentListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const { adjustments, loading: adjustmentsLoading, error, deleteAdjustment, refetch } = useAdjustments();

  const [tableData, setTableData] = useState<IAdjustmentItem[]>([]);

  // Sync tableData with adjustments from hook
  useEffect(() => {
    setTableData(adjustments);
  }, [adjustments]);

  const dataFiltered = tableData.length > 0 ? tableData : [];

  const notFound = !adjustmentsLoading && !(dataFiltered.length > 0);

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const denseHeight = table.dense ? 52 : 72;

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
  );
}
