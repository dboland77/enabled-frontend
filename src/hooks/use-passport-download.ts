'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@mui/material/styles';

import { IPassportData, getApproverInitials } from '@/types/passport';

// ----------------------------------------------------------------------

/**
 * Dynamically imports heavy libs so they don't affect initial bundle.
 */
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
  const theme = useTheme();
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async () => {
    if (!data) return;
    setDownloading(true);

    try {
      const { jsPDF, html2canvas } = await loadLibs();

      // Build a temporary off-screen container
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

      // Build the ordered list of page descriptors
      const pages = buildPageDescriptors(data, theme);

      for (let i = 0; i < pages.length; i++) {
        const { html } = pages[i];

        // Inject the page HTML
        container.innerHTML = html;
        container.style.height = `${RENDER_H_PX}px`;

        // Small delay to let the browser paint
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
  }, [data, theme]);

  return { download, downloading };
}

// ----------------------------------------------------------------------
// Build plain HTML strings for each page so html2canvas has no React overhead

function buildPageDescriptors(data: IPassportData, theme: ReturnType<typeof useTheme>) {
  const primary = theme.palette.primary.dark;
  const primaryMain = theme.palette.primary.main;
  const gold = '#D4AF37';
  const pageBg = '#FAF8F5';
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textDisabled = theme.palette.text.disabled;
  const successMain = theme.palette.success.main;

  const gridPattern = `
    repeating-linear-gradient(0deg,${primaryMain},${primaryMain} 1px,transparent 1px,transparent 20px),
    repeating-linear-gradient(90deg,${primaryMain},${primaryMain} 1px,transparent 1px,transparent 20px)
  `;

  // ------------------------------------------------------------------
  // Reusable builders

  const coverHtml = (variant: 'front' | 'back') => `
    <div style="
      width:${RENDER_W_PX}px;height:${RENDER_H_PX}px;
      background:linear-gradient(145deg,${primary} 0%,${theme.palette.primary.darker} 100%);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      position:relative;overflow:hidden;padding:40px;box-sizing:border-box;
    ">
      <div style="position:absolute;inset:0;opacity:0.08;
        background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.1) 2px,rgba(255,255,255,0.1) 4px)">
      </div>
      <div style="position:absolute;top:24px;left:24px;right:24px;height:2px;background:${gold};opacity:0.7;border-radius:1px"></div>
      ${variant === 'front' ? `
        <div style="width:100px;height:100px;border-radius:50%;border:3px solid ${gold};
          display:flex;align-items:center;justify-content:center;margin-bottom:32px;
          background:rgba(212,175,55,0.1)">
          <div style="width:76px;height:76px;border-radius:50%;border:2px solid ${gold};
            display:flex;align-items:center;justify-content:center;font-size:36px">
            ♿
          </div>
        </div>
        <div style="color:${gold};font-size:22px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.4)">Reasonable</div>
        <div style="color:${gold};font-size:22px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.4)">Adjustments</div>
        <div style="color:${gold};font-size:28px;font-weight:800;letter-spacing:6px;text-transform:uppercase;text-shadow:0 2px 4px rgba(0,0,0,0.5)">Passport</div>
        <div style="width:60%;height:1px;background:${gold};opacity:0.5;margin:24px 0 16px"></div>
        <div style="color:${gold};opacity:0.7;font-size:12px;letter-spacing:2px;text-transform:uppercase">Official Document</div>
      ` : `
        <div style="text-align:center">
          <div style="color:${gold};opacity:0.8;font-size:12px;letter-spacing:1px;margin-bottom:8px">For assistance contact your</div>
          <div style="color:${gold};font-size:14px;font-weight:600;letter-spacing:1px">HR Department</div>
        </div>
        <div style="position:absolute;bottom:32px;color:${gold};opacity:0.6;font-size:11px;letter-spacing:1px">Powered by Enabled</div>
      `}
      <div style="position:absolute;bottom:24px;left:24px;right:24px;height:2px;background:${gold};opacity:0.7;border-radius:1px"></div>
    </div>
  `;

  const insideCoverHtml = (variant: 'front' | 'back') => `
    <div style="
      width:${RENDER_W_PX}px;height:${RENDER_H_PX}px;background:${pageBg};
      padding:40px;box-sizing:border-box;position:relative;overflow:hidden;
    ">
      <div style="position:absolute;inset:0;opacity:0.03;background:${gridPattern}"></div>
      <div style="text-align:center;padding-bottom:20px;margin-bottom:24px;border-bottom:1px solid rgba(0,0,0,0.1)">
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${primary};font-weight:600">
          ${variant === 'front' ? 'Important Notice' : 'Notes'}
        </div>
      </div>
      ${variant === 'front' ? `
        <div style="background:rgba(0,0,0,0.04);border-radius:8px;padding:20px;font-size:11px;line-height:1.6;color:${textSecondary}">
          This Reasonable Adjustments Passport is an official document confirming approved workplace adjustments.
          Present this document to HR, line managers, or relevant authorities when required.
          The adjustments listed are legally approved accommodations under applicable equality legislation.
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[1,2,3,4,5,6,7].map(() => `<div style="height:1px;background:rgba(0,0,0,0.1)"></div><div style="height:28px"></div>`).join('')}
        </div>
      `}
    </div>
  `;

  const personalPageHtml = () => {
    const { holder, passportNumber, approvedAdjustments } = data;
    const issueDate = new Date(holder.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const initial = (holder.fullName || 'U').charAt(0).toUpperCase();
    return `
      <div style="
        width:${RENDER_W_PX}px;height:${RENDER_H_PX}px;background:${pageBg};
        padding:40px;box-sizing:border-box;position:relative;overflow:hidden;
      ">
        <div style="position:absolute;inset:0;opacity:0.03;background:${gridPattern}"></div>
        <div style="text-align:center;padding-bottom:16px;margin-bottom:24px;border-bottom:1px solid rgba(0,0,0,0.1)">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${primary};font-weight:600">Personal Information</div>
        </div>
        <div style="display:flex;gap:24px;margin-bottom:32px">
          <div style="width:110px;height:140px;border:2px solid rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;
            background:white;flex-shrink:0;font-size:40px;font-weight:700;color:${primary}">
            ${initial}
          </div>
          <div style="flex:1">
            <div style="margin-bottom:16px">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Full Name</div>
              <div style="font-size:16px;font-weight:700;color:${textPrimary}">${holder.fullName || 'Not specified'}</div>
            </div>
            <div>
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Email</div>
              <div style="font-size:12px;color:${textPrimary}">${holder.email}</div>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Passport No.</div>
            <div style="font-size:13px;font-weight:700;color:${primary};font-family:monospace">${passportNumber}</div>
          </div>
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Issue Date</div>
            <div style="font-size:13px;font-weight:600;color:${textPrimary}">${issueDate}</div>
          </div>
        </div>
        <div style="background:rgba(0,128,0,0.08);border:1px solid rgba(0,128,0,0.2);border-radius:8px;padding:16px">
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:6px">Approved Adjustments</div>
          <div style="font-size:36px;font-weight:800;color:${primaryMain}">${approvedAdjustments.length}</div>
        </div>
        <div style="position:absolute;bottom:16px;right:20px;font-size:10px;color:${textDisabled}">1</div>
      </div>
    `;
  };

  const adjustmentPageHtml = (adj: IPassportData['approvedAdjustments'][number], pageNumber: number) => {
    const approvedDate = adj.respondedAt
      ? new Date(adj.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date(adj.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const initials = getApproverInitials(adj.approverName);
    // Deterministic rotation based on id
    const hash = adj.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const rot = (hash % 11) - 5;

    return `
      <div style="
        width:${RENDER_W_PX}px;height:${RENDER_H_PX}px;background:${pageBg};
        padding:32px;box-sizing:border-box;position:relative;overflow:hidden;
      ">
        <div style="position:absolute;inset:0;opacity:0.03;background:${gridPattern}"></div>
        <div style="text-align:center;padding-bottom:12px;margin-bottom:20px;border-bottom:1px solid rgba(0,0,0,0.1)">
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${primary};font-weight:600">Approved Adjustment</div>
        </div>
        <div style="font-size:17px;font-weight:700;color:${textPrimary};margin-bottom:12px;line-height:1.3">${adj.title || 'Untitled Adjustment'}</div>
        ${adj.adjustmentType ? `
          <div style="display:inline-block;background:rgba(0,128,0,0.1);color:${primary};
            font-size:10px;padding:3px 10px;border-radius:20px;margin-bottom:16px;font-weight:600">
            ${adj.adjustmentType}
          </div>` : ''}
        ${adj.detail ? `
          <div style="margin-bottom:16px">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:4px">Details</div>
            <div style="font-size:12px;color:${textPrimary};line-height:1.5">${adj.detail.substring(0, 240)}${adj.detail.length > 240 ? '...' : ''}</div>
          </div>` : ''}
        <div style="display:flex;gap:24px;margin-bottom:16px">
          ${adj.location ? `
            <div style="flex:1">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Location</div>
              <div style="font-size:12px;color:${textPrimary}">${adj.location}</div>
            </div>` : ''}
          ${adj.workfunction ? `
            <div style="flex:1">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Work Function</div>
              <div style="font-size:12px;color:${textPrimary}">${adj.workfunction}</div>
            </div>` : ''}
        </div>
        <div style="background:rgba(0,200,0,0.07);border:1px solid rgba(0,200,0,0.2);border-radius:8px;padding:12px;
          display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Approved By</div>
            <div style="font-size:13px;font-weight:600;color:${textPrimary}">${adj.approverName || 'Authorized Approver'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${textSecondary};margin-bottom:3px">Date</div>
            <div style="font-size:13px;font-weight:600;color:${textPrimary}">${approvedDate}</div>
          </div>
        </div>

        <!-- Stamp -->
        <div style="
          position:absolute;bottom:40px;right:32px;
          width:80px;height:80px;
          transform:rotate(${rot}deg);
          border:3px solid rgba(185,28,28,0.7);
          border-radius:50%;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          opacity:0.85;
        ">
          <div style="
            position:absolute;inset:4px;border:1.5px dashed rgba(185,28,28,0.5);border-radius:50%
          "></div>
          <div style="font-size:7px;font-weight:800;color:rgb(185,28,28);letter-spacing:1.5px;text-transform:uppercase">APPROVED</div>
          <div style="font-size:14px;font-weight:800;color:rgb(185,28,28);letter-spacing:1px">${initials}</div>
          <div style="font-size:7px;color:rgb(185,28,28);font-family:monospace">${approvedDate}</div>
        </div>

        <div style="position:absolute;bottom:16px;left:20px;font-size:10px;color:${textDisabled}">${pageNumber}</div>
      </div>
    `;
  };

  return [
    { id: 'front-cover', html: coverHtml('front') },
    { id: 'inside-front', html: insideCoverHtml('front') },
    { id: 'personal', html: personalPageHtml() },
    ...data.approvedAdjustments.map((adj, i) => ({
      id: adj.id,
      html: adjustmentPageHtml(adj, i + 2),
    })),
    { id: 'inside-back', html: insideCoverHtml('back') },
    { id: 'back-cover', html: coverHtml('back') },
  ];
}
