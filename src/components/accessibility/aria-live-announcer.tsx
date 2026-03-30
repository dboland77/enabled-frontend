'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Politeness = 'polite' | 'assertive';

type AnnouncerContextType = {
  announce: (message: string, politeness?: Politeness) => void;
};

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

// ----------------------------------------------------------------------

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within AriaLiveAnnouncerProvider');
  }
  return context;
}

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export function AriaLiveAnnouncerProvider({ children }: Props) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    // Clear any existing timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    if (politeness === 'assertive') {
      setAssertiveMessage('');
      // Use requestAnimationFrame to ensure the DOM updates
      requestAnimationFrame(() => {
        setAssertiveMessage(message);
      });
    } else {
      setPoliteMessage('');
      requestAnimationFrame(() => {
        setPoliteMessage(message);
      });
    }

    // Clear message after screen reader has time to announce it
    clearTimeoutRef.current = setTimeout(() => {
      setPoliteMessage('');
      setAssertiveMessage('');
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* Polite announcements - for status updates */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {politeMessage}
      </Box>

      {/* Assertive announcements - for important/urgent messages */}
      <Box
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {assertiveMessage}
      </Box>
    </AnnouncerContext.Provider>
  );
}
