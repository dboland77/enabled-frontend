import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/frontend/routes/paths';
import { useRouter } from 'src/frontend/routes/hooks';
import { IAdjustmentRequestItem } from 'src/frontend/types/adjustmentRequest';

import AdjustmentRequestItem from './adjustmentRequest-item';

type Props = {
  adjustmentRequests: IAdjustmentRequestItem[];
};

export default function AdjustmentRequestList({ adjustmentRequests }: Props) {
  const router = useRouter();

  const handleView = useCallback(
    (id: string) => {
      router.push(paths.dashboard.adjustmentRequests.details);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.adjustmentRequests.edit(id));
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    console.log('DELETE', id);
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
        {adjustmentRequests.map((request) => (
          <AdjustmentRequestItem
            key={request.id}
            adjustmentRequest={request}
            onView={() => handleView(request.id)}
            onEdit={() => handleEdit(request.id)}
            onDelete={() => handleDelete(request.id)}
          />
        ))}
      </Box>

      {adjustmentRequests.length > 8 && (
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
