import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export function LogoMark({ size = 36, inverse = false }) {
  const tile = inverse ? '#F2B33D' : '#1F4D36';
  const awning = inverse ? '#1F4D36' : '#F2B33D';
  const front = inverse ? '#1F4D36' : '#F7F3EC';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={tile} />
      <path
        d="M8.5 8h15l2.5 6.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0Z"
        fill={awning}
      />
      <path d="M8.5 17.5V25h15v-7.5" fill="none" stroke={front} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 25v-4h4v4" fill="none" stroke={front} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

LogoMark.propTypes = { size: PropTypes.number, inverse: PropTypes.bool };

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="RetailStore home">
      <span className="transition-transform duration-300 group-hover:-rotate-6">
        <LogoMark inverse={light} />
      </span>
      <span
        className={`font-display text-[22px] font-semibold leading-none tracking-tight ${
          light ? 'text-cream-50' : 'text-ink'
        }`}
      >
        retail<span className={`italic font-normal ${light ? 'text-marigold-300' : 'text-forest-600'}`}>store</span>
      </span>
    </Link>
  );
}

Logo.propTypes = {
  to: PropTypes.string,
  light: PropTypes.bool,
};
