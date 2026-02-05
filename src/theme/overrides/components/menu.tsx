import { Theme } from '@mui/material/styles';

import { menuItem } from '@/theme/css';

// ----------------------------------------------------------------------

export function menu(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...menuItem(theme),
        },
      },
    },
  };
}
