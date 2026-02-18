import { Helmet } from 'react-helmet-async';

import { UserProfileView } from '../../../sections/user/view';

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  return (
    <>
      <Helmet>
        <title> enableD: User Profile</title>
      </Helmet>

      <UserProfileView />
    </>
  );
}
