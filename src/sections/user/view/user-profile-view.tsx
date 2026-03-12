'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

import Iconify from '../../../components/iconify';
import ProfileCover from '../profile-cover';
import UserProfileEditForm from '../user-profile-edit-form';
import { ProfileImageUploader } from '../../../components/profile-image-uploader';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useUserProfile } from '../../../hooks/use-user-profile';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'profile',
    label: 'Edit Profile',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'avatar',
    label: 'Profile Photo',
    icon: <Iconify icon="solar:camera-add-bold" width={24} />,
  },
];

export default function UserProfileView() {
  const settings = useSettingsContext();
  const { profile, loading, updateAvatar } = useUserProfile();

  const [currentTab, setCurrentTab] = useState('profile');

  const handleChangeTab = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const firstname = profile?.firstname ?? '';
  const lastname = profile?.lastname ?? '';
  const avatarUrl = profile?.avatar ?? '';
  const role = 'EMPLOYEE';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'User', href: '/dashboard/user' },
          { name: loading ? '...' : `${firstname} ${lastname}` },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        ) : (
          <ProfileCover
            role={role}
            name={`${firstname} ${lastname}`}
            avatarUrl={avatarUrl}
            coverUrl=""
          />
        )}

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

      {currentTab === 'profile' && <UserProfileEditForm />}

      {currentTab === 'avatar' && <ProfileImageUploader onUploadComplete={updateAvatar} />}
    </Container>
  );
}
