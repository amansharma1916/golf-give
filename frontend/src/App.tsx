import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/layout';
import { Spinner } from './components/ui';
import { router } from './router';
import { getCurrentSession, getMe, signOut } from './services/auth.service';
import { useUserStore } from './stores/userStore';

const queryClient = new QueryClient();

const App = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setSubscription = useUserStore((state) => state.setSubscription);
  const setAuthToken = useUserStore((state) => state.setAuthToken);
  const setLoading = useUserStore((state) => state.setLoading);
  const logout = useUserStore((state) => state.logout);
  const authToken = useUserStore((state) => state.authToken);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        setLoading(true);
        const session = await getCurrentSession();
        const token = session?.access_token ?? authToken;

        if (!token) {
          logout();
          return;
        }

        setAuthToken(token);
        const me = await getMe();
        setUser(me.user);
        setSubscription(me.subscription);
      } catch {
        await signOut();
        logout();
      } finally {
        setLoading(false);
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, [authToken, logout, setAuthToken, setLoading, setSubscription, setUser]);

  if (isBootstrapping) {
    return (
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-primary)',
            color: 'var(--color-surface)',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              GolfGive
            </div>
            <Spinner size="lg" color="accent" />
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
