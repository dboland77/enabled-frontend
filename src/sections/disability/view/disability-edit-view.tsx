import Container from '@mui/material/Container';

import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import DisabilityNewEditForm from '../disability-new-edit-form';

type Props = {
  id: string;
};

export default function DisabilityEditView({ id }: Props) {
  const settings = useSettingsContext();

  const currentDisability = {
    id: '',
    name: '',
    slug: '',
  };

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
            name: 'Disability',
            href: '/dashboard/disability',
          },
          { name: currentDisability?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DisabilityNewEditForm currentDisability={currentDisability} />
    </Container>
  );
}
