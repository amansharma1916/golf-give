import type { ReactElement } from 'react';
import { Navigate, createBrowserRouter, Outlet } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import ProtectedRoute from './ProtectedRoute';
import SubscriberRoute from './SubscriberRoute';
import { ComponentTestPage } from '../pages/public/ComponentTestPage';
import { HomePage } from '../pages/public/HomePage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { PricingPage } from '../pages/public/PricingPage';
import { CharitiesPage } from '../pages/public/CharitiesPage';
import { CharityProfilePage } from '../pages/public/CharityProfilePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { SubscribePage } from '../pages/auth/SubscribePage';
import { DashboardHomePage } from '../pages/dashboard/DashboardHomePage';
import { ScoresPage } from '../pages/dashboard/ScoresPage';
import { DrawsPage } from '../pages/dashboard/DrawsPage';
import { WinningsPage } from '../pages/dashboard/WinningsPage';
import { MyCharityPage } from '../pages/dashboard/MyCharityPage';
import { SubscriptionPage } from '../pages/dashboard/SubscriptionPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDrawsPage } from '../pages/admin/AdminDrawsPage';
import { AdminCharitiesPage } from '../pages/admin/AdminCharitiesPage';
import { AdminWinnersPage } from '../pages/admin/AdminWinnersPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminLayout, DashboardLayout, PublicLayout } from '../components/layout';
import { ROUTES } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

const AuthEntryRoute = ({ children }: { children: ReactElement }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    element: (
      <PublicLayout navbarTransparent={false}>
        <Outlet />
      </PublicLayout>
    ),
    children: [
      {
        path: ROUTES.HOW_IT_WORKS,
        element: <HowItWorksPage />,
      },
      {
        path: ROUTES.PRICING,
        element: <PricingPage />,
      },
      {
        path: ROUTES.CHARITIES,
        element: <CharitiesPage />,
      },
      {
        path: '/charities/:id',
        element: <CharityProfilePage />,
      },
      {
        path: ROUTES.SUBSCRIBE,
        element: (
          <ProtectedRoute redirectTo={ROUTES.SIGNUP}>
            <SubscribePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/test',
        element: <ComponentTestPage />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <AuthEntryRoute>
        <LoginPage />
      </AuthEntryRoute>
    ),
  },
  {
    path: ROUTES.SIGNUP,
    element: (
      <AuthEntryRoute>
        <SignupPage />
      </AuthEntryRoute>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <SubscriberRoute>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </SubscriberRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardHomePage />,
      },
      {
        path: ROUTES.SCORES,
        element: <ScoresPage />,
      },
      {
        path: ROUTES.DRAWS,
        element: <DrawsPage />,
      },
      {
        path: 'dashboard/winnings',
        element: <WinningsPage />,
      },
      {
        path: 'dashboard/charity',
        element: <MyCharityPage />,
      },
      {
        path: 'dashboard/subscription',
        element: <SubscriptionPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: 'admin/draws',
        element: <AdminDrawsPage />,
      },
      {
        path: 'admin/charities',
        element: <AdminCharitiesPage />,
      },
      {
        path: 'admin/winners',
        element: <AdminWinnersPage />,
      },
      {
        path: 'admin/reports',
        element: <AdminReportsPage />,
      },
    ],
  },
]);
