import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/frontend/routes/hooks';
import { AdjustmentRequestEditView } from 'src/frontend/sections/adjustmentRequest/view';

export default function AdjustmentRequestEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> enableD: Adjustment Edit</title>
      </Helmet>

      <AdjustmentRequestEditView id={`${id}`} />
    </>
  );
}
