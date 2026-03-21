import { useEffect, useState } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/layout';
import { Spinner, Toast } from './components/ui';
import { getErrorMessage, notifyError, notifySuccess, notifyWarning } from './lib/notify';
import { router } from './router';
import { getCurrentSession, getMe, signOut } from './services/auth.service';
import { useUserStore } from './stores/userStore';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silentError) {
        return;
      }

      notifyError(getErrorMessage(error, 'Failed to fetch data.'));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silentError) {
        return;
      }

      notifyError(getErrorMessage(error, 'Action failed. Please try again.'));
    },
  }),
});

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
      } catch (error: unknown) {
        notifyError(getErrorMessage(error, 'Failed to restore your session.'));
        await signOut();
        logout();
      } finally {
        setLoading(false);
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, [authToken, logout, setAuthToken, setLoading, setSubscription, setUser]);

  useEffect(() => {
    const onOnline = () => notifySuccess('Connection restored.');
    const onOffline = () => notifyWarning('You are offline. Some actions may fail.');
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      notifyError(getErrorMessage(event.reason, 'An unexpected error occurred.'));
    };
    const onGlobalError = () => {
      notifyError('Unexpected runtime error occurred.');
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onGlobalError);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onGlobalError);
    };
  }, []);

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
        <Toast />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toast />
    </QueryClientProvider>
  );
};

export default App;
