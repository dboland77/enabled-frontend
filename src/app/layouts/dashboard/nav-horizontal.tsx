import { memo } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';

import { useAppSelector } from 'src/frontend/hooks';

import { bgBlur } from '../../theme/css';
import { HEADER } from '../config-layout';
import { useNavData } from './config-navigation';
import Scrollbar from '../../components/scrollbar';
import HeaderShadow from '../common/header-shadow';
import { NavSectionHorizontal } from '../../components/nav-section';

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const { role } = useAppSelector((state) => state.auth);

  const navData = useNavData();

  return (
    <AppBar
      component="div"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <Scrollbar
          sx={{
            '& .simplebar-content': {
              display: 'flex',
            },
          }}
        >
          <NavSectionHorizontal
            data={navData}
            slotProps={{
              currentRole: role ?? '',
            }}
            sx={{
              ...theme.mixins.toolbar,
            }}
          />
        </Scrollbar>
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
