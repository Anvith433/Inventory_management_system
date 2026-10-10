import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * Section wrapper for every analytics panel. Renders title/subtitle + optional
 * toolbar, and centralizes the loading / error / empty states so a single
 * failed endpoint degrades to an inline message instead of crashing the page.
 *
 * States (checked in order): loading -> error -> empty -> children.
 */
export default function Panel({
  title,
  subtitle,
  icon,
  toolbar,
  loading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyText = 'No data available.',
  className = '',
  children,
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-ink-soft">
              {typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon}
            </span>
          )}
          <div>
            <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      <div className="min-h-[120px]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-300 border-t-forest-700" />
            Loading…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm font-semibold text-tomato-600">Couldn’t load this section.</p>
            <p className="max-w-md break-words text-xs text-ink-muted">{String(error)}</p>
            {onRetry && (
              <button onClick={onRetry} className="btn btn-outline btn-sm mt-1">
                <Icon name="refresh" size={13} />
                Retry
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <p className="py-10 text-center text-sm text-ink-muted">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

Panel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  toolbar: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onRetry: PropTypes.func,
  isEmpty: PropTypes.bool,
  emptyText: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
