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

  const { id, title, description, category } = row;

  const handleRowClick = () => {
    router.push(`/dashboard/adjustments/${id}`);
  };

  // Truncate description to 100 characters
  const truncatedDescription =
    description && description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

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
        {category && (
          <Chip label={category} size="small" variant="soft" color="primary" />
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
          {truncatedDescription}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
