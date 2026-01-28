import { Helmet } from 'react-helmet-async';

import { RegisterView } from 'src/frontend/routes/auth';

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> enableD: Register</title>
      </Helmet>

      <RegisterView />
    </>
  );
}
