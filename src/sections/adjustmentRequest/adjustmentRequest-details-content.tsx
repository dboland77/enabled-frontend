import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import Iconify from '@/components/iconify';
import { fDate } from '@/utils/format-time';
import Markdown from '@/components/markdown';

import { IAdjustmentRequestItem } from '@/types/adjustmentRequest';

type Props = {
  adjustmentRequest: IAdjustmentRequestItem;
};

export default function AdjustmentRequestDetailsContent({ adjustmentRequest }: Props) {
  const { title, detail, benefit, createdAt, workfunction, requiredDate, adjustmentType } =
    adjustmentRequest;

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4">{title}</Typography>

      <Markdown />

      <Stack spacing={2}>
        <Typography variant="h6">Benefits</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip key={benefit} label={benefit} variant="soft" />
        </Stack>
      </Stack>
    </Stack>
  );

  const renderOverview = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      {[
        {
          label: 'Date Created',
          value: fDate(createdAt),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        {
          label: 'Required date',
          value: fDate(requiredDate),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        {
          label: 'Adjustment type',
          value: adjustmentType,
          icon: <Iconify icon="solar:clock-circle-bold" />,
        },

        {
          label: 'Work Function',
          value: workfunction,
          icon: <Iconify icon="carbon:skill-level-basic" />,
        },
      ].map((item) => (
        <Stack key={item.label} spacing={1.5} direction="row">
          {item.icon}
          <ListItemText
            primary={item.label}
            secondary={item.value}
            primaryTypographyProps={{
              typography: 'body2',
              color: 'text.secondary',
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: 'subtitle2',
              color: 'text.primary',
              component: 'span',
            }}
          />
        </Stack>
      ))}
    </Stack>
  );

  const renderCompany = (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={2}
      direction="row"
      sx={{ p: 3, borderRadius: 2, mt: 3 }}
    >
      <Avatar alt="NAME" variant="rounded" sx={{ width: 64, height: 64 }} />
    </Stack>
  );

  return (
    <Grid container spacing={3}>
      <Grid>{renderContent}</Grid>

      <Grid>
        {renderOverview}

        {renderCompany}
      </Grid>
    </Grid>
  );
}
