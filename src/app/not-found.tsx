import { Metadata } from 'next';

import { NotFoundView } from '@/sections/error';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: '404 Page Not Found!',
};

export default function NotFoundPage() {
  return <NotFoundView />;
}
