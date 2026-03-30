import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Theme, SxProps } from '@mui/material/styles';
import Badge, { badgeClasses } from '@mui/material/Badge';

import Iconify from '@/components/iconify';
import { useSettingsContext } from '@/components/settings';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export default function SettingsButton({ sx }: Props) {
  const settings = useSettingsContext();

  return (
    <Tooltip title="Accessibility Settings">
      <Badge
        color="error"
        variant="dot"
        invisible={!settings.canReset}
        sx={{
          [`& .${badgeClasses.badge}`]: {
            top: 8,
            right: 8,
          },
          ...sx,
        }}
      >
        <IconButton
          aria-label="Accessibility settings"
          onClick={settings.onToggle}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:accessibility-bold" width={24} />
        </IconButton>
      </Badge>
    </Tooltip>
  );
}
