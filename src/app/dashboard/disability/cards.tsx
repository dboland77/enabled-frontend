import { Helmet } from 'react-helmet-async';

import { DisabilityCardsView } from 'src/frontend/sections/disability/view';

export default function DisabilityCardsPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Disability Cards</title>
      </Helmet>

      <DisabilityCardsView />
    </>
  );
}
