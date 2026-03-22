import Box from '@mui/material/Box';

import { IDisabilityItem } from '@/types/disability';

import DisabilityItem from './disability-item';

type Props = {
  disabilities: IDisabilityItem[];
};

export default function DisabilityList({ disabilities }: Props) {
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
        <DisabilityItem key={disability.id} disability={disability} />
      ))}
    </Box>
  );
}
