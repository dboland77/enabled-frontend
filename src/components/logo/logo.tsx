import { forwardRef } from 'react';

import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const PRIMARY_LIGHT = theme.palette.primary.light;
    const PRIMARY_MAIN = theme.palette.primary.main;

    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          ...sx,
        }}
        {...other}
      >
        {/* Main logo */}
        <svg height="50" width="300" viewBox="0 0 250 50">
          <text x="0" y="40" fill={PRIMARY_LIGHT} fontSize="40" fontWeight="500" letterSpacing="-1">
            enable
          </text>
          <text x="180" y="40" fill={PRIMARY_MAIN} fontSize="40" fontWeight="600" letterSpacing="-1">
            D
          </text>
        </svg>

        {/* Beta badge */}
        <svg height="32" width="70" viewBox="0 0 70 32">
          <rect x="0" y="0" width="70" height="32" rx="4" fill={PRIMARY_MAIN} />
          <text x="35" y="22" fill="#ffffff" fontSize="12" fontWeight="600" textAnchor="middle">
            Beta
          </text>
        </svg>
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
