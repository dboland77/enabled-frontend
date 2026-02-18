import { Helmet } from 'react-helmet-async';

import UserIndexView from 'src/frontend/sections/user/view/user-index-view';

export default function UserIndexPage() {
  return (
    <>
      <Helmet>
        <title> enableD: User Index</title>
      </Helmet>

      <UserIndexView />
    </>
  );
}
