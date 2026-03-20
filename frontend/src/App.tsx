import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
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

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        setLoading(true);
        const session = await getCurrentSession();

        if (!session?.access_token) {
          logout();
          return;
        }

        setAuthToken(session.access_token);
        const me = await getMe();
        setUser(me.user);
        setSubscription(me.subscription);
      } catch {
        await signOut();
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [logout, setAuthToken, setLoading, setSubscription, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
