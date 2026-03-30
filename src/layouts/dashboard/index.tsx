import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import { useBoolean } from '@/hooks/use-boolean';
import { useResponsive } from '@/hooks/use-responsive';
import { useSettingsContext } from '@/components/settings';

// Skip to content link for keyboard navigation accessibility
const SkipToContent = () => (
  <Link
    href="#main-content"
    sx={{
      position: 'absolute',
      left: '-9999px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      zIndex: 9999,
      '&:focus': {
        position: 'fixed',
        top: 16,
        left: 16,
        width: 'auto',
        height: 'auto',
        padding: '16px 24px',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 700,
        fontSize: '1rem',
        borderRadius: 1,
        boxShadow: 8,
        outline: '3px solid',
        outlineColor: 'primary.dark',
        outlineOffset: 2,
        textDecoration: 'none',
      },
    }}
  >
    Skip to main content
  </Link>
);

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  if (isHorizontal) {
    return (
      <>
        <SkipToContent />
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main id="main-content">{children}</Main>
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <SkipToContent />
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}

          <Main id="main-content">{children}</Main>
        </Box>
      </>
    );
  }

  return (
    <>
      <SkipToContent />
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {renderNavVertical}

        <Main id="main-content">{children}</Main>
      </Box>
    </>
  );
}
