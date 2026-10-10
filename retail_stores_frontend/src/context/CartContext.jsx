import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { ensureCatalog, getCartItems, getCartTotal, getProductId } from '../utils/catalog';

const CartContext = createContext(null);

/**
 * One shared cart for the whole app, so the header badge, product cards,
 * the basket drawer and checkout always agree. Every cart endpoint returns
 * the updated cart, which we store directly instead of refetching.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState({}); // productId -> true while a request is in flight
  const [catalogTick, setCatalogTick] = useState(0); // bumps once product pictures/categories are known

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/api/orders/cart');
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      return null;
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refresh();
      ensureCatalog().then(() => setCatalogTick((t) => t + 1));
    } else {
      setCart(null);
      setLoaded(false);
    }
  }, [user, refresh]);

  const withBusy = async (productId, fn) => {
    setBusy((b) => ({ ...b, [productId]: true }));
    try {
      const res = await fn();
      if (res?.data && typeof res.data === 'object') setCart(res.data);
      else await refresh();
      return res?.data;
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[productId];
        return next;
      });
    }
  };

  // Add one unit (the backend increments the existing line).
  const addItem = (productId) =>
    withBusy(productId, () => api.post('/api/orders/cart', { productId, quantity: 1 }));

  // Remove one unit (the backend decrements and drops the line at zero).
  const removeOne = (productId) =>
    withBusy(productId, () => api.delete(`/api/orders/cart/item/${productId}`));

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clear = async () => {
    await api.delete('/api/orders/cart');
    await refresh();
  };

  const value = useMemo(() => {
    const items = getCartItems(cart);
    const total = getCartTotal(cart);
    const qtyById = {};
    let count = 0;
    items.forEach((item) => {
      const id = getProductId(item);
      const q = Number(item.quantity) || 0;
      if (id != null) qtyById[id] = q;
      count += q;
    });
    const subtotal = items.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    );
    return { cart, items, total, subtotal, count, qtyById, loaded, busy, isOpen, catalogTick };
  }, [cart, loaded, busy, isOpen, catalogTick]);

  return (
    <CartContext.Provider
      value={{
        ...value,
        refresh,
        addItem,
        removeOne,
        clear,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
