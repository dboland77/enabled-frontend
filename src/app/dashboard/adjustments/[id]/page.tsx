import { AdjustmentDetailsView } from '@/sections/adjustment/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'enableD: Adjustment Details',
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdjustmentDetailsPage({ params }: Props) {
  const { id } = await params;

  return <AdjustmentDetailsView id={id} />;
}
