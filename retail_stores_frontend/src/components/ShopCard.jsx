import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=400&auto=format&fit=crop";

const ShopCard = ({ shop, onCartUpdate }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState({});

  // Helper to extract productId regardless of camelCase/snake_case
  const getProductId = (product) => product.productId || product.product_id;

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const res = await api.get('/api/orders/cart');
        const items = res.data.order_items || res.data.orderItems || [];
        const qtyMap = {};

        items.forEach(item => {
          const pId = item.product?.productId || item.product?.product_id;
          if (pId) {
            qtyMap[pId] = item.quantity;
          }
        });

        setCartItems(qtyMap);
      } catch (err) {
        console.error('Failed to load cart', err);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (product) => {
    if (!user) {
      alert('Please login');
      return;
    }

    const pId = getProductId(product);
    const newQty = (cartItems[pId] || 0) + 1;

    try {
      // ✅ FIXED: Send `productId` (camelCase) to match AddCartItemRequestDTO
      await api.post('/api/orders/cart', {
        productId: pId,
        quantity: 1,
      });

      setCartItems(prev => ({ ...prev, [pId]: newQty }));
      onCartUpdate?.();
    } catch (err) {
      alert('Failed to add item');
      console.error("❌ Error adding item:", err);
    }
  };

  const decreaseQuantity = async (product) => {
    const pId = getProductId(product);
    const currentQty = cartItems[pId] || 0;

    if (currentQty <= 1) {
      removeFromCart(product);
      return;
    }

    try {
      await api.delete(`/api/orders/cart/item/${pId}`);

      setCartItems(prev => ({
        ...prev,
        [pId]: currentQty - 1
      }));

      onCartUpdate?.();
    } catch (err) {
      alert('Failed to update');
      console.error(err);
    }
  };

  const removeFromCart = async (product) => {
    const pId = getProductId(product);
    if (!window.confirm(`Remove ${product.pname} from cart?`)) return;

    try {
      await api.delete(`/api/orders/cart/item/${pId}`);

      setCartItems(prev => {
        const updated = { ...prev };
        delete updated[pId];
        return updated;
      });

      onCartUpdate?.();
    } catch (err) {
      alert('Failed to remove');
      console.error(err);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-6 transition-all">
      {/* Store Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
          🏪
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
            {shop.shopName || shop.shop_name}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
            <span>📍</span> {shop.location || 'Local Store'}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {shop.products?.map((product) => {
          const pId = getProductId(product);
          const qty = cartItems[pId] || 0;

          return (
            <div
              key={pId}
              className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all duration-200"
            >
              <div>
                {/* Product Image */}
                <div className="w-full h-32 mb-3 rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src={product.imageUrl || product.image_url || DEFAULT_PRODUCT_IMAGE}
                    alt={product.pname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                </div>

                <h4 className="font-bold text-slate-800 text-sm truncate">{product.pname}</h4>
                <p className="font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-lg mt-1">
                  ₹{Number(product.price).toFixed(2)}
                </p>
              </div>

              <div className="mt-4 pt-2">
                {qty === 0 ? (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 px-3 rounded-xl hover:shadow-md hover:shadow-purple-500/20 active:scale-95 transition-all duration-200"
                  >
                    + Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => decreaseQuantity(product)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 font-extrabold text-base hover:bg-red-100 transition-colors"
                    >
                      –
                    </button>

                    <span className="px-2 font-bold text-xs text-slate-800">{qty}</span>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 font-extrabold text-base hover:bg-cyan-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!shop.products || shop.products.length === 0) && (
        <p className="text-slate-400 text-sm italic mt-2 text-center">No products available in this store.</p>
      )}
    </div>
  );
};

ShopCard.propTypes = {
  shop: PropTypes.object.isRequired,
  onCartUpdate: PropTypes.func,
};

export default ShopCard;