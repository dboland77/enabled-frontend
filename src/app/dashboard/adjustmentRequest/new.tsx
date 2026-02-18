import { Helmet } from 'react-helmet-async';

import { AdjustmentRequestCreateView } from 'src/frontend/sections/adjustmentRequest/view';

export default function AdjustmentRequestCreatePage() {
  return (
    <>
      <Helmet>
        <title> enableD: Create Adjustment record</title>
      </Helmet>

      <AdjustmentRequestCreateView />
    </>
  );
}
