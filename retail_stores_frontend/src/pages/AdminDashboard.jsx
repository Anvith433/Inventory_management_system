import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';

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
  <div className="inline-flex rounded-full bg-cream-100 p-1">
    {options.map((o) => (
      <button
        key={String(o.value)}
        onClick={() => onChange(o.value)}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          value === o.value ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container-page py-8 sm:py-10 flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin · Business overview</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight text-ink">
              How the shops are doing
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Sales and stock across every shop · <span className="font-semibold text-ink-soft">{periodLabel}</span>
            </p>
          </div>
          <button onClick={refreshAll} className="btn btn-outline self-start md:self-auto">
            <Icon name="refresh" size={16} />
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="card p-4 sm:p-5 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Location</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">From</span>
            <input
              type="date"
              value={draft.from}
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">To</span>
            <input
              type="date"
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Low stock at or below</span>
            <input
              type="number"
              min="0"
              placeholder="10"
              value={draft.lowStockThreshold}
              onChange={(e) => setDraft((d) => ({ ...d, lowStockThreshold: e.target.value }))}
              className="h-10 w-28 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
            />
          </label>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="btn btn-primary h-10">
              Apply
            </button>
            <button onClick={resetFilters} className="btn btn-ghost h-10">
              Reset
            </button>
          </div>
        </div>

        {/* Executive KPIs */}
        {S.summary.error ? (
          <Panel title="Executive Summary" icon="bar-chart" error={S.summary.error} onRetry={loadAnalytics} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard label="Total Revenue" value={inr(summary?.totalRevenue)} icon="wallet" accent="emerald" loading={S.summary.loading} sublabel={`${num(summary?.totalOrders)} orders`} />
            <KpiCard label="Avg Order Value" value={inr(summary?.averageOrderValue, 2)} icon="receipt" accent="cyan" loading={S.summary.loading} />
            <KpiCard label="Products Sold" value={num(summary?.totalProductsSold)} icon="package" accent="violet" loading={S.summary.loading} />
            <KpiCard label="Inventory Value" value={inr(summary?.totalInventoryValue)} icon="store" accent="amber" loading={S.summary.loading} sublabel={`${num(summary?.totalStockUnits)} units in stock`} />
            <KpiCard label="Total Shops" value={num(summary?.totalShops)} icon="store" accent="cyan" loading={S.summary.loading} />
            <KpiCard label="Products" value={num(summary?.totalProducts)} icon="tag" accent="slate" loading={S.summary.loading} />
            <KpiCard label="Customers" value={num(summary?.totalCustomers)} icon="users" accent="violet" loading={S.summary.loading} />
            <KpiCard
              label="Stock Alerts"
              value={`${num(summary?.lowStockCount)} / ${num(summary?.outOfStockCount)}`}
              icon="alert"
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
            icon="trophy"
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
              barClass="bg-forest-600"
              onSelect={(d) => setSelectedShopId(d.id)}
            />
          </Panel>

          <Panel
            title="Revenue Contribution"
            icon="pie-chart"
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
          icon="store"
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
            barClass="bg-[#2F5F69]"
            onSelect={(d) => setSelectedShopId(d.id)}
          />
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Low Stock"
            icon="alert"
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
            icon="ban"
            subtitle="Products with zero stock"
            loading={S.outOfStock.loading}
            error={S.outOfStock.error}
            onRetry={loadAnalytics}
            isEmpty={!S.outOfStock.loading && (S.outOfStock.data || []).length === 0}
            emptyText="Nothing is out of stock. Nice."
          >
            <InventoryTable rows={S.outOfStock.data} tone="rose" />
          </Panel>
        </div>

        {/* Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Top Selling Products"
            icon="trending"
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
              barClass="bg-tomato-500"
            />
          </Panel>

          <Panel
            title="Orders by Shop"
            icon="receipt"
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
              barClass="bg-marigold-500"
              onSelect={(d) => setSelectedShopId(d.id)}
            />
          </Panel>
        </div>

        <Panel
          title="Average Order Value by Shop"
          icon="card"
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
            barClass="bg-[#8A5A83]"
            onSelect={(d) => setSelectedShopId(d.id)}
          />
        </Panel>

        {/* Efficiency: scatter */}
        <Panel
          title="Revenue vs Inventory"
          icon="trending"
          subtitle="Each dot is a shop — top-left = high sales on lean inventory (efficient); bottom-right = capital tied up in slow stock"
          loading={S.shops.loading}
          error={S.shops.error}
          onRetry={loadAnalytics}
          isEmpty={!S.shops.loading && filteredShops.length === 0}
        >
          <div className="mx-auto max-w-3xl">
          <ScatterPlot
            data={filteredShops.map((s) => ({ id: s.shopId, label: s.shopName, x: s.inventoryValue, y: s.revenue }))}
            xLabel="Inventory Value"
            yLabel="Revenue"
            formatX={compactInr}
            formatY={compactInr}
            onSelect={(d) => setSelectedShopId(d.id)}
          />
          </div>
        </Panel>

        {/* Performance matrix (sortable) */}
        <Panel
          title="Shop Performance Matrix"
          icon="grid"
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
          icon="scale"
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
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
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
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
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
            <p className="text-center text-ink-muted text-sm py-6">Pick two shops to compare.</p>
          )}
        </Panel>

        {/* Preserved existing analytics */}
        <div>
          <h2 className="font-display text-2xl font-medium text-ink mb-4 mt-4 px-1">
            Customers &amp; products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Panel title="Top Spender" icon="gem" loading={S.hvCust.loading} error={S.hvCust.error} onRetry={loadLegacy} isEmpty={!S.hvCust.loading && !S.hvCust.data}>
              {S.hvCust.data && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-marigold-200 text-marigold-700 font-display font-semibold text-2xl flex items-center justify-center mx-auto mb-3">
                    {S.hvCust.data.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink">{inr(S.hvCust.data.total, 2)}</p>
                  <p className="text-sm font-semibold text-ink-muted mt-1">{S.hvCust.data.name}</p>
                </div>
              )}
            </Panel>

            <Panel title="Best Seller" icon="star" loading={S.mostProd.loading} error={S.mostProd.error} onRetry={loadLegacy} isEmpty={!S.mostProd.loading && !S.mostProd.data}>
              {S.mostProd.data && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-forest-700 text-cream-50 flex items-center justify-center mx-auto mb-3">
                    <Icon name="bag" size={28} strokeWidth={1.5} />
                  </div>
                  <p className="font-display text-xl font-semibold text-ink truncate px-2">{S.mostProd.data.pname}</p>
                  <p className="eyebrow mt-1">Most ordered item</p>
                </div>
              )}
            </Panel>

            <Panel title="Premium Products" icon="tag" subtitle="Priced above average" loading={S.aboveProd.loading} error={S.aboveProd.error} onRetry={loadLegacy} isEmpty={!S.aboveProd.loading && (S.aboveProd.data || []).length === 0}>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {(S.aboveProd.data || []).map((p) => (
                  <div key={p.productId} className="bg-cream-50 border border-line p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-ink truncate max-w-[150px]">{p.pname}</span>
                    <span className="font-semibold text-forest-700">{inr(p.price, 2)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Loyal Customers" icon="heart" subtitle="Above-average order counts" loading={S.aboveCust.loading} error={S.aboveCust.error} onRetry={loadLegacy} isEmpty={!S.aboveCust.loading && (S.aboveCust.data || []).length === 0}>
              <div className="grid grid-cols-3 gap-2">
                {(S.aboveCust.data || []).slice(0, 9).map((c) => (
                  <div key={c.customerId} className="bg-cream-50 border border-line p-2 rounded-xl text-center flex flex-col items-center">
                    <div className="w-8 h-8 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center text-xs font-semibold mb-1">
                      {c.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <p className="text-[11px] font-semibold text-ink truncate w-full">{c.name}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="High-Value Shops" icon="store" subtitle="Existing metric (inventory value)" loading={S.hvShops.loading} error={S.hvShops.error} onRetry={loadLegacy} isEmpty={!S.hvShops.loading && (S.hvShops.data || []).length === 0}>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {(S.hvShops.data || []).map((s) => (
                  <div key={s.shopId} className="bg-cream-50 border border-line p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-ink truncate max-w-[150px]">{s.shopName}</span>
                    <span className="font-semibold text-forest-600">{inr(s.inventoryValue)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </main>

      <Footer />

      <ShopDetailModal shopId={selectedShopId} filters={filters} onClose={() => setSelectedShopId(null)} />
    </div>
  );
}

// ---- small local components ---------------------------------------------
function InventoryTable({ rows = [], tone = 'amber' }) {
  const list = rows || [];
  const stockColor = tone === 'rose' ? 'text-tomato-600' : 'text-marigold-600';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-ink-muted text-[11px] uppercase tracking-wider">
            <th className="px-2 py-1.5 text-left font-semibold">Product</th>
            <th className="px-2 py-1.5 text-left font-semibold">Shop</th>
            <th className="px-2 py-1.5 text-right font-semibold">Stock</th>
            <th className="px-2 py-1.5 text-right font-semibold">Price</th>
            <th className="px-2 py-1.5 text-right font-semibold">Inv. Value</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.productId} className="border-t border-line">
              <td className="px-2 py-1.5 font-semibold text-ink whitespace-nowrap">{p.pname}</td>
              <td className="px-2 py-1.5 text-ink-muted whitespace-nowrap">{p.shopName || '—'}</td>
              <td className={`px-2 py-1.5 text-right font-semibold tabular-nums ${stockColor}`}>{num(p.stockQuantity)}</td>
              <td className="px-2 py-1.5 text-right text-ink-soft tabular-nums">{inr(p.price, 2)}</td>
              <td className="px-2 py-1.5 text-right text-ink-soft tabular-nums">{inr(p.inventoryValue)}</td>
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
          <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider font-semibold text-ink-muted">Metric</th>
          <th className="px-2 py-2 text-right font-semibold text-ink">
            {a.shopName}
            <span className={`ml-2 inline-block px-2 py-0.5 rounded-full border text-[10px] ${tierClasses(a.performanceTier)}`}>{a.performanceTier}</span>
          </th>
          <th className="px-2 py-2 text-right font-semibold text-ink">
            {b.shopName}
            <span className={`ml-2 inline-block px-2 py-0.5 rounded-full border text-[10px] ${tierClasses(b.performanceTier)}`}>{b.performanceTier}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, va, vb]) => (
          <tr key={label} className="border-t border-line">
            <td className="px-2 py-2 text-ink-muted font-medium">{label}</td>
            <td className="px-2 py-2 text-right font-semibold text-ink tabular-nums">{va}</td>
            <td className="px-2 py-2 text-right font-semibold text-ink tabular-nums">{vb}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
