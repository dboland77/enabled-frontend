'use client';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';

import Iconify from '@/components/iconify';
import { WIZARD_STEPS } from '@/types/wizard';

// ----------------------------------------------------------------------

type Props = {
  activeStep: number;
  onStepClick?: (step: number) => void;
};

export default function WizardStepper({ activeStep, onStepClick }: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper
        activeStep={activeStep - 1}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          '& .MuiStepLabel-root': {
            cursor: onStepClick ? 'pointer' : 'default',
          },
        }}
      >
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = activeStep > step.id;
          const isActive = activeStep === step.id;
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <Step
              key={step.id}
              completed={isCompleted}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon {...props} icon={step.icon} stepNumber={step.id} />
                )}
              >
                <Stack spacing={0.5} alignItems="center">
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      color: isActive
                        ? 'primary.main'
                        : isCompleted
                          ? 'text.primary'
                          : 'text.secondary',
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {step.description}
                  </Typography>
                </Stack>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CustomConnector() {
  const theme = useTheme();

  return (
    <StepConnector
      sx={{
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
          top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
          [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          },
        },
        [`&.${stepConnectorClasses.completed}`]: {
          [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          },
        },
        [`& .${stepConnectorClasses.line}`]: {
          height: 3,
          border: 0,
          backgroundColor: theme.palette.grey[300],
          borderRadius: 1,
        },
      }}
    />
  );
}

// ----------------------------------------------------------------------

type CustomStepIconProps = StepIconProps & {
  icon: string;
  stepNumber: number;
};

function CustomStepIcon({ active, completed, icon, stepNumber }: CustomStepIconProps) {
  const theme = useTheme();

  const backgroundColor = completed
    ? theme.palette.primary.main
    : active
      ? theme.palette.primary.main
      : theme.palette.grey[300];

  const color = completed || active ? theme.palette.common.white : theme.palette.grey[600];

  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor,
        color,
        boxShadow: active ? `0 4px 10px 0 ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {completed ? (
        <Iconify icon="eva:checkmark-fill" width={24} />
      ) : (
        <Iconify icon={icon} width={24} />
      )}
    </Box>
  );
}
