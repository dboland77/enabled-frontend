import { Metadata } from 'next';

import { View403 } from '@/sections/error';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: '403 Forbidden',
};

export default function ForbiddenPage() {
  return <View403 />;
}
