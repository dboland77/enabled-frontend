import Container from '@mui/material/Container';

import UserNewEditForm from '../user-new-edit-form';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new user"
        links={[
          {
            name: 'Home',
            href: '/dashboard',
          },
          {
            name: 'User',
            href: '/dashboard/user',
          },
          { name: 'New user' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm />
    </Container>
  );
}
