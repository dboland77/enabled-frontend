import { Helmet } from 'react-helmet-async';

import { LoginView } from 'src/frontend/routes/auth';

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Sign in</title>
      </Helmet>

      <LoginView />
    </>
  );
}
