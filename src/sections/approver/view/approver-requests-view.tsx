'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import Label from '@/components/label';
import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import { useSnackbar } from '@/components/snackbar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useApproverRequests, IAdjustmentRequestWithUser } from '@/hooks/use-adjustment-requests';
import { RequestStatusTypes, REQUEST_STATUS_LABELS } from '@/types/adjustmentRequest';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '@/components/table';

import ApproverRequestTableRow from '../approver-request-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Request' },
  { id: 'requesterName', label: 'Requester' },
  { id: 'adjustmentType', label: 'Type' },
  { id: 'requiredDate', label: 'Required By' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions', align: 'right' as const },
];

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'default' as const },
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'approved', label: 'Approved', color: 'success' as const },
  { value: 'declined', label: 'Declined', color: 'error' as const },
  { value: 'more_info', label: 'More Info', color: 'info' as const },
];

// ----------------------------------------------------------------------

type ActionType = 'approve' | 'decline' | 'more_info' | 'pending';

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  request: IAdjustmentRequestWithUser | null;
}

export default function ApproverRequestsView() {
  const table = useTable({ defaultOrderBy: 'createdAt' });
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState('all');
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: null,
    request: null,
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    allAssignedRequests,
    pendingRequests,
    loading,
    error,
    approveRequest,
    declineRequest,
    requestMoreInfo,
    setPendingStatus,
  } = useApproverRequests();

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    table.onResetPage();
  }, [table]);

  const getFilteredRequests = useCallback(() => {
    switch (currentTab) {
      case 'pending':
        return allAssignedRequests.filter(
          (r) => r.status === RequestStatusTypes.NEW || r.status === RequestStatusTypes.PENDING
        );
      case 'approved':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.APPROVED);
      case 'declined':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.DENIED);
      case 'more_info':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.MORE_INFO);
      default:
        return allAssignedRequests;
    }
  }, [currentTab, allAssignedRequests]);

  const dataFiltered = getFilteredRequests();

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const notFound = !dataFiltered.length;

  // Action handlers
  const handleOpenAction = (type: ActionType, request: IAdjustmentRequestWithUser) => {
    setActionDialog({ open: true, type, request });
    setResponseMessage('');
  };

  const handleCloseAction = () => {
    setActionDialog({ open: false, type: null, request: null });
    setResponseMessage('');
  };

  const handleConfirmAction = async () => {
    if (!actionDialog.request || !actionDialog.type) return;

    setActionLoading(true);
    try {
      const actionData = {
        requestId: actionDialog.request.id,
        status: RequestStatusTypes.NEW, // Will be set by the action
        responseMessage,
      };

      switch (actionDialog.type) {
        case 'approve':
          await approveRequest(actionData);
          enqueueSnackbar('Request approved successfully', { variant: 'success' });
          break;
        case 'decline':
          await declineRequest(actionData);
          enqueueSnackbar('Request declined', { variant: 'info' });
          break;
        case 'more_info':
          await requestMoreInfo(actionData);
          enqueueSnackbar('More information requested', { variant: 'warning' });
          break;
        case 'pending':
          await setPendingStatus(actionData);
          enqueueSnackbar('Request marked as pending', { variant: 'info' });
          break;
      }

      handleCloseAction();
    } catch (err) {
      console.error('Action failed:', err);
      enqueueSnackbar(err instanceof Error ? err.message : 'Action failed', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getActionDialogTitle = () => {
    switch (actionDialog.type) {
      case 'approve':
        return 'Approve Request';
      case 'decline':
        return 'Decline Request';
      case 'more_info':
        return 'Request More Information';
      case 'pending':
        return 'Mark as Pending';
      default:
        return '';
    }
  };

  const getActionDialogDescription = () => {
    switch (actionDialog.type) {
      case 'approve':
        return 'Add an optional message for the requester about the approval.';
      case 'decline':
        return 'Please provide a reason for declining this request.';
      case 'more_info':
        return 'Specify what additional information you need from the requester.';
      case 'pending':
        return 'Add an optional note about why this request is being held for review.';
      default:
        return '';
    }
  };

  const getActionButtonColor = () => {
    switch (actionDialog.type) {
      case 'approve':
        return 'success';
      case 'decline':
        return 'error';
      case 'more_info':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusCount = (status: string) => {
    switch (status) {
      case 'pending':
        return allAssignedRequests.filter(
          (r) => r.status === RequestStatusTypes.NEW || r.status === RequestStatusTypes.PENDING
        ).length;
      case 'approved':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.APPROVED).length;
      case 'declined':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.DENIED).length;
      case 'more_info':
        return allAssignedRequests.filter((r) => r.status === RequestStatusTypes.MORE_INFO).length;
      default:
        return allAssignedRequests.length;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <Iconify icon="solar:danger-triangle-bold" width={64} sx={{ color: 'error.main', mb: 2 }} />
          <Box sx={{ typography: 'h6', color: 'error.main' }}>{error}</Box>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Approval Requests"
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Approvals' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}`,
            }}
          >
            {STATUS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={tab.value === currentTab ? 'filled' : 'soft'}
                    color={tab.color}
                    sx={{ ml: 1 }}
                  >
                    {getStatusCount(tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <ApproverRequestTableRow
                      key={row.id}
                      row={row}
                      onApprove={() => handleOpenAction('approve', row)}
                      onDecline={() => handleOpenAction('decline', row)}
                      onRequestMoreInfo={() => handleOpenAction('more_info', row)}
                      onSetPending={() => handleOpenAction('pending', row)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
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

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={handleCloseAction} maxWidth="sm" fullWidth>
        <DialogTitle>{getActionDialogTitle()}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionDialog.request && (
              <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                <strong>Request:</strong> {actionDialog.request.title}
              </Box>
            )}
            <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
              {getActionDialogDescription()}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Message"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                actionDialog.type === 'decline'
                  ? 'Please provide a reason...'
                  : 'Optional message...'
              }
              required={actionDialog.type === 'decline' || actionDialog.type === 'more_info'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAction} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={getActionButtonColor() as 'success' | 'error' | 'warning' | 'primary'}
            onClick={handleConfirmAction}
            disabled={
              actionLoading ||
              ((actionDialog.type === 'decline' || actionDialog.type === 'more_info') &&
                !responseMessage.trim())
            }
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
