import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from 'sonner';
import { GlobalErrorBoundary } from '../components/common/GlobalErrorBoundary';
import { authApi } from '../services/api/auth.api';
import { useAuthStore } from '../stores/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export function App() {
  const { setServerOnline, setInitializing } = useAuthStore();

  useEffect(() => {
    // Hydrate authenticated user session from backend if token exists
    const initSession = async () => {
      try {
        const isOnline = await authApi.checkHealth();
        setServerOnline(isOnline);
        
        if (isOnline) {
          await authApi.getProfile();
        }
      } catch (err) {
        console.debug('Session initialization background note:', err);
      } finally {
        setInitializing(false);
      }
    };

    initSession();
  }, [setServerOnline, setInitializing]);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
            },
          }}
        />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;

