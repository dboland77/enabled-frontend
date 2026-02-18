import { Helmet } from 'react-helmet-async';

import { DisabilityCreateView } from 'src/frontend/sections/disability/view';

export default function DisabilityCreatePage() {
  return (
    <>
      <Helmet>
        <title> enableD: Create a disability record</title>
      </Helmet>

      <DisabilityCreateView />
    </>
  );
}
