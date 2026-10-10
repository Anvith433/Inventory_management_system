import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import Icon from './Icon';
import CartDrawer from './CartDrawer';
import { firstName } from '../utils/catalog';
import { price } from '../utils/format';

const isAdminUser = (user) => !!user?.role?.toUpperCase().includes('ADMIN');

function AnnouncementBar() {
  return (
    <div className="bg-forest-900 text-cream-100">
      <div className="container-page flex h-9 items-center justify-center gap-6 text-xs">
        <span className="flex items-center gap-2">
          <Icon name="store" size={14} className="text-marigold-300" />
          Real shops from your own city
        </span>
        <span className="hidden items-center gap-2 sm:flex">
          <Icon name="cash" size={14} className="text-marigold-300" />
          Pay cash on delivery or online
        </span>
        <span className="hidden items-center gap-2 md:flex">
          <Icon name="percent" size={14} className="text-marigold-300" />
          Offers applied at checkout
        </span>
      </div>
    </div>
  );
}

function SearchBox({ className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const onShopPage = location.pathname === '/dashboard';
  const urlQuery = onShopPage ? params.get('q') || '' : '';
  const [query, setQuery] = useState(urlQuery);

  // Keep the box in step with the URL (back/forward, "clear filters", …).
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const update = (value) => {
    setQuery(value);
    // On the shop page, filter as you type.
    if (onShopPage) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set('q', value);
          else next.delete('q');
          return next;
        },
        { replace: true }
      );
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!onShopPage) navigate(query ? `/dashboard?q=${encodeURIComponent(query)}` : '/dashboard');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`} role="search">
      <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        value={query}
        onChange={(e) => update(e.target.value)}
        placeholder="Search rice, soap, chocolate…"
        className="h-11 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted/80 transition-colors focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-100"
        aria-label="Search products"
      />
    </form>
  );
}

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-cream-200/70 sm:pr-3"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold-200 font-display text-base font-semibold text-marigold-700">
          {initial}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-[11px] text-ink-muted">Hello,</span>
          <span className="block max-w-[7rem] truncate text-sm font-semibold text-ink">{firstName(user?.name)}</span>
        </span>
        <Icon name="chevron-down" size={16} className={`hidden text-ink-muted transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift animate-rise-in"
        >
          <div className="px-3 pb-2 pt-2.5">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {[
            { to: '/profile', icon: 'user', label: 'Profile & address' },
            { to: '/orders', icon: 'receipt', label: 'My orders' },
            ...(isAdminUser(user) ? [{ to: '/admindashboard', icon: 'dashboard', label: 'Admin dashboard' }] : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream-100 hover:text-ink"
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-tomato-600 transition-colors hover:bg-tomato-50"
          >
            <Icon name="logout" size={18} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, total, openCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkCls = ({ isActive }) =>
    `hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors md:flex ${
      isActive ? 'text-forest-700' : 'text-ink-soft hover:text-ink'
    }`;

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-line bg-cream-100/95 backdrop-blur supports-[backdrop-filter]:bg-cream-100/85">
        <div className="container-page flex h-[72px] items-center gap-4 lg:gap-8">
          <Logo to={user ? '/dashboard' : '/'} />

          {user ? (
            <>
              <SearchBox className="hidden flex-1 md:block md:max-w-xl" />

              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                {user.city && (
                  <span className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft xl:flex">
                    <Icon name="pin" size={16} className="text-tomato-500" />
                    {user.city}
                  </span>
                )}
                {isAdminUser(user) && (
                  <NavLink to="/admindashboard" className={navLinkCls}>
                    <Icon name="dashboard" size={18} />
                    Admin
                  </NavLink>
                )}
                <NavLink to="/orders" className={navLinkCls}>
                  <Icon name="receipt" size={18} />
                  Orders
                </NavLink>

                <AccountMenu user={user} onLogout={handleLogout} />

                <button
                  onClick={openCart}
                  className="relative ml-1 flex h-11 items-center gap-2.5 rounded-full bg-forest-700 pl-3.5 pr-4 text-cream-50 transition-colors hover:bg-forest-800"
                  aria-label={`Open basket, ${count} items`}
                >
                  <Icon name="bag" size={19} />
                  <span className="hidden text-sm font-semibold tabular sm:inline">{price(total)}</span>
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-marigold-400 px-1 text-[11px] font-bold text-ink ring-2 ring-cream-100">
                      {count}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <a href="/#how-it-works" className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink md:block">
                How it works
              </a>
              <Link to="/login" className="btn btn-ghost !px-3 sm:!px-5">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary !px-4 sm:!px-5">
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Create account</span>
              </Link>
            </div>
          )}
        </div>

        {user && (
          <div className="container-page pb-3 md:hidden">
            <SearchBox />
          </div>
        )}
      </header>

      {user && <CartDrawer />}
    </>
  );
}
