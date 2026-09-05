import PropTypes from 'prop-types';

/**
 * Dependency-free horizontal bar chart (div/flex based, fully responsive).
 * Bars are sized relative to the max value. Optional row click for drill-down.
 *
 * data: [{ id, label, value, hint? }]
 */
export default function BarChartH({
  data = [],
  formatValue = (v) => String(v),
  barClass = 'bg-gradient-to-r from-cyan-500 to-blue-500',
  onSelect,
  emptyText = 'No data for the selected filters.',
}) {
  const rows = Array.isArray(data) ? data : [];
  const max = rows.reduce((m, d) => Math.max(m, Number(d.value) || 0), 0);

  if (rows.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-8">{emptyText}</p>;
  }

  return (
    <div className="space-y-2.5">
      {rows.map((d, i) => {
        const value = Number(d.value) || 0;
        const widthPct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
        const clickable = typeof onSelect === 'function';
        return (
          <div
            key={d.id ?? d.label ?? i}
            className={`group flex items-center gap-3 ${clickable ? 'cursor-pointer' : ''}`}
            onClick={clickable ? () => onSelect(d) : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(d);
                    }
                  }
                : undefined
            }
          >
            <div className="w-28 shrink-0 text-right text-xs font-semibold text-slate-600 truncate" title={d.label}>
              {d.label}
            </div>
            <div className="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden relative">
              <div
                className={`h-full rounded-lg ${barClass} transition-all duration-500 ${
                  clickable ? 'group-hover:brightness-110' : ''
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <div className="w-24 shrink-0 text-xs font-bold text-slate-800 tabular-nums">
              {formatValue(value)}
              {d.hint ? <span className="block text-[10px] font-medium text-slate-400">{d.hint}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

BarChartH.propTypes = {
  data: PropTypes.array,
  formatValue: PropTypes.func,
  barClass: PropTypes.string,
  onSelect: PropTypes.func,
  emptyText: PropTypes.string,
};
