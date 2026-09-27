import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente global de TanStack React Query con configuración óptima para aplicaciones móviles React Native.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que la data se considera fresca antes de volver a solicitarla en background (2 minutos)
      staleTime: 1000 * 60 * 2,
      // Tiempo que la data inactiva permanece en memoria caché (10 minutos)
      gcTime: 1000 * 60 * 10,
      // Intentos de reintento en caso de fallo de red
      retry: 2,
      // En dispositivos móviles se desactiva refetch on window focus porque no aplica la ventana web tradicional
      refetchOnWindowFocus: false,
      // Reintentar cuando se reconecte la red
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
