'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { createClient } from '@/lib/supabase/client';
import Iconify from '@/components/iconify';
import Label from '@/components/label';
import { useSettingsContext } from '@/components/settings';
import { fDate, fToNow } from '@/utils/format-time';
import {
  IAdjustmentRequestItem,
  RequestStatusTypes,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from '@/types/adjustmentRequest';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function AdjustmentRequestDetailPage({ id }: Props) {
  const settings = useSettingsContext();
  const router = useRouter();
  const supabase = createClient();

  const [request, setRequest] = useState<IAdjustmentRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Try fetching as the requester first
      const { data, error: fetchError } = await supabase
        .from('adjustment_requests')
        .select('*')
        .eq('id', id)
        .or(`user_id.eq.${user.id},approver_id.eq.${user.id}`)
        .single();

      if (fetchError || !data) {
        setError('Request not found or you do not have permission to view it.');
      } else {
        // Map snake_case DB columns to camelCase type
        const mapped: IAdjustmentRequestItem = {
          id: data.id,
          title: data.title,
          detail: data.detail,
          createdAt: data.created_at,
          adjustmentType: data.adjustment_type,
          requiredDate: data.required_date,
          workfunction: data.work_function,
          benefit: data.benefit,
          location: data.location,
          disability: data.disability,
          status: data.status,
          approverId: data.approver_id,
          approverName: data.approver_name,
          responseMessage: data.response_message,
          respondedAt: data.responded_at,
          requesterName: data.requester_name,
          requesterEmail: data.requester_email,
        };
        setRequest(mapped);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch request');
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  if (error || !request) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 10 }}>
          <Iconify icon="solar:document-broken-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
          <Typography variant="h5">Request Not Found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {error || 'This adjustment request could not be found.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Stack>
      </Container>
    );
  }

  const statusColor = request.status ? REQUEST_STATUS_COLORS[request.status] : 'default';
  const statusLabel = request.status ? REQUEST_STATUS_LABELS[request.status] : 'Unknown';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <Iconify icon="eva:arrow-back-fill" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Adjustment Request</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Submitted {fToNow(request.createdAt)}
          </Typography>
        </Box>
        <Label variant="filled" color={statusColor} sx={{ px: 2, py: 1.5, typography: 'subtitle2' }}>
          {statusLabel}
        </Label>
      </Stack>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {request.title}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Details
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {request.detail || 'No details provided.'}
              </Typography>
            </Card>

            {/* Response / Approver Message */}
            {request.responseMessage && (
              <Card
                sx={{
                  p: 3,
                  bgcolor:
                    request.status === RequestStatusTypes.APPROVED
                      ? 'success.lighter'
                      : request.status === RequestStatusTypes.DENIED
                        ? 'error.lighter'
                        : 'warning.lighter',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Iconify
                    icon={
                      request.status === RequestStatusTypes.APPROVED
                        ? 'solar:check-circle-bold'
                        : request.status === RequestStatusTypes.DENIED
                          ? 'solar:close-circle-bold'
                          : 'solar:question-circle-bold'
                    }
                    sx={{
                      color:
                        request.status === RequestStatusTypes.APPROVED
                          ? 'success.main'
                          : request.status === RequestStatusTypes.DENIED
                            ? 'error.main'
                            : 'warning.main',
                    }}
                  />
                  <Typography variant="subtitle2">
                    {request.status === RequestStatusTypes.APPROVED
                      ? 'Approval Message'
                      : request.status === RequestStatusTypes.DENIED
                        ? 'Decline Reason'
                        : 'Additional Information Required'}
                  </Typography>
                  {request.respondedAt && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                      {fToNow(request.respondedAt)}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2">{request.responseMessage}</Typography>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Request Details
              </Typography>
              <Stack spacing={2}>
                {[
                  {
                    label: 'Date Submitted',
                    value: fDate(request.createdAt),
                    icon: 'solar:calendar-date-bold',
                  },
                  {
                    label: 'Required By',
                    value: fDate(request.requiredDate),
                    icon: 'solar:calendar-mark-bold',
                  },
                  {
                    label: 'Adjustment Type',
                    value: request.adjustmentType,
                    icon: 'solar:settings-bold',
                  },
                  {
                    label: 'Work Function',
                    value: request.workfunction,
                    icon: 'carbon:skill-level-basic',
                  },
                  {
                    label: 'Location',
                    value: request.location,
                    icon: 'solar:map-point-bold',
                  },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <Stack key={item.label} direction="row" spacing={1.5}>
                      <Iconify icon={item.icon} sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                        primaryTypographyProps={{
                          typography: 'caption',
                          color: 'text.secondary',
                        }}
                        secondaryTypographyProps={{
                          typography: 'subtitle2',
                          color: 'text.primary',
                          component: 'span',
                        }}
                      />
                    </Stack>
                  ))}

                {request.benefit && (
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Benefit
                    </Typography>
                    <Chip label={request.benefit} variant="soft" size="small" sx={{ alignSelf: 'flex-start' }} />
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Approver Info */}
            {request.approverName && (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Assigned Approver
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon="solar:user-circle-bold" width={32} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2">{request.approverName}</Typography>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
