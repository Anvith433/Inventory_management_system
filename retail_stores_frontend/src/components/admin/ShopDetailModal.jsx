import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getShopDetail } from '../../services/analytics';
import { inr, num, pct, tierClasses } from '../../utils/format';
import Icon from '../Icon';

const Stat = ({ label, value }) => (
  <div className="bg-white border border-line rounded-xl px-3 py-2.5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
    <p className="text-sm font-semibold text-ink tabular-nums mt-0.5">{value}</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-cream-50 rounded-3xl shadow-lift p-6 sm:p-8 animate-rise-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl font-medium text-ink">{shop?.shopName || `Shop #${shopId}`}</h2>
              {shop?.performanceTier && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${tierClasses(shop.performanceTier)}`}>
                  {shop.performanceTier}
                </span>
              )}
            </div>
            {shop && (
              <p className="text-sm text-ink-muted mt-0.5">
                {shop.location || '—'} · Owner: {shop.ownerName || '—'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-ink-muted flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-ink-muted gap-2 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-cream-300 border-t-forest-700 animate-spin" />
            Loading shop details…
          </div>
        )}
        {error && !loading && (
          <p className="text-center text-tomato-600 text-sm py-16">Couldn’t load shop details: {String(error)}</p>
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
                <h3 className="text-sm font-semibold text-ink mb-2">Top Products (by units sold)</h3>
                {data.topProducts && data.topProducts.length > 0 ? (
                  <ul className="space-y-1.5">
                    {data.topProducts.map((p) => (
                      <li
                        key={p.productId}
                        className="flex items-center justify-between bg-white border border-line rounded-xl px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-ink truncate max-w-[55%]" title={p.pname}>
                          {p.pname}
                        </span>
                        <span className="text-ink-muted">
                          <span className="font-semibold text-ink">{num(p.quantitySold)}</span> units ·{' '}
                          <span className="font-semibold text-forest-600">{inr(p.revenueGenerated)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink-muted py-4 text-center">No sales in the selected period.</p>
                )}
              </div>

              {/* inventory breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">
                  Inventory Health{' '}
                  <span className="font-medium text-ink-muted">(low ≤ {data.lowStockThreshold})</span>
                </h3>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 text-center bg-forest-50 border border-forest-100 rounded-xl py-2">
                    <p className="text-lg font-semibold text-forest-600">{num(data.normalStockCount)}</p>
                    <p className="text-[10px] font-semibold uppercase text-forest-500">Healthy</p>
                  </div>
                  <div className="flex-1 text-center bg-marigold-50 border border-marigold-100 rounded-xl py-2">
                    <p className="text-lg font-semibold text-marigold-600">{num(data.lowStock?.length || 0)}</p>
                    <p className="text-[10px] font-semibold uppercase text-marigold-500">Low</p>
                  </div>
                  <div className="flex-1 text-center bg-tomato-50 border border-tomato-100 rounded-xl py-2">
                    <p className="text-lg font-semibold text-tomato-600">{num(data.outOfStock?.length || 0)}</p>
                    <p className="text-[10px] font-semibold uppercase text-tomato-500">Out</p>
                  </div>
                </div>
                {(data.lowStock?.length || 0) + (data.outOfStock?.length || 0) > 0 ? (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {[...(data.outOfStock || []), ...(data.lowStock || [])].map((p) => (
                      <li
                        key={p.productId}
                        className="flex items-center justify-between bg-white border border-line rounded-xl px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-ink truncate max-w-[60%]" title={p.pname}>
                          {p.pname}
                        </span>
                        <span
                          className={`font-semibold ${
                            (p.stockQuantity ?? 0) <= 0 ? 'text-tomato-600' : 'text-marigold-600'
                          }`}
                        >
                          {num(p.stockQuantity)} in stock
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink-muted py-2 text-center">All products are well-stocked.</p>
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
