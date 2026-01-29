'use client';
import Link from '@mui/material/Link';
import ThemeProvider from '@/theme';
import ProgressBar from '@/components/progress-bar';
import { SettingsDrawer, SettingsProvider } from '@/components/settings';
import SnackbarProvider from '@/components/snackbar/snackbar-provider';
import { AuthLayoutSwitcher } from './AuthLayoutSwitcher';

export default function Home() {
  return (
    <SettingsProvider
      defaultSettings={{
        themeMode: 'light', // 'light' | 'dark'
        themeDirection: 'ltr', //  'rtl' | 'ltr'
        themeContrast: 'default', // 'default' | 'bold'
        themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
        themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
        themeStretch: false,
      }}
    >
      <ThemeProvider>
        <SnackbarProvider>
          <SettingsDrawer />
          <ProgressBar />
          <AuthLayoutSwitcher />
        </SnackbarProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
