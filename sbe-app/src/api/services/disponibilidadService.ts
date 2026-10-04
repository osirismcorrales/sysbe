import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import type { BloqueDto, PlantillaHorarioResponseDto } from "../../data/types";

export const disponibilidadService = {
  /**
   * Consulta los bloques de disponibilidad horaria para una instalación en una fecha determinada.
   * GET /api/plantillas-horario/disponibilidad?idInstalacion={id}&fecha={fecha}
   */
  async consultarDisponibilidad(
    idInstalacion: number | string,
    fecha: string
  ): Promise<BloqueDto[]> {
    const response = await apiClient.get<BloqueDto[]>(
      ENDPOINTS.HORARIOS.DISPONIBILIDAD(idInstalacion, fecha)
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Consulta las plantillas horarias configuradas para una instalación.
   * GET /api/plantillas-horario?idInstalacion={id}
   */
  async listarPlantillas(
    idInstalacion?: number | string
  ): Promise<PlantillaHorarioResponseDto[]> {
    const response = await apiClient.get<PlantillaHorarioResponseDto[]>(
      ENDPOINTS.HORARIOS.PLANTILLAS(idInstalacion)
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
