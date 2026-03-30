import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Scrollbar from '@/components/scrollbar';
import Label from '@/components/label';
import Iconify from '@/components/iconify';
import NotificationItem from '@/layouts/common/notifications-popover/notification-item';
import { varHover } from '@/components/animate';
import { useBoolean } from '@/hooks/use-boolean';
import { useResponsive } from '@/hooks/use-responsive';
import { useNotifications } from '@/hooks/use-notifications';

export default function NotificationsPopover() {
  const drawer = useBoolean();
  const router = useRouter();
  const smUp = useResponsive('up', 'sm');

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

  const handleViewRequest = (requestId: string) => {
    drawer.onFalse();
    router.push(`/dashboard/user/adjustmentRequests/${requestId}`);
  };

  const handleNavigate = (path: string) => {
    drawer.onFalse();
    router.push(path);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const getFilteredNotifications = () => {
    switch (currentTab) {
      case 'unread':
        return unreadNotifications;
      case 'archived':
        return readNotifications;
      default:
        return notifications;
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
      value: 'archived',
      label: 'Read',
      count: readNotifications.length,
    },
  ];

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!unreadCount && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead} aria-label="Mark all notifications as read">
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      {!smUp && (
        <IconButton onClick={drawer.onFalse} aria-label="Close notifications">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
          sx={{
            '&:not(:last-of-type)': {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderLoading = (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
      <CircularProgress />
    </Stack>
  );

  const renderEmpty = (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
      <Iconify icon="solar:bell-off-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
        No notifications
      </Typography>
    </Stack>
  );

  const renderList = (
    <Scrollbar>
      <List 
        disablePadding 
        aria-live="polite" 
        aria-label={`${getFilteredNotifications().length} notifications`}
      >
        {getFilteredNotifications().map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onViewRequest={handleViewRequest}
            onNavigate={handleNavigate}
            onDelete={handleDelete}
          />
        ))}
      </List>
    </Scrollbar>
  );

  const renderContent = () => {
    if (loading) return renderLoading;
    if (getFilteredNotifications().length === 0) return renderEmpty;
    return renderList;
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        aria-label="Notifications panel"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
          role: 'region',
          'aria-label': 'Notifications',
        }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}
          <Tooltip title="Settings">
            <IconButton>
              <Iconify icon="solar:settings-bold-duotone" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider />

        {renderContent()}

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="large"
            onClick={() => {
              drawer.onFalse();
              router.push('/dashboard/notifications');
            }}
          >
            View All
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
