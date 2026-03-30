import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSnackbar } from '@/components/snackbar';
import { useAdjustmentRequests } from '@/hooks/use-adjustment-requests';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';
import FormProvider, { RHFTextField, RHFAutocomplete } from '@/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentRequest?: IAdjustmentRequestItem;
  onSuccess?: VoidFunction;
};

// Adjustment type options
const ADJUSTMENT_TYPE_OPTIONS = [
  'Assistive Technology',
  'Communication Support',
  'Equipment',
  'Flexible Working',
  'Physical Workspace',
  'Software',
  'Training & Development',
  'Travel & Transport',
  'Other',
];

// Work function options
const WORK_FUNCTION_OPTIONS = [
  'Administrative Tasks',
  'Communication',
  'Computer Work',
  'Customer Service',
  'Data Entry',
  'Fieldwork',
  'Meetings',
  'Physical Tasks',
  'Presentation',
  'Reading & Writing',
  'Research',
  'Travel',
  'Other',
];

// Location options
const LOCATION_OPTIONS = [
  'Office',
  'Home Office',
  'Hybrid',
  'Client Site',
  'Field Location',
  'Multiple Locations',
  'Other',
];

export default function AdjustmentRequestQuickEditForm({
  open,
  onClose,
  currentRequest,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateAdjustmentRequest } = useAdjustmentRequests();

  const QuickEditSchema = Yup.object().shape({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters'),
    detail: Yup.string()
      .required('Detail is required')
      .min(10, 'Please provide more detail'),
    adjustmentType: Yup.string().required('Adjustment type is required'),
    workfunction: Yup.string().required('Work function is required'),
    location: Yup.string().required('Location is required'),
    requiredDate: Yup.date().required('Required date is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentRequest?.title || '',
      detail: currentRequest?.detail || '',
      adjustmentType: currentRequest?.adjustmentType || '',
      workfunction: currentRequest?.workfunction || '',
      location: currentRequest?.location || '',
      requiredDate: currentRequest?.requiredDate ? new Date(currentRequest.requiredDate) : new Date(),
    }),
    [currentRequest]
  );

  const methods = useForm({
    resolver: yupResolver(QuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentRequest) {
      reset(defaultValues);
    }
  }, [currentRequest, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentRequest) return;

      await updateAdjustmentRequest({
        id: currentRequest.id,
        title: data.title,
        detail: data.detail,
        adjustmentType: data.adjustmentType,
        workfunction: data.workfunction,
        location: data.location,
        requiredDate: data.requiredDate,
        approverId: currentRequest.approverId || '',
        approverName: currentRequest.approverName || '',
      });

      reset();
      onClose();
      enqueueSnackbar('Update success!');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to update request',
        { variant: 'error' }
      );
    }
  });

  // Check if request can be edited
  const canEdit =
    currentRequest?.status === RequestStatusTypes.NEW ||
    currentRequest?.status === RequestStatusTypes.MORE_INFO;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Edit Adjustment Request</DialogTitle>

        <DialogContent>
          {!canEdit && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: 'warning.lighter',
                borderRadius: 1,
                color: 'warning.darker',
              }}
            >
              This request cannot be edited because it has status: {currentRequest?.status}
            </Box>
          )}

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ pt: 1 }}
          >
            <RHFTextField
              name="title"
              label="Adjustment Name"
              disabled={!canEdit}
            />

            <RHFAutocomplete
              name="adjustmentType"
              label="Adjustment Type"
              placeholder="Select type"
              options={ADJUSTMENT_TYPE_OPTIONS}
              disabled={!canEdit}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
            />

            <RHFAutocomplete
              name="workfunction"
              label="Work Function"
              placeholder="Select work function"
              options={WORK_FUNCTION_OPTIONS}
              disabled={!canEdit}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
            />

            <RHFAutocomplete
              name="location"
              label="Location"
              placeholder="Select location"
              options={LOCATION_OPTIONS}
              disabled={!canEdit}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
            />

            <Controller
              name="requiredDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Required Date"
                  format="dd/MM/yyyy"
                  disabled={!canEdit}
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

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <RHFTextField
                name="detail"
                label="Details"
                multiline
                rows={4}
                disabled={!canEdit}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !canEdit}
          >
            Update
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
