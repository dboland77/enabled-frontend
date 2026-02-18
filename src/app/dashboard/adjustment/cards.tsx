import { Helmet } from 'react-helmet-async';

import { AdjustmentCardsView } from 'src/frontend/sections/adjustment/view';

export default function AdjustmentCardsPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Adjustment Cards</title>
      </Helmet>

      <AdjustmentCardsView />
    </>
  );
}
