import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { userService } from "../services/userService";
import type { User } from "../../data/types";

/**
 * Hook para consultar el perfil del usuario actual
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => userService.getProfile(),
  });
}

/**
 * Hook para actualizar información del perfil
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partial: Partial<User>) => userService.updateProfile(partial),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user.profile(), updatedUser);
    },
  });
}

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
