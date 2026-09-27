import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { Reservation } from "../../data/types";

export type CreateReservationDTO = Omit<Reservation, "id" | "createdAt" | "status"> & {
  status?: Reservation["status"];
};

export const reservationsService = {
  /**
   * Obtiene la lista de reservas del usuario logueado
   */
  async getAll(): Promise<Reservation[]> {
    const response = await apiClient.get<Reservation[]>(ENDPOINTS.RESERVATIONS.LIST);
    return response.data;
  },

  /**
   * Obtiene una reserva por ID
   */
  async getById(id: string): Promise<Reservation> {
    const response = await apiClient.get<Reservation>(ENDPOINTS.RESERVATIONS.DETAIL(id));
    return response.data;
  },

  /**
   * Crea una nueva reserva
   */
  async create(data: CreateReservationDTO): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(ENDPOINTS.RESERVATIONS.CREATE, data);
    return response.data;
  },

  /**
   * Cancela una reserva existente
   */
  async cancel(id: string): Promise<Reservation> {
    const response = await apiClient.post<Reservation>(ENDPOINTS.RESERVATIONS.CANCEL(id));
    return response.data;
  },
};
