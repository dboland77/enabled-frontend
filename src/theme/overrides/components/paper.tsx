import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/system';


// ----------------------------------------------------------------------

export function paper(theme: Theme) {
  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: alpha(theme.palette.grey[500], 0.16),
        },
      },
    },
  };
}
