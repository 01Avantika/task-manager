import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader">Loading workspace...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
