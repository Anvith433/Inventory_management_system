export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-2xl shadow-slate-900/10 transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="text-sm text-slate-600">
          {children}
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-2">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}-