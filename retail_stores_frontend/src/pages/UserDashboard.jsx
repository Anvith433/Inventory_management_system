import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import ShopCard from '../components/ShopCard';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoryStyle, firstName, getProductId, greeting, rememberProducts } from '../utils/catalog';
import { price } from '../utils/format';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

function HeroBanner({ user, shopCount, productCount, loading }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="relative overflow-hidden rounded-3xl bg-forest-700 p-7 text-cream-50 sm:p-10 lg:col-span-2">
        <div className="grain absolute inset-0" aria-hidden="true" />
        {/* decorative produce "stickers" */}
        <div className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 sm:block" aria-hidden="true">
          <div className="relative h-56 w-56">
            <span className="absolute inset-0 rounded-full border border-dashed border-cream-50/20" />
            <span className="absolute left-2 top-4 flex h-20 w-20 -rotate-12 items-center justify-center rounded-3xl bg-marigold-400 text-ink shadow-lift">
              <Icon name="wheat" size={38} strokeWidth={1.25} />
            </span>
            <span className="absolute right-10 top-0 flex h-16 w-16 rotate-6 items-center justify-center rounded-full bg-cream-50 text-tomato-500 shadow-lift">
              <Icon name="apple" size={30} strokeWidth={1.4} />
            </span>
            <span className="absolute bottom-6 left-16 flex h-[72px] w-[72px] rotate-[8deg] items-center justify-center rounded-2xl bg-tomato-500 text-cream-50 shadow-lift">
              <Icon name="milk" size={34} strokeWidth={1.3} />
            </span>
          </div>
        </div>

        <div className="relative max-w-md">
          {user?.city && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream-100">
              <Icon name="pin" size={13} className="text-marigold-300" />
              Delivering in {user.city}
            </p>
          )}
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            {greeting()}, <span className="italic text-marigold-300">{firstName(user?.name)}.</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-cream-100/80">
            {loading
              ? 'Checking what the shops near you have in today…'
              : shopCount === 0
                ? 'We’re still lining up shops in your area.'
                : `${shopCount} ${shopCount === 1 ? 'shop' : 'shops'} near you, ${productCount} things on the shelves. What are we picking up today?`}
          </p>
          <a href="#products" className="btn btn-accent mt-6">
            Browse everything
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>

      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-1">
        <div className="relative overflow-hidden rounded-3xl bg-marigold-300 p-6">
          <Icon name="percent" size={88} strokeWidth={1} className="absolute -bottom-4 -right-3 text-marigold-500/40" />
          <p className="eyebrow !text-marigold-700">At checkout</p>
          <p className="mt-2 max-w-[14rem] font-display text-2xl font-medium leading-tight text-ink">
            We check your basket for offers.
          </p>
          <p className="mt-2 text-sm text-ink-soft">One tap before you pay.</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6">
          <Icon name="cash" size={88} strokeWidth={1} className="absolute -bottom-5 -right-3 text-forest-100" />
          <p className="eyebrow">No card? No problem</p>
          <p className="mt-2 max-w-[14rem] font-display text-2xl font-medium leading-tight text-ink">
            Pay cash when it arrives.
          </p>
          <p className="mt-2 text-sm text-ink-soft">Or online — UPI, cards, netbanking.</p>
        </div>
      </div>
    </section>
  );
}

