import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import ProductThumb from '../components/ProductThumb';
import api from '../services/api';
import { ensureCatalog, getItemName, getProductId, lookupProduct } from '../utils/catalog';
import { price } from '../utils/format';

// Status pill colours. Anything unknown falls back to the neutral style.
const STATUS_STYLES = [
  { match: ['deliver', 'complete'], cls: 'bg-forest-100 text-forest-800', dot: 'bg-forest-600' },
  { match: ['cancel', 'fail', 'reject'], cls: 'bg-tomato-50 text-tomato-700', dot: 'bg-tomato-500' },
  { match: ['pending', 'process', 'pack', 'ship', 'cart', 'high_value'], cls: 'bg-marigold-100 text-marigold-700', dot: 'bg-marigold-500' },
];

const statusStyle = (status) => {
  const s = (status || '').toLowerCase();
  return (
    STATUS_STYLES.find((st) => st.match.some((m) => s.includes(m))) || {
      cls: 'bg-cream-200 text-ink-soft',
      dot: 'bg-ink-muted',
    }
  );
};

const prettyStatus = (status) =>
  (status || 'Confirmed')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

const prettyPayment = (mode) => {
  const m = (mode || '').toUpperCase();
  if (m === 'COD') return { icon: 'cash', label: 'Cash on delivery' };
  if (m === 'ONLINE') return { icon: 'card', label: 'Paid online' };
  return mode ? { icon: 'wallet', label: mode } : null;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [res] = await Promise.all([api.get('/api/orders'), ensureCatalog()]);
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('We couldn’t load your orders just now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Safe field getters to handle camelCase and snake_case DTOs
  const getOrderId = (order) => order.orderId ?? order.order_id ?? order.id ?? '—';
  const getOrderDate = (order) => {
    const rawDate = order.orderDate || order.order_date || order.createdAt;
    return rawDate
      ? new Date(rawDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recently';
  };
  const getOrderTotal = (order) => Number(order.totalAmount ?? order.total_amount ?? 0);
  const getOrderItems = (order) => order.orderItems || order.order_items || order.items || [];
  const getStatus = (order) => order.orderStatus || order.status || 'CONFIRMED';
  const getPayment = (order) => order.paymentMode || order.payment_mode;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-page max-w-4xl flex-1 py-8 sm:py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <Icon name="arrow-left" size={16} />
          Back to the shops
        </Link>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">My orders</h1>
          {!loading && orders.length > 0 && (
            <p className="pb-1 text-sm text-ink-muted">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} so far
            </p>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-tomato-100 bg-tomato-50 p-4 text-sm text-tomato-700">
            <Icon name="alert" size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-44 !rounded-3xl" />
            ))}
          </div>
        ) : !orders.length && !error ? (
          <div className="card mt-8 p-10 text-center sm:p-14">
            <div className="relative mx-auto h-20 w-20">
              <span className="absolute inset-0 -rotate-6 rounded-[26px] bg-marigold-200" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border border-line bg-white text-forest-700">
                <Icon name="receipt" size={34} strokeWidth={1.4} />
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-medium text-ink">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              Once you’ve placed an order it’ll show up here, along with what you paid and how.
            </p>
            <Link to="/dashboard" className="btn btn-primary mt-7">
              Start shopping
            </Link>
          </div>
        ) : (
          <ol className="mt-8 space-y-5">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const status = getStatus(order);
              const st = statusStyle(status);
              const pay = prettyPayment(getPayment(order));
              const units = items.reduce((n, i) => n + (Number(i.quantity) || 1), 0);

              return (
                <li key={getOrderId(order)} className="card overflow-hidden">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div>
                        <p className="eyebrow">Order</p>
                        <p className="font-display text-lg font-semibold text-ink">#{getOrderId(order)}</p>
                      </div>
                      <div>
                        <p className="eyebrow">Placed</p>
                        <p className="text-sm font-medium text-ink">{getOrderDate(order)}</p>
                      </div>
                      {pay && (
                        <div className="hidden sm:block">
                          <p className="eyebrow">Payment</p>
                          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                            <Icon name={pay.icon} size={15} className="text-ink-muted" />
                            {pay.label}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {prettyStatus(status)}
                    </span>
                  </header>

                  <ul className="divide-y divide-line px-5 sm:px-6">
                    {items.map((item, idx) => {
                      const id = getProductId(item);
                      const known = lookupProduct(id);
                      const qty = Number(item.quantity) || 1;
                      const unit = Number(item.price || 0);
                      return (
                        <li key={id ?? idx} className="flex items-center gap-4 py-3.5">
                          <ProductThumb
                            src={known?.imageUrl}
                            alt={getItemName(item, idx)}
                            category={known?.category}
                            size="xs"
                            className="h-12 w-12 rounded-lg"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{getItemName(item, idx)}</p>
                            <p className="text-xs text-ink-muted">
                              {qty} × {price(unit)}
                            </p>
                          </div>
                          <p className="text-sm font-medium tabular text-ink">{price(qty * unit)}</p>
                        </li>
                      );
                    })}
                  </ul>

                  <footer className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-6">
                    <span className="text-sm text-ink-muted">
                      {units} {units === 1 ? 'item' : 'items'}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="text-sm text-ink-soft">Total</span>
                      <span className="font-display text-2xl font-semibold tabular text-ink">{price(getOrderTotal(order))}</span>
                    </span>
                  </footer>
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}
