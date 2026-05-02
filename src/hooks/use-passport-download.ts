'use client';

import { useState, useCallback } from 'react';

import { IPassportData } from '@/types/passport';

// ----------------------------------------------------------------------

async function loadLibs() {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  return { jsPDF, html2canvas };
}

// Page dimensions (points) — A5 portrait
const PAGE_W_PT = 419.53;
const PAGE_H_PT = 595.28;
// Pixel size of each rendered page element
const RENDER_W_PX = 560;
const RENDER_H_PX = 794;

// ----------------------------------------------------------------------

export function usePassportDownload(data: IPassportData | null) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async () => {
    if (!data) return;
    setDownloading(true);

    try {
      const { jsPDF, html2canvas } = await loadLibs();

      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${RENDER_W_PX}px;
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(container);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [PAGE_W_PT, PAGE_H_PT],
      });

      const pages = buildPageDescriptors(data);

      for (let i = 0; i < pages.length; i++) {
        const { html } = pages[i];

        container.innerHTML = html;
        container.style.height = `${RENDER_H_PX}px`;

        await new Promise((r) => setTimeout(r, 80));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          width: RENDER_W_PX,
          height: RENDER_H_PX,
          logging: false,
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.92),
          'JPEG',
          0,
          0,
          PAGE_W_PT,
          PAGE_H_PT
        );
      }

      document.body.removeChild(container);

      const holderName = (data.holder.fullName || 'passport').replace(/\s+/g, '_');
      pdf.save(`RAP_${holderName}_${data.passportNumber}.pdf`);
    } catch (err) {
      console.error('Passport download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [data]);

  return { download, downloading };
}

// ----------------------------------------------------------------------
// HTML page builders — mirror the React components in passport-pages.tsx

function buildPageDescriptors(data: IPassportData) {
  // Design tokens matching passport-pages.tsx
  const navy   = '#1a2e3a';
  const navyDk = '#0d1e28';
  const blue   = '#1a7fa8';
  const lblue  = '#7ECFEA';
  const tp     = '#212B36';
  const ts     = '#637381';
  const tm     = '#919EAB';
  const bd     = '#DFE3E8';
  const bgf    = '#F4F6F8';
  const bgp    = '#FAFBFC';

  const W = RENDER_W_PX;
  const H = RENDER_H_PX;

  // ── Shared helpers ────────────────────────────────────────────────────

  const hdr = (title: string, sub?: string) => `
    <div style="background:linear-gradient(90deg,${navy},${blue});border-radius:4px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;margin-bottom:12px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,0.85);text-transform:uppercase;font-family:sans-serif;">${title}</span>
      ${sub ? `<span style="font-size:9px;color:rgba(255,255,255,0.5);font-family:sans-serif;">${sub}</span>` : ''}
    </div>`;

  const pl = (n: number, dark?: boolean) => `
    <div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);font-size:8px;font-family:sans-serif;font-weight:600;color:${dark ? 'rgba(255,255,255,0.35)' : '#C4CDD5'};letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;">${n} / 8</div>`;

  const fi = (label: string, value: string) => `
    <div style="display:flex;flex-direction:column;gap:2px;">
      <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${tm};font-family:sans-serif;">${label}</div>
      <div style="font-size:12px;font-weight:600;color:${tp};font-family:sans-serif;line-height:1.3;">${value}</div>
    </div>`;

  const mrz = (name: string, num: string) => {
    const parts = name.toUpperCase().split(' ');
    const sn    = parts[parts.length - 1] || '';
    const gn    = parts.slice(0, -1).join('<') || '';
    const pad   = Math.max(0, 39 - sn.length - gn.length - 4);
    const l1    = `P<GBR${sn}<<${gn}${'<'.repeat(pad)}`.slice(0, 44);
    const code  = num.replace(/[^A-Z0-9]/g, '').slice(0, 9).padEnd(9, '<');
    const l2    = `${code}GBR${'<'.repeat(32)}`.slice(0, 44);
    return `<div style="background:${bgf};border-radius:4px;padding:8px 12px;font-family:monospace;font-size:9.5px;letter-spacing:0.08em;color:#454F5B;line-height:1.7;border-top:2px solid ${bd};"><div>${l1}</div><div>${l2}</div></div>`;
  };

  // Rectangular stamp matching PassportStamp component
  const stamp = (
    rot: number, label: string, date: string,
    color: string, bg: string,
    w = 90, h2 = 42, fs = 9, dfs = 6.5
  ) => `
    <div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:${w}px;height:${h2}px;border:2px solid ${color};border-radius:3px;background:${bg};transform:rotate(${rot}deg);opacity:0.88;flex-shrink:0;gap:2px;position:relative;overflow:hidden;box-shadow:inset 0 0 0 1px ${color}22;">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,${color}08,transparent 70%);pointer-events:none;"></div>
      <span style="font-family:Georgia,serif;font-weight:700;font-size:${fs}px;color:${color};letter-spacing:0.12em;line-height:1;text-transform:uppercase;z-index:1;">${label}</span>
      ${date ? `<span style="font-family:Georgia,serif;font-size:${dfs}px;color:${color};opacity:0.7;letter-spacing:0.06em;z-index:1;">${date}</span>` : ''}
      <div style="position:absolute;top:2px;left:2px;width:6px;height:6px;border-top:1.5px solid ${color};border-left:1.5px solid ${color};"></div>
      <div style="position:absolute;top:2px;right:2px;width:6px;height:6px;border-top:1.5px solid ${color};border-right:1.5px solid ${color};"></div>
      <div style="position:absolute;bottom:2px;left:2px;width:6px;height:6px;border-bottom:1.5px solid ${color};border-left:1.5px solid ${color};"></div>
      <div style="position:absolute;bottom:2px;right:2px;width:6px;height:6px;border-bottom:1.5px solid ${color};border-right:1.5px solid ${color};"></div>
    </div>`;

  const smStamp = (rot: number, date: string, color: string, bg: string) =>
    stamp(rot, 'APPROVED', date, color, bg, 72, 34, 7, 5.5);

  // ── Page 1 — Cover ────────────────────────────────────────────────────

  const p1 = `
    <div style="width:${W}px;height:${H}px;background:linear-gradient(160deg,${navy} 0%,${navyDk} 100%);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:32px 28px 28px;position:relative;overflow:hidden;box-sizing:border-box;">
      <div style="position:absolute;inset:10px;border:1px solid rgba(255,255,255,0.15);border-radius:4px;pointer-events:none;"></div>
      <div style="position:absolute;inset:14px;border:0.5px solid rgba(255,255,255,0.08);border-radius:3px;pointer-events:none;"></div>
      <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(26,127,168,0.12);"></div>
      <div style="position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;border-radius:50%;border:1px solid rgba(26,127,168,0.08);"></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;z-index:1;padding-top:8px;">
        <div style="width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.3)"/><path d="M9 12l2 2 4-4" stroke="${blue}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div style="font-size:9px;font-family:sans-serif;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.5);text-transform:uppercase;">United Kingdom</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;z-index:1;">
        <div style="font-size:26px;font-weight:800;font-family:sans-serif;letter-spacing:-0.03em;color:#fff;line-height:1;">enable<span style="color:${lblue};">D</span></div>
        <div style="width:80px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);"></div>
        <div style="font-size:20px;font-family:Georgia,serif;font-weight:400;color:rgba(255,255,255,0.92);letter-spacing:0.04em;text-align:center;line-height:1.3;">Accessibility<br/>Passport</div>
        <div style="font-size:9px;font-family:sans-serif;font-weight:600;letter-spacing:0.14em;color:rgba(255,255,255,0.4);text-transform:uppercase;">Workplace Adjustment Record</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;z-index:1;padding-bottom:8px;">
        <div style="font-size:11px;font-family:sans-serif;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.06em;">${data.holder.fullName.toUpperCase()}</div>
        <div style="font-size:9px;color:rgba(255,255,255,0.3);font-family:sans-serif;letter-spacing:0.08em;">${data.passportNumber}</div>
      </div>
      ${pl(1, true)}
    </div>`;

  // ── Page 2 — Personal Details ─────────────────────────────────────────

  const h     = data.holder;
  const issd  = new Date(h.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const vutil = new Date(new Date(h.issueDate).setFullYear(new Date(h.issueDate).getFullYear() + 2))
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const p2 = `
    <div style="width:${W}px;height:${H}px;background:#fff;display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:16px;box-sizing:border-box;">
      ${hdr('Personal Details', 'Page 2')}
      <div style="display:flex;gap:16px;">
        ${h.avatarUrl
          ? `<div style="width:88px;height:110px;border-radius:4px;border:1.5px solid #C4CDD5;flex-shrink:0;overflow:hidden;"><img src="${h.avatarUrl}" alt="Profile" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" /></div>`
          : `<div style="width:88px;height:110px;border-radius:4px;background:${bd};border:1.5px solid #C4CDD5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex-shrink:0;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="${tm}"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="${tm}"/></svg><span style="font-size:9px;color:${tm};font-family:sans-serif;font-weight:600;">PHOTO</span></div>`
        }
        <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
          ${fi('Full name', h.fullName)}
          ${h.jobTitle   ? fi('Job title',  h.jobTitle)   : ''}
          ${h.department ? fi('Department', h.department) : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
        ${fi('Passport No.', data.passportNumber)}
        ${fi('Date issued',  issd)}
        ${fi('Valid until',  vutil)}
        ${fi('Status',       'Active')}
      </div>
      ${mrz(h.fullName, data.passportNumber)}
      ${pl(2)}
    </div>`;

  // ── Page 3 — Conditions ───────────────────────────────────────────────

  const condRows = data.disabilities.length === 0
    ? `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:${tm};font-size:11px;font-family:sans-serif;">No conditions recorded</div>`
    : data.disabilities.map((c, i) => {
        const since = c.created_at ? new Date(c.created_at).getFullYear().toString() : '';
        return `
          <div style="background:#fff;border:1px solid ${bd};border-radius:6px;padding:10px 12px;display:flex;align-items:flex-start;gap:10px;">
            <div style="width:28px;height:28px;border-radius:50%;background:${navy};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
              <span style="font-size:11px;color:#fff;font-weight:700;font-family:sans-serif;">${i + 1}</span>
            </div>
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:700;color:${tp};font-family:sans-serif;line-height:1.3;margin-bottom:3px;">${c.disability_name}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${since      ? `<span style="font-size:9px;background:${bgf};color:${ts};padding:2px 6px;border-radius:3px;font-family:sans-serif;font-weight:600;">Since ${since}</span>` : ''}
                ${c.category ? `<span style="font-size:9px;background:${bgf};color:${ts};padding:2px 6px;border-radius:3px;font-family:sans-serif;font-weight:600;">${c.category}</span>` : ''}
                <span style="font-size:9px;background:rgba(0,120,103,0.1);color:#007867;padding:2px 6px;border-radius:3px;font-family:sans-serif;font-weight:700;">&#x2713; Verified</span>
              </div>
            </div>
          </div>`;
      }).join('');

  const p3 = `
    <div style="width:${W}px;height:${H}px;background:${bgp};display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:14px;box-sizing:border-box;">
      ${hdr('Conditions Summary', 'Page 3')}
      <p style="font-size:10px;color:${ts};line-height:1.6;font-family:sans-serif;margin:0;">Conditions listed here have been self-declared and may be supported by medical evidence held on file.</p>
      <div style="display:flex;flex-direction:column;gap:8px;flex:1;overflow:hidden;">${condRows}</div>
      <div style="font-size:9px;color:#C4CDD5;font-family:sans-serif;line-height:1.5;border-top:1px dashed ${bd};padding-top:8px;">Protected under the Equality Act 2010 · Confidential</div>
      ${pl(3)}
    </div>`;

  // ── Page 4 — Adjustments ──────────────────────────────────────────────

  const ADJ_R = [-3, 2.5, -1.5, 3, -2, 1.5, -3.5, 2];

  const adjRows = data.approvedAdjustments.length === 0
    ? `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:${tm};font-size:11px;font-family:sans-serif;">No adjustments recorded</div>`
    : data.approvedAdjustments.map((adj, i) => {
        const ds = adj.respondedAt
          ? new Date(adj.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : new Date(adj.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const rot = ADJ_R[i % ADJ_R.length];
        return `
          <div style="display:flex;align-items:center;gap:10px;background:${bgp};border:1px solid ${bd};border-radius:5px;padding:7px 10px;">
            <div style="width:22px;height:22px;border-radius:3px;background:${navy};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="font-size:8.5px;color:${lblue};font-family:sans-serif;font-weight:800;">A${i + 1}</span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:11px;font-weight:700;color:${tp};font-family:sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${adj.title || 'Untitled'}</div>
              <div style="font-size:9px;color:${tm};font-family:sans-serif;">${adj.adjustmentType || 'General'} · ${ds}</div>
            </div>
            ${smStamp(rot, ds, '#007867', 'rgba(0,120,103,0.08)')}
          </div>`;
      }).join('');

  const p4 = `
    <div style="width:${W}px;height:${H}px;background:#fff;display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:12px;box-sizing:border-box;">
      ${hdr('Adjustments', 'Page 4')}
      <div style="display:flex;flex-direction:column;gap:6px;flex:1;">${adjRows}</div>
      ${pl(4)}
    </div>`;

  // ── Page 5 — History ──────────────────────────────────────────────────

  type HistItem = { date: string; event: string; by: string; type: 'approved' | 'created' };
  const TC: Record<'approved' | 'created', string> = { approved: '#007867', created: '#006C9C' };
  const TI: Record<'approved' | 'created', string> = { approved: '&#x2713;', created: '&#9733;' };

  const histItems: HistItem[] = data.approvedAdjustments.map((adj, i): HistItem => ({
    date:  adj.respondedAt
      ? new Date(adj.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(adj.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    event: `A${i + 1} ${adj.title || 'Adjustment'} approved`,
    by:    adj.approverName || 'Approver',
    type:  'approved',
  }));
  const createdItem: HistItem = {
    date:  new Date(data.holder.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    event: 'Passport created',
    by:    data.holder.fullName,
    type:  'created',
  };
  const histAll = [createdItem, ...histItems].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const histRows = histAll.map((hItem, i) => {
    const col = TC[hItem.type];
    const ico = TI[hItem.type];
    return `
      <div style="display:flex;gap:10px;padding-bottom:10px;position:relative;">
        ${i < histAll.length - 1 ? `<div style="position:absolute;left:11px;top:22px;bottom:0;width:1px;background:${bd};"></div>` : ''}
        <div style="width:22px;height:22px;border-radius:50%;background:${col}18;border:1.5px solid ${col};display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;">
          <span style="font-size:8px;color:${col};font-weight:800;">${ico}</span>
        </div>
        <div style="flex:1;padding-top:3px;">
          <div style="font-size:11px;font-weight:600;color:${tp};font-family:sans-serif;line-height:1.3;">${hItem.event}</div>
          <div style="font-size:9px;color:${tm};font-family:sans-serif;margin-top:1px;">${hItem.date} · ${hItem.by}</div>
        </div>
      </div>`;
  }).join('');

  const p5 = `
    <div style="width:${W}px;height:${H}px;background:${bgp};display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:12px;box-sizing:border-box;">
      ${hdr('Approval History', 'Page 5')}
      <div style="flex:1;display:flex;flex-direction:column;">${histRows}</div>
      ${pl(5)}
    </div>`;

  // ── Page 6 — Emergency ────────────────────────────────────────────────

  const p6 = `
    <div style="width:${W}px;height:${H}px;background:#fff;display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:14px;box-sizing:border-box;">
      <div style="background:linear-gradient(90deg,#B71D18,#FF5630);border-radius:4px;padding:8px 14px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span style="font-size:14px;color:#fff;">&#9888;</span>
        <span style="font-size:10px;font-weight:700;letter-spacing:.12em;color:#fff;text-transform:uppercase;font-family:sans-serif;">Emergency &amp; Medical</span>
      </div>
      <div style="background:#FFF4F2;border:1px solid #FFAC82;border-radius:6px;padding:10px 12px;">
        <div style="font-size:10px;font-weight:700;color:#B71D18;margin-bottom:6px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;">Emergency Contact</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
          ${fi('Name', 'Not provided')} ${fi('Relation', '—')} ${fi('Phone', 'Update via HR')}
        </div>
      </div>
      <div style="background:${bgf};border:1px solid ${bd};border-radius:6px;padding:10px 12px;">
        <div style="font-size:10px;font-weight:700;color:#454F5B;margin-bottom:6px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;">GP / Medical</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
          ${fi('GP name', 'Not provided')} ${fi('Practice', '—')} ${fi('Phone', 'Update via HR')}
        </div>
      </div>
      <div style="flex:1;background:#FFFBF0;border:1px solid #FFD666;border-radius:6px;padding:10px 12px;">
        <div style="font-size:10px;font-weight:700;color:#B76E00;margin-bottom:6px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;">Important Notes</div>
        <p style="font-size:11px;color:#454F5B;line-height:1.6;margin:0;font-family:sans-serif;">Emergency and medical details can be updated by contacting your HR team. This section helps first responders and colleagues understand any health considerations relevant to your workplace.</p>
      </div>
      ${pl(6)}
    </div>`;

  // ── Page 7 — Notes ────────────────────────────────────────────────────

  const challenges = data.challenges || [];
  const notesText  = challenges.length > 0
    ? challenges.map((c) => c.description).join('. ')
    : 'No supporting notes have been added yet. Use the Manage Challenges section from the passport page to record things you find challenging or preferences that help you work effectively.';
  const issuedStr  = new Date(data.holder.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const updatedStr = new Date(data.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const sigLines = ['Manager acknowledgement:', 'HR sign-off:', 'Review date:'].map(l => `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:10px;color:${ts};font-family:sans-serif;font-weight:600;min-width:140px;">${l}</span>
      <div style="flex:1;border-bottom:1px solid #C4CDD5;"></div>
    </div>`).join('');

  const p7 = `
    <div style="width:${W}px;height:${H}px;background:#FFFEF8;display:flex;flex-direction:column;padding:24px 22px 32px;position:relative;gap:14px;box-sizing:border-box;">
      <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(transparent,transparent 27px,#e8e4d4 27px,#e8e4d4 28px);background-position:0 72px;opacity:0.4;pointer-events:none;"></div>
      ${hdr('Supporting Notes')}
      <div style="flex:1;position:relative;z-index:1;">
        <p style="font-size:12px;color:#454F5B;line-height:1.8;font-family:sans-serif;margin:0;">${notesText}</p>
        <div style="margin-top:20px;display:flex;flex-direction:column;gap:4px;">${sigLines}</div>
      </div>
      <div style="display:flex;gap:16px;justify-content:flex-end;z-index:1;">
        ${stamp(-4, 'ISSUED',  issuedStr,  '#007867', 'rgba(0,120,103,0.08)')}
        ${stamp( 3, 'RENEWED', updatedStr, '#006C9C', 'rgba(0,108,156,0.07)')}
      </div>
      ${pl(7)}
    </div>`;

  // ── Page 8 — Back Cover ───────────────────────────────────────────────

  const p8 = `
    <div style="width:${W}px;height:${H}px;background:linear-gradient(160deg,${navy} 0%,${navyDk} 100%);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:32px 28px 28px;position:relative;overflow:hidden;box-sizing:border-box;">
      <div style="position:absolute;inset:10px;border:1px solid rgba(255,255,255,0.15);border-radius:4px;pointer-events:none;"></div>
      <div style="position:absolute;inset:14px;border:0.5px solid rgba(255,255,255,0.08);border-radius:3px;pointer-events:none;"></div>
      <div style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);opacity:0.05;pointer-events:none;">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#fff"/></svg>
      </div>
      <div></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;z-index:1;">
        <div style="font-size:10px;font-family:sans-serif;font-weight:600;letter-spacing:0.14em;color:rgba(255,255,255,0.4);text-transform:uppercase;text-align:center;">This passport is the property of</div>
        <div style="font-size:14px;font-family:Georgia,serif;color:rgba(255,255,255,0.75);letter-spacing:0.06em;">${data.holder.fullName}</div>
        <div style="width:60px;height:1px;background:rgba(255,255,255,0.15);"></div>
        <div style="font-size:9.5px;font-family:sans-serif;color:rgba(255,255,255,0.35);line-height:1.7;text-align:center;max-width:180px;">If found, please return to HR.<br/>All information is confidential<br/>under the Equality Act 2010.</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;z-index:1;">
        <span style="font-size:16px;font-weight:800;font-family:sans-serif;letter-spacing:-0.03em;color:rgba(255,255,255,0.4);">enable<span style="color:rgba(126,207,234,0.5);">D</span></span>
        <div style="font-size:9px;color:rgba(255,255,255,0.2);font-family:sans-serif;letter-spacing:0.08em;">www.getenabled.co.uk</div>
      </div>
      ${pl(8, true)}
    </div>`;

  return [
    { id: 'cover',       html: p1 },
    { id: 'personal',    html: p2 },
    { id: 'conditions',  html: p3 },
    { id: 'adjustments', html: p4 },
    { id: 'history',     html: p5 },
    { id: 'emergency',   html: p6 },
    { id: 'notes',       html: p7 },
    { id: 'back-cover',  html: p8 },
  ];
}

