import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { Payment } from "../../data/types";

export type CreatePaymentDTO = Omit<Payment, "id" | "date"> & {
  date?: string;
};

export const paymentsService = {
  /**
   * Obtiene el historial de pagos del usuario
   */
  async getAll(): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(ENDPOINTS.PAYMENTS.LIST);
    return response.data;
  },

  /**
   * Obtiene el detalle de un pago
   */
  async getById(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(ENDPOINTS.PAYMENTS.DETAIL(id));
    return response.data;
  },

  /**
   * Registra un nuevo pago
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
