import type { CustomShadows } from '../theme/custom-shadows';

declare module '@mui/material/styles' {
  interface TypeBackground {
    neutral: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }

  interface PaletteColor {
    lighter: string;
    darker: string;
  }

  interface Theme {
    customShadows: CustomShadows;
  }

  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
}
