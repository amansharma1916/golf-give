import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

interface SubscriberRouteProps {
  children: ReactNode;
}

const SubscriberRoute = ({ children }: SubscriberRouteProps) => {
  const subscription = useUserStore((state) => state.subscription);
  const hasActiveSubscription = subscription?.status === 'active';

  if (!hasActiveSubscription) {
    return <Navigate to={ROUTES.PRICING} replace />;
  }

  return <>{children}</>;
};

export default SubscriberRoute;
