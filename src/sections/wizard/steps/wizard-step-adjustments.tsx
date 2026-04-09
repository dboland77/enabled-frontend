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
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
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
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter and group recommendations by category
  const groupedRecommendations = useMemo(() => {
    const filtered = recommendations.filter((r) => {
      const matchesSelected = !showOnlySelected || selectedIds.includes(r.id);
      return matchesSelected;
    });

    return filtered.reduce(
      (acc, adjustment) => {
        const category = adjustment.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(adjustment);
        return acc;
      },
      {} as Record<string, IRecommendedAdjustment[]>
    );
  }, [recommendations, showOnlySelected, selectedIds]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectRecommended = () => {
    // Select all adjustments with relevance score >= 70
    const recommendedIds = recommendations.filter((r) => r.relevance_score >= 70).map((r) => r.id);
    const newSelection = [...new Set([...selectedIds, ...recommendedIds])];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = Object.values(groupedRecommendations).flat().map((r) => r.id);
    const newSelection = [...new Set([...selectedIds, ...allIds])];
    onSelectionChange(newSelection);
  };

  const handleSelectAllInCategory = (category: string, checked: boolean) => {
    const categoryIds = groupedRecommendations[category]?.map((r) => r.id) || [];
    if (checked) {
      const newSelection = [...new Set([...selectedIds, ...categoryIds])];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedIds.filter((id) => !categoryIds.includes(id));
      onSelectionChange(newSelection);
    }
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
          Please go back and select at least one disability or challenge to receive personalised
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

      {/* Quick actions */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="soft"
          color="success"
          startIcon={<Iconify icon="mdi:star" />}
          onClick={handleSelectRecommended}
        >
          Select Highly Recommended
        </Button>
        <Button
          variant="soft"
          color="primary"
          startIcon={<Iconify icon="mdi:check-all" />}
          onClick={handleSelectAll}
        >
          Select All Visible
        </Button>
        <Button
          variant="soft"
          color="error"
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
          onClick={() => {
            setShowOnlySelected(!showOnlySelected);
            setPage(1);
          }}
          icon={
            <Iconify icon={showOnlySelected ? 'mdi:filter' : 'mdi:filter-outline'} width={16} />
          }
          sx={{ cursor: 'pointer' }}
        />
      </Stack>

      {/* Adjustment accordions grouped by category */}
      <Stack spacing={2}>
        {Object.entries(groupedRecommendations)
          .slice((page - 1) * itemsPerPage, page * itemsPerPage)
          .map(([category, items]) => {
          const categorySelectedCount = items.filter((r) => selectedIds.includes(r.id)).length;
          const allSelected = categorySelectedCount === items.length;
          const someSelected = categorySelectedCount > 0 && !allSelected;
          const isExpanded = expandedCategory === category;
          const avgRelevance = Math.round(
            items.reduce((sum, item) => sum + item.relevance_score, 0) / items.length
          );

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
                      <Iconify icon="mdi:lightbulb-on" width={22} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categorySelectedCount > 0 && `${categorySelectedCount} of `}
                        {items.length} {items.length === 1 ? 'adjustment' : 'adjustments'} • Avg{' '}
                        {avgRelevance}% relevance
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
                          handleSelectAllInCategory(category, e.target.checked);
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
                <Stack spacing={2}>
                  {items.map((adjustment) => {
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
                            <Checkbox
                              checked={isSelected}
                              size="small"
                              sx={{ p: 0, mt: 0.5 }}
                              tabIndex={-1}
                            />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                alignItems={{ sm: 'center' }}
                                justifyContent="space-between"
                                spacing={1}
                                sx={{ mb: 1 }}
                              >
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {adjustment.title}
                                </Typography>

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
                                        backgroundColor: alpha(
                                          getRelevanceColor(adjustment.relevance_score),
                                          0.2
                                        ),
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: getRelevanceColor(
                                            adjustment.relevance_score
                                          ),
                                          borderRadius: 3,
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                      sx={{
                                        color: getRelevanceColor(adjustment.relevance_score),
                                        minWidth: 32,
                                      }}
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
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      {/* Pagination */}
      {Object.keys(groupedRecommendations).length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(Object.keys(groupedRecommendations).length / itemsPerPage)}
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
