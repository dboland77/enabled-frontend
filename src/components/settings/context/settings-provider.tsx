'use client';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

import { SettingsValueProps } from '@/components/settings/types';
import { SettingsContext } from '@/components/settings/context/settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { localStorageGetItem } from '@/utils/storage-available';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings';

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  // Cache the default settings in a ref to avoid recalculating canReset
  const defaultSettingsRef = useRef(defaultSettings);
  const defaultSettingsString = useRef(JSON.stringify(defaultSettings));

  // Check if Arabic language only once on mount
  const isArabicChecked = useRef(false);

  useEffect(() => {
    if (!isArabicChecked.current) {
      isArabicChecked.current = true;
      const isArabic = localStorageGetItem('i18nextLng') === 'ar';
      if (isArabic) {
        update('themeDirection', 'rtl');
      }
    }
  }, [update]);

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang: string) => {
      update('themeDirection', lang === 'ar' ? 'rtl' : 'ltr');
    },
    [update]
  );

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  // Memoize canReset calculation
  const canReset = useMemo(() => JSON.stringify(state) !== defaultSettingsString.current, [state]);

  // Create stable callback refs
  const resetWithDefaults = useCallback(() => {
    reset();
  }, [reset]);

  const memoisedValue = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: resetWithDefaults,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      state,
      update,
      onChangeDirectionByLang,
      canReset,
      resetWithDefaults,
      openDrawer,
      onToggleDrawer,
      onCloseDrawer,
    ]
  );

  return <SettingsContext.Provider value={memoisedValue}>{children}</SettingsContext.Provider>;
}
