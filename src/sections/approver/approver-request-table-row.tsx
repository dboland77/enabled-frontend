import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Label from '@/components/label';
import Iconify from '@/components/iconify';
import { fDate } from '@/utils/format-time';
import { usePopover } from '@/components/custom-popover';
import CustomPopover from '@/components/custom-popover/custom-popover';
import { IAdjustmentRequestWithUser } from '@/hooks/use-adjustment-requests';
import {
  RequestStatusTypes,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from '@/types/adjustmentRequest';

// ----------------------------------------------------------------------

type Props = {
  row: IAdjustmentRequestWithUser;
  onApprove: () => void;
  onDecline: () => void;
  onRequestMoreInfo: () => void;
  onSetPending: () => void;
};

export default function ApproverRequestTableRow({
  row,
  onApprove,
  onDecline,
  onRequestMoreInfo,
  onSetPending,
}: Props) {
  const popover = usePopover();

  const { id, title, requesterName, requesterEmail, adjustmentType, requiredDate, status } = row;

  const isPending = status === RequestStatusTypes.NEW || status === RequestStatusTypes.PENDING;
  const isActionable = isPending || status === RequestStatusTypes.MORE_INFO;

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <span style={{ fontWeight: 600 }}>{title || 'Untitled Request'}</span>
            </Stack>
            <span style={{ fontSize: 12, color: '#637381' }}>ID: {id.slice(0, 8)}...</span>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <span>{requesterName || 'Unknown'}</span>
            <span style={{ fontSize: 12, color: '#637381' }}>{requesterEmail || ''}</span>
          </Stack>
        </TableCell>

        <TableCell>{adjustmentType || '-'}</TableCell>

        <TableCell>{requiredDate ? fDate(requiredDate) : '-'}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={status ? REQUEST_STATUS_COLORS[status] : 'default'}
          >
            {status ? REQUEST_STATUS_LABELS[status] : 'Unknown'}
          </Label>
        </TableCell>

        <TableCell align="right">
          {isActionable ? (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title="Approve">
                <IconButton color="success" onClick={onApprove} size="small">
                  <Iconify icon="solar:check-circle-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Decline">
                <IconButton color="error" onClick={onDecline} size="small">
                  <Iconify icon="solar:close-circle-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Request More Info">
                <IconButton color="warning" onClick={onRequestMoreInfo} size="small">
                  <Iconify icon="solar:question-circle-bold" />
                </IconButton>
              </Tooltip>
              <Tooltip title="More Actions">
                <IconButton onClick={popover.onOpen} size="small">
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Label
              variant="outlined"
              color={status === RequestStatusTypes.APPROVED ? 'success' : 'error'}
            >
              {status === RequestStatusTypes.APPROVED ? 'Completed' : 'Closed'}
            </Label>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <Stack sx={{ p: 1 }} spacing={0.5}>
          <Button
            fullWidth
            variant="text"
            color="inherit"
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={() => {
              popover.onClose();
              // Navigate to request details
              window.location.href = `/dashboard/user/adjustmentRequests/${id}`;
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            View Details
          </Button>

          {isPending && (
            <Button
              fullWidth
              variant="text"
              color="warning"
              startIcon={<Iconify icon="solar:clock-circle-bold" />}
              onClick={() => {
                popover.onClose();
                onSetPending();
              }}
              sx={{ justifyContent: 'flex-start' }}
            >
              Mark Pending
            </Button>
          )}
        </Stack>
      </CustomPopover>
    </>
  );
}
