import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { paymentsService, CreatePaymentDTO } from "../services/paymentsService";

/**
 * Hook para consultar el historial de pagos del usuario autenticado.
 * Conecta a GET /api/pagos/me y mapea los PagoResponseDto al modelo Payment.
 */
export function useMyPagos() {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsService.getMyPayments(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * @deprecated Usar useMyPagos() que conecta al backend real (/api/pagos/me)
 */
export function usePayments() {
  return useMyPagos();
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
