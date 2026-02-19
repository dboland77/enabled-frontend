'use client';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { useRouter } from 'next/navigation';
import { IDisabilityItem } from '@/types/disability';
import { usePagination } from '@/hooks/use-pagination';

import DisabilityItem from './disability-item';

type Props = {
  disabilities: IDisabilityItem[];
};

// TODO - change to state

const disabilities = [
  {
    id: '123',
    name: 'dfff',
    slug: '/sdfsdf',
  },
];

const disabilitiesLoading = false;

export default function DisabilityList({ disabilities }: Props) {
  const router = useRouter();

  // Create pagination.
  const { data, totalPages, setPage } = usePagination(disabilities, 6);

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

  const handlePageChange = (e: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

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
        {data?.map((disability) => (
          <DisabilityItem
            key={disability.id}
            disability={disability}
            onView={() => handleView(disability.id)}
            onEdit={() => handleEdit(disability.id)}
            onDelete={() => handleDelete(disability.id)}
          />
        ))}
      </Box>

      <Pagination count={totalPages} onChange={handlePageChange} color="primary" />
    </>
  );
}
