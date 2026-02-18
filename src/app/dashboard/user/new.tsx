import { Helmet } from 'react-helmet-async';

import { UserCreateView } from '../../../sections/user/view';

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  return (
    <>
      <Helmet>
        <title> enableD: Create a new user</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
