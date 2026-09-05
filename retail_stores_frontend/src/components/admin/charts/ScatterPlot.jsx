import PropTypes from 'prop-types';
import { PALETTE } from './DonutChart';

/**
 * Dependency-free SVG scatter plot. Each point is one shop positioned by
 * (x = inventory value, y = revenue). Responsive via viewBox.
 *
 * data: [{ id, label, x, y }]
 */
export default function ScatterPlot({
  data = [],
  xLabel = 'X',
  yLabel = 'Y',
  formatX = (v) => String(v),
  formatY = (v) => String(v),
  onSelect,
}) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-8">No data for the selected filters.</p>;
  }

  const W = 480;
  const H = 320;
  const padL = 58;
  const padR = 24;
  const padT = 18;
  const padB = 46;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxX = Math.max(1, ...rows.map((d) => Number(d.x) || 0));
  const maxY = Math.max(1, ...rows.map((d) => Number(d.y) || 0));
  // Add 8% headroom so points aren't glued to the edges.
  const spanX = maxX * 1.08;
  const spanY = maxY * 1.08;

  const px = (v) => padL + ((Number(v) || 0) / spanX) * plotW;
  const py = (v) => padT + plotH - ((Number(v) || 0) / spanY) * plotH;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const clickable = typeof onSelect === 'function';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* gridlines + axis ticks */}
      {ticks.map((t) => {
        const gy = padT + plotH - t * plotH;
        const gx = padL + t * plotW;
        return (
          <g key={t}>
            <line x1={padL} y1={gy} x2={padL + plotW} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padL - 8} y={gy + 3} textAnchor="end" style={{ fontSize: 9 }} className="fill-slate-400">
              {formatY(t * spanY)}
            </text>
            <text x={gx} y={padT + plotH + 16} textAnchor="middle" style={{ fontSize: 9 }} className="fill-slate-400">
              {formatX(t * spanX)}
            </text>
          </g>
        );
      })}

      {/* axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#94a3b8" strokeWidth="1.5" />

      {/* axis labels */}
      <text x={padL + plotW / 2} y={H - 6} textAnchor="middle" style={{ fontSize: 11 }} className="fill-slate-500 font-semibold">
        {xLabel}
      </text>
      <text
        x={14}
        y={padT + plotH / 2}
        textAnchor="middle"
        style={{ fontSize: 11 }}
        className="fill-slate-500 font-semibold"
        transform={`rotate(-90 14 ${padT + plotH / 2})`}
      >
        {yLabel}
      </text>

      {/* points */}
      {rows.map((d, i) => {
        const cx = px(d.x);
        const cy = py(d.y);
        return (
          <g
            key={d.id ?? d.label ?? i}
            className={clickable ? 'cursor-pointer' : ''}
            onClick={clickable ? () => onSelect(d) : undefined}
          >
            <circle cx={cx} cy={cy} r="6" fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth="1.5">
              <title>{`${d.label}: ${yLabel} ${formatY(d.y)}, ${xLabel} ${formatX(d.x)}`}</title>
            </circle>
            <text x={cx + 9} y={cy + 3} style={{ fontSize: 9 }} className="fill-slate-600 font-medium">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

ScatterPlot.propTypes = {
  data: PropTypes.array,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  formatX: PropTypes.func,
  formatY: PropTypes.func,
  onSelect: PropTypes.func,
};
