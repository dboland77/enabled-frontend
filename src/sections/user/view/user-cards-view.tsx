'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CardActionArea from '@mui/material/CardActionArea';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from '@/components/iconify';
import EmptyContent from '@/components/empty-content';
import ProgressBar from '@/components/progress-bar';
import { useSettingsContext } from '@/components/settings';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { AvatarShape } from '@/assets/illustrations';
import { useUserProfile, UserDisability, UserAdjustment } from '@/hooks/use-user-profile';

const NHS_LOGO_URL =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NHS%2010mm%20-%20RGB%20Blue%20on%20white-6UFE7zxSQtJnlvAPsWWgeiMzKpO2t6.jpg';

const ITEMS_PER_PAGE = 6;

// ----------------------------------------------------------------------

type DisabilityCardProps = {
  disability: UserDisability;
};

function DisabilityCard({ disability }: DisabilityCardProps) {
  const theme = useTheme();
  const { disability_name, disability_nhs_slug } = disability;

  const nhsUrl = disability_nhs_slug
    ? `https://www.nhs.uk/conditions/${disability_nhs_slug}`
    : null;

  const handleClick = () => {
    if (nhsUrl) {
      window.open(nhsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card sx={{ overflow: 'hidden', bgcolor: 'background.paper' }}>
      <CardActionArea onClick={handleClick} disabled={!nhsUrl}>
        <Box
          sx={{
            position: 'relative',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <AvatarShape
            sx={{
              left: 0,
              right: 0,
              zIndex: 10,
              mx: 'auto',
              bottom: -26,
              position: 'absolute',
              color: 'background.paper',
            }}
          />

          <Avatar
            alt={disability_name}
            sx={{
              width: 64,
              height: 64,
              zIndex: 11,
              left: 0,
              right: 0,
              bottom: -32,
              mx: 'auto',
              position: 'absolute',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
            }}
          >
            {disability_name.charAt(0).toUpperCase()}
          </Avatar>

          <Box
            sx={{
              height: 0,
              paddingTop: '56.25%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={NHS_LOGO_URL}
              alt="NHS"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '40%',
                maxHeight: '30%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            textAlign: 'center',
            pt: 5,
            pb: 2.5,
            px: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            {disability_name}
          </Typography>

          {disability_nhs_slug && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                borderRadius: 0.75,
                py: 0.5,
                px: 1,
                mx: 'auto',
                width: 'fit-content',
              }}
            >
              {disability_nhs_slug}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

// ----------------------------------------------------------------------

type AdjustmentCardProps = {
  adjustment: UserAdjustment;
};

function AdjustmentCard({ adjustment }: AdjustmentCardProps) {
  const theme = useTheme();
  const { adjustment_title, adjustment_type, approved_at } = adjustment;

  return (
    <Card sx={{ overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          position: 'relative',
          bgcolor: alpha(theme.palette.success.main, 0.08),
          borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
        }}
      >
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
            color: 'background.paper',
          }}
        />

        <Avatar
          alt={adjustment_title}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            left: 0,
            right: 0,
            bottom: -32,
            mx: 'auto',
            position: 'absolute',
            bgcolor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            fontWeight: 600,
          }}
        >
          {adjustment_title.charAt(0).toUpperCase()}
        </Avatar>

        <Box
          sx={{
            height: 0,
            paddingTop: '56.25%',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
          }}
        />
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          pt: 5,
          pb: 2.5,
          px: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {adjustment_title}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
          <Chip label={adjustment_type} size="small" variant="soft" color="success" />
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Approved: {new Date(approved_at).toLocaleDateString()}
        </Typography>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function UserCardsView() {
  const settings = useSettingsContext();
  const { fetchUserDisabilities, fetchUserAdjustments } = useUserProfile();

  const [currentTab, setCurrentTab] = useState('disabilities');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabilities, setDisabilities] = useState<UserDisability[]>([]);
  const [adjustments, setAdjustments] = useState<UserAdjustment[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [disabilitiesData, adjustmentsData] = await Promise.all([
        fetchUserDisabilities(),
        fetchUserAdjustments(),
      ]);
      setDisabilities(disabilitiesData);
      setAdjustments(adjustmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchUserDisabilities, fetchUserAdjustments]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(1);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  // Filter disabilities
  const filteredDisabilities = disabilities.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.disability_name.toLowerCase().includes(q) ||
      d.disability_nhs_slug?.toLowerCase().includes(q)
    );
  });

  // Filter adjustments
  const filteredAdjustments = adjustments.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.adjustment_title.toLowerCase().includes(q) ||
      a.adjustment_type.toLowerCase().includes(q)
    );
  });

  const currentItems = currentTab === 'disabilities' ? filteredDisabilities : filteredAdjustments;
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const paginatedItems = currentItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const notFound = !loading && currentItems.length === 0;

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CustomBreadcrumbs
        heading="My Cards"
        links={[
          { name: 'Home', href: '/dashboard' },
          { name: 'User', href: '/dashboard/user/profile' },
          { name: 'Cards' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: { xs: 3, md: 5 },
          '& .MuiTabs-flexContainer': {
            gap: 2,
          },
        }}
      >
        <Tab
          value="disabilities"
          label={`Disabilities (${disabilities.length})`}
          icon={<Iconify icon="mdi:wheelchair-accessibility" width={24} />}
          iconPosition="start"
        />
        <Tab
          value="adjustments"
          label={`Adjustments (${adjustments.length})`}
          icon={<Iconify icon="mdi:check-decagram" width={24} />}
          iconPosition="start"
        />
      </Tabs>

      <Stack sx={{ mb: { xs: 3, md: 5 } }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          placeholder={`Search ${currentTab}...`}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {notFound ? (
        <EmptyContent
          filled
          title={`No ${currentTab} found`}
          description={
            currentTab === 'disabilities'
              ? 'You have not added any disabilities to your profile yet.'
              : 'You have no approved adjustments yet.'
          }
          sx={{ py: 10 }}
        />
      ) : (
        <>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            {currentTab === 'disabilities'
              ? (paginatedItems as UserDisability[]).map((disability) => (
                  <DisabilityCard key={disability.id} disability={disability} />
                ))
              : (paginatedItems as UserAdjustment[]).map((adjustment) => (
                  <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
                ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
