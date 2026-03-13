'use client';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/components/snackbar';
import { IDisabilityItem } from '@/types/disability';
import { useResponsive } from '@/hooks/use-responsive';
import FormProvider, { RHFTextField } from '@/components/hook-form';

type Props = {
  currentDisability?: IDisabilityItem;
};

export default function DisabilityNewEditForm({ currentDisability }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewDisabilitySchema = Yup.object().shape({
    disability_name: Yup.string().required('Please tell us the name of the disability'),
    disability_nhs_slug: Yup.string().required('Please provide the NHS slug'),
  });

  const defaultValues = useMemo(
    () => ({
      disability_name: currentDisability?.disability_name || '',
      disability_nhs_slug: currentDisability?.disability_nhs_slug || '',
    }),
    [currentDisability]
  );

  const methods = useForm({
    resolver: yupResolver(NewDisabilitySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentDisability) {
      reset(defaultValues);
    }
  }, [currentDisability, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // TODO: Implement save to database
      reset();
      enqueueSnackbar(
        currentDisability ? 'Disability updated successfully!' : 'Disability Entry created!'
      );
      router.push('/dashboard/disability');
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Disability Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please provide any specific and relevant information for this disability.
          </Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Disability Name</Typography>
              <RHFTextField name="disability_name" placeholder="Example: Autism" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">NHS Slug</Typography>
              <RHFTextField name="disability_nhs_slug" placeholder="Example: autism" helperText="The URL slug used on the NHS website" />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid size={{ xs: 12 }} />}
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentDisability ? 'Create Disability Entry' : 'Save Changes'}
        </Button>
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
