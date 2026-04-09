import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Initialize state synchronously from localStorage to avoid hydration mismatch
function getInitialState(key: string, initialState: any) {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      return { ...initialState, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  return initialState;
}

export function useLocalStorage(key: string, initialState: any) {
  // Use ref to track if initial load from storage is done
  const isInitialised = useRef(false);

  const [state, setState] = useState(() => {
    // Only read from localStorage once during initialization
    if (typeof window !== 'undefined' && !isInitialised.current) {
      isInitialised.current = true;
      return getInitialState(key, initialState);
    }
    return initialState;
  });

  // Sync state from localStorage on mount (for SSR hydration)
  useEffect(() => {
    if (!isInitialised.current) {
      const restored = getStorage(key);
      if (restored) {
        setState((prevValue: any) => ({
          ...prevValue,
          ...restored,
        }));
      }
      isInitialised.current = true;
    }
  }, [key]);

  const update = useCallback(
    (name: string, updateValue: any) => {
      setState((prevValue: any) => {
        const newState = {
          ...prevValue,
          [name]: updateValue,
        };
        // Debounce localStorage writes
        setStorage(key, newState);
        return newState;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    removeStorage(key);
    setState(initialState);
  }, [initialState, key]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      state,
      update,
      reset,
    }),
    [state, update, reset]
  );
}

export const getStorage = (key: string) => {
  let value = null;

  try {
    const result = window.localStorage.getItem(key);

    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    console.error(error);
  }

  return value;
};

export const setStorage = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

export const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
};
