import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { inr, num, pct, tierClasses } from '../../utils/format';

// Column definitions: key on the DTO, header label, and how to render/sort.
const COLUMNS = [
  { key: 'shopName', label: 'Shop', align: 'left', type: 'string', render: (s) => s.shopName },
  { key: 'location', label: 'Location', align: 'left', type: 'string', render: (s) => s.location || '—' },
  { key: 'revenue', label: 'Revenue', align: 'right', type: 'number', render: (s) => inr(s.revenue) },
  { key: 'orderCount', label: 'Orders', align: 'right', type: 'number', render: (s) => num(s.orderCount) },
  { key: 'productsSold', label: 'Units Sold', align: 'right', type: 'number', render: (s) => num(s.productsSold) },
  { key: 'averageOrderValue', label: 'AOV', align: 'right', type: 'number', render: (s) => inr(s.averageOrderValue, 2) },
  { key: 'inventoryValue', label: 'Inv. Value', align: 'right', type: 'number', render: (s) => inr(s.inventoryValue) },
  { key: 'revenueToInventoryRatio', label: 'Rev/Inv', align: 'right', type: 'number', render: (s) => Number(s.revenueToInventoryRatio).toFixed(2) },
  { key: 'revenueContributionPct', label: 'Contrib.', align: 'right', type: 'number', render: (s) => pct(s.revenueContributionPct) },
  { key: 'performanceScore', label: 'Score', align: 'right', type: 'number', render: (s) => Number(s.performanceScore).toFixed(1) },
  { key: 'performanceTier', label: 'Tier', align: 'center', type: 'string', render: (s) => (
      <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${tierClasses(s.performanceTier)}`}>
        {s.performanceTier}
      </span>
    ) },
];

export default function ShopPerformanceTable({ shops = [], onSelect }) {
  const [sortKey, setSortKey] = useState('revenue');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey);
    const type = col?.type || 'number';
    const arr = [...(shops || [])];
    arr.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (type === 'string') {
        av = (av || '').toString().toLowerCase();
        bv = (bv || '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      av = Number(av) || 0;
      bv = Number(bv) || 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return arr;
  }, [shops, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'shopName' || key === 'location' ? 'asc' : 'desc');
    }
  };

  const arrow = (key) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const clickable = typeof onSelect === 'function';

  if (!shops || shops.length === 0) {
    return <p className="text-center text-ink-muted text-sm py-8">No shops to display.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-ink-muted">
            <th className="px-2 py-2 text-right font-semibold text-[11px] uppercase tracking-wider">#</th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className={`px-2 py-2 font-semibold text-[11px] uppercase tracking-wider cursor-pointer select-none hover:text-ink whitespace-nowrap ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                } ${c.key === sortKey ? 'text-forest-600' : ''}`}
              >
                {c.label}
                {arrow(c.key)}
              </th>
            ))}
            {clickable && <th className="px-2 py-2" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <tr
              key={s.shopId ?? s.shopName}
              onClick={clickable ? () => onSelect(s) : undefined}
              className={`border-t border-line ${clickable ? 'cursor-pointer hover:bg-cream-50' : ''}`}
            >
              <td className="px-2 py-2 text-right text-ink-muted font-semibold tabular-nums">{i + 1}</td>
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={`px-2 py-2 tabular-nums whitespace-nowrap ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  } ${c.key === 'shopName' ? 'font-semibold text-ink' : 'text-ink-soft'}`}
                >
                  {c.render(s)}
                </td>
              ))}
              {clickable && (
                <td className="px-2 py-2 text-right">
                  <span className="text-forest-600 text-xs font-semibold whitespace-nowrap">View</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ShopPerformanceTable.propTypes = {
  shops: PropTypes.array,
  onSelect: PropTypes.func,
};
