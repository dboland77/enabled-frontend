'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IDisabilityItem } from '@/types/disability';

// ----------------------------------------------------------------------

type Props = {
  disabilities: IDisabilityItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
  error?: string | null;
};

export default function WizardStepDisabilities({
  disabilities,
  selectedIds,
  onSelectionChange,
  loading,
  error,
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Group disabilities by category
  const groupedDisabilities = useMemo(() => {
    const filtered = disabilities.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.disability_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || d.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.reduce(
      (acc, disability) => {
        const category = disability.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(disability);
        return acc;
      },
      {} as Record<string, IDisabilityItem[]>
    );
  }, [disabilities, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = disabilities.map((d) => d.category);
    return [...new Set(cats)].sort();
  }, [disabilities]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const categoryIds = groupedDisabilities[category]?.map((d) => d.id) || [];
    if (checked) {
      const newSelection = [...new Set([...selectedIds, ...categoryIds])];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedIds.filter((id) => !categoryIds.includes(id));
      onSelectionChange(newSelection);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Select Your Disabilities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose any disabilities that apply to you. This helps us recommend appropriate workplace
          adjustments. You can skip this step if you prefer to select challenges directly.
        </Typography>
      </Box>

      {/* Search and filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search disabilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 320 } }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="All"
            variant={categoryFilter === null ? 'filled' : 'outlined'}
            color={categoryFilter === null ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(null)}
            sx={{ cursor: 'pointer' }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
              color={categoryFilter === cat ? 'primary' : 'default'}
              onClick={() => setCategoryFilter(cat)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <Alert severity="info" icon={<Iconify icon="mdi:information" />}>
          {selectedIds.length} {selectedIds.length === 1 ? 'disability' : 'disabilities'} selected
        </Alert>
      )}

      {/* Disability cards grouped by category */}
      <Stack spacing={3}>
        {Object.entries(groupedDisabilities).map(([category, items]) => {
          const categorySelectedCount = items.filter((d) => selectedIds.includes(d.id)).length;
          const allSelected = categorySelectedCount === items.length;
          const someSelected = categorySelectedCount > 0 && !allSelected;

          return (
            <Card key={category} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {category}
                    </Typography>
                    <Chip label={items.length} size="small" variant="soft" />
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(e) => handleSelectAll(category, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption" color="text.secondary">
                        Select all
                      </Typography>
                    }
                    sx={{ mr: 0 }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                  }}
                >
                  {items.map((disability) => {
                    const isSelected = selectedIds.includes(disability.id);

                    return (
                      <Box
                        key={disability.id}
                        onClick={() => handleToggle(disability.id)}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                          backgroundColor: isSelected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'background.paper',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2,
                          },
                        }}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggle(disability.id);
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            sx={{ p: 0, mt: 0.25 }}
                            tabIndex={-1}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {disability.disability_name}
                            </Typography>
                            {disability.disability_nhs_slug && (
                              <Typography variant="caption" color="text.secondary">
                                NHS: {disability.disability_nhs_slug}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {Object.keys(groupedDisabilities).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="eva:search-fill" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No disabilities found matching your search
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
