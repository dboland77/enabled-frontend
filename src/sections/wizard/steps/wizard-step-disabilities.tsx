'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CardContent from '@mui/material/CardContent';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
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
  const [page, setPage] = useState(1);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const itemsPerPage = 10;

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
      <Card variant="outlined" sx={{ bgcolor: 'background.neutral' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:filter-variant" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2">Filter Disabilities</Typography>
            </Stack>
            
            <TextField
              fullWidth
              placeholder="Search disabilities..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <Iconify icon="mdi:close" width={18} />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Category
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="All Categories"
                  variant={categoryFilter === null ? 'filled' : 'outlined'}
                  color={categoryFilter === null ? 'primary' : 'default'}
                  onClick={() => {
                    setCategoryFilter(null);
                    setPage(1);
                  }}
                  sx={{ cursor: 'pointer' }}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    variant={categoryFilter === cat ? 'filled' : 'outlined'}
                    color={categoryFilter === cat ? 'primary' : 'default'}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setPage(1);
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <Alert severity="info" icon={<Iconify icon="mdi:information" />}>
          {selectedIds.length} {selectedIds.length === 1 ? 'disability' : 'disabilities'} selected
        </Alert>
      )}

      {/* Disability accordions grouped by category */}
      <Stack spacing={2}>
        {Object.entries(groupedDisabilities)
          .slice((page - 1) * itemsPerPage, page * itemsPerPage)
          .map(([category, items]) => {
          const categorySelectedCount = items.filter((d) => selectedIds.includes(d.id)).length;
          const allSelected = categorySelectedCount === items.length;
          const someSelected = categorySelectedCount > 0 && !allSelected;
          const isExpanded = expandedCategory === category;

          return (
            <Accordion
              key={category}
              expanded={isExpanded}
              onChange={(_, expanded) => setExpandedCategory(expanded ? category : null)}
              sx={{
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                '&.Mui-expanded': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                sx={{
                  minHeight: 64,
                  '&.Mui-expanded': {
                    minHeight: 64,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: '100%', pr: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <Iconify icon="mdi:folder-heart" width={22} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categorySelectedCount > 0 && `${categorySelectedCount} of `}
                        {items.length} {items.length === 1 ? 'disability' : 'disabilities'}
                      </Typography>
                    </Box>
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectAll(category, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={
                      <Typography variant="caption" color="text.secondary">
                        Select all
                      </Typography>
                    }
                    sx={{ mr: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
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
                          <Box sx={{ flex: 1 }}>
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
              </AccordionDetails>
            </Accordion>
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

      {/* Pagination */}
      {Object.keys(groupedDisabilities).length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(Object.keys(groupedDisabilities).length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Stack>
  );
}