function CategoryRail({ categories, active, onPick }) {
  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        onClick={() => onPick('')}
        aria-pressed={!active}
        className={`flex shrink-0 snap-start items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors ${
          !active ? 'border-ink bg-ink text-cream-50' : 'border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink'
        }`}
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${!active ? 'bg-white/15' : 'bg-cream-100'}`}>
          <Icon name="basket" size={17} />
        </span>
        Everything
      </button>
      {categories.map(({ name, count }) => {
        const s = categoryStyle(name);
        const isActive = active.toLowerCase() === name.toLowerCase();
        return (
          <button
            key={name}
            onClick={() => onPick(isActive ? '' : name)}
            aria-pressed={isActive}
            className={`flex shrink-0 snap-start items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors ${
              isActive ? 'border-ink bg-ink text-cream-50' : 'border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink'
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: s.bg, color: s.fg }}>
              <Icon name={s.icon} size={17} />
            </span>
            {name}
            <span className={`text-xs ${isActive ? 'text-cream-100/70' : 'text-ink-muted'}`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-10">
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-[84px] w-72 shrink-0 !rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="skeleton aspect-[5/4] !rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton mt-4 h-8 w-full !rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const UserDashboard = () => {
  const { user } = useAuth();
  const { count, total, openCart } = useCart();
  const [params, setParams] = useSearchParams();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/shops/nearby');
      setShops(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load shops:', err);
      setError('We couldn’t reach the shops just now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const shopFilter = params.get('shop') || '';
  const sort = params.get('sort') || 'featured';

  const setParam = (key, value) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  const clearFilters = () => setParams({}, { replace: true });

  // Flatten every shop's shelf into one catalogue, remembering where each item lives.
  const allProducts = useMemo(
    () =>
      shops.flatMap((shop) =>
        (shop.products || []).map((p) => ({
          ...p,
          shopId: p.shopId ?? shop.shopId ?? shop.shop_id,
          shopName: shop.shopName || shop.shop_name,
        }))
      ),
    [shops]
  );

  useEffect(() => {
    rememberProducts(allProducts);
  }, [allProducts]);

  const categories = useMemo(() => {
    const counts = new Map();
    allProducts.forEach((p) => {
      const c = (p.category || '').trim();
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [...counts.entries()].map(([name, n]) => ({ name, count: n })).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = allProducts.filter((p) => {
      if (shopFilter && String(p.shopId) !== shopFilter) return false;
      if (category && (p.category || '').toLowerCase() !== category.toLowerCase()) return false;
      if (needle) {
        const hay = `${p.pname} ${p.category || ''} ${p.shopName || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    const inStock = (p) => ((p.stockQuantity ?? 1) > 0 ? 0 : 1);
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'name') sorted.sort((a, b) => (a.pname || '').localeCompare(b.pname || ''));
    else sorted.sort((a, b) => inStock(a) - inStock(b));
    return sorted;
  }, [allProducts, q, category, shopFilter, sort]);

  const activeShop = shops.find((s) => String(s.shopId ?? s.shop_id) === shopFilter);
  const hasFilters = !!(q || category || shopFilter);

  const heading = activeShop
    ? `From ${activeShop.shopName || activeShop.shop_name}`
    : category
      ? category
      : q
        ? `Results for “${q}”`
        : 'Everything near you';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-page flex-1 space-y-12 py-8 sm:py-10">
        <HeroBanner user={user} shopCount={shops.length} productCount={allProducts.length} loading={loading} />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tomato-50 text-tomato-500">
              <Icon name="alert" size={26} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-medium text-ink">{error}</h2>
            <p className="mt-2 text-sm text-ink-muted">Check your connection and give it another go.</p>
            <button onClick={fetchShops} className="btn btn-primary mt-6">
              <Icon name="refresh" size={16} />
              Try again
            </button>
          </div>
        ) : shops.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-marigold-100 text-marigold-600">
              <Icon name="store" size={26} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-medium text-ink">
              No shops in {user?.city || 'your city'} yet
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              We only show shops from your own city so deliveries stay quick. Check back soon — new ones join all the
              time.
            </p>
          </div>
        ) : (
          <>
            {/* Shops near you */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Shops near you</p>
                  <h2 className="mt-1 font-display text-2xl font-medium text-ink sm:text-3xl">Pick a counter, or shop them all</h2>
                </div>
                {shopFilter && (
                  <button onClick={() => setParam('shop', '')} className="btn btn-ghost btn-sm shrink-0">
                    Show all shops
                  </button>
                )}
              </div>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
                {shops.map((shop, i) => {
                  const id = String(shop.shopId ?? shop.shop_id ?? i);
                  return (
                    <ShopCard
                      key={id}
                      shop={shop}
                      productCount={(shop.products || []).length}
                      active={shopFilter === id}
                      onSelect={() => setParam('shop', shopFilter === id ? '' : id)}
                    />
                  );
                })}
              </div>
            </section>

            {/* Catalogue */}
            <section id="products" className="scroll-mt-28">
              <div className="mb-5">
                <p className="eyebrow">Browse by aisle</p>
                <div className="mt-3">
                  <CategoryRail categories={categories} active={category} onPick={(c) => setParam('category', c)} />
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">{heading}</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {visible.length} {visible.length === 1 ? 'product' : 'products'}
                    {hasFilters && (
                      <>
                        {' · '}
                        <button onClick={clearFilters} className="font-medium text-forest-600 underline-offset-2 hover:underline">
                          Clear filters
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <Icon name="filter" size={16} />
                  <span className="sr-only sm:not-sr-only">Sort by</span>
                  <select
                    value={sort}
                    onChange={(e) => setParam('sort', e.target.value === 'featured' ? '' : e.target.value)}
                    className="h-10 rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium text-ink focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {visible.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line bg-cream-50 px-6 py-16 text-center">
                  <Icon name="search" size={32} className="mx-auto text-ink-muted" />
                  <p className="mt-4 font-display text-xl font-medium text-ink">Nothing matches that, sorry.</p>
                  <p className="mt-1 text-sm text-ink-muted">Try a different word, or have a look at everything instead.</p>
                  <button onClick={clearFilters} className="btn btn-outline mt-6">
                    See all products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {visible.map((p, i) => (
                    <ProductCard
                      key={`${p.shopId}-${getProductId(p)}`}
                      product={p}
                      shopName={shopFilter ? undefined : p.shopName}
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Mobile basket bar */}
      {count > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <button onClick={openCart} className="btn btn-primary w-full justify-between !px-5">
            <span className="flex items-center gap-2">
              <Icon name="bag" size={18} />
              {count} {count === 1 ? 'item' : 'items'}
            </span>
            <span className="flex items-center gap-1.5">
              {price(total)}
              <Icon name="arrow-right" size={16} />
            </span>
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserDashboard;
