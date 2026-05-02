'use client';

export const STAMP_CONFIGS = {
  approved:        { label: 'APPROVED',     color: '#007867', bg: 'rgba(0,120,103,0.08)' },
  declined:        { label: 'DECLINED',     color: '#B71D18', bg: 'rgba(183,29,24,0.07)' },
  'under-review':  { label: 'UNDER REVIEW', color: '#B76E00', bg: 'rgba(183,110,0,0.07)' },
  pending:         { label: 'PENDING',      color: '#637381', bg: 'rgba(99,115,129,0.07)' },
  expired:         { label: 'EXPIRED',      color: '#454F5B', bg: 'rgba(69,79,91,0.07)'  },
  renewed:         { label: 'RENEWED',      color: '#006C9C', bg: 'rgba(0,108,156,0.07)' },
} as const;

export type StampStatus = keyof typeof STAMP_CONFIGS;
export type StampSize   = 'sm' | 'md' | 'lg';

interface PassportStampProps {
  status:    StampStatus;
  date?:     string;
  rotation?: number;
  size?:     StampSize;
}

export default function PassportStamp({ status, date, rotation = 0, size = 'md' }: PassportStampProps) {
  const cfg = STAMP_CONFIGS[status] ?? STAMP_CONFIGS.pending;
  const w   = size === 'lg' ? 110 : size === 'sm' ? 72 : 90;
  const h   = size === 'lg' ?  52 : size === 'sm' ? 34 : 42;
  const fs  = size === 'lg' ?  11 : size === 'sm' ?  7 :  9;
  const dfs = size === 'lg' ?   8 : size === 'sm' ? 5.5 : 6.5;

  return (
    <div
      style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', width: w, height: h,
        border: `2px solid ${cfg.color}`, borderRadius: 3, background: cfg.bg,
        transform: `rotate(${rotation}deg)`, opacity: 0.88, flexShrink: 0, gap: 2,
        boxShadow: `inset 0 0 0 1px ${cfg.color}22`, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* ink bleed */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${cfg.color}08, transparent 70%)`, pointerEvents: 'none' }} />

      <span style={{ fontFamily: "'Georgia','Times New Roman',serif", fontWeight: 700, fontSize: fs, color: cfg.color, letterSpacing: '0.12em', lineHeight: 1, textTransform: 'uppercase', zIndex: 1 }}>
        {cfg.label}
      </span>
      {date && (
        <span style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: dfs, color: cfg.color, opacity: 0.7, letterSpacing: '0.06em', zIndex: 1 }}>
          {date}
        </span>
      )}

      {/* corner serifs */}
      <div style={{ position: 'absolute', top: 2, left:  2, width: 6, height: 6, borderTop:    `1.5px solid ${cfg.color}`, borderLeft:  `1.5px solid ${cfg.color}` }} />
      <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderTop:    `1.5px solid ${cfg.color}`, borderRight: `1.5px solid ${cfg.color}` }} />
      <div style={{ position: 'absolute', bottom: 2, left:  2, width: 6, height: 6, borderBottom: `1.5px solid ${cfg.color}`, borderLeft:  `1.5px solid ${cfg.color}` }} />
      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 6, height: 6, borderBottom: `1.5px solid ${cfg.color}`, borderRight: `1.5px solid ${cfg.color}` }} />
    </div>
  );
}
