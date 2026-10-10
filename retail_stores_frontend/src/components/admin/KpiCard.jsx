import PropTypes from 'prop-types';
import Icon from '../Icon';

const ACCENTS = {
  cyan: 'bg-[#E0ECEE] text-[#2F5F69]',
  emerald: 'bg-forest-50 text-forest-700',
  violet: 'bg-[#E9E1F0] text-[#5F3F7A]',
  amber: 'bg-marigold-100 text-marigold-700',
  rose: 'bg-tomato-50 text-tomato-600',
  slate: 'bg-cream-200 text-ink-soft',
};

/** Compact executive KPI tile. `icon` is an Icon name. */
export default function KpiCard({ label, value, sublabel, icon, accent = 'cyan', loading = false }) {
  return (
    <div className="card flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ACCENTS[accent] || ACCENTS.cyan}`}>
          {typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon}
        </span>
      </div>
      {loading ? (
        <div className="skeleton h-8 w-28" />
      ) : (
        <p className="font-display text-[26px] font-semibold leading-none tracking-tight text-ink tabular">{value}</p>
      )}
      {sublabel ? <p className="text-xs text-ink-muted">{sublabel}</p> : null}
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
