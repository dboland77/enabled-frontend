import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import Image from '@/components/image';
import { AvatarShape } from '@/assets/illustrations';
import { IDisabilityItem } from '@/types/disability';

type Props = {
  disability: IDisabilityItem;
};

export default function DisabilityItem({ disability }: Props) {
  const theme = useTheme();

  const { disability_name, disability_nhs_slug, category } = disability;

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
          alt={disability_name}
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
        >
          {disability_name.charAt(0).toUpperCase()}
        </Avatar>

        <Image
          src=""
          alt={disability_name}
          ratio="16/9"
          overlay={alpha(theme.palette.grey[900], 0.48)}
        />
      </Box>

      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={disability_name}
        secondary={category}
        primaryTypographyProps={{ typography: 'subtitle1' }}
        secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
      />

      {disability_nhs_slug && (
        <Link
          href={`https://www.nhs.uk/conditions/${disability_nhs_slug}`}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1 }}
        >
          NHS: {disability_nhs_slug}
        </Link>
      )}

      <Divider sx={{ borderStyle: 'dashed' }} />
    </Card>
  );
}
