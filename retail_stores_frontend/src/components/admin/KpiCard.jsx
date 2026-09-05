import PropTypes from 'prop-types';

const ACCENTS = {
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  violet: 'from-violet-500 to-purple-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  slate: 'from-slate-500 to-slate-600',
};

/** Compact executive KPI tile. */
export default function KpiCard({ label, value, sublabel, icon, accent = 'cyan', loading = false }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-lg shadow-slate-200/50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span
          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${ACCENTS[accent] || ACCENTS.cyan} text-white flex items-center justify-center text-sm shadow`}
        >
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-black text-slate-900 tabular-nums leading-tight">{value}</p>
      )}
      {sublabel ? <p className="text-xs font-medium text-slate-400">{sublabel}</p> : null}
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  sublabel: PropTypes.string,
  icon: PropTypes.node,
  accent: PropTypes.string,
  loading: PropTypes.bool,
};
