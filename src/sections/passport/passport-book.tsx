'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { useRef, useCallback, useState, forwardRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Iconify from '@/components/iconify';
import { IPassportData } from '@/types/passport';

import PassportCover from './passport-cover';
import PassportInsideCover from './passport-inside-cover';
import PassportPersonalPage from './passport-personal-page';
import PassportDisabilitiesPage from './passport-disabilities-page';
import PassportLimitationsPage from './passport-limitations-page';
import PassportAdjustmentPage from './passport-adjustment-page';

// Dynamically import HTMLFlipBook with no SSR
const HTMLFlipBook = dynamic(() => import('react-pageflip').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: 280,
        height: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  ),
});

// ----------------------------------------------------------------------

// Wrapper component for pages (required by react-pageflip)
const PageWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} style={{ width: '100%', height: '100%' }}>
    {children}
  </div>
));
PageWrapper.displayName = 'PageWrapper';

// ----------------------------------------------------------------------

interface PassportBookProps {
  data: IPassportData;
  onPdfRef?: (ref: HTMLDivElement | null) => void;
  scale?: number;
}

export default function PassportBook({ data, onPdfRef, scale = 1 }: PassportBookProps) {
  const theme = useTheme();
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; getCurrentPageIndex: () => number; getPageCount: () => number } }>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate total pages: front cover + inside front + personal page + disabilities page + limitations page + adjustment pages + inside back + back cover
  const totalPages = 5 + data.approvedAdjustments.length + 2;

  const handleFlipNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const handleFlipPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const handlePageFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  // Pass container ref to parent for PDF generation
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      onPdfRef?.(node);
    },
    [onPdfRef]
  );

  if (!isMounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 280,
            height: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.grey[500], 0.1),
            borderRadius: 1,
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Book container */}
      <Box
        ref={setContainerRef}
        sx={{
          position: 'relative',
          perspective: '1500px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          // Reserve the scaled space so layout doesn't collapse
          width: 560 * scale,
          height: 380 * scale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* @ts-expect-error - react-pageflip types are not fully compatible */}
        <HTMLFlipBook
          ref={bookRef}
          width={280}
          height={380}
          size="stretch"
          minWidth={250}
          maxWidth={400}
          minHeight={340}
          maxHeight={540}
          showCover={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          onFlip={handlePageFlip}
          className="passport-book"
          style={{
            boxShadow: theme.shadows[20],
          }}
          flippingTime={600}
          usePortrait={true}
          startPage={0}
          drawShadow={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {/* Front Cover */}
          <PageWrapper>
            <PassportCover variant="front" />
          </PageWrapper>

          {/* Inside Front Cover */}
          <PageWrapper>
            <PassportInsideCover variant="front" />
          </PageWrapper>

          {/* Personal Information Page */}
          <PageWrapper>
            <PassportPersonalPage
              holder={data.holder}
              passportNumber={data.passportNumber}
              totalApprovedAdjustments={data.approvedAdjustments.length}
            />
          </PageWrapper>

          {/* Disabilities Page (My Conditions) */}
          <PageWrapper>
            <PassportDisabilitiesPage
              disabilities={data.disabilities || []}
              pageNumber={2}
            />
          </PageWrapper>

          {/* Limitations Page (I Struggle With) */}
          <PageWrapper>
            <PassportLimitationsPage
              limitations={data.limitations || []}
              pageNumber={3}
            />
          </PageWrapper>

          {/* Adjustment Pages */}
          {data.approvedAdjustments.map((adjustment, index) => (
            <PageWrapper key={adjustment.id}>
              <PassportAdjustmentPage
                adjustment={adjustment}
                pageNumber={index + 4}
              />
            </PageWrapper>
          ))}

          {/* Inside Back Cover */}
          <PageWrapper>
            <PassportInsideCover variant="back" />
          </PageWrapper>

          {/* Back Cover */}
          <PageWrapper>
            <PassportCover variant="back" />
          </PageWrapper>
        </HTMLFlipBook>
      </Box>

      {/* Navigation controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleFlipPrev}
          disabled={currentPage === 0}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            minWidth: 100,
            textAlign: 'center',
          }}
        >
          Page {currentPage + 1} of {totalPages}
        </Typography>

        <IconButton
          onClick={handleFlipNext}
          disabled={currentPage >= totalPages - 1}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
      </Box>

      {/* Instructions */}
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          textAlign: 'center',
        }}
      >
        Click on page corners or use arrows to flip pages
      </Typography>
    </Box>
  );
}
