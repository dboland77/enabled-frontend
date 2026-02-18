import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'src/frontend/components/iconify';
import { RouterLink } from 'src/frontend/routes/components';
import { usePopover } from 'src/frontend/components/custom-popover';

type Props = StackProps & {
  backLink: string;
  editLink: string;
  liveLink: string;
};

export default function AdjustmentRequestDetailsToolbar({
  backLink,
  editLink,
  liveLink,
  sx,
  ...other
}: Props) {
  const popover = usePopover();

  return (
    <Stack
      spacing={1.5}
      direction="row"
      sx={{
        mb: { xs: 3, md: 5 },
        ...sx,
      }}
      {...other}
    >
      <Button
        component={RouterLink}
        href={backLink}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Back
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="Edit">
        <IconButton component={RouterLink} href={editLink}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </Tooltip>

      <LoadingButton
        color="inherit"
        variant="contained"
        loadingIndicator="Loading…"
        endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
        onClick={popover.onOpen}
        sx={{ textTransform: 'capitalize' }}
      />
    </Stack>
  );
}
