import Container from '@mui/material/Container';

import { paths } from 'src/frontend/routes/paths';
import { useAppSelector } from 'src/frontend/hooks';
import { useSettingsContext } from 'src/frontend/components/settings';
import CustomBreadcrumbs from 'src/frontend/components/custom-breadcrumbs';

import RequestAdjustmentForm from '../adjustmentRequest-form';

type Props = {
  id: string;
};

export default function AdjustmentRequestEditView({ id }: Props) {
  const settings = useSettingsContext();

  const { adjustmentRequests } = useAppSelector((state) => state.adjustmentRequests);

  const currentAdjustmentRequest = adjustmentRequests.filter((a) => a.id === id)[0];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Adjustment Request"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Adjustment Requests',
            href: paths.dashboard.adjustmentRequests.list,
          },
          {
            name: 'Edit Adjustment Request',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <RequestAdjustmentForm currentAdjustmentRequest={currentAdjustmentRequest} />
    </Container>
  );
}
