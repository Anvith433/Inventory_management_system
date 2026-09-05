import PropTypes from 'prop-types';

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
    <section
      className={`bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl shadow-slate-200/50 p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {toolbar && <div className="flex items-center gap-2 flex-wrap">{toolbar}</div>}
      </div>

      <div className="min-h-[120px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-cyan-500 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="text-sm font-semibold text-rose-600">Couldn’t load this section.</p>
            <p className="text-xs text-slate-400 max-w-md break-words">{String(error)}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <p className="text-center text-slate-400 text-sm py-10">{emptyText}</p>
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
