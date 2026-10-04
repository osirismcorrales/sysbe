import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { disponibilidadService } from "../services/disponibilidadService";

/**
 * Hook para consultar los bloques de disponibilidad horaria de una instalación en una fecha.
 * GET /api/plantillas-horario/disponibilidad?idInstalacion={id}&fecha={fecha}
 */
export function useDisponibilidad(
  idInstalacion: number | string | null | undefined,
  fecha: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.horarios.disponibilidad(idInstalacion ?? 0, fecha ?? ""),
    queryFn: () => disponibilidadService.consultarDisponibilidad(idInstalacion!, fecha!),
    enabled: Boolean(idInstalacion && fecha),
    staleTime: 1000 * 30, // 30 segundos
  });
}

/**
 * Hook para consultar las plantillas horarias configuradas de una instalación.
 * GET /api/plantillas-horario?idInstalacion={id}
 */
export function usePlantillasHorario(idInstalacion?: number | string) {
  return useQuery({
    queryKey: queryKeys.horarios.plantillas(idInstalacion),
    queryFn: () => disponibilidadService.listarPlantillas(idInstalacion),
    enabled: idInstalacion !== undefined && idInstalacion !== null,
  });
}
