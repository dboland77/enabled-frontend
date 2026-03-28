'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IRecommendedAdjustment } from '@/types/wizard';

// ----------------------------------------------------------------------

type Props = {
  recommendations: IRecommendedAdjustment[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
  error?: string | null;
};

export default function WizardStepAdjustments({
  recommendations,
  selectedIds,
  onSelectionChange,
  loading,
  error,
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      const matchesSelected = !showOnlySelected || selectedIds.includes(r.id);
      return matchesSearch && matchesCategory && matchesSelected;
    });
  }, [recommendations, searchQuery, categoryFilter, showOnlySelected, selectedIds]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = recommendations.map((r) => r.category);
    return [...new Set(cats)].sort();
  }, [recommendations]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectRecommended = () => {
    // Select all adjustments with relevance score >= 70
    const recommendedIds = recommendations
      .filter((r) => r.relevance_score >= 70)
      .map((r) => r.id);
    const newSelection = [...new Set([...selectedIds, ...recommendedIds])];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredRecommendations.map((r) => r.id);
    const newSelection = [...new Set([...selectedIds, ...allIds])];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Get relevance color
  const getRelevanceColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.info.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.grey[500];
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'May Help';
    return 'Consider';
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

  if (recommendations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Iconify icon="mdi:lightbulb-off" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Recommendations Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Please go back and select at least one disability or limitation to receive personalized
          adjustment recommendations.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Recommended Adjustments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Based on your selections, we recommend the following workplace adjustments. Select the
          ones you would like to request.
        </Typography>
      </Box>

      {/* Summary stats */}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Chip
          icon={<Iconify icon="mdi:lightbulb-on" width={18} />}
          label={`${recommendations.length} recommendations`}
          color="primary"
          variant="soft"
        />
        <Chip
          icon={<Iconify icon="mdi:check-circle" width={18} />}
          label={`${selectedIds.length} selected`}
          color={selectedIds.length > 0 ? 'success' : 'default'}
          variant="soft"
        />
        <Chip
          icon={<Iconify icon="mdi:star" width={18} />}
          label={`${recommendations.filter((r) => r.relevance_score >= 70).length} highly recommended`}
          color="info"
          variant="soft"
        />
      </Stack>

      {/* Search and filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search adjustments..."
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

      {/* Quick actions */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:star" />}
          onClick={handleSelectRecommended}
        >
          Select Highly Recommended
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:check-all" />}
          onClick={handleSelectAll}
        >
          Select All Visible
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="mdi:close-circle" />}
          onClick={handleClearAll}
          disabled={selectedIds.length === 0}
        >
          Clear Selection
        </Button>
        <Chip
          label="Show Selected Only"
          variant={showOnlySelected ? 'filled' : 'outlined'}
          color={showOnlySelected ? 'primary' : 'default'}
          onClick={() => setShowOnlySelected(!showOnlySelected)}
          icon={<Iconify icon={showOnlySelected ? 'mdi:filter' : 'mdi:filter-outline'} width={16} />}
          sx={{ cursor: 'pointer' }}
        />
      </Stack>

      {/* Adjustment cards */}
      <Stack spacing={2}>
        {filteredRecommendations.map((adjustment) => {
          const isSelected = selectedIds.includes(adjustment.id);

          return (
            <Card
              key={adjustment.id}
              variant="outlined"
              onClick={() => handleToggle(adjustment.id)}
              sx={{
                cursor: 'pointer',
                border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, 0.04)
                  : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: theme.shadows[2],
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
              tabIndex={0}
              role="checkbox"
              aria-checked={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(adjustment.id);
                }
              }}
            >
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Checkbox checked={isSelected} size="small" sx={{ p: 0, mt: 0.5 }} tabIndex={-1} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {adjustment.title}
                        </Typography>
                        <Chip label={adjustment.category} size="small" variant="soft" />
                      </Stack>

                      <Tooltip title={`Relevance: ${adjustment.relevance_score}%`}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ minWidth: 160 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={adjustment.relevance_score}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(getRelevanceColor(adjustment.relevance_score), 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getRelevanceColor(adjustment.relevance_score),
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ color: getRelevanceColor(adjustment.relevance_score), minWidth: 32 }}
                          >
                            {adjustment.relevance_score}%
                          </Typography>
                        </Stack>
                      </Tooltip>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {adjustment.description}
                    </Typography>

                    {/* Source tags */}
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>
                        Recommended for:
                      </Typography>
                      {adjustment.sources.slice(0, 3).map((source, idx) => (
                        <Chip
                          key={`${source.type}-${source.name}-${idx}`}
                          label={source.name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                      {adjustment.sources.length > 3 && (
                        <Tooltip
                          title={adjustment.sources
                            .slice(3)
                            .map((s) => s.name)
                            .join(', ')}
                        >
                          <Chip
                            label={`+${adjustment.sources.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {filteredRecommendations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="eva:search-fill" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No adjustments found matching your filters
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
