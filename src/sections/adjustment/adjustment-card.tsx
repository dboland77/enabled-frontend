import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import Image from 'src/frontend/components/image';
import { AvatarShape } from 'src//assets/illustrations';
import { IAdjustmentCard } from 'src/frontend/types/adjustment';

type Props = {
  adjustment: IAdjustmentCard;
};

export default function AdjustmentCard({ adjustment }: Props) {
  const theme = useTheme();

  const { adjustment_title, adjustment_type, coverUrl, thumbnailUrl } = adjustment;

  return (
    <Card sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={adjustment_title}
          src={thumbnailUrl}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            left: 0,
            right: 0,
            bottom: -32,
            mx: 'auto',
            position: 'absolute',
          }}
        />

        <Image
          src={coverUrl}
          alt={coverUrl}
          ratio="16/9"
          overlay={alpha(theme.palette.grey[900], 0.48)}
        />
      </Box>

      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={adjustment_title}
        secondary={adjustment_type}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />
    </Card>
  );
}
