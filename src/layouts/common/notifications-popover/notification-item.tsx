import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import Label from '@/components/label';
import { fToNow } from '@/utils/format-time';
import Iconify from '@/components/iconify';
import {
  INotification,
  NotificationType,
  getNotificationIcon,
  getNotificationColor,
} from '@/types/notification';

type NotificationItemProps = {
  notification: INotification;
  onMarkAsRead?: (id: string) => void;
  onViewRequest?: (requestId: string) => void;
  onNavigate?: (path: string) => void;
  onDelete?: (id: string) => void;
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onViewRequest,
  onNavigate,
  onDelete,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.relatedRequestId && onViewRequest) {
      onViewRequest(notification.relatedRequestId);
    }
  };

  const renderAvatar = (
    <ListItemAvatar>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: `${getNotificationColor(notification.type)}.lighter`,
        }}
      >
        <Iconify
          icon={getNotificationIcon(notification.type)}
          sx={{
            width: 24,
            height: 24,
            color: `${getNotificationColor(notification.type)}.main`,
          }}
        />
      </Stack>
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={
        <Box
          sx={{
            mb: 0.5,
            typography: 'subtitle2',
            color: notification.isRead ? 'text.secondary' : 'text.primary',
          }}
        >
          {notification.title}
        </Box>
      }
      secondary={
        <Stack spacing={0.5}>
          {notification.message && (
            <Box
              sx={{
                typography: 'body2',
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {notification.message}
            </Box>
          )}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ typography: 'caption', color: 'text.disabled' }}
            divider={
              <Box
                sx={{
                  width: 2,
                  height: 2,
                  bgcolor: 'currentColor',
                  mx: 0.5,
                  borderRadius: '50%',
                }}
              />
            }
          >
            {fToNow(notification.createdAt)}
            <Label
              variant="soft"
              color={getNotificationColor(notification.type)}
              sx={{ height: 20, fontSize: 10 }}
            >
              {getStatusLabel(notification.type)}
            </Label>
          </Stack>
        </Stack>
      }
    />
  );

  const renderUnReadBadge = !notification.isRead && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 48,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  // Render action buttons for adjustment request notifications
  const renderActions = () => {
    if (!notification.relatedRequestId) return null;

    switch (notification.type) {
      case NotificationType.ADJUSTMENT_REQUEST_SUBMITTED:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => onViewRequest?.(notification.relatedRequestId!)}
            >
              Review
            </Button>
          </Stack>
        );

      case NotificationType.ADJUSTMENT_REQUEST_APPROVED:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="soft"
              color="success"
              onClick={() => onViewRequest?.(notification.relatedRequestId!)}
            >
              View Details
            </Button>
          </Stack>
        );

      case NotificationType.ADJUSTMENT_REQUEST_DECLINED:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="soft"
              color="error"
              onClick={() => onViewRequest?.(notification.relatedRequestId!)}
            >
              View Details
            </Button>
          </Stack>
        );

      case NotificationType.ADJUSTMENT_REQUEST_MORE_INFO:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => onViewRequest?.(notification.relatedRequestId!)}
            >
              Provide Info
            </Button>
          </Stack>
        );

      case NotificationType.ADJUSTMENT_REQUEST_PENDING:
      case NotificationType.ADJUSTMENT_REQUEST_UPDATED:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onViewRequest?.(notification.relatedRequestId!)}
            >
              View
            </Button>
          </Stack>
        );

      case NotificationType.COMPLETE_PROFILE:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => onNavigate?.('/dashboard/user/profile')}
            >
              Complete Profile
            </Button>
          </Stack>
        );

      case NotificationType.TRY_WIZARD:
        return (
          <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onNavigate?.('/dashboard/adjustments/wizard')}
            >
              Try Wizard
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <ListItemButton
      disableRipple
      onClick={handleClick}
      sx={{
        p: 2.5,
        pr: 5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: notification.isRead ? 'action.hover' : 'action.selected',
        },
        position: 'relative',
      }}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {renderActions()}
      </Stack>

      <Box
        onClick={handleDelete}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          color: 'text.disabled',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'error.main',
          },
        }}
      >
        <Iconify icon="eva:close-fill" width={18} />
      </Box>
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function getStatusLabel(type: NotificationType): string {
  switch (type) {
    case NotificationType.ADJUSTMENT_REQUEST_SUBMITTED:
      return 'New Request';
    case NotificationType.ADJUSTMENT_REQUEST_APPROVED:
      return 'Approved';
    case NotificationType.ADJUSTMENT_REQUEST_DECLINED:
      return 'Declined';
    case NotificationType.ADJUSTMENT_REQUEST_MORE_INFO:
      return 'Info Needed';
    case NotificationType.ADJUSTMENT_REQUEST_PENDING:
      return 'Pending';
    case NotificationType.ADJUSTMENT_REQUEST_UPDATED:
      return 'Updated';
    case NotificationType.COMPLETE_PROFILE:
      return 'Action';
    case NotificationType.TRY_WIZARD:
      return 'Tip';
    case NotificationType.SYSTEM:
    default:
      return 'System';
  }
}
