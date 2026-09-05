// Number / currency formatting helpers for the admin BI dashboard.
// Indian locale (en-IN) gives lakh/crore digit grouping, e.g. ₹2,72,865.

const inrFmt = (decimals) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Full rupee amount, e.g. inr(272865) -> "₹2,72,865". */
export function inr(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₹0';
  return inrFmt(decimals).format(n);
}

/** Plain grouped integer, e.g. num(3169) -> "3,169". */
export function num(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-IN').format(n);
}

/** Percentage with fixed decimals, e.g. pct(31.12) -> "31.1%". */
export function pct(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0%';
  return `${n.toFixed(decimals)}%`;
}

/**
 * Compact rupee for chart axis labels using Indian scale (K / L / Cr).
 * e.g. compactInr(272865) -> "₹2.7L", compactInr(34900) -> "₹34.9K".
 */
export function compactInr(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

/** Tier -> Tailwind badge classes. */
export function tierClasses(tier) {
  switch ((tier || '').toUpperCase()) {
    case 'HIGH':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-rose-100 text-rose-700 border-rose-200';
  }
}
