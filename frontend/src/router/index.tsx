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
import { AdminLayout, DashboardLayout, PublicLayout } from '../components/layout';
import { ROUTES } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

const SubscribePage = () => <div>SubscribePage</div>;
const DashboardHomePage = () => <div>DashboardHomePage</div>;
const ScoresPage = () => <div>ScoresPage</div>;
const DrawsPage = () => <div>DrawsPage</div>;
const WinningsPage = () => <div>WinningsPage</div>;
const MyCharityPage = () => <div>MyCharityPage</div>;
const SubscriptionPage = () => <div>SubscriptionPage</div>;
const AdminUsersPage = () => <div>AdminUsersPage</div>;
const AdminDrawsPage = () => <div>AdminDrawsPage</div>;
const AdminCharitiesPage = () => <div>AdminCharitiesPage</div>;
const AdminWinnersPage = () => <div>AdminWinnersPage</div>;
const AdminReportsPage = () => <div>AdminReportsPage</div>;

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
        element: <SubscribePage />,
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
        path: 'dashboard/scores',
        element: <ScoresPage />,
      },
      {
        path: 'dashboard/draws',
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
