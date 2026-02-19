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
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/components/snackbar';
import { IDisabilityItem } from '@/types/disability';
import { useResponsive } from '@/hooks/use-responsive';
import FormProvider, { RHFEditor, RHFTextField } from '@/components/hook-form';

type Props = {
  currentDisability?: IDisabilityItem;
};

// TODO - change to state

const disabilities = [
  {
    id: '123',
    name: 'dfff',
    slug: '/sdfsdf',
  },
];

const disabilitiesLoading = false;

export default function DisabilityNewEditForm({ currentDisability }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewDisabilitySchema = Yup.object().shape({
    name: Yup.string().required('Please tell us the name of the disability'),
    about: Yup.string().required('Please describe the disability'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentDisability?.name || '',
      about: currentDisability?.slug || '',
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
  }, [currentDisability, defaultValues, disabilities, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const request = {
      id: currentDisability?.id || '',
      title: data.name,
      detail: data.about,
    };

    try {
      if (!currentDisability) {
      }
      if (!disabilitiesLoading) {
        reset();
        enqueueSnackbar(
          currentDisability ? 'Disability updated successfully!' : 'Disability Entry created!'
        );
      }
      router.push('/dashboard/disability');
    } catch (error) {
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Disability Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please provide any specific and relevant information for this disability.
          </Typography>
        </Grid>
      )}

      <Grid>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Disability Name</Typography>
              <RHFTextField name="title" placeholder="Example: Autism" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Extra Detail</Typography>
              <RHFEditor
                simple
                name="detail"
                placeholder="Please add any extra detail for this disability."
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid />}
      <Grid sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentDisability ? 'Create Disability Entry' : 'Save Changes'}
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
