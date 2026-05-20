'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { usePassport } from '@/hooks/use-passport';
import { usePassportDownload } from '@/hooks/use-passport-download';

import PassportBook from '../passport-book';
import PassportEmpty from '../passport-empty';
import PassportSendDialog from '../passport-send-dialog';
import PassportFullscreenModal from '../passport-fullscreen-modal';
import PassportStamp, { STAMP_CONFIGS, type StampStatus } from '../passport-stamp';

// ──────────────────────────────────────────────────────────────────────────────

export default function PassportView() {
  const { passportData, loading, error } = usePassport();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const { download, downloading } = usePassportDownload(passportData);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;
  }

  if (!passportData) {
    return <Card sx={{ p: 3 }}><PassportEmpty /></Card>;
  }

  const d             = passportData;
  const approvedCount = d.approvedAdjustments.length;
  const fmt           = (date: Date | string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
  const issuedStr     = fmt(d.issueDate);
  const validUntilStr = fmt(new Date(new Date(d.issueDate).setFullYear(new Date(d.issueDate).getFullYear() + 2)));

  // Shared card style
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 0 2px rgba(145,158,171,0.2), 0 8px 24px -4px rgba(145,158,171,0.12)',
    padding: '16px 20px',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
    color: '#919EAB', marginBottom: 12, fontFamily: "'DM Sans',sans-serif",
    display: 'block',
  };

  return (
    <Box>
      {/* Breadcrumb + heading */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
          <Typography variant="caption" sx={{ color: '#919EAB', fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>
            My Workspace
          </Typography>
          <Typography variant="caption" sx={{ color: '#C4CDD5' }}>/</Typography>
          <Typography variant="caption" sx={{ color: '#212B36', fontWeight: 600, fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>
            My Passport
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontFamily: "'DM Sans',sans-serif", color: '#212B36', fontWeight: 700 }}>
          My Accessibility Passport
        </Typography>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: Passport booklet */}
        <PassportBook data={d} />

        {/* Right: Info panel */}
        <Box sx={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Passport Status ── */}
          <div style={card}>
            <span style={sectionLabel}>Passport Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00A76F', boxShadow: '0 0 0 3px rgba(0,167,111,0.2)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#007867', fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>Active</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0' }}>
              {([
                ['Issued',       issuedStr],
                ['Valid until',  validUntilStr],
                ['Adjustments',  `${approvedCount} total`],
                ['Approved',     String(approvedCount)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 9, color: '#919EAB', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stamp Legend ── */}
          <div style={card}>
            <span style={sectionLabel}>Stamp Legend</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.entries(STAMP_CONFIGS) as [StampStatus, (typeof STAMP_CONFIGS)[StampStatus]][]).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PassportStamp status={key} size="sm" />
                  <span style={{ fontSize: 11, color: '#637381', fontFamily: "'DM Sans',sans-serif" }}>
                    {cfg.label.charAt(0) + cfg.label.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={card}>
            <span style={sectionLabel}>Actions</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                ['Share with HR',  'Share a secure link with your HR team',       () => setSendDialogOpen(true)],
                ['Download PDF',   downloading ? 'Generating…' : 'Export a print-ready version', download],
                ['Fullscreen',     'View your passport in full screen',            () => setFullscreenOpen(true)],
              ] as [string, string, () => void][]).map(([label, desc, onClick]) => (
                <button
                  key={label}
                  onClick={onClick}
                  disabled={label === 'Download PDF' && downloading}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F4F6F8', border: 'none', borderRadius: 7, padding: '9px 12px', cursor: 'pointer', textAlign: 'left', transition: 'background .15s', width: '100%' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#DFE3E8'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F4F6F8'; }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>{label}</div>
                    <div style={{ fontSize: 10, color: '#919EAB', fontFamily: "'DM Sans',sans-serif" }}>{desc}</div>
                  </div>
                  <span style={{ color: '#C4CDD5', fontSize: 14 }}>›</span>
                </button>
              ))}
            </div>
          </div>

        </Box>
      </Box>

      <PassportSendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        passportNumber={d.passportNumber}
        holderName={d.holder.fullName}
        defaultEmail={d.holder.email}
      />

      <PassportFullscreenModal
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        data={d}
      />
    </Box>
  );
}
