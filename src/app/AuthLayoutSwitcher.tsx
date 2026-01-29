'use client';

import { useEffect, useState } from 'react';
import AuthLayout from '@/components/auth-layout';
import CompactAuthLayout from '@/components/compact-auth-layout';

export default function AuthLayoutSwitcher({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (isMobile === null) {
    throw Promise.resolve(); // Suspends
  }

  return isMobile ? (
    <CompactAuthLayout>{children}</CompactAuthLayout>
  ) : (
    <AuthLayout>{children}</AuthLayout>
  );
}
