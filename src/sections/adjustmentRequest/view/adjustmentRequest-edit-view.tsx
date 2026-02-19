import Container from '@mui/material/Container';

import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { RequestStatusTypes } from '@/types/adjustmentRequest';

import RequestAdjustmentForm from '../adjustmentRequest-form';

type Props = {
  id: string;
};

const adjustmentRequests = [
  {
    id: 'dfd',
    title: 'test',
    detail: 'detail test',
    createdAt: '',
    adjustmentType: 'adj type',
    requiredDate: new Date().toISOString(),
    workfunction: 'test function',
    benefit: 'ben1',
    location: 'here',
    disability: 'd1',
    status: RequestStatusTypes.NEW,
  },
];

export default function AdjustmentRequestEditView({ id }: Props) {
  const settings = useSettingsContext();

  const currentAdjustmentRequest = adjustmentRequests.filter((a) => a.id === id)[0];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Adjustment Request"
        links={[
          {
            name: 'Home',
            href: '/dashboard',
          },
          {
            name: 'Adjustment Requests',
            href: '/dashboard/adjustmentRequests/list',
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
