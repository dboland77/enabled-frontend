import { forwardRef } from 'react';

import Link from '@mui/material/Link';

import styles from './logo.module.css';

export interface LogoProps {
  disabledLink?: boolean;
  /** Show the compact eD icon mark instead of the full wordmark */
  compact?: boolean;
  /** Hide the Beta badge (e.g. in footers, print) */
  hideBeta?: boolean;
  /** 'lg' renders a larger wordmark for prominent placements like the login screen */
  size?: 'md' | 'lg';
  /** White wordmark for use on dark/coloured backgrounds */
  light?: boolean;
  className?: string;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, compact = false, hideBeta = false, size = 'md', light = false, className }, ref) => {

    // ── eD icon mark — compact / collapsed sidebar ─────────────
    const iconMark = (
      <div ref={ref} className={`${styles.iconMark}${className ? ` ${className}` : ''}`}>
        <span className={styles.iconMarkText}>
          <span className={styles.e}>e</span>D
        </span>
      </div>
    );

    // ── Full wordmark ──────────────────────────────────────────
    const textClass = [
      styles.wordmarkText,
      size === 'lg' ? styles.wordmarkLg : styles.wordmarkMd,
      light ? styles.wordmarkLight : '',
    ].filter(Boolean).join(' ');

    const wordmark = (
      <div ref={ref} className={`${styles.wordmark}${className ? ` ${className}` : ''}`}>
        <span className={textClass}>
          enable<span className={styles.cap}>D</span>
        </span>

        {/* Beta badge — remove this element entirely when platform exits beta */}
        {!hideBeta && <span className={styles.betaBadge}>Beta</span>}
      </div>
    );

    const logo = compact ? iconMark : wordmark;

    if (disabledLink) return logo;

    return (
      <Link href="/" className={styles.link}>
        {logo}
      </Link>
    );
  }
);

Logo.displayName = 'Logo';
export default Logo;
