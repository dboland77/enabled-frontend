import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { IAdjustmentItem } from 'src/frontend/types/adjustment';

type Props = {
  selected: boolean;
  row: IAdjustmentItem;
  onSelectRow: VoidFunction;
};

export default function AdjustmentTableRow({ row, selected, onSelectRow }: Props) {
  const { adjustment_title, adjustment_detail, adjustment_type } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          primary={adjustment_title}
          secondary={adjustment_detail}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{workfunction}</TableCell> */}
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{location}</TableCell> */}
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{disability}</TableCell> */}
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell> */}
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{benefit}</TableCell> */}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{adjustment_type}</TableCell>
    </TableRow>
  );
}
