import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './store/authStore';
import { useThemeInit } from './store/themeStore';
import { LanguageProvider } from './i18n';
import AppRouter from './routes';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInit() {
  useThemeInit();
  const initializeAuth = useAuth((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppInit />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              borderRadius: '12px',
            },
          }}
        />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
