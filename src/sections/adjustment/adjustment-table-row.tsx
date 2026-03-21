import { useRouter } from 'next/navigation';

import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { IAdjustmentItem } from '@/types/adjustment';

type Props = {
  selected: boolean;
  row: IAdjustmentItem;
  onSelectRow: VoidFunction;
};

export default function AdjustmentTableRow({ row, selected, onSelectRow }: Props) {
  const router = useRouter();

  const { id, title, detail, type } = row;

  const handleRowClick = () => {
    router.push(`/dashboard/adjustments/${id}`);
  };

  // Truncate detail to 100 characters
  const truncatedDetail =
    detail && detail.length > 100
      ? `${detail.substring(0, 100)}...`
      : detail;

  return (
    <TableRow
      hover
      selected={selected}
      onClick={handleRowClick}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRow();
          }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {type && (
          <Chip label={type} size="small" variant="soft" color="primary" />
        )}
      </TableCell>

      <TableCell>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {truncatedDetail}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
