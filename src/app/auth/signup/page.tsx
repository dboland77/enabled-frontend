'use client';
import { useRouter } from 'next/navigation';

// TODO: Re-enable sign up after testing phase
// Sign up is currently disabled for testing. Redirect users to sign in page.
export default function SignUpView() {
  // redirect('/auth/signin');
  const router = useRouter();
}

// };

//   const renderHead = (
//     <Stack spacing={2} sx={{ mb: 5 }}>
//       <Typography variant="h4">Sign up to enableD</Typography>

//       <Stack direction="row" spacing={0.5}>
//         <Typography variant="body2">Existing user?</Typography>

//         <Link
//           component="button"
//           type="button"
//           variant="body2"
//           onClick={() => {
//             router.push('/auth/signin');
//           }}
//         >
//           Sign In
//         </Link>
//       </Stack>
//     </Stack>
//   );

//   const renderForm = (
//     <Stack spacing={2.5}>
//       {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

//       <RHFTextField name="email" label="Email address" />

//       <RHFTextField
//         name="password"
//         label="Password"
//         type={showPassword.value ? 'text' : 'password'}
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <IconButton onClick={showPassword.onToggle} edge="end">
//                 <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />

//       <Button
//         fullWidth
//         color="inherit"
//         size="large"
//         type="submit"
//         variant="contained"
//         loading={isSubmitting}
//         sx={{
//           bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.common.white,
//           color: (theme) => theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.grey[800],
//           '&:hover': {
//             bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.grey[400],
//           },
//         }}
//       >
//         Sign Up
//       </Button>
//     </Stack>
//   );

//   return (
//     <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
//       {renderHead}

//       {renderForm}
//     </FormProvider>
//   );
// }
