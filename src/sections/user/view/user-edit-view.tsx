import Container from '@mui/material/Container';

import UserNewEditForm from '../user-new-edit-form';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

const _userList = [
  {
    id: '123',
    name: 'test',
    city: 'test',
    role: 'EMPLOYEE',
    email: 'test',
    state: 'test',
    status: 'test',
    address: 'test',
    country: 'test',
    postCode: 'test',
    company: 'test',
    avatarUrl: 'test',
    phoneNumber: 'test',
    isVerified: true,
  },
];

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();

  const currentUser = _userList.find((user) => user.id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Home',
            href: '/dashboard',
          },
          {
            name: 'User',
            href: '/dashboard/user',
          },
          { name: currentUser?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentUser={currentUser} />
    </Container>
  );
}
