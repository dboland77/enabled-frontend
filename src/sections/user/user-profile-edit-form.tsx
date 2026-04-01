'use client';

import * as Yup from 'yup';
import { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import { useSnackbar } from '@/components/snackbar';
import FormProvider, { RHFTextField, RHFSwitch, RHFAutocomplete } from '@/components/hook-form';
import { useUserProfile, UserDisability, UserAdjustment } from '@/hooks/use-user-profile';
import { useDisabilities } from '@/hooks/use-disabilities';
import { useRoles } from '@/hooks/use-roles';
import { useDepartments } from '@/hooks/use-departments';

// ----------------------------------------------------------------------

export default function UserProfileEditForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { profile, loading, updateProfile, fetchUserDisabilities, fetchUserAdjustments, addUserDisability, removeUserDisability } = useUserProfile();
  const { disabilities: allDisabilities } = useDisabilities();
  const { roles, loading: rolesLoading } = useRoles();
  const { departments, loading: departmentsLoading } = useDepartments();

  // Check if current user can edit roles (admin or approver)
  const canEditRoles = profile?.role === 'admin' || profile?.role === 'approver';

  const [userDisabilities, setUserDisabilities] = useState<UserDisability[]>([]);
  const [userAdjustments, setUserAdjustments] = useState<UserAdjustment[]>([]);
  const [loadingDisabilities, setLoadingDisabilities] = useState(true);
  
  // Track pending changes - only saved when form is submitted
  const [pendingAdditions, setPendingAdditions] = useState<{ id: string; disability_name: string }[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]); // IDs of user_disabilities to remove

  // Fetch user disabilities and adjustments on mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoadingDisabilities(true);
      try {
        const [disabilities, adjustments] = await Promise.all([
          fetchUserDisabilities(),
          fetchUserAdjustments(),
        ]);
        setUserDisabilities(disabilities);
        setUserAdjustments(adjustments);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoadingDisabilities(false);
      }
    };
    loadUserData();
  }, [fetchUserDisabilities, fetchUserAdjustments]);

  const ProfileSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    job_title: Yup.string().nullable(),
    role: Yup.mixed().nullable(),
    department: Yup.mixed().nullable(),
    line_manager_id: Yup.string().nullable(),
    is_disabled: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      firstname: profile?.firstname ?? '',
      lastname: profile?.lastname ?? '',
      job_title: profile?.job_title ?? '',
      role: profile?.role ?? '',
      department: profile?.department ?? '',
      line_manager_id: profile?.line_manager_id ?? '',
      is_disabled: profile?.is_disabled ?? false,
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
    watch,
    formState: { isSubmitting },
  } = methods;

  const isDisabled = watch('is_disabled');

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Handle autocomplete values - extract string from object if needed
      let roleValue: string | null = null;
      if (typeof data.role === 'object' && data.role !== null) {
        roleValue = (data.role as { role_name: string }).role_name;
      } else if (typeof data.role === 'string') {
        roleValue = data.role || null;
      }

      let departmentValue: string | null = null;
      if (typeof data.department === 'object' && data.department !== null) {
        departmentValue = (data.department as { department_name: string }).department_name;
      } else if (typeof data.department === 'string') {
        departmentValue = data.department || null;
      }

      // Save profile data
      await updateProfile({
        firstname: data.firstname,
        lastname: data.lastname,
        job_title: data.job_title || null,
        role: roleValue,
        department: departmentValue,
        line_manager_id: data.line_manager_id || null,
        is_disabled: data.is_disabled,
      });

      // Process pending disability additions
      for (const disability of pendingAdditions) {
        await addUserDisability(disability.id);
      }

      // Process pending disability removals
      for (const userDisabilityId of pendingRemovals) {
        await removeUserDisability(userDisabilityId);
      }

      // Refresh disabilities list and clear pending changes
      const updatedDisabilities = await fetchUserDisabilities();
      setUserDisabilities(updatedDisabilities);
      setPendingAdditions([]);
      setPendingRemovals([]);

      enqueueSnackbar('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  // Stage a disability for addition (will be saved on form submit)
  const handleStageDisability = (disability: { id: string; disability_name: string }) => {
    setPendingAdditions((prev) => [...prev, disability]);
  };

  // Unstage a pending addition
  const handleUnstageDisability = (disabilityId: string) => {
    setPendingAdditions((prev) => prev.filter((d) => d.id !== disabilityId));
  };

  // Stage an existing disability for removal (will be removed on form submit)
  const handleStageRemoval = (userDisabilityId: string) => {
    setPendingRemovals((prev) => [...prev, userDisabilityId]);
  };

  // Unstage a pending removal (restore it)
  const handleUnstageRemoval = (userDisabilityId: string) => {
    setPendingRemovals((prev) => prev.filter((id) => id !== userDisabilityId));
  };

  // Filter out already selected disabilities and pending additions
  const availableDisabilities = allDisabilities.filter(
    (d) => 
      !userDisabilities.some((ud) => ud.disability_id === d.id) &&
      !pendingAdditions.some((pa) => pa.id === d.id)
  );

  // Check if there are unsaved changes
  const hasUnsavedDisabilityChanges = pendingAdditions.length > 0 || pendingRemovals.length > 0;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Personal Information
            </Typography>
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
          </Card>
        </Grid>

        {/* Job Details Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Job Details
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="job_title" label="Job Title" disabled={loading} />
              <RHFAutocomplete
                name="role"
                label="Role"
                options={roles}
                loading={rolesLoading}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.role_name}
                isOptionEqualToValue={(option, value) => {
                  if (typeof value === 'string') return option.role_name === value;
                  return option.id === value.id;
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.role_name}
                  </li>
                )}
                disabled={loading || !canEditRoles}
                helperText={!canEditRoles ? 'Only admins can change roles' : undefined}
              />
              <RHFAutocomplete
                name="department"
                label="Department"
                options={departments}
                loading={departmentsLoading}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.department_name}
                isOptionEqualToValue={(option, value) => {
                  if (typeof value === 'string') return option.department_name === value;
                  return option.id === value.id;
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.department_name}
                  </li>
                )}
                disabled={loading}
              />
              <RHFTextField name="line_manager_id" label="Line Manager ID" disabled={loading} helperText="Enter your line manager's user ID" />
            </Box>
          </Card>
        </Grid>

        {/* Disability Information Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Disability Information
            </Typography>
            
            <RHFSwitch name="is_disabled" label="I have a disability or long-term health condition" />

            {isDisabled && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  My Disabilities
                </Typography>

                {loadingDisabilities ? (
                  <Typography color="text.secondary">Loading...</Typography>
                ) : (
                  <>
                    {/* Existing disabilities (saved) */}
                    {userDisabilities.length > 0 || pendingAdditions.length > 0 ? (
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                        {/* Saved disabilities */}
                        {userDisabilities
                          .filter((d) => !pendingRemovals.includes(d.id))
                          .map((disability) => (
                            <Chip
                              key={disability.id}
                              label={disability.disability_name}
                              onDelete={() => handleStageRemoval(disability.id)}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        
                        {/* Pending additions (not yet saved) */}
                        {pendingAdditions.map((disability) => (
                          <Chip
                            key={`pending-${disability.id}`}
                            label={disability.disability_name}
                            onDelete={() => handleUnstageDisability(disability.id)}
                            color="success"
                            variant="filled"
                            sx={{ fontStyle: 'italic' }}
                          />
                        ))}

                        {/* Pending removals (will be removed on save) */}
                        {userDisabilities
                          .filter((d) => pendingRemovals.includes(d.id))
                          .map((disability) => (
                            <Chip
                              key={`removing-${disability.id}`}
                              label={disability.disability_name}
                              onDelete={() => handleUnstageRemoval(disability.id)}
                              color="error"
                              variant="outlined"
                              sx={{ textDecoration: 'line-through', opacity: 0.7 }}
                            />
                          ))}
                      </Stack>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No disabilities added yet. Use the dropdown below to add your disabilities.
                      </Alert>
                    )}

                    {hasUnsavedDisabilityChanges && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        You have unsaved disability changes. Click &quot;Save Changes&quot; to apply them.
                      </Alert>
                    )}

                    {availableDisabilities.length > 0 && (
                      <RHFAutocomplete
                        name="selectedDisability"
                        label="Add Disability"
                        placeholder="Select a disability to add..."
                        options={availableDisabilities}
                        value={null}
                        getOptionLabel={(option) => typeof option === 'string' ? option : (option as { disability_name: string }).disability_name}
                        isOptionEqualToValue={(option, value) => (option as { id: string }).id === (value as { id: string }).id}
                        onChange={(_, newValue) => {
                          if (newValue && typeof newValue !== 'string' && 'id' in newValue) {
                            handleStageDisability(newValue as { id: string; disability_name: string });
                          }
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={(option as { id: string }).id}>
                            {(option as { disability_name: string }).disability_name}
                          </li>
                        )}
                        helperText="Select disabilities to add. Changes are saved when you click Save Changes."
                      />
                    )}
                  </>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Approved Adjustments Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Approved Adjustments
            </Typography>

            {loadingDisabilities ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : userAdjustments.length > 0 ? (
              <Stack spacing={2}>
                {userAdjustments.map((adjustment) => (
                  <Card key={adjustment.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1">{adjustment.adjustment_title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {adjustment.adjustment_type}
                        </Typography>
                        {adjustment.adjustment_detail && (
                          <Typography variant="body2" color="text.secondary">
                            {adjustment.adjustment_detail}
                          </Typography>
                        )}
                        {adjustment.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Notes: {adjustment.notes}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={`Approved ${new Date(adjustment.approved_at).toLocaleDateString()}`}
                        color="success"
                        size="small"
                      />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                No approved adjustments yet. Request adjustments through the Adjustment Requests section.
              </Alert>
            )}
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid size={{ xs: 12 }}>
          <Stack alignItems="flex-end">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || isSubmitting}
            >
              Save Changes
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
