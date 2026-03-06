import Box from '@mui/material/Box';

import { IAdjustmentCard } from '@/types/adjustment';

import AdjustmentCard from './adjustment-card';

type Props = {
  adjustments: IAdjustmentCard[];
};

export default function AdjustmentCardList({ adjustments }: Props) {
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
      {adjustments.map((adjustment) => (
        <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
      ))}
    </Box>
  );
}
