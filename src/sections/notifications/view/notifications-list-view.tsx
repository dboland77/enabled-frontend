'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import Label from '@/components/label';
import Iconify from '@/components/iconify';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType, getNotificationIcon, getNotificationColor } from '@/types/notification';
import { fToNow } from '@/utils/format-time';

export default function NotificationsListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('all');

  const {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/user/adjustmentRequests/${requestId}`);
  };

  const getFilteredNotifications = () => {
    switch (currentTab) {
      case 'unread':
        return unreadNotifications;
      case 'read':
        return readNotifications;
      default:
        return notifications;
    }
  };

  const getActionButton = (notification: { type: NotificationType; relatedRequestId?: string | null }) => {
    switch (notification.type) {
      case NotificationType.ADJUSTMENT_REQUEST_SUBMITTED:
      case NotificationType.ADJUSTMENT_REQUEST_APPROVED:
      case NotificationType.ADJUSTMENT_REQUEST_DECLINED:
      case NotificationType.ADJUSTMENT_REQUEST_MORE_INFO:
      case NotificationType.ADJUSTMENT_REQUEST_PENDING:
      case NotificationType.ADJUSTMENT_REQUEST_UPDATED:
        return notification.relatedRequestId ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleViewRequest(notification.relatedRequestId!)}
          >
            View Request
          </Button>
        ) : null;

      case NotificationType.COMPLETE_PROFILE:
        return (
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => handleNavigate('/dashboard/user/profile')}
          >
            Complete Profile
          </Button>
        );

      case NotificationType.TRY_WIZARD:
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleNavigate('/dashboard/adjustments/wizard')}
          >
            Try Wizard
          </Button>
        );

      default:
        return null;
    }
  };

  const TABS = [
    {
      value: 'all',
      label: 'All',
      count: notifications.length,
    },
    {
      value: 'unread',
      label: 'Unread',
      count: unreadCount,
    },
    {
      value: 'read',
      label: 'Read',
      count: readNotifications.length,
    },
  ];

  const renderLoading = (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
      <CircularProgress />
    </Stack>
  );

  const renderEmpty = (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
      <Iconify icon="solar:bell-off-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
      <Typography variant="h6" sx={{ color: 'text.secondary', mt: 2 }}>
        No notifications
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>
        {currentTab === 'unread'
          ? 'You have no unread notifications'
          : currentTab === 'read'
            ? 'You have no read notifications'
            : "You're all caught up!"}
      </Typography>
    </Stack>
  );

  const renderList = (
    <Stack spacing={2} sx={{ p: 3 }}>
      {getFilteredNotifications().map((notification) => {
        const color = getNotificationColor(notification.type);
        const icon = getNotificationIcon(notification.type);

        return (
          <Card
            key={notification.id}
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              bgcolor: notification.isRead ? 'background.paper' : 'action.hover',
              border: (theme) =>
                `1px solid ${notification.isRead ? theme.palette.divider : theme.palette.primary.light}`,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
                flexShrink: 0,
              }}
            >
              <Iconify icon={icon} width={24} />
            </Box>

            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" noWrap>
                  {notification.title}
                </Typography>
                {!notification.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'info.main',
                      flexShrink: 0,
                    }}
                  />
                )}
              </Stack>

              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {notification.message}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fToNow(notification.createdAt)}
                </Typography>

                {getActionButton(notification)}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              {!notification.isRead && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                >
                  <Iconify icon="eva:done-all-fill" width={18} />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(notification.id)}
                title="Delete"
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Notifications"
        links={[{ name: 'Home', href: '/dashboard' }, { name: 'Notifications' }]}
        action={
          unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:done-all-fill" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )
        }
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
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={tab.value === currentTab ? 'filled' : 'soft'}
                  color={
                    (tab.value === 'unread' && 'info') ||
                    (tab.value === 'read' && 'success') ||
                    'default'
                  }
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <Divider />

        {loading ? renderLoading : getFilteredNotifications().length === 0 ? renderEmpty : renderList}
      </Card>
    </Container>
  );
}
