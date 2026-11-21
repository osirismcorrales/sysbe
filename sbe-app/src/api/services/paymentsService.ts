import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { Payment, PagoResponseDto, PagoRequestDto } from "../../data/types";
import { mapPagoToPayment } from "../../data/types";

export type CreatePaymentDTO = Omit<Payment, "id" | "date"> & {
  date?: string;
};

export const paymentsService = {
  /**
   * Obtiene el historial de pagos del usuario autenticado
   * GET /api/pagos/me
   */
  async getMyPagos(): Promise<PagoResponseDto[]> {
    const response = await apiClient.get<PagoResponseDto[]>(ENDPOINTS.PAYMENTS.ME);
    return response.data;
  },

  /**
   * Obtiene el historial de pagos mapeado al modelo interno Payment
   * GET /api/pagos/me
   */
  async getMyPayments(): Promise<Payment[]> {
    const dtos = await paymentsService.getMyPagos();
    return dtos.map(mapPagoToPayment);
  },

  /**
   * Obtiene el detalle de un pago por ID
   * GET /api/pagos/{id}
   */
  async getById(id: string | number): Promise<PagoResponseDto> {
    const response = await apiClient.get<PagoResponseDto>(ENDPOINTS.PAYMENTS.DETAIL(id));
    return response.data;
  },

  /**
   * Crea y registra un pago en el backend: POST /api/pagos
   */
  async crearPago(dto: PagoRequestDto): Promise<PagoResponseDto> {
    const response = await apiClient.post<PagoResponseDto>(ENDPOINTS.PAYMENTS.CREATE, dto);
    return response.data;
  },

  /**
   * Crea un nuevo pago (admin/empleado)
   */
  async create(data: CreatePaymentDTO): Promise<Payment> {
    const response = await apiClient.post<Payment>(ENDPOINTS.PAYMENTS.CREATE, data);
    return response.data;
  },

  /**
   * Realiza el pago de la cuota de membresía
   */
  async payMembership(): Promise<Payment> {
    const response = await apiClient.post<Payment>(ENDPOINTS.PAYMENTS.PAY_MEMBERSHIP);
    return response.data;
  },
};
