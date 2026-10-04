import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { reservationsService, CreateReservationDTO } from "../services/reservationsService";

/**
 * Hook para obtener las reservas del usuario autenticado (GET /api/reservas/me)
 */
export function useMisReservas() {
  return useQuery({
    queryKey: queryKeys.reservations.list("me"),
    queryFn: () => reservationsService.obtenerMisReservas(),
  });
}

/**
 * Hook para obtener las reservas del usuario
 */
export function useReservations(status?: string) {
  return useQuery({
    queryKey: queryKeys.reservations.list(status),
    queryFn: () => reservationsService.obtenerMisReservas(),
    select: (data) => {
      if (!status) return data;
      return data.filter((r) => r.estadoReserva === status);
    },
  });
}

/**
 * Hook para obtener una reserva por ID
 */
export function useReservationDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(id),
    queryFn: () => reservationsService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook para crear una reserva e invalidar la lista en caché
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationDTO) => reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.points() });
    },
  });
}

/**
 * Hook para cancelar una reserva e invalidar la lista en caché
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.points() });
    },
  });
}
