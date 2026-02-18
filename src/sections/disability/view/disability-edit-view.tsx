import Container from '@mui/material/Container';

import { paths } from '@/routes/paths';
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
            href: paths.dashboard.root,
          },
          {
            name: 'Disability',
            href: paths.dashboard.disability.root,
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
