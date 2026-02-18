import { Helmet } from 'react-helmet-async';

import { HomeView } from 'src/frontend/sections/home';

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Home</title>
      </Helmet>

      <HomeView />
    </>
  );
}
