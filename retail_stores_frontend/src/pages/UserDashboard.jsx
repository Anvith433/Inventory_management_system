import React, { useState, useEffect } from 'react';
import ShopCard from '../components/ShopCard';
import api from '../services/api';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    try {
      const response = await api.get('/api/shops/nearby');
      setShops(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load shops:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCartUpdate = () => {
    console.log('Cart updated successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        
        {/* Header / Hero Banner */}
        <div className="mb-8 bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Live Stores
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Nearby <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Retail Stores</span>
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Browse available shops, explore products, and add items directly to your cart.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/60">
              {shops.length} {shops.length === 1 ? 'Store Available' : 'Stores Available'}
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className="bg-white/60 backdrop-blur-lg border border-white p-6 rounded-3xl animate-pulse shadow-md flex flex-col gap-4"
              >
                <div className="h-7 bg-slate-200 rounded-xl w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="h-32 bg-slate-200/80 rounded-2xl"></div>
                  <div className="h-32 bg-slate-200/80 rounded-2xl"></div>
                  <div className="h-32 bg-slate-200/80 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-6 bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-lg max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 text-3xl flex items-center justify-center mx-auto mb-4">
              🏪
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Nearby Stores Found</h3>
            <p className="text-slate-500 text-sm mt-2">
              We couldn't locate any active retail shops right now. Please check back later.
            </p>
          </div>
        ) : (
          /* Shop Cards Container */
          <div className="space-y-6">
            {shops.map((shop, index) => (
              <ShopCard 
                key={shop.shopId || shop.shop_id || index} 
                shop={shop} 
                onCartUpdate={handleCartUpdate} 
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  );
};

export default UserDashboard;