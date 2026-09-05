import PropTypes from 'prop-types';

// Categorical palette (up to 8 distinct shops). Hex so it works in SVG stroke.
export const PALETTE = [
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#059669', // emerald-600
  '#db2777', // pink-600
  '#d97706', // amber-600
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#0d9488', // teal-600
];

/**
 * Dependency-free SVG donut chart with legend.
 * data: [{ id, label, value }]  — slices are value / total.
 */
export default function DonutChart({ data = [], formatValue = (v) => String(v), centerLabel, centerValue }) {
  const rows = (Array.isArray(data) ? data : []).filter((d) => (Number(d.value) || 0) > 0);
  const total = rows.reduce((s, d) => s + (Number(d.value) || 0), 0);

  if (total <= 0) {
    return <p className="text-center text-slate-400 text-sm py-8">No revenue in the selected period.</p>;
  }

  const size = 180;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  let acc = 0;
  const slices = rows.map((d, i) => {
    const value = Number(d.value) || 0;
    const frac = value / total;
    const slice = {
      ...d,
      value,
      frac,
      color: PALETTE[i % PALETTE.length],
      dash: `${frac * C} ${C - frac * C}`,
      offset: -acc * C,
    };
    acc += frac;
    return slice;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {slices.map((s) => (
            <circle
              key={s.id ?? s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
            />
          ))}
        </g>
        {(centerValue || centerLabel) && (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-800 font-extrabold" style={{ fontSize: 18 }}>
              {centerValue}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-400 font-semibold" style={{ fontSize: 10 }}>
              {centerLabel}
            </text>
          </>
        )}
      </svg>

      <ul className="flex-1 w-full space-y-1.5">
        {slices.map((s) => (
          <li key={`lg-${s.id ?? s.label}`} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="font-semibold text-slate-700 truncate flex-1" title={s.label}>
              {s.label}
            </span>
            <span className="font-bold text-slate-800 tabular-nums">{formatValue(s.value)}</span>
            <span className="w-12 text-right font-medium text-slate-400 tabular-nums">
              {(s.frac * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

DonutChart.propTypes = {
  data: PropTypes.array,
  formatValue: PropTypes.func,
  centerLabel: PropTypes.string,
  centerValue: PropTypes.string,
};
