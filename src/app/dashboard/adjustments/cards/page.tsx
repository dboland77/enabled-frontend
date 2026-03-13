import { AdjustmentCardsView } from '@/sections/adjustment/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'enableD: Choose Adjustments',
};

// Prevent static prerendering - this page uses client-side context
export const dynamic = 'force-dynamic';

export default function AdjustmentsCardsPage() {
  return <AdjustmentCardsView />;
}
