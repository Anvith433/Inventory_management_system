export default function OrderSummary({ items, total, onCheckout, onRemove }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
          <span>🛍️</span> Order Summary
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-500 text-xl flex items-center justify-center mx-auto mb-2">
            🛒
          </div>
          <p className="text-slate-400 text-sm font-medium">No items in your order yet</p>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs transition-all hover:border-slate-300"
              >
                <div className="flex-1 pr-2 truncate">
                  <p className="font-bold text-slate-800 truncate">{item.pname}</p>
                  <p className="text-slate-500 font-semibold mt-0.5">
                    ₹{Number(item.price).toFixed(2)} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-black text-slate-900">
                    ₹{Number(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemove(item)}
                    className="w-6 h-6 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-bold flex items-center justify-center transition-colors"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{Number(total).toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            className="mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 px-4 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <span>→</span>
          </button>
        </>
      )}
    </div>
  );
}