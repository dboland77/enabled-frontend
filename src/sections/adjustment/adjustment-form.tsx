import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/frontend/routes/paths';
import { useRouter } from 'src/frontend/routes/hooks';
import { createAdjustment } from 'src/frontend/slices';
import { useSnackbar } from 'src/frontend/components/snackbar';
import { useResponsive } from 'src/frontend/hooks/use-responsive';
import { useAppDispatch, useAppSelector } from 'src/frontend/hooks';
import FormProvider, {
  RHFEditor,
  RHFTextField,
  RHFAutocomplete,
} from 'src/frontend/components/hook-form';

export default function CreateAdjustmentForm() {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { adjustmentsLoading } = useAppSelector((state) => state.adjustments);
  const { adjustments } = useAppSelector((state) => state.adjustments);

  // Set Option Values for the form
  const adjustmentTypes = adjustments.map((a) => a.adjustment_type);
  const adjustmentTypeOptions = Array.from(new Set(adjustmentTypes));

  const NewAdjustmentSchema = Yup.object().shape({
    title: Yup.string().required('Please provide the name of the adjustment'),
    detail: Yup.string().required('Detail is required'),
    adjustmentType: Yup.mixed<any>().nullable().required('Adjustment Type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: '',
      detail: '',
      adjustmentType: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewAdjustmentSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const adjustment = {
      title: data.title,
      detail: data.detail,
      adjustmentType: data.adjustmentType,
    };

    try {
      await dispatch(createAdjustment(adjustment));
      reset();
      enqueueSnackbar('Adjustment created!');
      router.push(paths.dashboard.adjustments.root);
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
            Please provide any specific information that helps to show the benefit of this
            adjustment.
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
              <RHFEditor
                simple
                name="detail"
                placeholder="Please add as much detail as you can, including images."
              />
            </Stack>
          </Stack>

          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="subtitle2">Adjustment Type</Typography>
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
          loading={adjustmentsLoading}
          sx={{ ml: 2 }}
        >
          Create Adjustment
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
