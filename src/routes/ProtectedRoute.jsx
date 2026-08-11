import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isResolvingSession } = useAuth();
  const location = useLocation();

  if (isResolvingSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/401" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
