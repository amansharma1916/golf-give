import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = useUserStore((state) => state.user?.isAdmin === true);

  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
