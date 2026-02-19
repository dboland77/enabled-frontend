'use client';
import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { useRouter } from 'next/navigation';
import { IDisabilityItem } from '@/types/disability';

import DisabilityItem from './disability-item';

type Props = {
  disabilities: IDisabilityItem[];
};

export default function DisabilityCards({ disabilities }: Props) {
  const router = useRouter();

  useEffect(() => {}, []);

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
    <>
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

      {disabilities.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}
