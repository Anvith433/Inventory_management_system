import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  
  const storedUserRaw = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

  const activeUser = user || storedUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-10 font-bold text-slate-600">Loading...</div>
      </div>
    );
  }

  
  if (!activeUser || !token) {
    return <Navigate to="/login" replace />;
  }

  
  if (adminOnly) {
    const userRole = activeUser.role || activeUser.roles?.[0] || '';
    const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}