import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useAppSelector } from 'src/frontend/hooks';

import { NAV } from '../config-layout';
import Logo from '../../components/logo';
import { hideScroll } from '../../theme/css';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';
import { NavSectionMini } from '../../components/nav-section';

export default function NavMini() {
  const { role } = useAppSelector((state) => state.auth);

  const navData = useNavData();

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2, width: '15%' }} />

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: role ?? '',
          }}
        />
      </Stack>
    </Box>
  );
}
