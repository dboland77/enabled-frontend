'use client';

import { useParams } from 'next/navigation';
import { AdjustmentRequestDetailsView } from '@/sections/adjustmentRequest/view';

export default function AdjustmentRequestDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <title> enableD: Adjustment Details</title>

      <AdjustmentRequestDetailsView id={`${id}`} />
    </>
  );
}
