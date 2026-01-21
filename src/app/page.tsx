'use client';
import Link from '@mui/material/Link';
import { Provider } from 'react-redux';
import ThemeProvider from '@/theme';
import ProgressBar from '@/components/progress-bar';
import { SettingsDrawer, SettingsProvider } from '@/components/settings';
import SnackbarProvider from '@/components/snackbar/snackbar-provider';
import { store } from '@/store/store';

export default function Home() {
  return (
    <Provider store={store}>
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
            <div className="row">
              <div className="col-12">
                <h1 className="header">Supabase Auth + Storage</h1>
                <p>
                  Experience our Auth and Storage through a simple profile management example.
                  Create a user profile and upload an avatar image. Fast, simple, secure.
                </p>
              </div>
              <div className="col-6 form-widget">
                <Link href="/login">Auth page</Link>
              </div>
            </div>
          </SnackbarProvider>
        </ThemeProvider>
      </SettingsProvider>
    </Provider>
  );
}
