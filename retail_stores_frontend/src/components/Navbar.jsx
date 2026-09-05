import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ FIX 1: Match endpoint used across ShopCard and Checkout (/api/orders/cart)
  const fetchCart = async () => {
    try {
      const res = await api.get('/api/orders/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  // ✅ FIX 2: Safely extract array items across all possible DTO field names
  const itemsList = 
    cart?.orderItems || 
    cart?.order_items || 
    cart?.items || 
    cart?.cartItems || 
    (Array.isArray(cart) ? cart : []);

  const cartItemsCount = itemsList.length;
  const totalAmount = cart?.totalAmount ?? cart?.total_amount ?? 0;

  const handleCashCheckout = async () => {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/orders/checkout', { paymentMode: 'COD' });
      setMessage('Order placed successfully via Cash on Delivery!');
      fetchCart();
      setTimeout(() => setIsCartOpen(false), 2000);
    } catch (err) {
      console.error('Checkout failed:', err);
      setMessage(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (totalAmount <= 0) {
      alert('Your cart is empty!');
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay SDK not loaded! Check public/index.html.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/api/payments/create-order', {
        amount: totalAmount,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Retail Store Management',
        description: 'Order Checkout',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 200) {
              await api.post('/api/orders/checkout', { paymentMode: 'ONLINE' });
              setMessage('Payment successful! Order placed.');
              fetchCart();
              setTimeout(() => setIsCartOpen(false), 2000);
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#0f172a',
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();

    } catch (err) {
      console.error('Failed to start Razorpay payment:', err);
      alert('Failed to initiate online payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">
              Retail<span className="text-cyan-600">Store</span>
            </span>
          </Link>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <button
                  onClick={() => {
                    fetchCart();
                    setIsCartOpen(true);
                  }}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-cyan-600 hover:bg-slate-100/60 transition-all flex items-center justify-center"
                  title="View Cart"
                >
                  🛒
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-cyan-600 hover:bg-slate-100/60 transition-all"
                >
                  Profile
                </Link>

                <Link
                  to="/checkout"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Order
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:text-cyan-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {message && (
                <div className="p-4 mb-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {message}
                </div>
              )}

              {cartItemsCount === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">
                  Your cart is currently empty.
                </div>
              ) : (
                <div className="space-y-4">
                  {itemsList.map((item, idx) => {
                    const name = item.productName || item.product_name || item.product?.pname || item.product?.name || `Item #${idx + 1}`;
                    const itemPrice = Number(item.price || item.product?.price || 0);
                    const qty = Number(item.quantity || 1);

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{name}</p>
                          <p className="text-xs text-slate-500">₹{itemPrice.toFixed(2)} × {qty}</p>
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{(itemPrice * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItemsCount > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">₹{Number(totalAmount).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCashCheckout}
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-all disabled:opacity-50"
                  >
                    💵 Cash on Delivery
                  </button>

                  <button
                    onClick={handlePayOnline}
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md hover:shadow-slate-900/20 disabled:opacity-50"
                  >
                    💳 Pay Online
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}