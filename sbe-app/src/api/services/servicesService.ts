import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { InstalacionResponseDto, Service } from "../../data/types";
import { mapInstalacionToService } from "../../data/types";

export const servicesService = {
  /**
   * Obtiene la lista de instalaciones disponibles (operativas)
   * GET /api/instalaciones
   */
  async getAll(): Promise<Service[]> {
    const response = await apiClient.get<InstalacionResponseDto[]>(ENDPOINTS.INSTALACIONES.LIST);
    return response.data.map(mapInstalacionToService);
  },

  /**
   * Obtiene el detalle de una instalación por su ID
   * GET /api/instalaciones/{id}
   */
  async getById(id: string | number): Promise<Service> {
    const response = await apiClient.get<InstalacionResponseDto>(ENDPOINTS.INSTALACIONES.DETAIL(id));
    return mapInstalacionToService(response.data);
  },
};
