import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders'); // or /api/orders
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your order history.');
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
    return rawDate ? new Date(rawDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'Recent';
  };
  const getOrderTotal = (order) => Number(order.totalAmount ?? order.total_amount ?? 0).toFixed(2);
  const getOrderItems = (order) => order.orderItems || order.order_items || order.items || [];
  const getStatus = (order) => order.orderStatus || order.status || 'CONFIRMED';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-xl">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-bold text-lg">Loading order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/dashboard"
              className="text-cyan-600 hover:text-cyan-700 text-xs font-bold uppercase tracking-wider transition-colors inline-block mb-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Order <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">History</span>
            </h1>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            {error}
          </div>
        )}

        {!orders.length ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white p-12 rounded-3xl shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 text-3xl flex items-center justify-center mx-auto mb-4">
              🛍️
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Orders Placed Yet</h2>
            <p className="text-slate-500 text-xs mb-6">Looks like you haven't bought anything yet.</p>
            <Link
              to="/dashboard"
              className="inline-block py-3 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = getOrderItems(order);
              return (
                <div
                  key={getOrderId(order)}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                      <h3 className="text-lg font-black text-slate-900">#{getOrderId(order)}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                        <span className="text-xs font-bold text-slate-700">{getOrderDate(order)}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {getStatus(order)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-3 mb-6">
                    {items.map((item, idx) => {
                      const name = item.productName || item.product_name || item.pname || `Product #${item.productId || item.product_id || idx}`;
                      const qty = item.quantity || 1;
                      const price = Number(item.price || 0);

                      return (
                        <div key={idx} className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{name}</p>
                            <p className="text-xs text-slate-500 font-semibold">Qty: {qty} × ₹{price.toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-slate-800 text-sm">₹{(qty * price).toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Paid */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</span>
                    <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹{getOrderTotal(order)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  );
}