import { Helmet } from 'react-helmet-async';

import { DisabilityListView } from 'src/frontend/sections/disability/view';

export default function DisabilityListPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Disability List</title>
      </Helmet>

      <DisabilityListView />
    </>
  );
}
