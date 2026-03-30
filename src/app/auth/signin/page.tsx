'use client';
import OneTapComponent from '@/app/auth/signin/GoogleOneTap';

import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from '@/components/iconify';
import { useBoolean } from '@/hooks';
import FormProvider, { RHFTextField } from '@/components/hook-form';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { SignInFormValues } from '../types';

export default function SignInView() {
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const showPassword = useBoolean();

  const SignInSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: SignInFormValues) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      router.push('/error');
      return;
    }

    router.push('/dashboard/app');
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to enableD</Typography>

      {/* TODO: Re-enable sign up after testing phase
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => {
            router.push('/auth/signup');
          }}
        >
          Sign Up
        </Link>
      </Stack>
      */}
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" label="Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={showPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={showPassword.onToggle} edge="end">
                <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* TODO: Re-enable forgot password after testing phase
      <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Forgot password?
      </Link>
      */}

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.common.white,
          color: (theme) => theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[800],
          '&:hover': {
            bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.grey[400],
          },
        }}
      >
        Sign In
      </Button>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}

      {renderForm}
      <OneTapComponent />
    </FormProvider>
  );
}
