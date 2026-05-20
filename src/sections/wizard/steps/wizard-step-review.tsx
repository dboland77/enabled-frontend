'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import { IDisabilityItem } from '@/types/disability';
import { IChallengeItem, IRecommendedAdjustment } from '@/types/wizard';

// ----------------------------------------------------------------------

type Props = {
  selectedDisabilities: IDisabilityItem[];
  selectedChallenges: IChallengeItem[];
  selectedAdjustments: IRecommendedAdjustment[];
  additionalNotes: string;
  onNotesChange: (notes: string) => void;
  onNotesBlur?: () => void;
  onEditStep: (step: number) => void;
};

export default function WizardStepReview({
  selectedDisabilities,
  selectedChallenges,
  selectedAdjustments,
  additionalNotes,
  onNotesChange,
  onNotesBlur,
  onEditStep,
}: Props) {
  const theme = useTheme();

  const hasSelections =
    selectedDisabilities.length > 0 ||
    selectedChallenges.length > 0 ||
    selectedAdjustments.length > 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Review Your Request
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please review your selections before submitting your adjustment request. You can go back
          to any step to make changes.
        </Typography>
      </Box>

      {!hasSelections ? (
        <Alert severity="warning" icon={<Iconify icon="mdi:alert" />}>
          You haven&apos;t selected any adjustments yet. Please go back and select at least one
          adjustment to submit a request.
        </Alert>
      ) : (
        <>
          {/* Summary cards */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <SummaryCard
              title="Disabilities"
              count={selectedDisabilities.length}
              icon="mdi:account-heart"
              color={theme.palette.primary.main}
              onEdit={() => onEditStep(1)}
            />
            <SummaryCard
              title="Challenges"
              count={selectedChallenges.length}
              icon="mdi:hand-heart"
              color={theme.palette.info.main}
              onEdit={() => onEditStep(2)}
            />
            <SummaryCard
              title="Adjustments"
              count={selectedAdjustments.length}
              icon="mdi:lightbulb-on"
              color={theme.palette.success.main}
              onEdit={() => onEditStep(3)}
            />
          </Stack>

          {/* Detailed selections */}
          <Stack spacing={2}>
            {/* Disabilities */}
            {selectedDisabilities.length > 0 && (
              <ReviewSection
                title="Selected Disabilities"
                icon="mdi:account-heart"
                color={theme.palette.primary.main}
                onEdit={() => onEditStep(1)}
              >
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {selectedDisabilities.map((d) => (
                    <Chip
                      key={d.id}
                      label={d.disability_name}
                      variant="soft"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
              </ReviewSection>
            )}

            {/* Challenges */}
            {selectedChallenges.length > 0 && (
              <ReviewSection
                title="Selected Challenges"
                icon="mdi:hand-heart"
                color={theme.palette.info.main}
                onEdit={() => onEditStep(2)}
              >
                <Stack spacing={1}>
                  {Object.entries(
                    selectedChallenges.reduce(
                      (acc, l) => {
                        const cat = l.category || 'Other';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(l);
                        return acc;
                      },
                      {} as Record<string, IChallengeItem[]>
                    )
                  ).map(([category, items]) => (
                    <Box key={category}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        {category}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {items.map((l) => (
                          <Chip key={l.id} label={l.name} variant="outlined" size="small" />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </ReviewSection>
            )}

            {/* Adjustments */}
            {selectedAdjustments.length > 0 && (
              <ReviewSection
                title="Selected Adjustments"
                icon="mdi:lightbulb-on"
                color={theme.palette.success.main}
                onEdit={() => onEditStep(3)}
              >
                <Stack spacing={1.5}>
                  {selectedAdjustments.map((adj) => (
                    <Box
                      key={adj.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.success.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography variant="subtitle2">{adj.title}</Typography>
                        <Chip label={adj.category} size="small" variant="soft" color="success" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {adj.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </ReviewSection>
            )}
          </Stack>

          {/* Additional notes */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Additional Notes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add any additional information that might help us understand your needs better.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g., specific times when adjustments are most needed, any temporary or permanent requirements, preferred implementation timeline..."
                value={additionalNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                onBlur={onNotesBlur}
              />
            </CardContent>
          </Card>

          {/* Submission notice */}
          <Alert severity="info" icon={<Iconify icon="mdi:information" />}>
            <Typography variant="body2">
              Once submitted, your request will be reviewed by the appropriate team. You will
              receive notifications about the status of your request.
            </Typography>
          </Alert>
        </>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

type SummaryCardProps = {
  title: string;
  count: number;
  icon: string;
  color: string;
  onEdit: () => void;
};

function SummaryCard({ title, count, icon, color, onEdit }: SummaryCardProps) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: color,
          boxShadow: theme.shadows[2],
        },
      }}
      onClick={onEdit}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(color, 0.1),
              color,
            }}
          >
            <Iconify icon={icon} width={24} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ReviewSectionProps = {
  title: string;
  icon: string;
  color: string;
  onEdit: () => void;
  children: React.ReactNode;
};

function ReviewSection({ title, icon, color, onEdit, children }: ReviewSectionProps) {
  const theme = useTheme();

  return (
    <Card variant="outlined">
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
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(color, 0.1),
                color,
              }}
            >
              <Iconify icon={icon} width={18} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
          <Chip
            label="Edit"
            size="small"
            variant="outlined"
            onClick={onEdit}
            icon={<Iconify icon="mdi:pencil" width={14} />}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
