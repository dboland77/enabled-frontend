'use client';
import { AdjustmentRequestListView } from '@/sections/adjustmentRequest/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'enableD: My Adjustment Requests',
};

export default function AdjustmentRequestsPage() {
  return <AdjustmentRequestListView />;
}
