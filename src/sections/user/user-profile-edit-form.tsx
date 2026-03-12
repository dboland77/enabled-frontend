'use client';

import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';

import { useSnackbar } from '@/components/snackbar';
import FormProvider, { RHFTextField } from '@/components/hook-form';
import { useUserProfile } from '@/hooks/use-user-profile';

// ----------------------------------------------------------------------

export default function UserProfileEditForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, loading, updateProfile } = useUserProfile();

  const ProfileSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      firstname: profile?.firstname ?? '',
      lastname: profile?.lastname ?? '',
    }),
    [profile]
  );

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfile(data);
      enqueueSnackbar('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstname" label="First Name" disabled={loading} />
              <RHFTextField name="lastname" label="Last Name" disabled={loading} />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={loading}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
