import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Payment() {
  const nav = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      alert('Payment successful! Your order is being packed.')
      nav('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [nav])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          
          {/* Animated Spinner with Gradient Accents */}
          <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="w-full h-full border-4 border-transparent border-t-purple-600 border-r-pink-600 rounded-full animate-spin"></div>
            <span className="absolute text-2xl">💳</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Processing <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Payment</span>
          </h2>
          <p className="text-slate-600 font-medium text-sm">
            Please wait a moment while we securely process your transaction and confirm your order.
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Encrypted Connection
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/40">
        © {new Date().getFullYear()} Retail Store Management. All rights reserved.
      </footer>
    </div>
  )
}