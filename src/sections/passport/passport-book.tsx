'use client';

import { useState, useCallback } from 'react';

import { IPassportData } from '@/types/passport';

import {
  CoverPage,
  PersonalPage,
  ConditionsPage,
  AdjustmentsPage,
  HistoryPage,
  EmergencyPage,
  NotesPage,
  BackCoverPage,
} from './passport-pages';

// ── CSS animation ─────────────────────────────────────────────────────────────

const FLIP_CSS = `
  @keyframes pp-out-fwd {
    from { transform: rotateY(0deg); }
    to   { transform: rotateY(-90deg); }
  }
  @keyframes pp-in-fwd {
    from { transform: rotateY(90deg); }
    to   { transform: rotateY(0deg); }
  }
  @keyframes pp-out-bck {
    from { transform: rotateY(0deg); }
    to   { transform: rotateY(90deg); }
  }
  @keyframes pp-in-bck {
    from { transform: rotateY(-90deg); }
    to   { transform: rotateY(0deg); }
  }
  .pp-out-fwd { animation: pp-out-fwd 0.18s ease-in  forwards; }
  .pp-in-fwd  { animation: pp-in-fwd  0.18s ease-out both; }
  .pp-out-bck { animation: pp-out-bck 0.18s ease-in  forwards; }
  .pp-in-bck  { animation: pp-in-bck  0.18s ease-out both; }
`;

// ── Page registry ─────────────────────────────────────────────────────────────

const PAGES = [
  { id: 'cover',       label: 'Cover',       Component: CoverPage },
  { id: 'personal',    label: 'Personal',    Component: PersonalPage },
  { id: 'conditions',  label: 'Conditions',  Component: ConditionsPage },
  { id: 'adjustments', label: 'Adjustments', Component: AdjustmentsPage },
  { id: 'history',     label: 'History',     Component: HistoryPage },
  { id: 'emergency',   label: 'Emergency',   Component: EmergencyPage },
  { id: 'notes',       label: 'Notes',       Component: NotesPage },
  { id: 'back',        label: 'Back',        Component: BackCoverPage },
] as const;

const BOOK_W = 320;
const BOOK_H = 460;

// ── Component ─────────────────────────────────────────────────────────────────

interface PassportBookProps {
  data:    IPassportData;
  scale?:  number;
  /** Legacy prop — no longer used, kept for API compatibility */
  onPdfRef?: (ref: HTMLDivElement | null) => void;
}

export default function PassportBook({ data, scale = 1 }: PassportBookProps) {
  const [current,   setCurrent]   = useState(0);
  const [animClass, setAnimClass] = useState('');

  const goTo = useCallback(
    (idx: number) => {
      if (idx === current || animClass) return;
      const fwd    = idx > current;
      const outCls = fwd ? 'pp-out-fwd' : 'pp-out-bck';
      const inCls  = fwd ? 'pp-in-fwd'  : 'pp-in-bck';
      setAnimClass(outCls);
      setTimeout(() => {
        setCurrent(idx);
        setAnimClass(inCls);
        setTimeout(() => setAnimClass(''), 180);
      }, 180);
    },
    [current, animClass]
  );

  const prev = () => goTo(Math.max(0, current - 1));
  const next = () => goTo(Math.min(PAGES.length - 1, current + 1));

  const { Component } = PAGES[current];

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        transform: `scale(${scale})`,
        transformOrigin: 'center top',
        // Reserve layout space when scaled up so parent layout doesn't collapse
        width:  BOOK_W,
        height: BOOK_H + 80,
      }}
    >
      <style>{FLIP_CSS}</style>

      {/* Passport booklet */}
      <div style={{ perspective: 1200 }}>
        <div
          className={animClass || undefined}
          style={{
            width: BOOK_W, height: BOOK_H,
            borderRadius: '3px 8px 8px 3px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15), 4px 0 8px rgba(0,0,0,0.12), -2px 0 4px rgba(0,0,0,0.1), 0 20px 60px rgba(0,0,0,0.25)',
            position: 'relative', overflow: 'hidden',
            userSelect: 'none',
            borderLeft: '6px solid #0d1722',
          }}
        >
          <Component data={data} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={prev}
          disabled={current === 0}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1.5px solid #DFE3E8',
            background: current === 0 ? '#F4F6F8' : '#fff',
            cursor: current === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: current === 0 ? '#C4CDD5' : '#212B36',
            boxShadow: current > 0 ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all .15s',
          }}
        >
          ‹
        </button>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 5 }}>
          {PAGES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              title={p.label}
              style={{
                width: i === current ? 20 : 7, height: 7, borderRadius: 4,
                border: 'none',
                background: i === current ? '#1a7fa8' : '#DFE3E8',
                cursor: 'pointer', padding: 0,
                transition: 'all .2s',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === PAGES.length - 1}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1.5px solid #DFE3E8',
            background: current === PAGES.length - 1 ? '#F4F6F8' : '#fff',
            cursor: current === PAGES.length - 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: current === PAGES.length - 1 ? '#C4CDD5' : '#212B36',
            boxShadow: current < PAGES.length - 1 ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all .15s',
          }}
        >
          ›
        </button>
      </div>

      {/* Page label */}
      <div style={{ fontSize: 11, color: '#919EAB', fontFamily: "'DM Sans',sans-serif" }}>
        {PAGES[current].label} · {current + 1} of {PAGES.length}
      </div>
    </div>
  );
}
