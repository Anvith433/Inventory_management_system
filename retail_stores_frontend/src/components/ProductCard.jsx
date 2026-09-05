export default function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex flex-col justify-between h-full shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div>
        {/* Category Badge & Product Name */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="font-bold text-slate-800 text-base group-hover:text-cyan-600 transition-colors line-clamp-1">
            {product.pname}
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200/60 px-2 py-0.5 rounded-full flex-shrink-0">
            {product.category || 'Item'}
          </span>
        </div>

        {/* Price Tag */}
        <p className="text-xl font-black bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mt-2">
          ₹{Number(product.price).toFixed(2)}
        </p>
      </div>

      {/* Add to Cart Button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => onAdd(product)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <span>+</span> Add to Cart
        </button>
      </div>
    </div>
  );
}