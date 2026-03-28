'use client';

import { use } from 'react';

import AdjustmentRequestDetailPage from '@/sections/adjustmentRequest/view/adjustmentRequest-detail-page';

// ----------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
};

export default function AdjustmentRequestPage({ params }: Props) {
  const { id } = use(params);
  return <AdjustmentRequestDetailPage id={id} />;
}
