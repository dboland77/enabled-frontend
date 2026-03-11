'use client';

import ThemeProvider from '@/theme';
import ProgressBar from '@/components/progress-bar';
import { SettingsDrawer, SettingsProvider } from '@/components/settings';
import SnackbarProvider from '@/components/snackbar/snackbar-provider';
import DashboardLayout from '@/layouts/dashboard';

type Props = {
  children: React.ReactNode;
};

export default function DashboardPageLayout({ children }: Props) {
  return (
    <SettingsProvider
      defaultSettings={{
        themeMode: 'light',
        themeDirection: 'ltr',
        themeContrast: 'default',
        themeLayout: 'vertical',
        themeColorPresets: 'default',
        themeStretch: false,
      }}
    >
      <ThemeProvider>
        <SnackbarProvider>
          <SettingsDrawer />
          <ProgressBar />
          <DashboardLayout>{children}</DashboardLayout>
        </SnackbarProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
