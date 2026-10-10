import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import ProductThumb from './ProductThumb';
import QtyStepper from './QtyStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getItemName, getProductId, lookupProduct } from '../utils/catalog';
import { price } from '../utils/format';

export default function CartDrawer() {
  const { isOpen, closeCart, items, count, total, busy, addItem, removeOne } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Close on Escape and lock page scroll while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const safely = (fn) => async () => {
    try {
      await fn();
    } catch (err) {
      console.error('Cart update failed:', err);
      toast("Couldn't update your basket", { tone: 'error' });
    }
  };

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Your basket">
      <button
        aria-label="Close basket"
        onClick={closeCart}
        className="absolute inset-0 cursor-default bg-ink/40 animate-fade-in"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-cream-50 shadow-lift animate-slide-in-right">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Your basket</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {count === 0 ? 'Nothing in here yet' : `${count} ${count === 1 ? 'item' : 'items'}`}
            </p>
          </div>
          <button onClick={closeCart} className="btn btn-ghost h-10 w-10 !p-0" aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </header>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="relative mb-6">
              <span className="absolute inset-0 -rotate-6 rounded-[28px] bg-marigold-200" />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-line bg-white text-forest-700">
                <Icon name="basket" size={44} strokeWidth={1.25} />
              </span>
            </div>
            <p className="font-display text-xl font-medium text-ink">Your basket is empty</p>
            <p className="mt-2 max-w-[16rem] text-sm text-ink-muted">
              Have a wander through the shops near you — anything you add will show up here.
            </p>
            <Link to="/dashboard" onClick={closeCart} className="btn btn-primary mt-6">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item, idx) => {
                const id = getProductId(item);
                const known = lookupProduct(id);
                const unit = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const stock = known?.stockQuantity;
                return (
                  <li key={id ?? idx} className="flex gap-4 py-4">
                    <ProductThumb
                      src={known?.imageUrl}
                      alt={getItemName(item, idx)}
                      category={known?.category}
                      size="sm"
                      className="h-16 w-16 rounded-xl"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{getItemName(item, idx)}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {price(unit)} each{known?.shopName ? ` · ${known.shopName}` : ''}
                          </p>
                        </div>
                        <p className="font-semibold tabular text-ink">{price(unit * qty)}</p>
                      </div>
                      <div className="mt-2">
                        <QtyStepper
                          qty={qty}
                          size="sm"
                          busy={!!busy[id]}
                          canAdd={stock == null || qty < stock}
                          onAdd={safely(() => addItem(id))}
                          onRemove={safely(() => removeOne(id))}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-line bg-white px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">Subtotal</span>
                <span className="font-display text-2xl font-semibold tabular text-ink">{price(total)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Offers are checked at checkout. Pay on delivery or online.
              </p>
              <button onClick={goToCheckout} className="btn btn-primary btn-lg mt-5 w-full">
                Go to checkout
                <Icon name="arrow-right" size={18} />
              </button>
              <button onClick={closeCart} className="mt-2 w-full py-2 text-sm font-medium text-ink-soft hover:text-ink">
                Keep shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
