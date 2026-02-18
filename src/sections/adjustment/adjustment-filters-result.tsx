import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'src/frontend/components/iconify';
import { IAdjustmentFilters, IAdjustmentFilterValue } from 'src/frontend/types/adjustment';

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

  const handleRemoveLocations = (inputValue: string) => {
    const newValue = filters.locations.filter((item: any) => item !== inputValue);
    onFilters('locations', newValue);
  };

  const handleRemoveBenefits = (inputValue: string) => {
    const newValue = filters.benefits.filter((item: any) => item !== inputValue);
    onFilters('benefits', newValue);
  };

  const handleRemoveDisabilities = (inputValue: string) => {
    const newValue = filters.disabilities.filter((item: any) => item !== inputValue);
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
        {!!filters.adjustmentType.length && (
          <Block label="Adjustment Types:">
            {filters.adjustmentType.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveAdjustmentTypes(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.disabilities.length && (
          <Block label="Disabilities:">
            {filters.disabilities.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveDisabilities(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.locations.length && (
          <Block label="Locations:">
            {filters.locations.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveLocations(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.benefits.length && (
          <Block label="Benefits:">
            {filters.benefits.map((item: any) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveBenefits(item)}
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
