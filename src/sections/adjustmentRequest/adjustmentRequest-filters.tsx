import { useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

import Iconify from '@/components/iconify';
import Scrollbar from '@/components/scrollbar';
import {
  IAdjustmentRequestFilters,
  IAdjustmentRequestFilterValue,
} from '@/types/adjustmentRequest';

type Props = {
  open: boolean;
  onOpen: VoidFunction;
  onClose: VoidFunction;
  filters: IAdjustmentRequestFilters;
  onFilters: (name: string, value: IAdjustmentRequestFilterValue) => void;
  canReset: boolean;
  onResetFilters: VoidFunction;
  benefitOptions: string[];
  adjustmentTypeOptions: string[];
  locationOptions: string[];
};

export default function AdjustmentRequestFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  locationOptions,
  benefitOptions,
  adjustmentTypeOptions,
}: Props) {
  const handleFilterAdjustmentTypes = useCallback(
    (newValue: string) => {
      const checked = filters.adjustmentTypes.includes(newValue)
        ? filters.adjustmentTypes.filter((value: any) => value !== newValue)
        : [...filters.adjustmentTypes, newValue];
      onFilters('adjustmentTypes', checked);
    },
    [filters.adjustmentTypes, onFilters]
  );

  const handleFilterLocations = useCallback(
    (newValue: string[]) => {
      onFilters('locations', newValue);
    },
    [onFilters]
  );

  const handleFilterBenefits = useCallback(
    (newValue: string) => {
      const checked = filters.benefits.includes(newValue)
        ? filters.benefits.filter((value: any) => value !== newValue)
        : [...filters.benefits, newValue];
      onFilters('benefits', checked);
    },
    [filters.benefits, onFilters]
  );

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Filters
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={onResetFilters}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderAdjustmentTypes = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Adjustment Types
      </Typography>
      {adjustmentTypeOptions.map((option: any) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={filters.adjustmentTypes.includes(option)}
              onClick={() => handleFilterAdjustmentTypes(option)}
            />
          }
          label={option}
        />
      ))}
    </Stack>
  );

  const renderWorkFunctions = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Benefits
      </Typography>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={['m', 'n']}
        getOptionLabel={(option) => option}
        value={filters.workfunctions}
        onChange={(event, newValue) => handleFilterBenefits('b')}
        renderInput={(params) => <TextField placeholder="Select Benefits" {...params} />}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );

  const renderLocations = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Locations
      </Typography>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={locationOptions.map((option) => option)}
        getOptionLabel={(option) => option}
        value={filters.locations}
        onChange={(event, newValue) => handleFilterLocations(newValue)}
        renderInput={(params) => <TextField placeholder="Select Locations" {...params} />}
        renderOption={(props, option) => {
          locationOptions.filter((country) => country === option);

          return (
            <li {...props} key={1}>
              hello
            </li>
          );
        }}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </Stack>
  );

  const renderBenefits = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Benefits
      </Typography>
      {benefitOptions.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={filters.benefits.includes(option)}
              onClick={() => handleFilterBenefits(option)}
            />
          }
          label={option}
        />
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderAdjustmentTypes}

            {renderBenefits}

            {renderLocations}
            {renderWorkFunctions}

            {renderBenefits}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
