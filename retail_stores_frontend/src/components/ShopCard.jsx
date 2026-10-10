import PropTypes from 'prop-types';
import Icon from './Icon';

// Each shop gets a steady colour, picked from its id, for its little storefront badge.
const SWATCHES = [
  { bg: '#1F4D36', fg: '#F7CF7A' },
  { bg: '#E19A1F', fg: '#1D2B22' },
  { bg: '#D9573B', fg: '#FFFDF9' },
  { bg: '#2F5F69', fg: '#F7F3EC' },
  { bg: '#5F3F7A', fg: '#F9DFA6' },
  { bg: '#7A5A1E', fg: '#FCEFD3' },
];

const initials = (name = '') =>
  name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'S';

/** Compact storefront tile used in the "Shops near you" row; acts as a filter toggle. */
const ShopCard = ({ shop, productCount, active = false, onSelect }) => {
  const id = shop.shopId ?? shop.shop_id ?? 0;
  const name = shop.shopName || shop.shop_name || 'Local shop';
  const swatch = SWATCHES[Math.abs(Number(id) || 0) % SWATCHES.length];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group flex w-64 shrink-0 snap-start items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 sm:w-72 ${
        active
          ? 'border-forest-700 bg-forest-50 ring-1 ring-forest-700'
          : 'border-line bg-white hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft'
      }`}
    >
      <span
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl font-display text-lg font-semibold"
        style={{ backgroundColor: swatch.bg, color: swatch.fg }}
      >
        {/* tiny awning stripe */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-2.5"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${swatch.fg} 0 7px, transparent 7px 14px)`,
            opacity: 0.55,
          }}
        />
        <span className="mt-1.5">{initials(name)}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[17px] font-semibold text-ink">{name}</span>
        {shop.ownerName && <span className="block truncate text-xs text-ink-muted">Run by {shop.ownerName}</span>}
        <span className="mt-1.5 flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Icon name="package" size={13} />
            {productCount} {productCount === 1 ? 'item' : 'items'}
          </span>
          {shop.location && (
            <span className="flex items-center gap-1 truncate">
              <Icon name="pin" size={13} />
              {shop.location}
            </span>
          )}
        </span>
      </span>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
          active ? 'bg-forest-700 text-cream-50' : 'bg-cream-100 text-ink-muted group-hover:text-ink'
        }`}
      >
        <Icon name={active ? 'check' : 'chevron-right'} size={15} strokeWidth={2} />
      </span>
    </button>
  );
};

ShopCard.propTypes = {
  shop: PropTypes.object.isRequired,
  productCount: PropTypes.number,
  active: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default ShopCard;
