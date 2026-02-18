import { Helmet } from 'react-helmet-async';

import { AdjustmentCreateView } from 'src/frontend/sections/adjustment/view';

// ----------------------------------------------------------------------

export default function AdjustmentCreatePage() {
  return (
    <>
      <Helmet>
        <title> enableD: Create a new Adjustment</title>
      </Helmet>

      <AdjustmentCreateView />
    </>
  );
}
