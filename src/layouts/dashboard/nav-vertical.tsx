'use client';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Logo from '@/components/logo';
import { usePathname } from 'next/navigation';
import { NAV } from '@/layouts/config-layout';
import Scrollbar from '@/components/scrollbar';
import { useResponsive } from '@/hooks/use-responsive';
import { NavSectionVertical } from '@/components/nav-section';
import NavToggleButton from '@/layouts/common/nav-toggle-button';
import { useUserProfile } from '@/hooks/use-user-profile';

import { useNavData } from './config-navigation';

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  const { profile } = useUserProfile();

  const role = profile?.role ?? '';

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const sidebarSx = {
    bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
  };

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ mt: 3, ml: 4, mb: 1 }} />

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: role ?? '',
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderStyle: 'dashed', mx: 2 }} />

      <Stack
        spacing={1}
        alignItems="center"
        sx={{ py: 3, px: 2 }}
      >
        <Typography variant="caption" fontWeight={500} color="text.primary">
          &copy; {new Date().getFullYear()} Enabled
        </Typography>
        <Link
          href="https://www.getenabled.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          fontWeight={500}
          color="text.secondary"
          underline="hover"
          sx={{
            '&:hover': { color: 'primary.main' },
            transition: 'color 0.2s',
          }}
        >
          www.getenabled.co.uk
        </Link>
      </Stack>
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
            ...sidebarSx,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              ...sidebarSx,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
