'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import Iconify from '@/components/iconify';
import { useSettingsContext } from '@/components/settings';

// ----------------------------------------------------------------------

type Shortcut = {
  keys: string[];
  description: string;
  action?: () => void;
};

type ShortcutGroup = {
  title: string;
  shortcuts: Shortcut[];
};

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const settings = useSettingsContext();
  const [helpOpen, setHelpOpen] = useState(false);

  const shortcuts: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['g', 'h'], description: 'Go to Home', action: () => router.push('/dashboard') },
        { keys: ['g', 'p'], description: 'Go to Profile', action: () => router.push('/dashboard/user/profile') },
        { keys: ['g', 'a'], description: 'Go to Adjustments', action: () => router.push('/dashboard/user/adjustments') },
        { keys: ['g', 'w'], description: 'Go to Wizard', action: () => router.push('/dashboard/adjustments/wizard') },
        { keys: ['g', 'n'], description: 'Go to Notifications', action: () => router.push('/dashboard/notifications') },
      ],
    },
    {
      title: 'Accessibility',
      shortcuts: [
        { keys: ['a', 's'], description: 'Open Accessibility Settings', action: () => settings.onToggle() },
        { keys: ['a', 'd'], description: 'Toggle Dark Mode', action: () => settings.onUpdate('themeMode', settings.themeMode === 'dark' ? 'light' : 'dark') },
        { keys: ['a', 'c'], description: 'Toggle High Contrast', action: () => settings.onUpdate('themeContrast', settings.themeContrast === 'bold' ? 'default' : 'bold') },
      ],
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], description: 'Show Keyboard Shortcuts' },
        { keys: ['Escape'], description: 'Close Dialog / Cancel' },
      ],
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Show help dialog with ? or Shift+/
    if (event.key === '?' || (event.shiftKey && event.key === '/')) {
      event.preventDefault();
      setHelpOpen(true);
      return;
    }

    // Close dialog with Escape
    if (event.key === 'Escape' && helpOpen) {
      setHelpOpen(false);
      return;
    }
  }, [helpOpen]);

  // Handle two-key shortcuts (g+h, g+p, etc.)
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingTimeout, setPendingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleKeySequence = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();

    // Clear any existing timeout
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
    }

    if (pendingKey) {
      // Check for two-key shortcuts
      const fullKey = `${pendingKey}+${key}`;
      
      for (const group of shortcuts) {
        for (const shortcut of group.shortcuts) {
          if (shortcut.keys.length === 2 && 
              shortcut.keys[0].toLowerCase() === pendingKey && 
              shortcut.keys[1].toLowerCase() === key) {
            event.preventDefault();
            shortcut.action?.();
            setPendingKey(null);
            return;
          }
        }
      }
      
      setPendingKey(null);
    } else {
      // Start a potential two-key sequence
      if (key === 'g' || key === 'a') {
        setPendingKey(key);
        const timeout = setTimeout(() => {
          setPendingKey(null);
        }, 500); // 500ms to press second key
        setPendingTimeout(timeout);
      }
    }
  }, [pendingKey, pendingTimeout, shortcuts, router, settings]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeySequence);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeySequence);
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
      }
    };
  }, [handleKeyDown, handleKeySequence, pendingTimeout]);

  return (
    <>
      {children}
      
      <Dialog 
        open={helpOpen} 
        onClose={() => setHelpOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="keyboard-shortcuts-title"
      >
        <DialogTitle id="keyboard-shortcuts-title">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:keyboard-bold" width={24} />
              <Typography variant="h6">Keyboard Shortcuts</Typography>
            </Stack>
            <IconButton 
              onClick={() => setHelpOpen(false)} 
              aria-label="Close keyboard shortcuts dialog"
              size="small"
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3}>
            {shortcuts.map((group) => (
              <Box key={group.title}>
                <Typography 
                  variant="overline" 
                  sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}
                >
                  {group.title}
                </Typography>
                
                <Stack spacing={1}>
                  {group.shortcuts.map((shortcut, index) => (
                    <Stack 
                      key={index} 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ py: 0.5 }}
                    >
                      <Typography variant="body2">
                        {shortcut.description}
                      </Typography>
                      
                      <Stack direction="row" spacing={0.5}>
                        {shortcut.keys.map((key, keyIndex) => (
                          <Box key={keyIndex}>
                            <Box
                              component="kbd"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.5,
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'divider',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                minWidth: 24,
                                textAlign: 'center',
                                display: 'inline-block',
                              }}
                            >
                              {key}
                            </Box>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <Typography 
                                component="span" 
                                variant="caption" 
                                sx={{ mx: 0.5, color: 'text.disabled' }}
                              >
                                then
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="caption" color="text.secondary">
            Press <kbd style={{ fontFamily: 'monospace', fontWeight: 600 }}>?</kbd> at any time to show this dialog
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
