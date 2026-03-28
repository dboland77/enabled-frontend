'use client';

import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';

import RequestAdjustmentForm from '../adjustmentRequest-form';

type Props = {
  id: string;
};

export default function AdjustmentRequestEditView({ id }: Props) {
  const settings = useSettingsContext();
  const router = useRouter();
  const supabase = createClient();

  const [adjustmentRequest, setAdjustmentRequest] = useState<IAdjustmentRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdjustmentRequest = async () => {
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

        const { data, error: fetchError } = await supabase
          .from('adjustment_requests')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Adjustment request not found or you do not have permission to edit it.');
          } else {
            setError(fetchError.message);
          }
        } else {
          // Check if request can be edited (only NEW or MORE_INFO status)
          const editableStatuses = [RequestStatusTypes.NEW, RequestStatusTypes.MORE_INFO];
          if (!editableStatuses.includes(data.status)) {
            setError(`This request cannot be edited because it has status: ${data.status}`);
          } else {
            setAdjustmentRequest(data as IAdjustmentRequestItem);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch adjustment request');
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustmentRequest();
  }, [id, supabase]);

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Adjustment Request"
          links={[
            { name: 'Home', href: '/dashboard' },
            { name: 'Adjustment Requests', href: '/dashboard/user/adjustmentRequests' },
            { name: 'Edit' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => router.push('/dashboard/user/adjustmentRequests')}
            >
              Back to List
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Adjustment Request"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'Adjustment Requests', href: '/dashboard/user/adjustmentRequests' },
          { name: adjustmentRequest?.title || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RequestAdjustmentForm currentAdjustmentRequest={adjustmentRequest!} />
    </Container>
  );
}
