import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between overflow-hidden">
      
      {/* Navigation Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/30">
            S
          </div>
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">
            Retail<span className="text-cyan-600">Store</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Badge Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          Complete Retail Solution
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
          RETAIL STORE <br />
          <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            MANAGEMENT
          </span>
        </h1>

        <p className="mt-4 text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Your complete solution for retail operations
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-white/80 hover:bg-white text-slate-800 border-2 border-slate-200 font-bold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
          >
            Register
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
          
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-lg border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📦
            </div>
            <h3 className="text-xl font-bold text-slate-800">Order</h3>
            <p className="text-sm text-slate-500 mt-1">Order Management</p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-lg border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🛍️
            </div>
            <h3 className="text-xl font-bold text-slate-800">Shop</h3>
            <p className="text-sm text-slate-500 mt-1">Shop Browsing</p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-lg border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 text-left group">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <h3 className="text-xl font-bold text-slate-800">Secure</h3>
            <p className="text-sm text-slate-500 mt-1">Secure Payment</p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  )
}