import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import ProductThumb from '../components/ProductThumb';
import QtyStepper from '../components/QtyStepper';
import { ensureCatalog, firstName, getItemName, getProductId, lookupProduct } from '../utils/catalog';
import { price } from '../utils/format';

const HIGH_VALUE = 2000;

const PAYMENT_OPTIONS = [
  {
    value: 'COD',
    icon: 'cash',
    title: 'Cash on delivery',
    body: 'Pay the delivery person when your order arrives.',
  },
  {
    value: 'ONLINE',
    icon: 'card',
    title: 'Pay online',
    body: 'UPI, cards or netbanking — handled securely by Razorpay.',
  },
];

function Steps({ current }) {
  const steps = ['Basket', 'Checkout', 'Done'];
  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              i < current
                ? 'bg-forest-700 text-cream-50'
                : i === current
                  ? 'bg-ink text-cream-50'
                  : 'border border-line bg-white text-ink-muted'
            }`}
          >
            {i < current ? <Icon name="check" size={13} strokeWidth={2.5} /> : i + 1}
          </span>
          <span className={i === current ? 'font-medium text-ink' : 'text-ink-muted'}>{s}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-line sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, subtotal, busy, addItem, removeOne, refresh, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [paymentMode, setPaymentMode] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Always start from a fresh copy of the cart.
  useEffect(() => {
    Promise.all([refresh(), ensureCatalog()]).finally(() => setLoading(false));
  }, [refresh]);

  const savings = Math.max(0, subtotal - total);

  const applyDiscount = async () => {
    if (discountApplied || !items.length) return;
    setApplyingDiscount(true);
    try {
      const payload = {
        productIds: items.map((item) => getProductId(item)),
        totalAmount: total,
      };

      const res = await api.post(`/api/discounts/apply`, payload);
      const finalAmount = res.data?.finalAmount ?? res.data?.final_amount ?? total;

      if (finalAmount < total) {
        setDiscountApplied(true);
        toast(`Nice — you saved ${price(Number((total - finalAmount).toFixed(2)))}`, { tone: 'success' });
        await refresh();
      } else {
        toast('No offers on this basket right now');
      }
    } catch {
      toast('No offers on this basket right now');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const finishOrder = async (res, mode, fallbackTotal) => {
    const orderId = res.data?.orderId ?? res.data?.order_id ?? res.data?.id ?? 'N/A';
    setOrderSuccess({
      orderId,
      paymentMode: mode,
      totalAmount: res.data?.totalAmount ?? res.data?.total_amount ?? fallbackTotal,
    });
    window.scrollTo({ top: 0 });
    await refresh();
  };

  const handlePayment = async () => {
    const totalPaid = total;

    // 1. CASH ON DELIVERY FLOW
    if (paymentMode === 'COD') {
      setPlacing(true);
      try {
        const res = await api.post(`/api/orders/checkout`, {
          paymentMode: 'COD',
          deliveryMode: 'DELIVERY',
        });
        await finishOrder(res, 'COD', totalPaid);
      } catch (err) {
        console.error('Checkout failed:', err);
        toast(err.response?.data?.message || 'We couldn’t place your order. Please try again.', { tone: 'error' });
      } finally {
        setPlacing(false);
      }
      return;
    }

    // 2. RAZORPAY ONLINE PAYMENT FLOW
    if (typeof window.Razorpay === 'undefined') {
      toast('Online payments are unavailable right now — try cash on delivery.', { tone: 'error' });
      return;
    }

    setPlacing(true);
    try {
      // Step A: Ask the backend to create a Razorpay order
      const { data } = await api.post('/api/payments/create-order', {
        amount: totalPaid,
      });

      // Step B: Configure the Razorpay modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'RetailStore',
        description: 'Your basket',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          setPlacing(true);
          try {
            // Step C: Verify the Razorpay signature on the backend
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 200) {
              // Step D: Place the order only after payment verification passes
              const res = await api.post(`/api/orders/checkout`, {
                paymentMode: 'ONLINE',
                deliveryMode: 'DELIVERY',
              });
              await finishOrder(res, 'ONLINE', totalPaid);
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            toast('We couldn’t confirm that payment. Please contact support.', { tone: 'error', duration: 5000 });
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#1F4D36',
        },
      };

      // Step E: Open the Razorpay overlay
      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        setPlacing(false);
        toast('Payment failed: ' + response.error.description, { tone: 'error', duration: 5000 });
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay initiation failed:', err);
      setPlacing(false);
      toast('Couldn’t start the payment: ' + (err.response?.data?.message || err.message), { tone: 'error' });
    }
  };

  const handleEmptyBasket = async () => {
    try {
      await clear();
      setConfirmCancel(false);
      toast('Basket emptied');
      navigate('/dashboard');
    } catch {
      toast('Couldn’t empty your basket. Try again.', { tone: 'error' });
    }
  };

  const safely = (fn) => async () => {
    try {
      await fn();
    } catch (err) {
      console.error('Cart update failed:', err);
      toast("Couldn't update your basket", { tone: 'error' });
    }
  };

  // ---- Order placed -------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container-page flex flex-1 flex-col items-center py-12 sm:py-16">
          <Steps current={2} />
          <div className="card mt-10 w-full max-w-lg p-8 text-center sm:p-10 animate-rise-in">
            <div className="relative mx-auto h-20 w-20">
              <span className="absolute inset-0 rotate-6 rounded-[26px] bg-marigold-300" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-[26px] bg-forest-700 text-cream-50">
                <Icon name="check" size={36} strokeWidth={2.25} />
              </span>
            </div>

            <h1 className="mt-7 font-display text-3xl font-medium text-ink sm:text-4xl">
              Thank you, {firstName(user?.name)}!
            </h1>
            <p className="mt-3 text-ink-soft">
              Order <span className="font-semibold text-ink">#{orderSuccess.orderId}</span> is in and the shop is getting
              it ready.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl bg-cream-100 p-4">
                <dt className="eyebrow">{orderSuccess.paymentMode === 'COD' ? 'To pay on delivery' : 'Paid online'}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold tabular text-ink">
                  {price(Number(orderSuccess.totalAmount || 0))}
                </dd>
              </div>
              <div className="rounded-2xl bg-cream-100 p-4">
                <dt className="eyebrow">Delivering to</dt>
                <dd className="mt-1 truncate text-sm font-medium text-ink">{user?.street || user?.address || '—'}</dd>
                <dd className="truncate text-xs text-ink-muted">
                  {[user?.city, user?.pincode].filter(Boolean).join(' · ')}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/orders')} className="btn btn-primary flex-1">
                <Icon name="receipt" size={17} />
                View my orders
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-outline flex-1">
                Keep shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container-page flex-1 py-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
              <Icon name="arrow-left" size={16} />
              Keep shopping
            </Link>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">Checkout</h1>
          </div>
          <Steps current={1} />
        </div>

        {loading ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-24 !rounded-2xl" />
              ))}
            </div>
            <div className="skeleton h-96 !rounded-3xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="card mx-auto mt-12 max-w-lg p-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-marigold-100 text-marigold-600">
              <Icon name="basket" size={30} strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-medium text-ink">Your basket is empty</h2>
            <p className="mt-2 text-sm text-ink-muted">Add a few things from the shops near you and come back here to pay.</p>
            <Link to="/dashboard" className="btn btn-primary mt-6">
              Browse the shops
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left column */}
            <div className="space-y-6">
              {total > HIGH_VALUE && (
                <div className="flex items-center gap-4 rounded-2xl border border-marigold-200 bg-marigold-50 p-4 sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marigold-400 text-ink">
                    <Icon name="star" size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">That’s a big basket!</p>
                    <p className="text-sm text-ink-soft">Orders over {price(HIGH_VALUE)} get priority delivery and dedicated support.</p>
                  </div>
                </div>
              )}

              <section className="card">
                <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                  <h2 className="font-display text-xl font-medium text-ink">
                    In your basket <span className="text-ink-muted">({items.length})</span>
                  </h2>
                  {confirmCancel ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="hidden text-ink-soft sm:inline">Empty everything?</span>
                      <button onClick={handleEmptyBasket} className="btn btn-danger btn-sm">
                        Yes, empty it
                      </button>
                      <button onClick={() => setConfirmCancel(false)} className="btn btn-ghost btn-sm">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-tomato-600"
                    >
                      <Icon name="trash" size={15} />
                      Empty basket
                    </button>
                  )}
                </header>

                <ul className="divide-y divide-line">
                  {items.map((item, idx) => {
                    const id = getProductId(item);
                    const known = lookupProduct(id);
                    const unit = Number(item.price) || 0;
                    const qty = Number(item.quantity) || 1;
                    const stock = known?.stockQuantity;
                    return (
                      <li key={id ?? idx} className="flex gap-4 px-5 py-4 sm:px-6">
                        <ProductThumb
                          src={known?.imageUrl}
                          alt={getItemName(item, idx)}
                          category={known?.category}
                          size="sm"
                          className="h-20 w-20 rounded-xl"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{getItemName(item, idx)}</p>
                            <p className="mt-0.5 text-sm text-ink-muted">
                              {price(unit)} each{known?.shopName ? ` · ${known.shopName}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-6 sm:justify-end">
                            <QtyStepper
                              qty={qty}
                              size="sm"
                              busy={!!busy[id] || placing}
                              canAdd={stock == null || qty < stock}
                              onAdd={safely(() => addItem(id))}
                              onRemove={safely(() => removeOne(id))}
                            />
                            <p className="w-20 text-right font-semibold tabular text-ink">{price(unit * qty)}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <Icon name="truck" size={20} />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-medium text-ink">Delivering to {firstName(user?.name)}</h2>
                      <p className="mt-1 text-sm text-ink-soft">{user?.street || user?.address || 'No street address saved yet'}</p>
                      <p className="text-sm text-ink-soft">{[user?.city, user?.pincode].filter(Boolean).join(' – ')}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="btn btn-ghost btn-sm shrink-0">
                    <Icon name="pencil" size={14} />
                    Change
                  </Link>
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="card space-y-6 p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-medium text-ink">Order summary</h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Items</dt>
                  <dd className="tabular text-ink">{price(subtotal || total)}</dd>
                </div>
                {savings > 0.009 && (
                  <div className="flex justify-between text-forest-600">
                    <dt>Offer savings</dt>
                    <dd className="tabular">−{price(Number(savings.toFixed(2)))}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery</dt>
                  <dd className="text-ink">No charge</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-dashed border-line pt-4">
                  <dt className="font-semibold text-ink">To pay</dt>
                  <dd className="font-display text-3xl font-semibold tabular text-ink">{price(total)}</dd>
                </div>
              </dl>

              <button
                onClick={applyDiscount}
                disabled={discountApplied || applyingDiscount}
                className={`flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left transition-colors ${
                  discountApplied
                    ? 'border-forest-300 bg-forest-50'
                    : 'border-marigold-500 bg-marigold-50 hover:bg-marigold-100'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    discountApplied ? 'bg-forest-700 text-cream-50' : 'bg-marigold-400 text-ink'
                  }`}
                >
                  <Icon name={discountApplied ? 'check' : 'tag'} size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {discountApplied ? 'Offer applied' : applyingDiscount ? 'Checking for offers…' : 'Check for offers'}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {discountApplied ? 'Your savings are included above.' : 'We’ll apply anything your basket qualifies for.'}
                  </span>
                </span>
              </button>

              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-ink">How would you like to pay?</legend>
                <div className="space-y-2.5">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const selected = paymentMode === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                          selected ? 'border-forest-700 bg-forest-50 ring-1 ring-forest-700' : 'border-line hover:border-ink/25'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value={opt.value}
                          checked={selected}
                          onChange={() => setPaymentMode(opt.value)}
                          className="sr-only"
                        />
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? 'border-forest-700' : 'border-ink/25'
                          }`}
                        >
                          {selected && <span className="h-2.5 w-2.5 rounded-full bg-forest-700" />}
                        </span>
                        <span className="flex-1">
                          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <Icon name={opt.icon} size={17} className="text-ink-soft" />
                            {opt.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-muted">{opt.body}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <button onClick={handlePayment} disabled={placing} className="btn btn-primary btn-lg w-full">
                {placing
                  ? 'Placing your order…'
                  : paymentMode === 'COD'
                    ? `Place order · ${price(total)}`
                    : `Pay ${price(total)}`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
                <Icon name="lock" size={13} />
                Payments are encrypted and processed by Razorpay
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
