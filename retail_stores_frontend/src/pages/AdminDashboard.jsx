import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

import { getSummary, getShops, getTopProducts, getLowStock, getOutOfStock } from '../services/analytics';
import { inr, num, pct, compactInr, tierClasses } from '../utils/format';

import KpiCard from '../components/admin/KpiCard';
import Panel from '../components/admin/Panel';
import BarChartH from '../components/admin/charts/BarChartH';
import DonutChart from '../components/admin/charts/DonutChart';
import ScatterPlot from '../components/admin/charts/ScatterPlot';
import ShopPerformanceTable from '../components/admin/ShopPerformanceTable';
import ShopDetailModal from '../components/admin/ShopDetailModal';

// ---- helpers -------------------------------------------------------------
const initSection = (empty = null) => ({ data: empty, loading: true, error: null });

const errMsg = (err) => {
  if (err?.response?.status === 403) return 'Not authorized — admin access required.';
  return err?.response?.data?.message || err?.message || 'Request failed';
};

// Segmented toggle (Top 5 / Top 10 / All etc.)
const Toggle = ({ options, value, onChange }) => (
  <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
    {options.map((o) => (
      <button
        key={String(o.value)}
        onClick={() => onChange(o.value)}
        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
          value === o.value ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!user && !!user.role?.toUpperCase().includes('ADMIN');

  // Filters: draft (form inputs) vs applied (used in server calls). Location is client-side.
  const [draft, setDraft] = useState({ from: '', to: '', lowStockThreshold: '' });
  const [applied, setApplied] = useState({ from: '', to: '', lowStockThreshold: '' });
  const [location, setLocation] = useState('');

  // View toggles
  const [topShopsN, setTopShopsN] = useState(5);
  const [topProductsN, setTopProductsN] = useState(5);

  // Drill-down + comparison
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [cmpA, setCmpA] = useState('');
  const [cmpB, setCmpB] = useState('');

  const [S, setS] = useState({
    summary: initSection(),
    shops: initSection([]),
    topProducts: initSection([]),
    lowStock: initSection([]),
    outOfStock: initSection([]),
    hvCust: initSection(),
    aboveProd: initSection([]),
    aboveCust: initSection([]),
    mostProd: initSection(),
    hvShops: initSection([]),
  });
  const patch = (key, p) => setS((s) => ({ ...s, [key]: { ...s[key], ...p } }));

  const load = (key, fn, empty = null) => {
    patch(key, { loading: true, error: null });
    fn()
      .then((data) => patch(key, { data, loading: false }))
      .catch((err) => patch(key, { loading: false, error: errMsg(err), data: empty }));
  };

  // Redirect non-admins (backend also enforces this; this is UX only).
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  const loadAnalytics = () => {
    load('summary', () => getSummary(applied), null);
    load('shops', () => getShops({ from: applied.from, to: applied.to }), []);
    load('topProducts', () => getTopProducts({ limit: 10, from: applied.from, to: applied.to }), []);
    load('lowStock', () => getLowStock({ threshold: applied.lowStockThreshold }), []);
    load('outOfStock', () => getOutOfStock(), []);
  };

  const loadLegacy = () => {
    load('hvCust', () => api.get('/api/admin/customers/high-value?amount=5000').then((r) => r.data?.[0] || null), null);
    load('aboveProd', () => api.get('/api/admin/products/above-average').then((r) => (Array.isArray(r.data) ? r.data : [])), []);
    load('aboveCust', () => api.get('/api/admin/analytics/above-average-customers').then((r) => (Array.isArray(r.data) ? r.data : [])), []);
    load('mostProd', () => api.get('/api/admin/most-ordered-product').then((r) => r.data?.[0] || null), null);
    load('hvShops', () => api.get('/api/admin/shops/high-value?minValue=5000').then((r) => (Array.isArray(r.data) ? r.data : [])), []);
  };

  // Analytics reload whenever applied filters change; legacy once.
  useEffect(() => {
    if (isAdmin) loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, applied]);
  useEffect(() => {
    if (isAdmin) loadLegacy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ---- derived data ------------------------------------------------------
  const shops = S.shops.data || [];
  const locations = useMemo(
    () => [...new Set(shops.map((s) => s.location).filter(Boolean))].sort(),
    [shops]
  );
  const filteredShops = useMemo(
    () => (location ? shops.filter((s) => s.location === location) : shops),
    [shops, location]
  );

  const byRevenue = useMemo(() => [...filteredShops].sort((a, b) => b.revenue - a.revenue), [filteredShops]);
  const topShops = topShopsN === 'all' ? byRevenue : byRevenue.slice(0, topShopsN);

  const products = S.topProducts.data || [];
  const topProducts = products.slice(0, topProductsN);

  const summary = S.summary.data;
  const filters = applied;

  const shopById = (id) => shops.find((s) => String(s.shopId) === String(id));
  const cmpShopA = shopById(cmpA);
  const cmpShopB = shopById(cmpB);

  const applyFilters = () => setApplied({ ...draft });
  const resetFilters = () => {
    setDraft({ from: '', to: '', lowStockThreshold: '' });
    setApplied({ from: '', to: '', lowStockThreshold: '' });
    setLocation('');
  };
  const refreshAll = () => {
    loadAnalytics();
    loadLegacy();
  };

  if (authLoading || !isAdmin) return null;

  const periodLabel =
    applied.from || applied.to ? `${applied.from || '…'} → ${applied.to || '…'}` : 'All time';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Business Intelligence
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Shop{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Performance
                </span>{' '}
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1 text-sm">
                Real-time analytics across all shops · <span className="font-semibold">{periodLabel}</span>
              </p>
            </div>
            <button
              onClick={refreshAll}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all text-sm self-start"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Filter bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">From</span>
              <input
                type="date"
                value={draft.from}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">To</span>
              <input
                type="date"
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low-stock ≤</span>
              <input
                type="number"
                min="0"
                placeholder="10"
                value={draft.lowStockThreshold}
                onChange={(e) => setDraft((d) => ({ ...d, lowStockThreshold: e.target.value }))}
                className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </label>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 shadow text-sm"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Executive KPIs */}
        {S.summary.error ? (
          <Panel title="Executive Summary" icon="📊" error={S.summary.error} onRetry={loadAnalytics} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Revenue" value={inr(summary?.totalRevenue)} icon="💰" accent="emerald" loading={S.summary.loading} sublabel={`${num(summary?.totalOrders)} orders`} />
            <KpiCard label="Avg Order Value" value={inr(summary?.averageOrderValue, 2)} icon="🧾" accent="cyan" loading={S.summary.loading} />
            <KpiCard label="Products Sold" value={num(summary?.totalProductsSold)} icon="📦" accent="violet" loading={S.summary.loading} />
            <KpiCard label="Inventory Value" value={inr(summary?.totalInventoryValue)} icon="🏬" accent="amber" loading={S.summary.loading} sublabel={`${num(summary?.totalStockUnits)} units in stock`} />
            <KpiCard label="Total Shops" value={num(summary?.totalShops)} icon="🏪" accent="cyan" loading={S.summary.loading} />
            <KpiCard label="Products" value={num(summary?.totalProducts)} icon="🏷️" accent="slate" loading={S.summary.loading} />
            <KpiCard label="Customers" value={num(summary?.totalCustomers)} icon="👥" accent="violet" loading={S.summary.loading} />
            <KpiCard
              label="Stock Alerts"
              value={`${num(summary?.lowStockCount)} / ${num(summary?.outOfStockCount)}`}
              icon="⚠️"
              accent="rose"
              loading={S.summary.loading}
              sublabel={`low (≤${summary?.lowStockThreshold ?? 10}) / out`}
            />
          </div>
        )}

        {/* Shop Performance: revenue ranking + contribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Top Shops by Revenue"
            icon="🏆"
            subtitle="Click a bar to drill into the shop"
            loading={S.shops.loading}
            error={S.shops.error}
            onRetry={loadAnalytics}
            isEmpty={!S.shops.loading && filteredShops.length === 0}
            toolbar={
              <Toggle
                options={[{ label: 'Top 5', value: 5 }, { label: 'Top 10', value: 10 }, { label: 'All', value: 'all' }]}
                value={topShopsN}
                onChange={setTopShopsN}
              />
            }
          >
            <BarChartH
              data={topShops.map((s) => ({ id: s.shopId, label: s.shopName, value: s.revenue }))}
              formatValue={(v) => inr(v)}
              barClass="bg-gradient-to-r from-emerald-500 to-teal-500"
              onSelect={(d) => setSelectedShopId(d.id)}
            />
          </Panel>

          <Panel
            title="Revenue Contribution"
            icon="🥧"
            subtitle="Share of total revenue by shop"
            loading={S.shops.loading}
            error={S.shops.error}
            onRetry={loadAnalytics}
            isEmpty={!S.shops.loading && byRevenue.every((s) => (s.revenue || 0) === 0)}
          >
            <DonutChart
              data={byRevenue.map((s) => ({ id: s.shopId, label: s.shopName, value: s.revenue }))}
              formatValue={(v) => inr(v)}
              centerValue={compactInr(summary?.totalRevenue || byRevenue.reduce((a, s) => a + s.revenue, 0))}
              centerLabel="Total"
            />
          </Panel>
        </div>

        {/* Inventory */}
        <Panel
          title="Inventory Value by Shop"
          icon="🏬"
          subtitle="Σ (price × stock quantity) per shop — independent of the date range"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && filteredShops.every((s) => (s.inventoryValue || 0) === 0)}
        >
          <BarChartH
            data={[...filteredShops]
              .sort((a, b) => b.inventoryValue - a.inventoryValue)
              .map((s) => ({ id: s.shopId, label: s.shopName, value: s.inventoryValue, hint: `${num(s.stockUnits)} units` }))}
            formatValue={(v) => inr(v)}
            barClass="bg-gradient-to-r from-indigo-500 to-violet-500"
            onSelect={(d) => setSelectedShopId(d.id)}
          />
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Low Stock"
            icon="⚠️"
            subtitle={`Products at or below threshold (${summary?.lowStockThreshold ?? (applied.lowStockThreshold || 10)})`}
            loading={S.lowStock.loading}
            error={S.lowStock.error}
            onRetry={loadAnalytics}
            isEmpty={!S.lowStock.loading && (S.lowStock.data || []).length === 0}
            emptyText="No products are low on stock at this threshold."
          >
            <InventoryTable rows={S.lowStock.data} tone="amber" />
          </Panel>

          <Panel
            title="Out of Stock"
            icon="🚫"
            subtitle="Products with zero stock"
            loading={S.outOfStock.loading}
            error={S.outOfStock.error}
            onRetry={loadAnalytics}
            isEmpty={!S.outOfStock.loading && (S.outOfStock.data || []).length === 0}
            emptyText="Nothing is out of stock. 🎉"
          >
            <InventoryTable rows={S.outOfStock.data} tone="rose" />
          </Panel>
        </div>

        {/* Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Top Selling Products"
            icon="🔥"
            subtitle="By units sold across all shops"
            loading={S.topProducts.loading}
            error={S.topProducts.error}
            onRetry={loadAnalytics}
            isEmpty={!S.topProducts.loading && products.length === 0}
            toolbar={
              <Toggle
                options={[{ label: 'Top 5', value: 5 }, { label: 'Top 10', value: 10 }]}
                value={topProductsN}
                onChange={setTopProductsN}
              />
            }
          >
            <BarChartH
              data={topProducts.map((p) => ({ id: p.productId, label: p.pname, value: p.quantitySold, hint: p.shopName }))}
              formatValue={(v) => `${num(v)} u`}
              barClass="bg-gradient-to-r from-orange-500 to-red-500"
            />
          </Panel>

          <Panel
            title="Orders by Shop"
            icon="🧾"
            subtitle="Distinct finalized orders containing each shop’s products"
            loading={S.shops.loading}
            error={S.shops.error}
            onRetry={loadAnalytics}
            isEmpty={!S.shops.loading && filteredShops.every((s) => (s.orderCount || 0) === 0)}
          >
            <BarChartH
              data={[...filteredShops]
                .sort((a, b) => b.orderCount - a.orderCount)
                .map((s) => ({ id: s.shopId, label: s.shopName, value: s.orderCount }))}
              formatValue={(v) => num(v)}
              barClass="bg-gradient-to-r from-sky-500 to-cyan-500"
              onSelect={(d) => setSelectedShopId(d.id)}
            />
          </Panel>
        </div>

        <Panel
          title="Average Order Value by Shop"
          icon="💳"
          subtitle="Revenue ÷ distinct orders per shop"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && filteredShops.every((s) => (s.averageOrderValue || 0) === 0)}
        >
          <BarChartH
            data={[...filteredShops]
              .sort((a, b) => b.averageOrderValue - a.averageOrderValue)
              .map((s) => ({ id: s.shopId, label: s.shopName, value: s.averageOrderValue }))}
            formatValue={(v) => inr(v, 2)}
            barClass="bg-gradient-to-r from-fuchsia-500 to-purple-500"
            onSelect={(d) => setSelectedShopId(d.id)}
          />
        </Panel>

        {/* Efficiency: scatter */}
        <Panel
          title="Revenue vs Inventory"
          icon="📈"
          subtitle="Each dot is a shop — top-left = high sales on lean inventory (efficient); bottom-right = capital tied up in slow stock"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && filteredShops.length === 0}
        >
          <ScatterPlot
            data={filteredShops.map((s) => ({ id: s.shopId, label: s.shopName, x: s.inventoryValue, y: s.revenue }))}
            xLabel="Inventory Value"
            yLabel="Revenue"
            formatX={compactInr}
            formatY={compactInr}
            onSelect={(d) => setSelectedShopId(d.id)}
          />
        </Panel>

        {/* Performance matrix (sortable) */}
        <Panel
          title="Shop Performance Matrix"
          icon="🧮"
          subtitle="Sort any column · click a row for full shop detail · Score = 100 × (0.5·rev + 0.3·orders + 0.2·units), min-max normalized"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && filteredShops.length === 0}
        >
          <ShopPerformanceTable shops={filteredShops} onSelect={(s) => setSelectedShopId(s.shopId)} />
        </Panel>

        {/* Shop comparison */}
        <Panel
          title="Compare Two Shops"
          icon="⚖️"
          subtitle="Side-by-side, from already-loaded data"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && shops.length === 0}
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <select
              value={cmpA}
              onChange={(e) => setCmpA(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="">Select shop A…</option>
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
            <select
              value={cmpB}
              onChange={(e) => setCmpB(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="">Select shop B…</option>
              {shops.map((s) => (
                <option key={s.shopId} value={s.shopId}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>
          {cmpShopA && cmpShopB ? (
            <CompareTable a={cmpShopA} b={cmpShopB} />
          ) : (
            <p className="text-center text-slate-400 text-sm py-6">Pick two shops to compare.</p>
          )}
        </Panel>

        {/* Preserved existing analytics */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2 px-1">
            <span>🔎</span> Customer &amp; Product Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Panel title="Top Spender" icon="💎" loading={S.hvCust.loading} error={S.hvCust.error} onRetry={loadLegacy} isEmpty={!S.hvCust.loading && !S.hvCust.data}>
              {S.hvCust.data && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3">
                    {S.hvCust.data.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <p className="text-2xl font-black text-slate-800">{inr(S.hvCust.data.total, 2)}</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{S.hvCust.data.name}</p>
                </div>
              )}
            </Panel>

            <Panel title="Best Seller" icon="⭐" loading={S.mostProd.loading} error={S.mostProd.error} onRetry={loadLegacy} isEmpty={!S.mostProd.loading && !S.mostProd.data}>
              {S.mostProd.data && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white text-2xl flex items-center justify-center mx-auto mb-3">
                    🛍️
                  </div>
                  <p className="text-xl font-black text-slate-800 truncate px-2">{S.mostProd.data.pname}</p>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mt-1">Most Ordered Item</p>
                </div>
              )}
            </Panel>

            <Panel title="Premium Products" icon="🏷️" subtitle="Priced above average" loading={S.aboveProd.loading} error={S.aboveProd.error} onRetry={loadLegacy} isEmpty={!S.aboveProd.loading && (S.aboveProd.data || []).length === 0}>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {(S.aboveProd.data || []).map((p) => (
                  <div key={p.productId} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{p.pname}</span>
                    <span className="font-bold text-purple-600">{inr(p.price, 2)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Loyal Customers" icon="🛡️" subtitle="Above-average order counts" loading={S.aboveCust.loading} error={S.aboveCust.error} onRetry={loadLegacy} isEmpty={!S.aboveCust.loading && (S.aboveCust.data || []).length === 0}>
              <div className="grid grid-cols-3 gap-2">
                {(S.aboveCust.data || []).slice(0, 9).map((c) => (
                  <div key={c.customerId} className="bg-slate-50 border border-slate-200/60 p-2 rounded-xl text-center flex flex-col items-center">
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-extrabold mb-1">
                      {c.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 truncate w-full">{c.name}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="High-Value Shops" icon="🏪" subtitle="Existing metric (inventory value)" loading={S.hvShops.loading} error={S.hvShops.error} onRetry={loadLegacy} isEmpty={!S.hvShops.loading && (S.hvShops.data || []).length === 0}>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {(S.hvShops.data || []).map((s) => (
                  <div key={s.shopId} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{s.shopName}</span>
                    <span className="font-bold text-emerald-600">{inr(s.inventoryValue)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management · Business Intelligence
      </footer>

      <ShopDetailModal shopId={selectedShopId} filters={filters} onClose={() => setSelectedShopId(null)} />
    </div>
  );
}

// ---- small local components ---------------------------------------------
function InventoryTable({ rows = [], tone = 'amber' }) {
  const list = rows || [];
  const stockColor = tone === 'rose' ? 'text-rose-600' : 'text-amber-600';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-[11px] uppercase tracking-wider">
            <th className="px-2 py-1.5 text-left font-bold">Product</th>
            <th className="px-2 py-1.5 text-left font-bold">Shop</th>
            <th className="px-2 py-1.5 text-right font-bold">Stock</th>
            <th className="px-2 py-1.5 text-right font-bold">Price</th>
            <th className="px-2 py-1.5 text-right font-bold">Inv. Value</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.productId} className="border-t border-slate-100">
              <td className="px-2 py-1.5 font-semibold text-slate-800 whitespace-nowrap">{p.pname}</td>
              <td className="px-2 py-1.5 text-slate-500 whitespace-nowrap">{p.shopName || '—'}</td>
              <td className={`px-2 py-1.5 text-right font-bold tabular-nums ${stockColor}`}>{num(p.stockQuantity)}</td>
              <td className="px-2 py-1.5 text-right text-slate-600 tabular-nums">{inr(p.price, 2)}</td>
              <td className="px-2 py-1.5 text-right text-slate-600 tabular-nums">{inr(p.inventoryValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareTable({ a, b }) {
  const rows = [
    ['Revenue', inr(a.revenue), inr(b.revenue)],
    ['Orders', num(a.orderCount), num(b.orderCount)],
    ['Units Sold', num(a.productsSold), num(b.productsSold)],
    ['Avg Order Value', inr(a.averageOrderValue, 2), inr(b.averageOrderValue, 2)],
    ['Inventory Value', inr(a.inventoryValue), inr(b.inventoryValue)],
    ['Stock Units', num(a.stockUnits), num(b.stockUnits)],
    ['Rev / Inventory', Number(a.revenueToInventoryRatio).toFixed(2), Number(b.revenueToInventoryRatio).toFixed(2)],
    ['Revenue Share', pct(a.revenueContributionPct), pct(b.revenueContributionPct)],
    ['Performance Score', Number(a.performanceScore).toFixed(1), Number(b.performanceScore).toFixed(1)],
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider font-bold text-slate-400">Metric</th>
          <th className="px-2 py-2 text-right font-extrabold text-slate-800">
            {a.shopName}
            <span className={`ml-2 inline-block px-2 py-0.5 rounded-full border text-[10px] ${tierClasses(a.performanceTier)}`}>{a.performanceTier}</span>
          </th>
          <th className="px-2 py-2 text-right font-extrabold text-slate-800">
            {b.shopName}
            <span className={`ml-2 inline-block px-2 py-0.5 rounded-full border text-[10px] ${tierClasses(b.performanceTier)}`}>{b.performanceTier}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, va, vb]) => (
          <tr key={label} className="border-t border-slate-100">
            <td className="px-2 py-2 text-slate-500 font-medium">{label}</td>
            <td className="px-2 py-2 text-right font-bold text-slate-800 tabular-nums">{va}</td>
            <td className="px-2 py-2 text-right font-bold text-slate-800 tabular-nums">{vb}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
