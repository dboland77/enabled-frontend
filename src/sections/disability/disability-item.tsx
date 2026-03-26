import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { AvatarShape } from '@/assets/illustrations';
import { IDisabilityItem } from '@/types/disability';

const NHS_LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NHS%2010mm%20-%20RGB%20Blue%20on%20white-6UFE7zxSQtJnlvAPsWWgeiMzKpO2t6.jpg';

type Props = {
  disability: IDisabilityItem;
};

export default function DisabilityItem({ disability }: Props) {
  const { disability_name, disability_nhs_slug, category } = disability;

  const nhsUrl = disability_nhs_slug 
    ? `https://www.nhs.uk/conditions/${disability_nhs_slug}` 
    : null;

  const handleClick = () => {
    if (nhsUrl) {
      window.open(nhsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardActionArea 
        onClick={handleClick} 
        disabled={!nhsUrl}
        sx={{ textAlign: 'center' }}
      >
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

          <Box
            sx={{
              height: 0,
              paddingTop: '56.25%',
              position: 'relative',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={NHS_LOGO_URL}
              alt="NHS"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '40%',
                maxHeight: '30%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 7, mb: 0.5 }}>
          {disability_name}
        </Typography>

        <Chip label={category} size="small" variant="soft" color="primary" sx={{ mb: 1 }} />

        {disability_nhs_slug && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {disability_nhs_slug}
          </Typography>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />
      </CardActionArea>
    </Card>
  );
}
