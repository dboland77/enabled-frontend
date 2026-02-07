import { memo } from 'react';

import Stack from '@mui/material/Stack';

import NavList from '@/components/nav-basic/mobile/nav-list';
import { NavProps } from '@/components/nav-basic/types';

// ----------------------------------------------------------------------

function NavBasicMobile({ data, slotProps, ...other }: NavProps) {
  return (
    <Stack component="nav" id="nav-basic-mobile" {...other}>
      {data.map((list) => (
        <NavList key={list.title} data={list} depth={1} slotProps={slotProps} />
      ))}
    </Stack>
  );
}

export default memo(NavBasicMobile);
