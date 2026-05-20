import { memo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';

import Iconify from '@/components/iconify';
import NavList from '@/components/nav-section/vertical/nav-list';
import { NavProps, NavGroupProps } from '@/components/nav-section/types';

function NavSectionVertical({ data, slotProps, ...other }: NavProps) {
  const currentRole = slotProps?.currentRole || '';
  
  // Track which group is expanded (only one at a time)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(data[0]?.subheader || null);
  
  // Filter groups based on roles
  const filteredData = data.filter((group) => {
    if (!group.roles || group.roles.length === 0) return true;
    return group.roles.includes(currentRole);
  });

  const handleToggle = useCallback((subheader: string) => {
    setExpandedGroup((prev) => (prev === subheader ? null : subheader));
  }, []);

  return (
    <Stack component="nav" id="nav-section-vertical" {...other}>
      {filteredData.map((group, index) => (
        <>
          {index > 0 && (
            <Divider
              key={`divider-${index}`}
              sx={{ borderStyle: 'dashed', mx: 2, my: 1 }}
            />
          )}
          <Group
            key={group.subheader || index}
            subheader={group.subheader}
            items={group.items}
            slotProps={slotProps}
            isOpen={expandedGroup === group.subheader}
            onToggle={() => handleToggle(group.subheader || '')}
          />
        </>
      ))}
    </Stack>
  );
}

export default memo(NavSectionVertical);

interface GroupProps extends NavGroupProps {
  isOpen: boolean;
  onToggle: () => void;
}

function Group({ subheader, items, slotProps, isOpen, onToggle }: GroupProps) {
  const renderContent = items.map((list) => (
    <NavList key={list.title} data={list} depth={1} slotProps={slotProps} />
  ));

  return (
    <Stack sx={{ px: 2 }}>
      {subheader ? (
        <>
          <ListSubheader
            disableGutters
            disableSticky
            onClick={onToggle}
            sx={{
              fontSize: 12,
              cursor: 'pointer',
              typography: 'overline',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: isOpen ? 'text.primary' : 'text.secondary',
              fontWeight: 700,
              letterSpacing: 1.2,
              mb: `${slotProps?.gap || 4}px`,
              p: (theme) => theme.spacing(2.5, 1, 1.5, 1.5),
              transition: (theme) =>
                theme.transitions.create(['color'], {
                  duration: theme.transitions.duration.shortest,
                }),
              '&:hover': {
                color: 'text.primary',
              },
              ...slotProps?.subheader,
            }}
          >
            {subheader}
            <Iconify
              icon={isOpen ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
              width={16}
              sx={{
                color: 'inherit',
                transition: 'transform 0.2s',
              }}
            />
          </ListSubheader>

          <Collapse in={isOpen}>{renderContent}</Collapse>
        </>
      ) : (
        renderContent
      )}
    </Stack>
  );
}
