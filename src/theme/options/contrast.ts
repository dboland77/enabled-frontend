import { grey, common } from '@/theme/palette';
import { customShadows } from '@/theme/custom-shadows';

// ----------------------------------------------------------------------

// High contrast colors for WCAG AA compliance (4.5:1 ratio minimum)
const highContrastColors = {
  light: {
    text: {
      primary: common.black, // Maximum contrast on light backgrounds
      secondary: grey[800],  // Darker secondary text
      disabled: grey[600],   // More visible disabled text
    },
    background: {
      default: grey[100],
      paper: common.white,
    },
  },
  dark: {
    text: {
      primary: common.white, // Maximum contrast on dark backgrounds
      secondary: grey[300],  // Lighter secondary text
      disabled: grey[500],   // More visible disabled text
    },
    background: {
      default: common.black,
      paper: grey[900],
    },
  },
};

export function createContrast(contrast: 'default' | 'bold', mode: 'light' | 'dark') {
  const theme = {
    ...(contrast === 'bold' && {
      palette: {
        ...highContrastColors[mode],
      },
    }),
  };

  const components = {
    ...(contrast === 'bold' && {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: customShadows(mode).z1,
            // Ensure card backgrounds have good contrast
            ...(mode === 'light' && {
              backgroundColor: common.white,
            }),
            ...(mode === 'dark' && {
              backgroundColor: grey[900],
            }),
          },
        },
      },
      // Enhanced typography contrast
      MuiTypography: {
        styleOverrides: {
          root: {
            // Ensure text meets WCAG AA standards
          },
          body2: {
            color: mode === 'light' ? grey[800] : grey[300],
          },
          caption: {
            color: mode === 'light' ? grey[700] : grey[400],
          },
        },
      },
      // Enhanced button contrast
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      // Enhanced link contrast
      MuiLink: {
        styleOverrides: {
          root: {
            textDecorationThickness: '2px',
            textUnderlineOffset: '2px',
          },
        },
      },
      // Enhanced form field contrast
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderWidth: 2,
          },
        },
      },
      // Enhanced chip contrast
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    }),
  };

  return {
    ...theme,
    components,
  };
}
