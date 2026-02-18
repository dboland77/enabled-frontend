'use client';
import { useParams } from 'next/navigation';
import { AdjustmentRequestEditView } from '@/sections/adjustmentRequest/view';

export default function AdjustmentRequestEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <title> enableD: Adjustment Edit</title>

      <AdjustmentRequestEditView id={`${id}`} />
    </>
  );
}
