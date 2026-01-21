import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/frontend/routes/paths';
import { useRouter } from 'src/frontend/routes/hooks';
import { SplashScreen } from 'src/frontend/components/loading-screen';

const loginPath = paths.auth.login;

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const { authLoading } = useSelector((state: any) => state.auth);

  return <>{authLoading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

function Container({ children }: Props) {
  const router = useRouter();

  const { authenticated } = useSelector((state: any) => state.auth);

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
