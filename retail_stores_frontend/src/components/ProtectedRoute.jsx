import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
          <div className="relative mx-auto w-14 h-14 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="w-full h-full border-4 border-transparent border-t-purple-600 border-r-pink-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-700 font-bold text-base">Verifying Session...</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">Please wait a moment</p>
        </div>
      </div>
    )
  }

  
  if (!user) return <Navigate to="/login" replace />

  // Admin-only route validation
  if (adminOnly && !user.role?.toUpperCase().includes('ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}