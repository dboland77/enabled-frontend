import { AdjustmentRequestEditView } from '@/sections/adjustmentRequest/view';

// ----------------------------------------------------------------------

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdjustmentRequestEditPage({ params }: Props) {
  const { id } = await params;

  return <AdjustmentRequestEditView id={id} />;
}
