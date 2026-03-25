'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';

import { IDisabilityItem } from '@/types/disability';

import DisabilityItem from './disability-item';

type Props = {
  disabilities: IDisabilityItem[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function DisabilityList({ disabilities }: Props) {
  const router = useRouter();

  const handleView = useCallback(
    (id: string) => {
      router.push('/dashboard/disability/details');
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push('/dashboard/disability/edit');
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    console.info('DELETE', id);
  }, []);

  return (
    <Box
      gap={3}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      }}
    >
      {disabilities.map((disability) => (
        <DisabilityItem
          key={disability.id}
          disability={disability}
          onView={() => handleView(disability.id)}
          onEdit={() => handleEdit(disability.id)}
          onDelete={() => handleDelete(disability.id)}
        />
      ))}
    </Box>
  );
}
