import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/frontend/routes/paths';
import { useRouter } from 'src/frontend/routes/hooks';
import { getDisabilities } from 'src/frontend/slices';
import { IDisabilityItem } from 'src/frontend/types/disability';
import { useAppDispatch, useAppSelector } from 'src/frontend/hooks';

import DisabilityItem from './disability-item';

type Props = {
  disabilities: IDisabilityItem[];
};

export default function DisabilityCards({ disabilities }: Props) {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const nhsData = useAppSelector((state) => state.nhsData);

  useEffect(() => {
    dispatch(getDisabilities());
  }, [dispatch]);

  const handleView = useCallback(
    (id: string) => {
      router.push(paths.dashboard.disability.details);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.disability.edit);
    },
    [router]
  );

  const handleDelete = useCallback(
    (id: string) => {
      console.log(nhsData);
      console.info('DELETE', id);
    },
    [nhsData]
  );

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
