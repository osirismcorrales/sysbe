import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { Service, TimeSlot } from "../../data/types";

export const servicesService = {
  /**
   * Obtiene la lista completa de servicios / instalaciones disponibles
   */
  async getAll(): Promise<Service[]> {
    const response = await apiClient.get<Service[]>(ENDPOINTS.SERVICES.LIST);
    return response.data;
  },

  /**
   * Obtiene el detalle de un servicio por su ID
   */
  async getById(id: string): Promise<Service> {
    const response = await apiClient.get<Service>(ENDPOINTS.SERVICES.DETAIL(id));
    return response.data;
  },

  /**
   * Obtiene los horarios/turnos disponibles de un servicio para una fecha dada
   */
  async getSlots(id: string, date: string): Promise<TimeSlot[]> {
    const response = await apiClient.get<TimeSlot[]>(ENDPOINTS.SERVICES.SLOTS(id, date));
    return response.data;
  },
};
