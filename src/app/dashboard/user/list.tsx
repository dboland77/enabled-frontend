import { Helmet } from 'react-helmet-async';

import { UserListView } from '../../../sections/user/view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> enableD: User List</title>
      </Helmet>

      <UserListView />
    </>
  );
}
