'use client';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { useSettingsContext } from '@/components/settings';
import ProgressBar from '@/components/progress-bar';
import { createClient } from '@/lib/supabase/client';
import { IAdjustmentItem } from '@/types/adjustment';

import AdjustmentDetailsToolbar from '../adjustment-details-toolbar';

type Props = {
  id: string;
};

export default function AdjustmentDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const supabase = createClient();

  const [adjustment, setAdjustment] = useState<IAdjustmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdjustment() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('adjustments')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setAdjustment(data as IAdjustmentItem);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch adjustment');
      } finally {
        setLoading(false);
      }
    }

    fetchAdjustment();
  }, [id, supabase]);

  if (loading) {
    return <ProgressBar />;
  }

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <AdjustmentDetailsToolbar
          backLink="/dashboard/adjustments"
          editLink={`/dashboard/adjustments/${id}/edit`}
          liveLink="#"
        />
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!adjustment) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <AdjustmentDetailsToolbar
          backLink="/dashboard/adjustments"
          editLink={`/dashboard/adjustments/${id}/edit`}
          liveLink="#"
        />
        <Alert severity="warning">Adjustment not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <AdjustmentDetailsToolbar
        backLink="/dashboard/adjustments"
        editLink={`/dashboard/adjustments/${id}/edit`}
        liveLink="#"
      />

      <Card sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{adjustment.title}</Typography>
            {adjustment.category && (
              <Chip label={adjustment.category} color="primary" variant="soft" />
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {adjustment.description || 'No description provided'}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}
