import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/frontend/routes/hooks';
import { AdjustmentRequestDetailsView } from 'src/frontend/sections/adjustmentRequest/view';

export default function AdjustmentRequestDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> enableD: Adjustment Details</title>
      </Helmet>

      <AdjustmentRequestDetailsView id={`${id}`} />
    </>
  );
}
