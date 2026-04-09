'use client';

import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'next/navigation';

import Iconify from '@/components/iconify';
import { useBoolean } from '@/hooks/use-boolean';
import ProgressBar from '@/components/progress-bar';
import { ConfirmDialog } from '@/components/custom-dialog';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import { useDisabilities } from '@/hooks/use-disabilities';
import { useChallenges, useRecommendedAdjustments, useWizardSession } from '@/hooks/use-wizard';
import { WIZARD_STEPS, IRecommendedAdjustment, IChallengeItem } from '@/types/wizard';
import { IDisabilityItem } from '@/types/disability';

import WizardStepper from '../wizard-stepper';
import WizardStepReview from '../steps/wizard-step-review';
import WizardStepChallenges from '../steps/wizard-step-challenges';
import WizardStepAdjustments from '../steps/wizard-step-adjustments';
import WizardStepDisabilities from '../steps/wizard-step-disabilities';

// ----------------------------------------------------------------------

export default function AdjustmentWizardView() {
  const theme = useTheme();
  const router = useRouter();
  const settings = useSettingsContext();
  const confirmReset = useBoolean();
  const confirmSubmit = useBoolean();

  // Session management
  const {
    session,
    loading: sessionLoading,
    saving,
    error: sessionError,
    updateSession,
    updateSessionLocal,
    saveNotes,
    completeWizard,
    resetWizard,
  } = useWizardSession();

  // Data fetching
  const {
    disabilities,
    loading: disabilitiesLoading,
    error: disabilitiesError,
  } = useDisabilities();
  const {
    challenges,
    loading: challengesLoading,
    error: challengesError,
  } = useChallenges(session.selectedDisabilities);
  const {
    recommendations,
    loading: recommendationsLoading,
    error: recommendationsError,
  } = useRecommendedAdjustments(session.selectedDisabilities, session.selectedChallenges);

  // Get selected items for review
  const selectedDisabilities = useMemo(
    () => disabilities.filter((d) => session.selectedDisabilities.includes(d.id)),
    [disabilities, session.selectedDisabilities]
  );

  // Filter disabilities to only show pre-selected ones in the wizard
  const wizardDisabilities = useMemo(
    () => disabilities.filter((d) => session.selectedDisabilities.includes(d.id)),
    [disabilities, session.selectedDisabilities]
  );

  const selectedChallenges = useMemo(
    () => challenges.filter((l) => session.selectedChallenges.includes(l.id)),
    [challenges, session.selectedChallenges]
  );

  const selectedAdjustments = useMemo(
    () => recommendations.filter((r) => session.selectedAdjustments.includes(r.id)),
    [recommendations, session.selectedAdjustments]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (session.currentStep < 4) {
      updateSession({ currentStep: session.currentStep + 1 });
    }
  }, [session.currentStep, updateSession]);

  const handleBack = useCallback(() => {
    if (session.currentStep > 1) {
      updateSession({ currentStep: session.currentStep - 1 });
    }
  }, [session.currentStep, updateSession]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step <= session.currentStep) {
        updateSession({ currentStep: step });
      }
    },
    [session.currentStep, updateSession]
  );

  // Selection handlers
  const handleDisabilitiesChange = useCallback(
    (ids: string[]) => {
      updateSession({ selectedDisabilities: ids });
    },
    [updateSession]
  );

  const handleChallengesChange = useCallback(
    (ids: string[]) => {
      updateSession({ selectedChallenges: ids });
    },
    [updateSession]
  );

  const handleAdjustmentsChange = useCallback(
    (ids: string[]) => {
      updateSession({ selectedAdjustments: ids });
    },
    [updateSession]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      updateSessionLocal({ additionalNotes: notes });
    },
    [updateSessionLocal]
  );

  const handleNotesBlur = useCallback(() => {
    saveNotes();
  }, [saveNotes]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const requestId = await completeWizard();
    if (requestId) {
      router.push(`/dashboard/user/adjustmentRequests/${requestId}`);
    }
    confirmSubmit.onFalse();
  }, [completeWizard, router, confirmSubmit]);

  // Reset handler
  const handleReset = useCallback(async () => {
    await resetWizard();
    confirmReset.onFalse();
  }, [resetWizard, confirmReset]);

  // Loading state
  if (sessionLoading) {
    return <ProgressBar />;
  }

  // Determine if we can proceed to next step
  const canProceed = () => {
    switch (session.currentStep) {
      case 1:
        return true; // Can skip disabilities
      case 2:
        return true; // Can skip challenges
      case 3:
        return session.selectedAdjustments.length > 0;
      case 4:
        return session.selectedAdjustments.length > 0;
      default:
        return false;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (session.currentStep) {
      case 1:
        return (
          <WizardStepDisabilities
            disabilities={wizardDisabilities}
            selectedIds={session.selectedDisabilities}
            onSelectionChange={handleDisabilitiesChange}
            loading={disabilitiesLoading}
            error={disabilitiesError}
          />
        );
      case 2:
        return (
          <WizardStepChallenges
            challenges={challenges}
            selectedIds={session.selectedChallenges}
            onSelectionChange={handleChallengesChange}
            loading={challengesLoading}
            error={challengesError}
          />
        );
      case 3:
        return (
          <WizardStepAdjustments
            recommendations={recommendations}
            selectedIds={session.selectedAdjustments}
            onSelectionChange={handleAdjustmentsChange}
            loading={recommendationsLoading}
            error={recommendationsError}
          />
        );
      case 4:
        return (
          <WizardStepReview
            selectedDisabilities={selectedDisabilities}
            selectedChallenges={selectedChallenges}
            selectedAdjustments={selectedAdjustments}
            additionalNotes={session.additionalNotes}
            onNotesChange={handleNotesChange}
            onNotesBlur={handleNotesBlur}
            onEditStep={handleStepClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Adjustment Wizard"
          links={[
            { name: 'Home', href: '/dashboard' },
            { name: 'Adjustments', href: '/dashboard/adjustments' },
            { name: 'Wizard' },
          ]}
          action={
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={confirmReset.onTrue}
              disabled={saving}
            >
              Start Over
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {sessionError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {sessionError}
          </Alert>
        )}

        {/* Stepper */}
        <WizardStepper activeStep={session.currentStep} onStepClick={handleStepClick} />

        {/* Step content */}
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation buttons */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleBack}
            disabled={session.currentStep === 1 || saving}
          >
            Back
          </Button>

          <Stack direction="row" alignItems="center" spacing={2}>
            {saving && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Saving...
                </Typography>
              </Stack>
            )}

            {session.currentStep < 4 ? (
              <Button
                variant="contained"
                endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                onClick={handleNext}
                disabled={!canProceed() || saving}
              >
                {session.currentStep === 3 ? 'Review' : 'Continue'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                endIcon={<Iconify icon="mdi:check" />}
                onClick={confirmSubmit.onTrue}
                disabled={!canProceed() || saving}
              >
                Submit Request
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Progress indicator */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Step {session.currentStep} of {WIZARD_STEPS.length}
          </Typography>
        </Box>
      </Container>

      {/* Reset confirmation dialog */}
      <ConfirmDialog
        open={confirmReset.value}
        onClose={confirmReset.onFalse}
        title="Start Over?"
        content="This will clear all your selections and start the wizard from the beginning. Are you sure?"
        action={
          <Button variant="contained" color="error" onClick={handleReset}>
            Yes, Start Over
          </Button>
        }
      />

      {/* Submit confirmation dialog */}
      <ConfirmDialog
        open={confirmSubmit.value}
        onClose={confirmSubmit.onFalse}
        title="Submit Request?"
        content={
          <>
            You are about to submit a request for{' '}
            <strong>{session.selectedAdjustments.length}</strong> workplace{' '}
            {session.selectedAdjustments.length === 1 ? 'adjustment' : 'adjustments'}. Your request
            will be reviewed by the appropriate team.
          </>
        }
        action={
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Request'}
          </Button>
        }
      />
    </>
  );
}
