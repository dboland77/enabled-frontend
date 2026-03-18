'use client';

import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';
import type { accounts, CredentialResponse } from 'google-one-tap';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

declare const google: { accounts: accounts } | undefined;

// List of allowed origins for Google One Tap
// Add your production domain and localhost here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  // Add your production domain here, e.g.:
  // 'https://yourdomain.com',
];

// Check if current origin is allowed for Google One Tap
const isOriginAllowed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const currentOrigin = window.location.origin;
  return ALLOWED_ORIGINS.some(origin => currentOrigin.startsWith(origin));
};

// generate nonce to use for google id token sign-in
const generateNonce = async (): Promise<string[]> => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return [nonce, hashedNonce];
};

const OneTapComponent = () => {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);

  // Check if Google Client ID is configured
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Only enable on allowed origins
  useEffect(() => {
    if (clientId && isOriginAllowed()) {
      setIsEnabled(true);
    }
  }, [clientId]);
  
  const initializeGoogleOneTap = async () => {
    // Skip initialization if google is not loaded
    if (typeof google === 'undefined') {
      setIsEnabled(false);
      return;
    }

    try {
      const supabase = await createClient();
      const [nonce, hashedNonce] = await generateNonce();

      // check if there's already an existing session before initializing the one-tap UI
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session', error);
      }
      if (data.session) {
        router.push('/dashboard');
        return true;
      }

      /* global google */
      google.accounts.id.initialize({
        client_id: clientId!,
        callback: async (response: CredentialResponse) => {
          try {
            // send id token returned in response.credential to supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
              nonce,
            });

            if (error) throw error;

            // redirect to protected page
            router.push('/dashboard');
          } catch (error) {
            console.error('Error logging in with Google One Tap', error);
          }
        },
        nonce: hashedNonce,
        // with chrome's removal of third-party cookies, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
        use_fedcm_for_prompt: true,
      });
      google.accounts.id.prompt(); // Display the One Tap UI
    } catch (error) {
      // Silently handle errors when origin is not allowed for the client ID
      // This commonly happens in development/preview environments
      setIsEnabled(false);
    }
  };

  // Don't render the script if not enabled
  if (!isEnabled) {
    return null;
  }

  return (
    <Script
      onReady={() => {
        initializeGoogleOneTap();
      }}
      onError={() => {
        // Handle script loading errors gracefully
        setIsEnabled(false);
      }}
      src="https://accounts.google.com/gsi/client"
    />
  );
};

export default OneTapComponent;
