import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { userService } from "../services/userService";
import { getAuthToken } from "../client";
import type { UsuarioResponseDto, UsuarioUpdateMeDto } from "../../data/types";

/**
 * Hook para consultar la información de perfil de un usuario por su ID
 * Utiliza: GET http://localhost:8080/api/usuarios/{id}
 */
export function useUserById(id: string | number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.user.detail(id ?? ""),
    queryFn: () => userService.getById(id!),
    enabled: Boolean(id && getAuthToken()) && (options?.enabled ?? true),
  });
}

/**
 * Hook para consultar el perfil del usuario actual
 * Utiliza: GET http://localhost:8080/api/usuarios/me
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => userService.getProfile(),
    enabled: Boolean(getAuthToken()),
  });
}

/**
 * Hook de mutación para que un usuario actualice su propio perfil
 * Utiliza: PUT http://localhost:8080/api/usuarios/me
 */
export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UsuarioUpdateMeDto) => userService.updateMe(dto),
    onSuccess: (updatedUser: UsuarioResponseDto) => {
      // Actualizar la caché del perfil
      queryClient.setQueryData(queryKeys.user.profile(), updatedUser);
      if (updatedUser.id) {
        queryClient.setQueryData(queryKeys.user.detail(updatedUser.id), updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Alias de useUpdateMeMutation
 */
export const useUpdateUserProfile = useUpdateMeMutation;

/**
 * Hook para consultar estado de la membresía y cuotas
 */
export function useMembership() {
  return useQuery({
    queryKey: queryKeys.user.membership(),
    queryFn: () => userService.getMembership(),
  });
}

/**
 * Hook para consultar los movimientos y saldo de puntos
 */
export function usePoints() {
  return useQuery({
    queryKey: queryKeys.user.points(),
    queryFn: () => userService.getPoints(),
  });
}

/**
 * Hook para consultar promociones activas
 */
export function usePromotions() {
  return useQuery({
    queryKey: queryKeys.promotions.list(),
    queryFn: () => userService.getPromotions(),
  });
}

/**
 * Hook para canjear una promoción
 */
export function useRedeemPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promoId: string) => userService.redeemPromotion(promoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.points() });
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
    },
  });
}
