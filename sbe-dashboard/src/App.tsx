import React from 'react';
import { I18nProvider } from '@heroui/react/rac';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui/Toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <I18nProvider locale="es-AR">
          <AppRoutes />
        </I18nProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
