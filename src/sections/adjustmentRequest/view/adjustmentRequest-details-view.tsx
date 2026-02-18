import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from '@/routes/paths';
import { useSettingsContext } from '@/components/settings';
import { RequestStatusTypes } from '@/types/adjustmentRequest';

import AdjustmentRequestDetailsToolbar from '../adjustmentRequest-details-toolbar';
import AdjustmentRequestDetailsContent from '../adjustmentRequest-details-content';

type Props = {
  id: string;
};

const _adjustmentRequests = [
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

export default function AdjustmentRequestsDetailsView({ id }: Props) {
  const settings = useSettingsContext();

  const currentAdjustmentRequest = _adjustmentRequests.filter((a) => a.id === id)[0];

  const [currentTab, setCurrentTab] = useState('content');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {[{ label: 'content', value: 'content' }].map((tab) => (
        <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} icon="" />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <AdjustmentRequestDetailsToolbar
        backLink={paths.dashboard.adjustmentRequests.root}
        editLink={paths.dashboard.adjustmentRequests.edit(id)}
        liveLink="#"
      />
      {renderTabs}
      {currentTab === 'content' && (
        <AdjustmentRequestDetailsContent adjustmentRequest={currentAdjustmentRequest} />
      )}
    </Container>
  );
}
