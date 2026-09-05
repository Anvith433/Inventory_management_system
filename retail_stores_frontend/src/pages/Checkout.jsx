import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Helper getters to safely handle camelCase/snake_case responses
  const getOrderItems = (cartData) => cartData?.orderItems || cartData?.order_items || [];
  const getTotalAmount = (cartData) => cartData?.totalAmount ?? cartData?.total_amount ?? 0;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get(`/api/orders/cart`);
        const items = getOrderItems(res.data);
        if (!items.length) {
          alert('Your cart is empty!');
          navigate('/dashboard');
          return;
        }
        setCart(res.data);
      } catch (err) {
        alert('Failed to load cart');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const applyDiscount = async () => {
    if (discountApplied || !cart) return;
    try {
      const items = getOrderItems(cart);
      const currentTotal = getTotalAmount(cart);

      const payload = {
        productIds: items.map(item => item.productId || item.product_id),
        totalAmount: currentTotal
      };

      const res = await api.post(`/api/discounts/apply`, payload);
      const finalAmount = res.data?.finalAmount ?? res.data?.final_amount ?? currentTotal;

      if (finalAmount < currentTotal) {
        setDiscountApplied(true);
        alert(`Discount Applied! You saved ₹${(currentTotal - finalAmount).toFixed(2)}`);
        const updated = await api.get(`/api/orders/cart`);
        setCart(updated.data);
      } else {
        alert('No discount available for this order');
      }
    } catch {
      alert('No discount available');
    }
  };

  const handlePayment = async (paymentMode) => {
    const totalPaid = getTotalAmount(cart);

    // 1. CASH ON DELIVERY FLOW
    if (paymentMode === 'COD') {
      try {
        const res = await api.post(`/api/orders/checkout`, {
          paymentMode: 'COD',
          deliveryMode: 'DELIVERY'
        });

        const orderId = res.data?.orderId ?? res.data?.order_id ?? res.data?.id ?? 'N/A';
        setOrderSuccess({
          orderId,
          totalAmount: res.data?.totalAmount ?? res.data?.total_amount ?? totalPaid
        });
      } catch (err) {
        console.error('Checkout failed:', err);
        alert(err.response?.data?.message || 'Checkout failed. Please try again.');
      }
      return;
    }

    // 2. RAZORPAY ONLINE PAYMENT FLOW
    if (paymentMode === 'ONLINE') {
      if (typeof window.Razorpay === 'undefined') {
        alert('Razorpay SDK not loaded! Make sure <script src="https://checkout.razorpay.com/v1/checkout.js"></script> is inside public/index.html.');
        return;
      }

      try {
        // Step A: Request Spring Boot backend to create a Razorpay Order ID
        const { data } = await api.post('/api/payments/create-order', {
          amount: totalPaid,
        });

        // Step B: Configure Razorpay modal options
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Retail Store Management',
          description: 'Cart Order Checkout',
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            try {
              // Step C: Verify Razorpay signature on Spring Boot backend
              const verifyRes = await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.status === 200) {
                // Step D: Place order in database ONLY after payment verification passes
                const res = await api.post(`/api/orders/checkout`, {
                  paymentMode: 'ONLINE',
                  deliveryMode: 'DELIVERY'
                });

                const orderId = res.data?.orderId ?? res.data?.order_id ?? res.data?.id ?? 'N/A';
                setOrderSuccess({
                  orderId,
                  totalAmount: res.data?.totalAmount ?? res.data?.total_amount ?? totalPaid
                });
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

        // Step E: Launch Razorpay Overlay
        const razorpayInstance = new window.Razorpay(options);

        razorpayInstance.on('payment.failed', function (response) {
          alert('Payment Failed: ' + response.error.description);
        });

        razorpayInstance.open();

      } catch (err) {
        console.error('Razorpay initiation failed:', err);
        alert('Failed to launch Razorpay payment: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleBackAndCancel = async () => {
    if (!window.confirm('Cancel order and clear cart?')) return;
    try {
      await api.delete(`/api/orders/cart`);
      alert('Cart cleared. Returning to dashboard.');
      navigate('/dashboard');
    } catch {
      alert('Failed to cancel cart. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-xl">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-700 font-bold text-lg">Loading your cart...</p>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
          © {new Date().getFullYear()} Retail Store Management. All rights reserved.
        </footer>
      </div>
    );
  }

  // Render Confirmation UI when placed successfully
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
        <Navbar />

        <main className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-3xl shadow-2xl text-center w-full">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 text-4xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              ✓
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Your order <span className="font-bold text-slate-900">#{orderSuccess.orderId}</span> has been placed successfully and is being packed.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Paid</span>
              <span className="text-2xl font-black text-slate-800">
                ₹{Number(orderSuccess.totalAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm"
              >
                View Order History
              </button>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
          © {new Date().getFullYear()} Retail Store Management. All rights reserved.
        </footer>
      </div>
    );
  }

  if (!cart) return null;

  const items = getOrderItems(cart);
  const totalAmount = getTotalAmount(cart);
  const isHighValue = totalAmount > 2000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        {/* VIP Banner */}
        {isHighValue && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-3xl shadow-xl shadow-orange-500/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
                👑
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-wide">High Value Order!</h2>
                <p className="text-sm font-medium opacity-95">You're a VIP — enjoy priority delivery & dedicated support.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Review Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
                Order Review
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Cart</span>
              </h1>
            </div>

            <button
              onClick={handleBackAndCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>✕</span> Cancel Order
            </button>
          </div>

          {/* Product Items */}
          <div className="space-y-3 mb-8">
            {items.map((item, idx) => {
              const productName = item.productName || item.product_name || item.pname || `Product #${item.productId || item.product_id}`;
              const price = Number(item.price || 0);
              const qty = Number(item.quantity || 1);

              return (
                <div 
                  key={item.productId || item.product_id || idx} 
                  className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl hover:border-slate-300 transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-base">{productName}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      ₹{price.toFixed(2)} × {qty}
                    </p>
                  </div>
                  <p className="text-lg font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{(price * qty).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t-2 border-slate-100 pt-6 flex items-center justify-between px-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
              <span className="text-3xl font-black text-slate-900">Total</span>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Discount Action */}
          <button
            onClick={applyDiscount}
            disabled={discountApplied}
            className={`w-full mt-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${
              discountApplied
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-default'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/30 transform hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {discountApplied ? '✓ Discount Applied!' : '✨ Apply Special Discount'}
          </button>

          {/* Payment Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handlePayment('COD')}
              className="py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
            >
              💵 Cash on Delivery
            </button>
            <button
              onClick={() => handlePayment('ONLINE')}
              className="py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-lg hover:shadow-slate-800/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base"
            >
              💳 Pay Online
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  );
}