import { Helmet } from 'react-helmet-async';

import { AdjustmentRequestListView } from 'src/frontend/sections/adjustmentRequest/view';

export default function AdjustmentRequestListPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Adjustment List</title>
      </Helmet>

      <AdjustmentRequestListView />
    </>
  );
}
