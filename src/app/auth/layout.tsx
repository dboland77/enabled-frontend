'use client';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Logo from '@/components/logo';
import { useResponsive } from '@/hooks/use-responsive';

const FEATURES = [
  'Request workplace adjustments',
  'Maintain your Accessibility Passport',
  'Track approvals in real time',
];

type Props = {
  children: React.ReactNode;
};

export default function AuthModernLayout({ children }: Props) {
  const mdUp = useResponsive('up', 'md');

  const renderBranding = (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 6,
        py: 8,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #004B50 0%, #007867 40%, #00A76F 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />

      <Box sx={{ textAlign: 'center', maxWidth: 380, position: 'relative', zIndex: 1 }}>
        <Logo size="lg" light disabledLink />

        <Typography sx={{ fontSize: 16, opacity: 0.85, mt: 2.5, lineHeight: 1.7, color: '#fff' }}>
          Empowering disabled employees with seamless workplace adjustment compliance and accessibility management.
        </Typography>

        <Stack spacing={1.75} sx={{ mt: 4, display: 'inline-flex', alignItems: 'flex-start' }}>
          {FEATURES.map((feature) => (
            <Stack key={feature} direction="row" alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  flexShrink: 0,
                  color: '#fff',
                }}
              >
                ✓
              </Box>
              <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );

  const renderForm = (
    <Stack
      sx={{
        width: { xs: '100%', md: 480 },
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 0 },
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FEFDF7 0%, #EEEEEE 100%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        {children}
      </Box>
    </Stack>
  );

  return (
    <Stack component="main" direction="row" sx={{ minHeight: '100vh' }}>
      {mdUp && renderBranding}
      {renderForm}
    </Stack>
  );
}
