import { createContext, useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../components/Icon';

const ToastContext = createContext(() => {});

const TONES = {
  default: { cls: 'bg-ink text-cream-50', icon: 'check' },
  success: { cls: 'bg-forest-700 text-cream-50', icon: 'check' },
  error: { cls: 'bg-tomato-600 text-white', icon: 'alert' },
};

/**
 * Small toast queue that replaces the old window.alert() calls.
 * Usage: const toast = useToast(); toast('Added to basket', { tone: 'success' });
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, { tone = 'default', duration = 2800 } = {}) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const tone = TONES[t.tone] || TONES.default;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-full py-2.5 pl-3 pr-4 text-sm font-medium shadow-lift animate-rise-in ${tone.cls}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Icon name={tone.icon} size={14} strokeWidth={2.5} />
              </span>
              <span>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
