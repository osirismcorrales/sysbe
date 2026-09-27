import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { paymentsService, CreatePaymentDTO } from "../services/paymentsService";

/**
 * Hook para consultar el historial de pagos del usuario
 */
export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsService.getAll(),
  });
}

/**
 * Hook para crear un nuevo pago
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDTO) => paymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}

/**
 * Hook para pagar la cuota de membresía
 */
export function usePayMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => paymentsService.payMembership(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.membership() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.points() });
    },
  });
}
