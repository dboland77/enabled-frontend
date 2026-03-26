import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { AvatarShape } from '@/assets/illustrations';
import { IAdjustmentCard } from '@/types/adjustment';

type Props = {
  adjustment: IAdjustmentCard;
};

export default function AdjustmentCard({ adjustment }: Props) {
  const theme = useTheme();

  const { title, category } = adjustment;

  return (
    <Card
      sx={{
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Top section - primary color gradient */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
            color: 'background.paper',
          }}
        />

        <Avatar
          alt={title}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            left: 0,
            right: 0,
            bottom: -32,
            mx: 'auto',
            position: 'absolute',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 600,
          }}
        >
          {title.charAt(0).toUpperCase()}
        </Avatar>

        <Box
          sx={{
            height: 0,
            paddingTop: '56.25%',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          }}
        />
      </Box>

      {/* Bottom section - content on clean background */}
      <Box
        sx={{
          textAlign: 'center',
          pt: 5,
          pb: 2.5,
          px: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>

        <Chip 
          label={category} 
          size="small" 
          variant="soft" 
          color="primary" 
        />
      </Box>
    </Card>
  );
}
