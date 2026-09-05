import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getShopDetail } from '../../services/analytics';
import { inr, num, pct, tierClasses } from '../../utils/format';

const Stat = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-black text-slate-800 tabular-nums mt-0.5">{value}</p>
  </div>
);
Stat.propTypes = { label: PropTypes.string, value: PropTypes.node };

/**
 * Drill-down modal for one shop. Fetches /analytics/shops/{id} (respecting the
 * active date/threshold filters) when opened. Self-contained wide overlay.
 */
export default function ShopDetailModal({ shopId, filters, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shopId == null) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setData(null);
    getShopDetail(shopId, filters)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.response?.data?.message || e.message || 'Request failed'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, filters?.from, filters?.to, filters?.lowStockThreshold]);

  if (shopId == null) return null;

  const shop = data?.shop;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold text-slate-900">{shop?.shopName || `Shop #${shopId}`}</h2>
              {shop?.performanceTier && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${tierClasses(shop.performanceTier)}`}>
                  {shop.performanceTier}
                </span>
              )}
            </div>
            {shop && (
              <p className="text-sm text-slate-500 mt-0.5">
                {shop.location || '—'} · Owner: {shop.ownerName || '—'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-cyan-500 animate-spin" />
            Loading shop details…
          </div>
        )}
        {error && !loading && (
          <p className="text-center text-rose-600 text-sm py-16">Couldn’t load shop details: {String(error)}</p>
        )}

        {shop && !loading && !error && (
          <div className="mt-4 space-y-6">
            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Stat label="Revenue" value={inr(shop.revenue)} />
              <Stat label="Orders" value={num(shop.orderCount)} />
              <Stat label="Units Sold" value={num(shop.productsSold)} />
              <Stat label="Avg Order Value" value={inr(shop.averageOrderValue, 2)} />
              <Stat label="Inventory Value" value={inr(shop.inventoryValue)} />
              <Stat label="Stock Units" value={num(shop.stockUnits)} />
              <Stat label="Rev / Inventory" value={Number(shop.revenueToInventoryRatio).toFixed(2)} />
              <Stat label="Revenue Share" value={pct(shop.revenueContributionPct)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* top products */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Top Products (by units sold)</h3>
                {data.topProducts && data.topProducts.length > 0 ? (
                  <ul className="space-y-1.5">
                    {data.topProducts.map((p) => (
                      <li
                        key={p.productId}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700 truncate max-w-[55%]" title={p.pname}>
                          {p.pname}
                        </span>
                        <span className="text-slate-500">
                          <span className="font-bold text-slate-800">{num(p.quantitySold)}</span> units ·{' '}
                          <span className="font-bold text-emerald-600">{inr(p.revenueGenerated)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No sales in the selected period.</p>
                )}
              </div>

              {/* inventory breakdown */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  Inventory Health{' '}
                  <span className="font-medium text-slate-400">(low ≤ {data.lowStockThreshold})</span>
                </h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 text-center bg-emerald-50 border border-emerald-100 rounded-xl py-2">
                    <p className="text-lg font-black text-emerald-600">{num(data.normalStockCount)}</p>
                    <p className="text-[10px] font-bold uppercase text-emerald-500">Healthy</p>
                  </div>
                  <div className="flex-1 text-center bg-amber-50 border border-amber-100 rounded-xl py-2">
                    <p className="text-lg font-black text-amber-600">{num(data.lowStock?.length || 0)}</p>
                    <p className="text-[10px] font-bold uppercase text-amber-500">Low</p>
                  </div>
                  <div className="flex-1 text-center bg-rose-50 border border-rose-100 rounded-xl py-2">
                    <p className="text-lg font-black text-rose-600">{num(data.outOfStock?.length || 0)}</p>
                    <p className="text-[10px] font-bold uppercase text-rose-500">Out</p>
                  </div>
                </div>
                {(data.lowStock?.length || 0) + (data.outOfStock?.length || 0) > 0 ? (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {[...(data.outOfStock || []), ...(data.lowStock || [])].map((p) => (
                      <li
                        key={p.productId}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700 truncate max-w-[60%]" title={p.pname}>
                          {p.pname}
                        </span>
                        <span
                          className={`font-bold ${
                            (p.stockQuantity ?? 0) <= 0 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {num(p.stockQuantity)} in stock
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 py-2 text-center">All products are well-stocked.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ShopDetailModal.propTypes = {
  shopId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  filters: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
