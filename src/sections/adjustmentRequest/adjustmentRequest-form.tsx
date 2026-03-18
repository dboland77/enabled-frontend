'use client';
import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/components/snackbar';
import { useResponsive } from '@/hooks/use-responsive';
import { useAdjustments } from '@/hooks/use-adjustments';
import { useAdjustmentRequests } from '@/hooks/use-adjustment-requests';
import { IAdjustmentRequestItem } from '@/types/adjustmentRequest';
import FormProvider, { RHFEditor, RHFTextField, RHFAutocomplete } from '@/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  currentAdjustmentRequest?: IAdjustmentRequestItem;
};

// Work function options
const WORK_FUNCTION_OPTIONS = [
  'Administrative Tasks',
  'Communication',
  'Computer Work',
  'Customer Service',
  'Data Entry',
  'Fieldwork',
  'Meetings',
  'Physical Tasks',
  'Presentation',
  'Reading & Writing',
  'Research',
  'Travel',
  'Other',
];

// Location options
const LOCATION_OPTIONS = [
  'Office',
  'Home Office',
  'Hybrid',
  'Client Site',
  'Field Location',
  'Multiple Locations',
  'Other',
];

// Adjustment type options
const ADJUSTMENT_TYPE_OPTIONS = [
  'Assistive Technology',
  'Communication Support',
  'Equipment',
  'Flexible Working',
  'Physical Workspace',
  'Software',
  'Training & Development',
  'Travel & Transport',
  'Other',
];

export default function RequestAdjustmentForm({ currentAdjustmentRequest }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const { adjustments, loading: adjustmentsLoading } = useAdjustments();
  const { createAdjustmentRequest, updateAdjustmentRequest } = useAdjustmentRequests();

  // Get unique adjustment types - combine database types with static options
  const adjustmentTypeOptions = useMemo(() => {
    const dbTypes = adjustments
      .map((a) => a.adjustment_type)
      .filter((type): type is string => type !== null && type.trim() !== '');
    // Combine database types with static options, removing duplicates
    const allTypes = [...new Set([...ADJUSTMENT_TYPE_OPTIONS, ...dbTypes])];
    return allTypes.sort();
  }, [adjustments]);

  const NewAdjustmentSchema = Yup.object().shape({
    title: Yup.string()
      .required('Please tell us the name of the adjustment')
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be less than 200 characters'),
    detail: Yup.string()
      .required('Please provide details about why you need this adjustment')
      .min(10, 'Please provide more detail (at least 10 characters)'),
    adjustmentType: Yup.string().nullable().required('Please select an adjustment type'),
    workfunction: Yup.string()
      .nullable()
      .required('Please select the work function this adjustment relates to'),
    location: Yup.string().nullable().required('Please select where you need this adjustment'),
    requiredDate: Yup.date()
      .nullable()
      .required('Please tell us when you need this adjustment')
      .min(new Date(), 'Required date must be in the future'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentAdjustmentRequest?.title || '',
      detail: currentAdjustmentRequest?.detail || '',
      adjustmentType: currentAdjustmentRequest?.adjustmentType || '',
      workfunction: currentAdjustmentRequest?.workfunction || '',
      location: currentAdjustmentRequest?.location || '',
      requiredDate: new Date(currentAdjustmentRequest?.requiredDate || ''),
    }),
    [currentAdjustmentRequest]
  );

  const methods = useForm({
    resolver: yupResolver(NewAdjustmentSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentAdjustmentRequest) {
      reset(defaultValues);
    }
  }, [currentAdjustmentRequest, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestData = {
        title: data.title,
        detail: data.detail,
        adjustmentType: data.adjustmentType as string,
        workfunction: data.workfunction as string,
        location: data.location as string,
        requiredDate: data.requiredDate as Date,
      };

      if (currentAdjustmentRequest) {
        await updateAdjustmentRequest({
          id: currentAdjustmentRequest.id,
          ...requestData,
        });
        enqueueSnackbar('Adjustment request updated successfully!', { variant: 'success' });
      } else {
        await createAdjustmentRequest(requestData);
        enqueueSnackbar('Adjustment request submitted successfully!', { variant: 'success' });
      }

      reset();
      router.push('/dashboard/user/adjustmentRequests');
    } catch (error) {
      console.error('Error submitting adjustment request:', error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to submit adjustment request',
        { variant: 'error' }
      );
    }
  });

  const handleCancel = () => {
    router.push('/dashboard/user/adjustmentRequests');
  };

  const renderDetails = (
    <>
      {mdUp && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Adjustment Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please provide specific information about the adjustment you need. The more detail you
            provide, the better we can support you.
          </Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          {!mdUp && <CardHeader title="Adjustment Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                Adjustment Name <span style={{ color: 'error.main' }}>*</span>
              </Typography>
              <RHFTextField
                name="title"
                placeholder="Example: Braille Keyboard, Standing Desk, Screen Reader Software"
                helperText="What adjustment or support do you need?"
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                Why do you need this adjustment? <span style={{ color: 'error.main' }}>*</span>
              </Typography>
              <RHFEditor
                simple
                name="detail"
                placeholder="Please describe how this adjustment will help you perform your work more effectively..."
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Explain how this adjustment relates to your disability or health condition and how
                it will benefit you at work.
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Request Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Help us understand the context of your request.
          </Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          {!mdUp && <CardHeader title="Request Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="adjustmentType"
                label="Adjustment Type *"
                placeholder="Select the type of adjustment"
                options={adjustmentTypeOptions}
                loading={adjustmentsLoading}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Select the category that best describes your adjustment request.
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="workfunction"
                label="Work Function *"
                placeholder="Select the work activity this relates to"
                options={WORK_FUNCTION_OPTIONS}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                What type of work activity does this adjustment support?
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="location"
                label="Location *"
                placeholder="Where do you need this adjustment?"
                options={LOCATION_OPTIONS}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Where will you primarily use this adjustment?
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                When do you need this adjustment? <span style={{ color: 'error.main' }}>*</span>
              </Typography>
              <Controller
                name="requiredDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    {...field}
                    format="dd/MM/yyyy"
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                        placeholder: 'Select a date',
                      },
                    }}
                  />
                )}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Please provide the latest date by which you need this adjustment in place.
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid size={{ xs: 12 }} />}
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" size="large" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentAdjustmentRequest ? 'Submit Request' : 'Save Changes'}
        </Button>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
