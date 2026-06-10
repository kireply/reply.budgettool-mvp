import type { Lang } from '../translations';

// Inline SVG flags: emoji flags don't render on Windows browsers, so we draw them.
// 20×14 (10:7), rounded corners via clipPath.

interface FlagProps {
  lang: Lang;
  size?: number;
}

export default function Flag({ lang, size = 20 }: FlagProps) {
  const w = size;
  const h = (size * 7) / 10;
  const clipId = `flag-clip-${lang}`;

  return (
    <svg width={w} height={h} viewBox="0 0 20 14" style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {lang === 'it' && (
          <>
            <rect width="20" height="14" fill="#FFFFFF" />
            <rect width="6.67" height="14" fill="#009246" />
            <rect x="13.33" width="6.67" height="14" fill="#CE2B37" />
          </>
        )}
        {lang === 'en' && (
          <>
            <rect width="20" height="14" fill="#012169" />
            <path d="M0 0 L20 14 M20 0 L0 14" stroke="#FFFFFF" strokeWidth="2.8" />
            <path d="M0 0 L20 14 M20 0 L0 14" stroke="#C8102E" strokeWidth="1.2" />
            <path d="M10 0 V14 M0 7 H20" stroke="#FFFFFF" strokeWidth="4.6" />
            <path d="M10 0 V14 M0 7 H20" stroke="#C8102E" strokeWidth="2.6" />
          </>
        )}
        {lang === 'fr' && (
          <>
            <rect width="20" height="14" fill="#FFFFFF" />
            <rect width="6.67" height="14" fill="#002395" />
            <rect x="13.33" width="6.67" height="14" fill="#ED2939" />
          </>
        )}
        {lang === 'de' && (
          <>
            <rect width="20" height="4.67" fill="#000000" />
            <rect y="4.67" width="20" height="4.67" fill="#DD0000" />
            <rect y="9.33" width="20" height="4.67" fill="#FFCE00" />
          </>
        )}
      </g>
      <rect width="20" height="14" rx="2" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    </svg>
  );
}
