import { Helmet } from 'react-helmet-async';

import { AdjustmentListView } from 'src/frontend/sections/adjustment/view';

export default function AdjustmentListPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Adjustment List</title>
      </Helmet>

      <AdjustmentListView />
    </>
  );
}
