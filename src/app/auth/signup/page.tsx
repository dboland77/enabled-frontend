'use client';
import OneTapComponent from '@/app/auth/login/GoogleOneTap';

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

import { SignUpFormValues } from '../types';

export default function SignUpView() {
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const showPassword = useBoolean();

  const SignUpSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required to sign up')
      .email('Email must be a valid email address'),
    password: Yup.string().required('Password is required to sign up'),
  });

  const methods = useForm({
    resolver: yupResolver(SignUpSchema),
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

  const onSubmit = async (data: SignUpFormValues) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      router.push('/error');
    }

    router.push('/auth/login');
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign up to enableD</Typography>
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

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Sign Up
      </Button>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
