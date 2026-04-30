const s = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

const icons = {
  // ── 支出 ──
  food: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M3 11h18"/>
      <path d="M5 11c0 4.5 3.5 7.5 7 7.5s7-3 7-7.5"/>
      <path d="M8 4c0 1 .5 2.5 1 3.5"/>
      <path d="M12 4c0 1 .5 2.5 1 3.5"/>
      <path d="M16 4c0 1 .5 2.5 1 3.5"/>
    </svg>
  ),
  transport: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="2" y="9" width="20" height="8" rx="2.5"/>
      <path d="M4 9l2.5-4h11l2.5 4"/>
      <line x1="6" y1="17" x2="6" y2="17.01" strokeWidth="2.5"/>
      <line x1="18" y1="17" x2="18" y2="17.01" strokeWidth="2.5"/>
    </svg>
  ),
  shopping: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M6 7h12l1.5 13H4.5L6 7z"/>
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  entertainment: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="2" y="8" width="20" height="10" rx="4"/>
      <path d="M6 13.5h3.5"/>
      <path d="M7.75 11.75v3.5"/>
      <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="13.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  housing: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M3 11.5L12 4l9 7.5"/>
      <rect x="5" y="11.5" width="14" height="9.5" rx="1.5"/>
      <rect x="10" y="15" width="4" height="6" rx="0.5"/>
    </svg>
  ),
  bills: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M5 3h14v18l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V3h1z"/>
      <line x1="8" y1="7.5" x2="16" y2="7.5"/>
      <line x1="8" y1="11" x2="13" y2="11"/>
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="3" y="3" width="18" height="18" rx="3.5"/>
      <path d="M12 8v8"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M2 18V6c0-1 1.5-2 4-2h3l2 2h7c1.5 0 2 1 2 2v10c0 1-.5 2-2 2H6c-2.5 0-4-1-4-2z"/>
      <line x1="2" y1="18" x2="2" y2="6"/>
      <line x1="8" y1="10" x2="14" y2="10"/>
      <line x1="8" y1="13.5" x2="12" y2="13.5"/>
    </svg>
  ),
  travel: (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9"/>
      <ellipse cx="12" cy="12" rx="4" ry="9"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="5" y1="7.5" x2="19" y2="7.5"/>
      <line x1="5" y1="16.5" x2="19" y2="16.5"/>
    </svg>
  ),
  other_expense: (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="6" r="2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  ),

  // ── 收入 ──
  salary: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="2" y="6" width="20" height="14" rx="2.5"/>
      <path d="M2 10h20"/>
      <circle cx="17" cy="14.5" r="1.5"/>
      <line x1="6" y1="14.5" x2="10" y2="14.5"/>
    </svg>
  ),
  bonus: (
    <svg viewBox="0 0 24 24" {...s}>
      <polygon points="12,3 14.5,8.5 20.5,9 16,13.5 17.5,19.5 12,16.5 6.5,19.5 8,13.5 3.5,9 9.5,8.5"/>
    </svg>
  ),
  freelance: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="2" y="7" width="20" height="13" rx="2.5"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  investment: (
    <svg viewBox="0 0 24 24" {...s}>
      <polyline points="22,6 13.5,14.5 8.5,9.5 2,16"/>
      <polyline points="16,6 22,6 22,12"/>
    </svg>
  ),
  refund: (
    <svg viewBox="0 0 24 24" {...s}>
      <polyline points="1,4 1,10 7,10"/>
      <path d="M3.5 15a9 9 0 1 0 2.1-9.36L1 10"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="3" y="11" width="18" height="10" rx="1.5"/>
      <rect x="5" y="8" width="14" height="3" rx="1"/>
      <line x1="12" y1="8" x2="12" y2="21"/>
      <line x1="3" y1="14" x2="21" y2="14"/>
      <path d="M12 8c-2-3-6-1-4 1.5"/>
      <path d="M12 8c2-3 6-1 4 1.5"/>
    </svg>
  ),
  other_income: (
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

export default function CategoryIcon({ categoryId, size = 20, color = 'currentColor' }) {
  const icon = icons[categoryId];
  if (!icon) return <span>?</span>;
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, color }}>
      {icon}
    </span>
  );
}
