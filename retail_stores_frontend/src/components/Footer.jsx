import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/dashboard', label: 'All products' },
      { to: '/checkout', label: 'Your basket' },
      { to: '/orders', label: 'Past orders' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'Profile & address' },
      { to: '/login', label: 'Sign in' },
      { to: '/register', label: 'Create an account' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-forest-900 text-cream-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-cream-200/70">
            Groceries and everyday bits from the shops in your own city — the same counters you&rsquo;d
            walk up to, now a few taps away.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-base font-medium text-cream-50">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-cream-200/70 transition-colors hover:text-marigold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-display text-base font-medium text-cream-50">Paying for things</h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-200/70">
            <li className="flex items-start gap-2.5">
              <Icon name="cash" size={18} className="mt-0.5 text-marigold-300" />
              Cash when your order arrives
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="shield" size={18} className="mt-0.5 text-marigold-300" />
              UPI, cards &amp; netbanking through Razorpay
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-cream-200/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} RetailStore. All rights reserved.</p>
          <p>Made for the corner shop down the road.</p>
        </div>
      </div>
    </footer>
  );
}
