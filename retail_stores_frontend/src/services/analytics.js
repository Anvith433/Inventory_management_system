// Thin wrappers over the /api/admin/analytics/* endpoints, using the shared axios
// instance (which attaches the Bearer token). Each returns response.data.
import api from './api';

const BASE = '/api/admin/analytics';

/** Drop null/undefined/'' params so we never send `?from=&to=`. */
function clean(params = {}) {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') out[k] = v;
  });
  return out;
}

export const getSummary = ({ from, to, lowStockThreshold } = {}) =>
  api.get(`${BASE}/summary`, { params: clean({ from, to, lowStockThreshold }) }).then((r) => r.data);

export const getShops = ({ from, to } = {}) =>
  api.get(`${BASE}/shops`, { params: clean({ from, to }) }).then((r) => r.data);

export const getShopDetail = (shopId, { from, to, lowStockThreshold } = {}) =>
  api
    .get(`${BASE}/shops/${shopId}`, { params: clean({ from, to, lowStockThreshold }) })
    .then((r) => r.data);

export const getTopProducts = ({ limit, from, to } = {}) =>
  api.get(`${BASE}/top-products`, { params: clean({ limit, from, to }) }).then((r) => r.data);

export const getLowStock = ({ threshold } = {}) =>
  api.get(`${BASE}/inventory/low-stock`, { params: clean({ threshold }) }).then((r) => r.data);

export const getOutOfStock = () =>
  api.get(`${BASE}/inventory/out-of-stock`).then((r) => r.data);
