import { QueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/Toast';
import { ApiError } from './apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutos de stale time por defecto
    },
    mutations: {
      onError: (error) => {
        // Manejador centralizado para errores no interceptados por los formularios
        if (error instanceof ApiError) {
          if (error.status === 409) {
            toast.warning(error.mensaje || 'Conflicto con los datos existentes', 'Conflicto');
          } else if (error.status >= 500) {
            toast.error(error.mensaje || 'Error interno del servidor', 'Servidor');
          } else if (error.status !== 400 && error.status !== 422) {
            // 400/422 suelen ser gestionados por los formularios
            toast.error(error.mensaje || 'Error al procesar la solicitud');
          }
        } else if (error instanceof Error) {
          toast.error(error.message);
        }
      },
    },
  },
});
