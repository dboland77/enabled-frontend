import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import UserCardList from '../user-card-list';
import Iconify from '@/components/iconify';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function UserCardsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="User Cards"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'User', href: 'paths/dashboard/user' },
          { name: 'Cards' },
        ]}
        action={
          <Button
            href={'/dashboard/user/new'}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New User
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCardList users={[]} />
    </Container>
  );
}
