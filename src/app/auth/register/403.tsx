import { Helmet } from 'react-helmet-async';

import { View403 } from '../sections/error';

// ----------------------------------------------------------------------

export default function Page403() {
  return (
    <>
      <Helmet>
        <title> 403 Forbidden</title>
      </Helmet>

      <View403 />
    </>
  );
}
