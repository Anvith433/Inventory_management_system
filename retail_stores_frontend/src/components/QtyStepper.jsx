import PropTypes from 'prop-types';
import Icon from './Icon';

/** − qty + control shared by product cards, the basket drawer and checkout. */
export default function QtyStepper({ qty, onAdd, onRemove, busy = false, canAdd = true, size = 'md', className = '' }) {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  const w = size === 'sm' ? 'w-8' : 'w-10';
  return (
    <div
      className={`inline-flex ${h} items-center rounded-full bg-forest-700 text-cream-50 ${busy ? 'opacity-80' : ''} ${className}`}
    >
      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        className={`flex ${h} ${w} items-center justify-center rounded-full transition-colors hover:bg-forest-800 disabled:cursor-wait`}
        aria-label={qty <= 1 ? 'Remove from basket' : 'Remove one'}
      >
        <Icon name={qty <= 1 ? 'trash' : 'minus'} size={size === 'sm' ? 14 : 16} strokeWidth={2} />
      </button>
      <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular">{qty}</span>
      <button
        type="button"
        onClick={onAdd}
        disabled={busy || !canAdd}
        className={`flex ${h} ${w} items-center justify-center rounded-full transition-colors hover:bg-forest-800 disabled:opacity-40`}
        aria-label="Add one more"
      >
        <Icon name="plus" size={size === 'sm' ? 14 : 16} strokeWidth={2} />
      </button>
    </div>
  );
}

QtyStepper.propTypes = {
  qty: PropTypes.number.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  canAdd: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
};
