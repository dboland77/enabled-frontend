import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from '@/components/iconify';
import { IAdjustmentFilters, IAdjustmentFilterValue } from '@/types/adjustment';

type Props = StackProps & {
  filters: IAdjustmentFilters;
  onFilters: (name: string, value: IAdjustmentFilterValue) => void;
  canReset: boolean;
  onResetFilters: VoidFunction;
  results: number;
};

export default function AdjustmentFiltersResult({
  filters,
  onFilters,
  canReset,
  onResetFilters,
  results,
  ...other
}: Props) {
  const handleRemoveAdjustmentTypes = (inputValue: string) => {
    onFilters('adjustmentType', inputValue);
  };

  const handleRemoveAdjustments = (inputValue: string) => {
    const newValue = filters.title.filter((item: any) => item !== inputValue);
    onFilters('locations', newValue);
  };

  const handleRemoveCategories = (inputValue: string) => {
    const newValue = filters.category.filter((item: any) => item !== inputValue);
    onFilters('disabilities', newValue);
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.type.length && (
          <Block label="Adjustment Types:">
            {filters.type.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveAdjustmentTypes(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.category.length && (
          <Block label="Categories:">
            {filters.category.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveCategories(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.title.length && (
          <Block label="Titles:">
            {filters.title.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveAdjustments(item)}
              />
            ))}
          </Block>
        )}

        {canReset && (
          <Button
            color="error"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
