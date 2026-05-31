import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './store/authStore';
import { ThemeProvider } from './store/themeStore';
import { SettingsProvider } from './store/settingsStore';
import { LanguageProvider } from './i18n';
import AppRouter from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <AppRouter />
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                  },
                }}
              />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
