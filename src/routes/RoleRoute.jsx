import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ROLE_HOME } from '../context/roleHome';

export function RoleRoute({ roles }) {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
