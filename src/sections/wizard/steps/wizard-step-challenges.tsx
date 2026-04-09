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
import { IChallengeItem, CHALLENGE_CATEGORIES } from '@/types/wizard';

// ----------------------------------------------------------------------

type Props = {
  challenges: IChallengeItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
  error?: string | null;
};

export default function WizardStepChallenges({
  challenges,
  selectedIds,
  onSelectionChange,
  loading,
  error,
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Group challenges by category
  const groupedChallenges = useMemo(() => {
    const filtered = challenges.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || l.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.reduce(
      (acc, challenge) => {
        const category = challenge.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(challenge);
        return acc;
      },
      {} as Record<string, IChallengeItem[]>
    );
  }, [challenges, searchQuery, categoryFilter]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const cats = challenges.map((l) => l.category);
    return [...new Set(cats)].sort();
  }, [challenges]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const categoryIds = groupedChallenges[category]?.map((l) => l.id) || [];
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
          Identify Functional Challenges
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select any functional challenges you experience that may affect your work. These help us
          provide more specific adjustment recommendations.
        </Typography>
      </Box>

      {/* Search and filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search challenges..."
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
          {selectedIds.length} {selectedIds.length === 1 ? 'challenge' : 'challenges'} selected
        </Alert>
      )}

      {/* Challenge cards grouped by category */}
      <Stack spacing={3}>
        {Object.entries(groupedChallenges).map(([category, items]) => {
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
                        {items.length} {items.length === 1 ? 'challenge' : 'challenges'}
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
                  {items.map((challenge) => {
                    const isSelected = selectedIds.includes(challenge.id);

                    return (
                      <Box
                        key={challenge.id}
                        onClick={() => handleToggle(challenge.id)}
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
                            handleToggle(challenge.id);
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
                              {challenge.name}
                            </Typography>
                            {challenge.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {challenge.description}
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

      {Object.keys(groupedChallenges).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="eva:search-fill" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No challenges found matching your search
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
