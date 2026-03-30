import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import { useSnackbar } from '@/components/snackbar';
import CustomPopover, { usePopover } from '@/components/custom-popover';
import { useUserProfile } from '@/hooks/use-user-profile';

import { alpha } from '@mui/system';

// Role display configuration
const ROLE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' }> = {
  admin: { label: 'Administrator', color: 'error' },
  approver: { label: 'Approver', color: 'warning' },
  manager: { label: 'Manager', color: 'info' },
  employee: { label: 'Employee', color: 'default' },
};

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Profile',
    linkTo: '/dashboard/user/profile',
  },
];

export default function AccountPopover() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();
  const { profile, loading } = useUserProfile();

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        popover.onClose();
        router.push('/');
        router.refresh();
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path: string) => {
    popover.onClose();
    router.push(path);
  };

  const firstname = profile?.firstname ?? '';
  const lastname = profile?.lastname ?? '';
  const avatarUrl = profile?.avatar ?? '';
  const userRole = profile?.role ?? 'employee';
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.employee;

  return (
    <>
      <IconButton
        onClick={popover.onOpen}
        aria-label={`Account menu${firstname ? ` for ${firstname} ${lastname}` : ''}`}
        aria-haspopup="true"
        aria-expanded={popover.open}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        {loading ? (
          <Skeleton variant="circular" width={36} height={36} />
        ) : (
          <Avatar
            src={avatarUrl}
            alt={firstname}
            sx={{
              width: 36,
              height: 36,
              border: (theme) => `solid 2px ${theme.palette.background.default}`,
            }}
          >
            {firstname.charAt(0).toUpperCase()}
          </Avatar>
        )}
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          {loading ? (
            <Stack spacing={0.5}>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={160} />
            </Stack>
          ) : (
            <>
              <Typography variant="subtitle2" noWrap>
                {firstname} {lastname}
              </Typography>
              <Chip 
                label={roleConfig.label} 
                color={roleConfig.color} 
                size="small" 
                sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} 
              />
            </>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
