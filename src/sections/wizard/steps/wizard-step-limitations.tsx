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
import { ILimitationItem, LIMITATION_CATEGORIES } from '@/types/wizard';

// ----------------------------------------------------------------------

type Props = {
  limitations: ILimitationItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
  error?: string | null;
};

export default function WizardStepLimitations({
  limitations,
  selectedIds,
  onSelectionChange,
  loading,
  error,
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Group limitations by category
  const groupedLimitations = useMemo(() => {
    const filtered = limitations.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || l.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.reduce(
      (acc, limitation) => {
        const category = limitation.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(limitation);
        return acc;
      },
      {} as Record<string, ILimitationItem[]>
    );
  }, [limitations, searchQuery, categoryFilter]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const cats = limitations.map((l) => l.category);
    return [...new Set(cats)].sort();
  }, [limitations]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const categoryIds = groupedLimitations[category]?.map((l) => l.id) || [];
    if (checked) {
      const newSelection = [...new Set([...selectedIds, ...categoryIds])];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedIds.filter((id) => !categoryIds.includes(id));
      onSelectionChange(newSelection);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      Visual: 'mdi:eye',
      Hearing: 'mdi:ear-hearing',
      Mobility: 'mdi:wheelchair-accessibility',
      Dexterity: 'mdi:hand-back-left',
      Cognitive: 'mdi:brain',
      Communication: 'mdi:message-text',
      'Energy/Fatigue': 'mdi:battery-low',
      'Pain Management': 'mdi:medical-bag',
      'Mental Health': 'mdi:head-heart',
      Other: 'mdi:dots-horizontal-circle',
    };
    return iconMap[category] || 'mdi:circle';
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
          Identify Functional Limitations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select any functional limitations you experience that may affect your work. These help us
          provide more specific adjustment recommendations.
        </Typography>
      </Box>

      {/* Search and filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search limitations..."
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
          {availableCategories.map((cat) => (
            <Chip
              key={cat}
              icon={<Iconify icon={getCategoryIcon(cat)} width={16} />}
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
          {selectedIds.length} {selectedIds.length === 1 ? 'limitation' : 'limitations'} selected
        </Alert>
      )}

      {/* Limitation cards grouped by category */}
      <Stack spacing={3}>
        {Object.entries(groupedLimitations).map(([category, items]) => {
          const categorySelectedCount = items.filter((l) => selectedIds.includes(l.id)).length;
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
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <Iconify icon={getCategoryIcon(category)} width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {items.length} {items.length === 1 ? 'limitation' : 'limitations'}
                      </Typography>
                    </Box>
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

                <Stack spacing={1.5}>
                  {items.map((limitation) => {
                    const isSelected = selectedIds.includes(limitation.id);

                    return (
                      <Box
                        key={limitation.id}
                        onClick={() => handleToggle(limitation.id)}
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
                            handleToggle(limitation.id);
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
                              {limitation.name}
                            </Typography>
                            {limitation.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {limitation.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {Object.keys(groupedLimitations).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="eva:search-fill" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No limitations found matching your search
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
