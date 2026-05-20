'use client';

import { format } from 'date-fns';

import { IPassportData } from '@/types/passport';
import { RequestStatusTypes } from '@/types/adjustmentRequest';

import PassportStamp, { type StampStatus } from './passport-stamp';
import { STAMP_CONFIGS } from './passport-stamp';

// ── Shared helpers ────────────────────────────────────────────────────────────

const TOTAL = 8;

function PageLabel({ n, dark }: { n: number; dark?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        fontSize: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        color: dark ? 'rgba(255,255,255,0.6)' : '#637381',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {n} / {TOTAL}
    </div>
  );
}

function HeaderBand({ title, sub }: { title: string; sub?: string }) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg,#1a2e3a,#1a7fa8)', borderRadius: 4,
        padding: '8px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>
        {title}
      </span>
      {sub && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',sans-serif" }}>{sub}</span>}
    </div>
  );
}

function GiltBorder() {
  return (
    <>
      <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 14, border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 3, pointerEvents: 'none' }} />
    </>
  );
}

function PhotoPlaceholder({ avatarUrl }: { avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <div style={{ width: 88, height: 88, borderRadius: '50%', border: '2px solid #C4CDD5', flexShrink: 0, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#DFE3E8', border: '2px solid #C4CDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#919EAB" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#919EAB" />
      </svg>
    </div>
  );
}

function FieldItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#919EAB', fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function MRZBar({ name, passportNumber }: { name: string; passportNumber: string }) {
  const parts    = name.toUpperCase().split(' ');
  const surname  = parts[parts.length - 1] || '';
  const given    = parts.slice(0, -1).join('<') || '';
  const pad      = Math.max(0, 39 - surname.length - given.length - 4);
  const line1    = `P<GBR${surname}<<${given}${'<'.repeat(pad)}`.slice(0, 44);
  const code     = passportNumber.replace(/[^A-Z0-9]/g, '').slice(0, 9).padEnd(9, '<');
  const line2    = `${code}GBR${'<'.repeat(32)}`.slice(0, 44);
  return (
    <div style={{ background: '#F4F6F8', borderRadius: 4, padding: '8px 12px', fontFamily: "'Courier New',monospace", fontSize: 9.5, letterSpacing: '0.08em', color: '#454F5B', lineHeight: 1.7, borderTop: '2px solid #DFE3E8' }}>
      <div>{line1}</div>
      <div>{line2}</div>
    </div>
  );
}

function mapStatus(s: RequestStatusTypes | null | undefined): StampStatus {
  if (s === RequestStatusTypes.APPROVED)  return 'approved';
  if (s === RequestStatusTypes.DENIED)    return 'declined';
  if (s === RequestStatusTypes.MORE_INFO) return 'under-review';
  if (s === RequestStatusTypes.PENDING)   return 'pending';
  return 'pending';
}

// ── Page 1 — Cover ────────────────────────────────────────────────────────────

export function CoverPage({ data }: { data: IPassportData }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#1a2e3a 0%,#0d1e28 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '32px 28px 28px', position: 'relative', overflow: 'hidden' }}>
      <GiltBorder />

      {/* decorative circles */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(26,127,168,0.12)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(26,127,168,0.08)' }} />

      {/* accessibility watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, pointerEvents: 'none' }}>
        <svg width={180} height={180} viewBox="0 0 100 100">
          <circle cx="50" cy="20" r="8" fill="#fff" />
          <path d="M50 30 L50 60 M35 40 L65 40 M50 60 L38 80 M50 60 L62 80" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* top: crest */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.3)" />
            <path d="M9 12l2 2 4-4" stroke="#1a7fa8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>United Kingdom</div>
      </div>

      {/* centre: wordmark + title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 1 }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
            enable<span style={{ color: '#7ECFEA' }}>D</span>
          </span>
          <span style={{ position: 'absolute', top: -7, right: -28, background: '#FF5630', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 6.5, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', padding: '1.5px 4px', borderRadius: 2.5, boxShadow: '0 1px 4px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>Beta</span>
        </div>
        <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
        <div style={{ fontSize: 20, fontFamily: "'Georgia','Times New Roman',serif", fontWeight: 400, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3 }}>
          Accessibility<br />Passport
        </div>
        <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Workplace Adjustment Record</div>
      </div>

      {/* bottom: holder info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
        <div style={{ fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
          {data.holder.fullName.toUpperCase()}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.08em' }}>{data.passportNumber}</div>
      </div>

      <PageLabel n={1} dark />
    </div>
  );
}

// ── Page 2 — Personal Details ─────────────────────────────────────────────────

export function PersonalPage({ data }: { data: IPassportData }) {
  const h          = data.holder;
  const issued     = format(new Date(h.issueDate), 'dd MMMM yyyy');
  const validUntil = format(new Date(new Date(h.issueDate).setFullYear(new Date(h.issueDate).getFullYear() + 2)), 'dd MMMM yyyy');

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 16 }}>
      <HeaderBand title="Personal Details" sub="Page 2" />

      <div style={{ display: 'flex', gap: 16 }}>
        <PhotoPlaceholder avatarUrl={h.avatarUrl} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <FieldItem label="Full name"   value={h.fullName} />
          {h.jobTitle   && <FieldItem label="Job title"   value={h.jobTitle} />}
          {h.department && <FieldItem label="Department"  value={h.department} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        <FieldItem label="Passport No." value={data.passportNumber} />
        <FieldItem label="Date issued"  value={issued} />
        <FieldItem label="Valid until"  value={validUntil} />
        <FieldItem label="Status"       value="Active" />
      </div>

      <MRZBar name={h.fullName} passportNumber={data.passportNumber} />
      <PageLabel n={2} />
    </div>
  );
}

// ── Page 3 — Conditions ───────────────────────────────────────────────────────

export function ConditionsPage({ data }: { data: IPassportData }) {
  const { disabilities } = data;

  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFBFC', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 14 }}>
      <HeaderBand title="Conditions Summary" sub="Page 3" />

      <p style={{ fontSize: 10, color: '#637381', lineHeight: 1.6, fontFamily: "'Atkinson Hyperlegible Next',sans-serif", margin: 0 }}>
        Conditions listed here have been self-declared and may be supported by medical evidence held on file.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {disabilities.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#919EAB', fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>
            No conditions recorded
          </div>
        ) : (
          disabilities.map((c, i) => {
            const since = c.created_at ? new Date(c.created_at).getFullYear().toString() : '';
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #DFE3E8', borderRadius: 6, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a2e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif", lineHeight: 1.3, marginBottom: 3 }}>{c.disability_name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {since    && <span style={{ fontSize: 9, background: '#F4F6F8', color: '#637381', padding: '2px 6px', borderRadius: 3, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Since {since}</span>}
                    {c.category && <span style={{ fontSize: 9, background: '#F4F6F8', color: '#637381', padding: '2px 6px', borderRadius: 3, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{c.category}</span>}
                    <span style={{ fontSize: 9, background: 'rgba(0,120,103,0.1)', color: '#007867', padding: '2px 6px', borderRadius: 3, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>✓ Verified</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: 9, color: '#637381', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, borderTop: '1px dashed #DFE3E8', paddingTop: 8 }}>
        Protected under the Equality Act 2010 · Confidential
      </div>
      <PageLabel n={3} />
    </div>
  );
}

// ── Page 4 — Adjustments ─────────────────────────────────────────────────────

const ADJ_ROTATIONS = [-3, 2.5, -1.5, 3, -2, 1.5, -3.5, 2];

export function AdjustmentsPage({ data }: { data: IPassportData }) {
  const adjs = data.approvedAdjustments;

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 12, overflowY: 'auto' }}>
      <HeaderBand title="Adjustments" sub="Page 4" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {adjs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#919EAB', fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>
            No adjustments recorded
          </div>
        ) : (
          adjs.map((adj, i) => {
            const status  = mapStatus(adj.status);
            const dateStr = adj.respondedAt
              ? format(new Date(adj.respondedAt), 'dd MMM yyyy')
              : format(new Date(adj.createdAt), 'dd MMM yyyy');
            return (
              <div key={adj.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FAFBFC', border: '1px solid #DFE3E8', borderRadius: 5, padding: '7px 10px' }}>
                <div style={{ width: 22, height: 22, borderRadius: 3, background: '#1a2e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 8.5, color: '#7ECFEA', fontFamily: "'DM Sans',sans-serif", fontWeight: 800 }}>A{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adj.title || 'Untitled'}</div>
                  <div style={{ fontSize: 9, color: '#919EAB', fontFamily: "'DM Sans',sans-serif" }}>{adj.adjustmentType || 'General'} · {dateStr}</div>
                </div>
                <PassportStamp status={status} date={dateStr} rotation={ADJ_ROTATIONS[i % ADJ_ROTATIONS.length]} size="sm" />
              </div>
            );
          })
        )}
      </div>
      <PageLabel n={4} />
    </div>
  );
}

// ── Page 5 — Approval History ─────────────────────────────────────────────────

type HistoryType = 'approved' | 'declined' | 'pending' | 'created';

const TYPE_COLORS: Record<HistoryType, string> = {
  approved: '#007867', declined: '#B71D18', pending: '#B76E00', created: '#006C9C',
};
const TYPE_ICONS: Record<HistoryType, string> = {
  approved: '✓', declined: '✕', pending: '◷', created: '★',
};

type HistoryItem = { date: string; event: string; by: string; type: HistoryType };

export function HistoryPage({ data }: { data: IPassportData }) {
  const items: HistoryItem[] = data.approvedAdjustments.map(
    (adj, i): HistoryItem => ({
      date:  adj.respondedAt
        ? format(new Date(adj.respondedAt), 'dd MMM yyyy')
        : format(new Date(adj.createdAt),   'dd MMM yyyy'),
      event: `A${i + 1} ${adj.title || 'Adjustment'} approved`,
      by:    adj.approverName || 'Approver',
      type:  'approved',
    })
  );
  const created: HistoryItem = { date: format(new Date(data.holder.issueDate), 'dd MMM yyyy'), event: 'Passport created', by: data.holder.fullName, type: 'created' };
  const history = [created, ...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFBFC', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 12 }}>
      <HeaderBand title="Approval History" sub="Page 5" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {history.map((h, i) => {
          const col = TYPE_COLORS[h.type];
          const ico = TYPE_ICONS[h.type];
          return (
            <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 10, position: 'relative' }}>
              {i < history.length - 1 && (
                <div style={{ position: 'absolute', left: 11, top: 22, bottom: 0, width: 1, background: '#DFE3E8' }} />
              )}
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${col}18`, border: `1.5px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                <span style={{ fontSize: 8, color: col, fontWeight: 800 }}>{ico}</span>
              </div>
              <div style={{ flex: 1, paddingTop: 3 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif", lineHeight: 1.3 }}>{h.event}</div>
                <div style={{ fontSize: 9, color: '#919EAB', fontFamily: "'DM Sans',sans-serif", marginTop: 1 }}>{h.date} · {h.by}</div>
              </div>
            </div>
          );
        })}
      </div>
      <PageLabel n={5} />
    </div>
  );
}

// ── Page 6 — Emergency & Medical ─────────────────────────────────────────────

function EmField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#919EAB', fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#212B36', fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>{value}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmergencyPage(_props: { data: IPassportData }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 14 }}>
      {/* red header */}
      <div style={{ background: 'linear-gradient(90deg,#B71D18,#FF5630)', borderRadius: 4, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 14 }}>⚠</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#fff', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>Emergency &amp; Medical</span>
      </div>

      <div style={{ background: '#FFF4F2', border: '1px solid #FFAC82', borderRadius: 6, padding: '10px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#B71D18', marginBottom: 6, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>Emergency Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          <EmField label="Name"     value="Not provided" />
          <EmField label="Relation" value="—" />
          <EmField label="Phone"    value="Update via HR" />
        </div>
      </div>

      <div style={{ background: '#F4F6F8', border: '1px solid #DFE3E8', borderRadius: 6, padding: '10px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#454F5B', marginBottom: 6, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>GP / Medical</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          <EmField label="GP name"  value="Not provided" />
          <EmField label="Practice" value="—" />
          <EmField label="Phone"    value="Update via HR" />
        </div>
      </div>

      <div style={{ flex: 1, background: '#FFFBF0', border: '1px solid #FFD666', borderRadius: 6, padding: '10px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#B76E00', marginBottom: 6, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '.08em' }}>Important Notes</div>
        <p style={{ fontSize: 11, color: '#454F5B', lineHeight: 1.6, margin: 0, fontFamily: "'Atkinson Hyperlegible Next',sans-serif" }}>
          Emergency and medical details can be updated by contacting your HR team. This section helps first
          responders and colleagues understand any health considerations relevant to your workplace.
        </p>
      </div>
      <PageLabel n={6} />
    </div>
  );
}

// ── Page 7 — Supporting Notes ─────────────────────────────────────────────────

export function NotesPage({ data }: { data: IPassportData }) {
  const challenges = data.challenges || [];
  const notes = challenges.length > 0
    ? challenges.map((c) => c.description).join('. ')
    : 'No supporting notes have been added yet. Use the "Manage Challenges" section from the passport page to record things you find challenging or preferences that help you work effectively.';

  const issuedStr  = format(new Date(data.holder.issueDate), 'dd MMM yyyy');
  const updatedStr = format(new Date(data.lastUpdated), 'dd MMM yyyy');

  return (
    <div style={{ width: '100%', height: '100%', background: '#FFFEF8', display: 'flex', flexDirection: 'column', padding: '24px 22px 32px', position: 'relative', gap: 14 }}>
      {/* lined paper texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e4d4 27px, #e8e4d4 28px)', backgroundPosition: '0 72px', opacity: 0.4, pointerEvents: 'none' }} />

      <HeaderBand title="Supporting Notes" />

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 12, color: '#454F5B', lineHeight: 1.8, fontFamily: "'Atkinson Hyperlegible Next',sans-serif", margin: 0 }}>{notes}</p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Manager acknowledgement:', 'HR sign-off:', 'Review date:'].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: '#637381', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, minWidth: 140 }}>{l}</span>
              <div style={{ flex: 1, borderBottom: '1px solid #C4CDD5' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', zIndex: 1 }}>
        <PassportStamp status="approved" date={issuedStr}  rotation={-4} size="md" />
        <PassportStamp status="renewed"  date={updatedStr} rotation={3}  size="md" />
      </div>
      <PageLabel n={7} />
    </div>
  );
}

// ── Page 8 — Back Cover ───────────────────────────────────────────────────────

export function BackCoverPage({ data }: { data: IPassportData }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#1a2e3a 0%,#0d1e28 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '32px 28px 28px', position: 'relative', overflow: 'hidden' }}>
      <GiltBorder />

      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.05, pointerEvents: 'none' }}>
        <svg width={180} height={180} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#fff" />
        </svg>
      </div>

      <div />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', textAlign: 'center' }}>
          This passport is the property of
        </div>
        <div style={{ fontSize: 14, fontFamily: "'Georgia',serif", color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em' }}>
          {data.holder.fullName}
        </div>
        <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ fontSize: 9.5, fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, textAlign: 'center', maxWidth: 180 }}>
          If found, please return to HR.<br />
          All information is confidential<br />
          under the Equality Act 2010.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.4)' }}>
          enable<span style={{ color: 'rgba(126,207,234,0.5)' }}>D</span>
        </span>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans',sans-serif", letterSpacing: '0.08em' }}>www.getenabled.co.uk</div>
      </div>

      <PageLabel n={8} dark />
    </div>
  );
}

// Re-export STAMP_CONFIGS so passport-view can import it from one place
export { STAMP_CONFIGS };
