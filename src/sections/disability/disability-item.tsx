import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { AvatarShape } from '@/assets/illustrations';
import { IDisabilityItem } from '@/types/disability';

const NHS_LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NHS%2010mm%20-%20RGB%20Blue%20on%20white-6UFE7zxSQtJnlvAPsWWgeiMzKpO2t6.jpg';

type Props = {
  disability: IDisabilityItem;
};

export default function DisabilityItem({ disability }: Props) {
  const theme = useTheme();

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
    <Card
      sx={{
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <CardActionArea 
        onClick={handleClick} 
        disabled={!nhsUrl}
      >
        {/* Top section - NHS logo with primary color tint */}
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
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
            }}
          >
            {disability_name.charAt(0).toUpperCase()}
          </Avatar>

          <Box
            sx={{
              height: 0,
              paddingTop: '56.25%',
              position: 'relative',
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
            {disability_name}
          </Typography>

          <Chip 
            label={category} 
            size="small" 
            variant="soft" 
            color="primary" 
            sx={{ mb: 1.5 }} 
          />

          {disability_nhs_slug && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                borderRadius: 0.75,
                py: 0.5,
                px: 1,
                mx: 'auto',
                width: 'fit-content',
              }}
            >
              {disability_nhs_slug}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}
