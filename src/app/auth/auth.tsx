import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import AuthModernLayout from 'src/frontend/layouts/auth/modern';
import { SplashScreen } from 'src/frontend/components/loading-screen';

const LoginPage = lazy(() => import('src/frontend/pages/auth/login'));
const RegisterPage = lazy(() => import('src/frontend/pages/auth/register'));

const auth = {
  path: '/auth',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthModernLayout>
          <LoginPage />
        </AuthModernLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthModernLayout>
          <RegisterPage />
        </AuthModernLayout>
      ),
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [auth],
  },
];
