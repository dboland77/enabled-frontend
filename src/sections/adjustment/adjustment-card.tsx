import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Image from '@/components/image';
import { AvatarShape } from '@/assets/illustrations';
import { IAdjustmentCard } from '@/types/adjustment';

type Props = {
  adjustment: IAdjustmentCard;
};

export default function AdjustmentCard({ adjustment }: Props) {
  const theme = useTheme();

  const { title, category, coverUrl, thumbnailUrl } = adjustment;

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
          alt={title}
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

      <Typography variant="subtitle1" sx={{ mt: 7, mb: 0.5 }}>
        {title}
      </Typography>

      <Chip label={category} size="small" variant="soft" color="primary" sx={{ mb: 1 }} />

      <Divider sx={{ borderStyle: 'dashed' }} />
    </Card>
  );
}
