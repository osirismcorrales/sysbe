import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';
import type {
  ReporteFiltrosRequestDto,
  ReservaReporteDto,
  SocioActivoReporteDto,
} from '../types/reportes.types';

export interface ReportePaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const getReporteReservasServicioPaginado = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PageResponse<ReservaReporteDto>> => {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.post<any>(
    `/reportes/reservas-servicio${queryString}`,
    filtros
  );
  return normalizePageResponse<any, ReservaReporteDto>(data, (r) => ({
    dni: r.dniUsuario ?? r.dni ?? '',
    dniUsuario: r.dniUsuario ?? r.dni ?? '',
    nombreUsuario: r.nombreUsuario ?? r.nombre ?? '',
    tipoUsuario: r.tipoUsuario ?? r.tipoSocio ?? '',
    tipoSocio: r.tipoUsuario ?? r.tipoSocio ?? '',
    tipoInstalacion: r.tipoInstalacion ?? r.instalacion ?? '',
    instalacion: r.tipoInstalacion ?? r.instalacion ?? '',
    fechaReserva: r.fechaReserva ?? '',
    estado: r.estado ?? '',
  }));
};

export const getReporteReservasServicio = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<ReservaReporteDto[]> => {
  const res = await getReporteReservasServicioPaginado(filtros, params);
  return res.content;
};

export const getReporteReservasFechaPaginado = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PageResponse<ReservaReporteDto>> => {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.post<any>(
    `/reportes/reservas-fecha${queryString}`,
    filtros
  );
  return normalizePageResponse<any, ReservaReporteDto>(data, (r) => ({
    dni: r.dniUsuario ?? r.dni ?? '',
    dniUsuario: r.dniUsuario ?? r.dni ?? '',
    nombreUsuario: r.nombreUsuario ?? r.nombre ?? '',
    tipoUsuario: r.tipoUsuario ?? r.tipoSocio ?? '',
    tipoSocio: r.tipoUsuario ?? r.tipoSocio ?? '',
    tipoInstalacion: r.tipoInstalacion ?? r.instalacion ?? '',
    instalacion: r.tipoInstalacion ?? r.instalacion ?? '',
    fechaReserva: r.fechaReserva ?? '',
    estado: r.estado ?? '',
  }));
};

export const getReporteReservasFecha = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<ReservaReporteDto[]> => {
  const res = await getReporteReservasFechaPaginado(filtros, params);
  return res.content;
};

export const getReporteSociosActivosPaginado = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PageResponse<SocioActivoReporteDto>> => {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.post<any>(
    `/reportes/socios-activos${queryString}`,
    filtros
  );
  return normalizePageResponse<any, SocioActivoReporteDto>(data, (s) => ({
    dni: s.dniUsuario ?? s.dni ?? '',
    dniUsuario: s.dniUsuario ?? s.dni ?? '',
    nombreCompleto: s.nombreUsuario ?? s.nombreCompleto ?? '',
    nombreUsuario: s.nombreUsuario ?? s.nombreCompleto ?? '',
    tipoUsuario: s.tipoUsuario ?? s.tipoSocio ?? '',
    tipoSocio: s.tipoUsuario ?? s.tipoSocio ?? '',
    email: s.email ?? '',
    estado: s.estado ?? 'ACTIVO',
  }));
};

export const getReporteSociosActivos = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<SocioActivoReporteDto[]> => {
  const res = await getReporteSociosActivosPaginado(filtros, params);
  return res.content;
};