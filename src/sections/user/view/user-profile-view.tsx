import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';

import { useAppSelector } from '@/hooks';

import Iconify from '../../../components/iconify';
import ProfileCover from '../profile-cover';
import { paths } from '../../../routes/paths';
import { ProfileImageUploader } from '../../../components/profile-image-uploader';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'profile',
    label: 'Profile',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
];

export default function UserProfileView() {
  const settings = useSettingsContext();

  const { firstname, lastname, avatarUrl } = useAppSelector((state) => state.userProfile);
  const { role } = useAppSelector((state) => state.auth);

  const [currentTab, setCurrentTab] = useState('profile');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: `${firstname} ${lastname}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card
        sx={{
          mb: 3,
          height: 290,
        }}
      >
        <ProfileImageUploader />

        <ProfileCover
          role={role ?? null}
          name={`${firstname} ${lastname}`}
          avatarUrl={avatarUrl ?? ''}
          coverUrl="coverUrl"
        />

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .${tabsClasses.flexContainer}`]: {
              pr: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-end',
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {/* {currentTab === 'profile' && <ProfileHome info={null} posts={_userFeeds} />} */}
    </Container>
  );
}
