'use client';

import { useState, useCallback, useMemo } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '../../../components/iconify';
import ProfileCover from '../profile-cover';
import ProfileReadView from '../profile-read-view';
import UserProfileEditForm from '../user-profile-edit-form';
import { ProfileImageUploader } from '../../../components/profile-image-uploader';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useUserProfile } from '../../../hooks/use-user-profile';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'profile',
    label: 'Profile Details',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
    tooltip: 'View and edit your personal information',
  },
  {
    value: 'avatar',
    label: 'Profile Photo',
    icon: <Iconify icon="solar:camera-add-bold" width={24} />,
    tooltip: 'Upload or change your profile picture',
  },
];

export default function UserProfileView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const { profile, loading, updateAvatar } = useUserProfile();

  const [currentTab, setCurrentTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChangeTab = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const firstname = profile?.firstname ?? '';
  const lastname = profile?.lastname ?? '';
  const avatarUrl = profile?.avatar ?? '';
  const role = profile?.role ?? 'Employee';

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    
    const fields = [
      profile.firstname,
      profile.lastname,
      profile.job_title,
      profile.department,
      profile.role,
      profile.avatar,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [profile]);

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

      {/* Profile Cover Card */}
      <Card 
        sx={{ 
          mb: 3, 
          height: { xs: 280, md: 320 },
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          <ProfileCover
            role={role}
            name={`${firstname} ${lastname}`}
            avatarUrl={avatarUrl}
            coverUrl=""
            isEditMode={isEditMode}
            onToggleEdit={handleToggleEditMode}
            completionPercentage={completionPercentage}
          />
        )}

        {/* Tabs positioned at bottom */}
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            [`& .${tabsClasses.flexContainer}`]: {
              pr: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-end',
              },
            },
            '& .MuiTab-root': {
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tooltip key={tab.value} title={tab.tooltip} arrow placement="top">
              <Tab value={tab.value} icon={tab.icon} label={tab.label} />
            </Tooltip>
          ))}
        </Tabs>
      </Card>

      {/* Content with fade transition */}
      <Fade in timeout={300} key={`${currentTab}-${isEditMode}`}>
        <Box>
          {currentTab === 'profile' && (
            isEditMode ? (
              <UserProfileEditForm />
            ) : (
              <ProfileReadView />
            )
          )}

          {currentTab === 'avatar' && (
            <ProfileImageUploader onUploadComplete={updateAvatar} />
          )}
        </Box>
      </Fade>
    </Container>
  );
}
