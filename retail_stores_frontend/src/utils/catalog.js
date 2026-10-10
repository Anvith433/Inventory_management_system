import api from '../services/api';

// Visual treatment for product categories: an icon plus a soft background tint.
// Products in the DB rarely have photos, so these tints double as the
// product "image" in cards, the cart and checkout.

const STYLES = [
  { match: ['chocolate', 'snack', 'sweet', 'candy', 'biscuit', 'confection'], icon: 'cookie', bg: '#FCEFD3', fg: '#8A5A0C' },
  { match: ['breakfast', 'cereal', 'oats', 'coffee', 'tea'], icon: 'coffee', bg: '#F6E4D4', fg: '#8B4A22' },
  { match: ['personal', 'care', 'soap', 'beauty', 'hygiene', 'toothpaste', 'bath'], icon: 'droplet', bg: '#E0ECEE', fg: '#2F5F69' },
  { match: ['dairy', 'milk', 'curd', 'paneer', 'cheese'], icon: 'milk', bg: '#ECEEF5', fg: '#4A5683' },
  { match: ['fruit'], icon: 'apple', bg: '#FADFD6', fg: '#9A3420' },
  { match: ['veg', 'produce', 'greens'], icon: 'carrot', bg: '#DDE9E0', fg: '#1F4D36' },
  { match: ['beverage', 'drink', 'juice', 'soda'], icon: 'soda', bg: '#E9E1F0', fg: '#5F3F7A' },
  { match: ['house', 'clean', 'home', 'kitchen', 'detergent'], icon: 'home', bg: '#E8E6DF', fg: '#4F4A3A' },
  { match: ['grocer', 'rice', 'staple', 'grain', 'atta', 'flour', 'dal', 'pulse', 'oil', 'spice'], icon: 'wheat', bg: '#F1E7D0', fg: '#7A5A1E' },
];

const FALLBACK = { icon: 'basket', bg: '#EFE8DB', fg: '#46534A' };

export function categoryStyle(category) {
  const c = (category || '').toLowerCase();
  if (!c) return FALLBACK;
  return STYLES.find((s) => s.match.some((m) => c.includes(m))) || FALLBACK;
}

export const getProductId = (p) => p?.productId ?? p?.product_id ?? p?.product?.productId ?? p?.product?.product_id;

export const getItemName = (item, idx = 0) =>
  item.productName ||
  item.product_name ||
  item.pname ||
  item.product?.pname ||
  item.product?.name ||
  `Item #${getProductId(item) ?? idx + 1}`;

export const getCartItems = (cart) =>
  cart?.order_items || cart?.orderItems || cart?.items || cart?.cartItems || (Array.isArray(cart) ? cart : []);

export const getCartTotal = (cart) => Number(cart?.total_amount ?? cart?.totalAmount ?? 0);

// Cart lines only carry id/name/price/qty. Products seen on the shop page are
// remembered here so the basket and checkout can show the right picture,
// category tint and shop name.
const seenProducts = new Map();

export function rememberProducts(list = []) {
  list.forEach((p) => {
    const id = getProductId(p);
    if (id != null) seenProducts.set(String(id), p);
  });
}

export const lookupProduct = (id) => (id == null ? undefined : seenProducts.get(String(id)));

let catalogRequest = null;

/** Load the nearby shops' products once, for pages opened directly (checkout, orders…). */
export function ensureCatalog() {
  if (seenProducts.size > 0) return Promise.resolve();
  if (!catalogRequest) {
    catalogRequest = api
      .get('/api/shops/nearby')
      .then((res) => {
        (Array.isArray(res.data) ? res.data : []).forEach((shop) =>
          rememberProducts(
            (shop.products || []).map((p) => ({ ...p, shopName: shop.shopName || shop.shop_name }))
          )
        );
      })
      .catch(() => {})
      .finally(() => {
        catalogRequest = null;
      });
  }
  return catalogRequest;
}

/** Time-of-day greeting for the shop header. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const firstName = (name) => (name || '').trim().split(/\s+/)[0] || 'there';
