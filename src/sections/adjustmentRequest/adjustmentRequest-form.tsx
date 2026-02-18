import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/frontend/routes/paths';
import { useRouter } from 'src/frontend/routes/hooks';
import { useSnackbar } from 'src/frontend/components/snackbar';
import { useResponsive } from 'src/frontend/hooks/use-responsive';
import { useAppDispatch, useAppSelector } from 'src/frontend/hooks';
import { IAdjustmentRequestItem } from 'src/frontend/types/adjustmentRequest';
import { createAdjustmentRequest, updateAdjustmentRequest } from 'src/frontend/slices';
import FormProvider, {
  RHFEditor,
  RHFTextField,
  RHFAutocomplete,
} from 'src/frontend/components/hook-form';

type Props = {
  currentAdjustmentRequest?: IAdjustmentRequestItem;
};

export default function RequestAdjustmentForm({ currentAdjustmentRequest }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { adjustmentRequestsLoading } = useAppSelector((state) => state.adjustmentRequests);
  const { id } = useAppSelector((state) => state.auth);
  const { adjustments } = useAppSelector((state) => state.adjustments);

  // Set Option Values for the form
  const adjustmentTypes = adjustments.map((a) => a.adjustment_type);
  const adjustmentTypeOptions = Array.from(new Set(adjustmentTypes));

  const NewAdjustmentSchema = Yup.object().shape({
    title: Yup.string().required('Please tell us the name of the adjustment'),
    detail: Yup.string().required('Detail is required'),
    adjustmentType: Yup.mixed<any>().nullable().required('Adjustment Type is required'),
    workfunction: Yup.mixed<any>().nullable().required('Work Function is required'),
    benefit: Yup.string(),
    location: Yup.mixed<any>().nullable().required('Location is required'),
    requiredDate: Yup.mixed<any>()
      .nullable()
      .required('Please tell us the latest date you need this'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentAdjustmentRequest?.title || '',
      detail: currentAdjustmentRequest?.detail || '',
      adjustmentType: currentAdjustmentRequest?.adjustmentType || null,
      workfunction: currentAdjustmentRequest?.workfunction || null,
      benefit: '',
      requiredDate: currentAdjustmentRequest
        ? new Date(currentAdjustmentRequest.requiredDate)
        : null,
      location: currentAdjustmentRequest?.location || null,
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
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentAdjustmentRequest) {
      reset(defaultValues);
    }
  }, [currentAdjustmentRequest, defaultValues, adjustments, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const request = {
      id: currentAdjustmentRequest?.id || '',
      title: data.title,
      detail: data.detail,
      adjustmentType: data.adjustmentType,
      workfunction: data.workfunction,
      benefit: '',
      location: data.location,
      requiredDate: data.requiredDate,
      status: currentAdjustmentRequest ? 'PENDING' : 'NEW',
      userId: id,
    };

    try {
      if (!currentAdjustmentRequest) {
        await dispatch(createAdjustmentRequest(request));
      } else {
        await dispatch(updateAdjustmentRequest(request));
      }
      if (!adjustmentRequestsLoading) {
        reset();
        enqueueSnackbar(
          currentAdjustmentRequest ? 'Request updated successfully!' : 'Adjustment Request created!'
        );
      }
      router.push(paths.dashboard.adjustmentRequests.root);
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Adjustment Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please provide any specific information for this adjustment that helps to show the
            benefit for you.
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Adjustment Name</Typography>
              <RHFTextField name="title" placeholder="Example: Braille Keyboard" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Extra Detail</Typography>
              <RHFEditor simple name="detail" />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="workfunction"
                label="Work Function"
                options={['WF 1', 'WF 2']}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
            </Stack>

            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="adjustmentType"
                label="Adjustment Type"
                options={adjustmentTypeOptions}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
            </Stack>

            <Stack spacing={1.5}>
              <RHFAutocomplete
                name="location"
                label="Location"
                options={['Loc 1', 'Loc 2']}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">How soon do you need this adjustment?</Typography>
              <Controller
                name="requiredDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    {...field}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentAdjustmentRequest ? 'Request Adjustment' : 'Save Changes'}
        </LoadingButton>
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
