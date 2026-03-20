import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = ROUTES.LOGIN }: ProtectedRouteProps) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
