'use client';

import Box, { BoxProps } from '@mui/material/Box';
import { usePathname } from 'next/navigation';

import { NAV, HEADER } from '@/layouts/config-layout';
import { useResponsive } from '@/hooks/use-responsive';
import { useSettingsContext } from '@/components/settings';

const SPACING = 8;

type MainProps = BoxProps & {
  id?: string;
};

export default function Main({ children, sx, id, ...other }: MainProps) {
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const pathname = usePathname();

  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';

  const sharedSx = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    '@keyframes pageEnter': {
      from: { opacity: 0, transform: 'translateY(6px)' },
      to: { opacity: 1, transform: 'none' },
    },
    animation: 'pageEnter 0.18s ease-out',
  };

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        id={id}
        tabIndex={-1}
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: `${HEADER.H_MOBILE + 24}px`,
          pb: 10,
          ...(lgUp && {
            pt: `${HEADER.H_MOBILE * 2 + 40}px`,
            pb: 15,
          }),
          '&:focus': { outline: 'none' },
        }}
      >
        <Box key={pathname} sx={sharedSx}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      id={id}
      tabIndex={-1}
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI}px)`,
          }),
        }),
        '&:focus': { outline: 'none' },
        ...sx,
      }}
      {...other}
    >
      <Box key={pathname} sx={sharedSx}>
        {children}
      </Box>
    </Box>
  );
}
