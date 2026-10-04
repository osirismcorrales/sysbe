import { apiClient } from '../../../lib/apiClient';
import type {
  ReporteFiltrosRequestDto,
  ReservaReporteDto,
  SocioActivoReporteDto,
} from '../types/reportes.types';

export const getReporteReservasServicio = async (
  filtros: ReporteFiltrosRequestDto = {}
): Promise<ReservaReporteDto[]> => {
  return await apiClient.post<ReservaReporteDto[]>(
    '/reportes/reservas-servicio',
    filtros
  );
};

export const getReporteReservasFecha = async (
  filtros: ReporteFiltrosRequestDto = {}
): Promise<ReservaReporteDto[]> => {
  return await apiClient.post<ReservaReporteDto[]>(
    '/reportes/reservas-fecha',
    filtros
  );
};

export const getReporteSociosActivos = async (
  filtros: ReporteFiltrosRequestDto = {}
): Promise<SocioActivoReporteDto[]> => {
  return await apiClient.post<SocioActivoReporteDto[]>(
    '/reportes/socios-activos',
    filtros
  );
};