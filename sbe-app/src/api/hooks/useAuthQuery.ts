import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { authService } from "../services/authService";
import type { LoginRequestDto, LoginResponseDto } from "../../data/types";

/**
 * Hook para consultar el usuario logueado en la sesión
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.getMe(),
    retry: false,
  });
}

/**
 * Hook de mutación para iniciar sesión con POST /api/auth/login
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequestDto) => authService.login(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
}

/**
 * Hook de mutación para cerrar sesión
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      authService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
