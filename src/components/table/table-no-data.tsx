import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';

import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
};

export default function TableNoData({ notFound, sx }: Props) {
  if (!notFound) return null;

  return (
    <TableRow>
      <TableCell colSpan={12}>
        <EmptyContent
          filled
          title="No Data"
          sx={{
            py: 5,
            ...sx,
          }}
        />
      </TableCell>
    </TableRow>
  );
}
