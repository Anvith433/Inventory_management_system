import PropTypes from 'prop-types';
import Icon from './Icon';
import ProductThumb from './ProductThumb';
import QtyStepper from './QtyStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getProductId } from '../utils/catalog';
import { price } from '../utils/format';

const LOW_STOCK = 10;

export default function ProductCard({ product, shopName, style }) {
  const { qtyById, busy, addItem, removeOne } = useCart();
  const toast = useToast();

  const id = getProductId(product);
  const qty = qtyById[id] || 0;
  const stock = product.stockQuantity ?? product.stock_quantity;
  const hasStock = stock == null || stock > 0;
  const lowStock = stock != null && stock > 0 && stock <= LOW_STOCK;
  const canAdd = stock == null || qty < stock;
  const isBusy = !!busy[id];

  const add = async () => {
    try {
      await addItem(id);
      if (qty === 0) toast(`${product.pname} is in your basket`, { tone: 'success' });
    } catch (err) {
      console.error('Error adding item:', err);
      toast(err.response?.data?.message || "Couldn't add that just now — try again?", { tone: 'error' });
    }
  };

  const remove = async () => {
    try {
      await removeOne(id);
    } catch (err) {
      console.error('Error updating item:', err);
      toast("Couldn't update your basket", { tone: 'error' });
    }
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift animate-rise-in"
      style={style}
    >
      <div className="relative">
        <ProductThumb
          src={product.imageUrl || product.image_url}
          alt={product.pname}
          category={product.category}
          className="aspect-[5/4] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {!hasStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-cream-50">
            Sold out
          </span>
        ) : lowStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-tomato-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Only {stock} left
          </span>
        ) : null}
        {product.category && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {shopName && (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Icon name="store" size={13} />
            <span className="truncate">{shopName}</span>
          </p>
        )}
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.75rem] font-medium leading-snug text-ink">{product.pname}</h3>

        <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
          <p className="font-display text-xl font-semibold leading-none text-ink">{price(product.price)}</p>

          {qty > 0 ? (
            <QtyStepper
              qty={qty}
              onAdd={add}
              onRemove={remove}
              busy={isBusy}
              canAdd={canAdd}
              size="sm"
              className="w-full justify-between sm:w-auto"
            />
          ) : (
            <button
              onClick={add}
              disabled={!hasStock || isBusy}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border sm:w-auto border-forest-700 px-4 text-sm font-semibold text-forest-700 transition-colors hover:bg-forest-700 hover:text-cream-50 disabled:border-line disabled:text-ink-muted disabled:hover:bg-transparent"
            >
              <Icon name="plus" size={15} strokeWidth={2.25} />
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  shopName: PropTypes.string,
  style: PropTypes.object,
};
