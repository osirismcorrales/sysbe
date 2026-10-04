import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { servicesService } from "../services/servicesService";

/**
 * Hook para obtener la lista de instalaciones disponibles
 * GET /api/instalaciones
 */
export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesService.getAll(),
  });
}

/**
 * Hook para obtener el detalle de una instalación individual
 * GET /api/instalaciones/{id}
 */
export function useServiceDetail(id: string | number) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => servicesService.getById(id),
    enabled: Boolean(id),
  });
}
