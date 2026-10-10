import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream-100 p-6">
        <span className="h-10 w-10 rounded-full border-[3px] border-cream-300 border-t-forest-700 animate-spin" />
        <p className="text-sm font-medium text-ink-soft">Checking you in…</p>
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