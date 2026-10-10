import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';

/** Split screen used by sign in / sign up: a warm brand panel and the form. */
export default function AuthLayout({ panelTitle, panelBody, children }) {
  return (
    <div className="flex min-h-screen bg-cream-100">
      <aside className="relative hidden w-[44%] max-w-2xl flex-col justify-between overflow-hidden bg-forest-700 p-12 text-cream-50 lg:flex">
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <Logo light />
        </div>

        <div className="relative">
          <div className="mb-10 flex gap-3" aria-hidden="true">
            <span className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-marigold-400 text-ink">
              <Icon name="wheat" size={30} strokeWidth={1.3} />
            </span>
            <span className="flex h-16 w-16 rotate-3 items-center justify-center rounded-full bg-cream-50 text-tomato-500">
              <Icon name="apple" size={28} strokeWidth={1.4} />
            </span>
            <span className="flex h-16 w-16 -rotate-2 items-center justify-center rounded-2xl bg-tomato-500 text-cream-50">
              <Icon name="milk" size={28} strokeWidth={1.3} />
            </span>
          </div>
          <h2 className="max-w-md font-display text-5xl font-medium leading-[1.05] tracking-tight">{panelTitle}</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-cream-100/75">{panelBody}</p>
        </div>

        <div className="relative flex items-center gap-6 text-sm text-cream-100/70">
          <span className="flex items-center gap-2">
            <Icon name="cash" size={16} className="text-marigold-300" />
            Cash on delivery
          </span>
          <span className="flex items-center gap-2">
            <Icon name="shield" size={16} className="text-marigold-300" />
            Secure payments
          </span>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <span className="lg:hidden">
            <Logo />
          </span>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <Icon name="arrow-left" size={16} />
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-md animate-rise-in">{children}</div>
        </div>
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  panelTitle: PropTypes.node.isRequired,
  panelBody: PropTypes.node,
  children: PropTypes.node.isRequired,
};
