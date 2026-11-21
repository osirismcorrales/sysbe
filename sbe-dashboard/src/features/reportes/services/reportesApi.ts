import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';
import type {
  PagoReporteDto,
  ReporteFiltrosRequestDto,
  ReservaReporteDto,
  SocioActivoReporteDto,
} from '../types/reportes.types';

export interface ReportePaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

interface ReservaApiItem {
  dniUsuario?: string;
  dni?: string;
  nombreUsuario?: string;
  nombre?: string;
  tipoUsuario?: string;
  tipoSocio?: string;
  tipoInstalacion?: string;
  instalacion?: string;
  fechaReserva?: string;
  estado?: string;
}

interface SocioApiItem {
  dniUsuario?: string;
  dni?: string;
  nombreUsuario?: string;
  nombreCompleto?: string;
  tipoUsuario?: string;
  tipoSocio?: string;
  email?: string;
  estado?: string;
}

interface PagoApiItem {
  idPago?: number;
  dniUsuario?: string;
  dni?: string;
  nombreUsuario?: string;
  nombreCompleto?: string;
  tipoPago?: string;
  periodo?: string | null;
  idReserva?: number | null;
  montoPago?: number | string;
  metodoPago?: string;
  estadoPago?: string;
  fechaCreacion?: string;
  fechaPago?: string | null;
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
  const data = await apiClient.post<PageResponse<ReservaApiItem>>(
    `/reportes/reservas-servicio${queryString}`,
    filtros
  );
  return normalizePageResponse<ReservaApiItem, ReservaReporteDto>(data, (r) => ({
    dniUsuario: r.dniUsuario ?? r.dni ?? '',
    nombreUsuario: r.nombreUsuario ?? r.nombre ?? '',
    tipoUsuario: r.tipoUsuario ?? r.tipoSocio ?? '',
    tipoInstalacion: r.tipoInstalacion ?? r.instalacion ?? '',
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

export const getReporteSociosActivosPaginado = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PageResponse<SocioActivoReporteDto>> => {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.post<PageResponse<SocioApiItem>>(
    `/reportes/socios-activos${queryString}`,
    filtros
  );
  return normalizePageResponse<SocioApiItem, SocioActivoReporteDto>(data, (s) => ({
    dniUsuario: s.dniUsuario ?? s.dni ?? '',
    nombreUsuario: s.nombreUsuario ?? s.nombreCompleto ?? '',
    tipoUsuario: s.tipoUsuario ?? s.tipoSocio ?? '',
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

export const getReportePagosPaginado = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PageResponse<PagoReporteDto>> => {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.post<PageResponse<PagoApiItem>>(
    `/reportes/pagos${queryString}`,
    filtros
  );
  return normalizePageResponse<PagoApiItem, PagoReporteDto>(data, (p) => ({
    idPago: Number(p.idPago ?? 0),
    dniUsuario: p.dniUsuario ?? p.dni ?? '',
    nombreUsuario: p.nombreUsuario ?? p.nombreCompleto ?? '',
    tipoPago: p.tipoPago ?? '',
    periodo: p.periodo ?? null,
    idReserva: p.idReserva != null ? Number(p.idReserva) : null,
    montoPago: Number(p.montoPago ?? 0),
    metodoPago: p.metodoPago ?? '',
    estadoPago: p.estadoPago ?? '',
    fechaCreacion: p.fechaCreacion ?? '',
    fechaPago: p.fechaPago ?? null,
  }));
};

export const getReportePagos = async (
  filtros: ReporteFiltrosRequestDto = {},
  params: ReportePaginationParams = {}
): Promise<PagoReporteDto[]> => {
  const res = await getReportePagosPaginado(filtros, params);
  return res.content;
};
