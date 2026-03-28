import SimpleBar from 'simplebar-react';

import { alpha, styled } from '@mui/system';

// ----------------------------------------------------------------------

export const StyledRootScrollbar = styled('div')(() => ({
  flexShrink: 0,
  overflow: 'hidden',
}));

export const StyledScrollbar = styled(SimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.grey[600], 0.48),
    },
    '&.simplebar-visible:before': {
      opacity: 1,
    },
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
}));
