import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { servicesService } from "../services/servicesService";

/**
 * Hook para obtener la lista de servicios / instalaciones disponibles
 */
export function useServices(category?: string) {
  return useQuery({
    queryKey: queryKeys.services.list(category),
    queryFn: () => servicesService.getAll(),
    select: (data) => {
      if (!category) return data;
      return data.filter((s) => s.category === category);
    },
  });
}

/**
 * Hook para obtener el detalle de un servicio individual
 */
export function useServiceDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => servicesService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook para consultar los turnos disponibles para un servicio y fecha
 */
export function useServiceSlots(id: string, date: string) {
  return useQuery({
    queryKey: queryKeys.services.slots(id, date),
    queryFn: () => servicesService.getSlots(id, date),
    enabled: Boolean(id && date),
  });
}
