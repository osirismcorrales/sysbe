/**
 * reservasApi.ts
 * Servicio de la feature "reservas" que usa el apiClient centralizado.
 *
 * Endpoints basados en el ReservaController del backend:
 *  - GET    /api/reservas/usuario/:idUsuario  → obtenerHistorialUsuario
 *  - POST   /api/reservas                     → crearReserva
 *  - PUT    /api/reservas/:idReserva/cancelar  → cancelarReserva
 *  - PUT    /api/reservas/:idReserva/reprogramar → reprogramarReserva
 */

import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';

export interface GetReservasParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ─── DTOs del backend ────────────────────────────────────────────────────────

export type EstadoReserva =
  | 'RESERVADA'
  | 'CANCELADA'
  | 'REPROGRAMADA'
  | 'FINALIZADA'
  | 'BLOQUEADA';

export interface ReservaResponseDto {
  idReserva: number;
  fechaReserva: string;      // "YYYY-MM-DD"
  horarioInicio: string;     // "HH:mm" o "HH:mm:ss"
  horarioFin: string;        // "HH:mm" o "HH:mm:ss"
  estadoReserva: EstadoReserva;
  montoReserva: number;
  idUsuario: number;
  idInstalacion: number;
}

export interface ReservaRequestDto {
  fechaReserva: string;      // "YYYY-MM-DD"
  horarioInicio: string;     // "HH:mm"
  horarioFin: string;        // "HH:mm"
  idUsuario: number;
  idInstalacion: number;
}

export interface ReprogramarReservaRequestDto {
  fechaReserva: string;      // "YYYY-MM-DD"
  horarioInicio: string;     // "HH:mm"
  horarioFin: string;        // "HH:mm"
}

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizeReserva(raw: any): ReservaResponseDto {
  if (!raw) {
    return {
      idReserva: 0,
      fechaReserva: '',
      horarioInicio: '',
      horarioFin: '',
      estadoReserva: 'RESERVADA',
      montoReserva: 0,
      idUsuario: 0,
      idInstalacion: 0,
    };
  }
  return {
    idReserva: raw.idReserva ?? raw.id_reserva ?? raw.id ?? 0,
    fechaReserva: raw.fechaReserva ?? raw.fecha_reserva ?? '',
    horarioInicio: raw.horarioInicio ?? raw.horario_inicio ?? '',
    horarioFin: raw.horarioFin ?? raw.horario_fin ?? '',
    estadoReserva: raw.estadoReserva ?? raw.estado_reserva ?? raw.estado ?? 'RESERVADA',
    montoReserva: Number(raw.montoReserva ?? raw.monto_reserva ?? raw.monto ?? 0),
    idUsuario: raw.idUsuario ?? raw.id_usuario ?? 0,
    idInstalacion: raw.idInstalacion ?? raw.id_instalacion ?? 0,
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/reservas';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/reservas/usuario/:idUsuario — Historial de reservas de un usuario */
export async function getReservasUsuario(idUsuario: number): Promise<ReservaResponseDto[]> {
  const data = await apiClient.get<any[]>(`${RESOURCE}/usuario/${idUsuario}`);
  return (Array.isArray(data) ? data : []).map(normalizeReserva);
}

/** POST /api/reservas — Crear nueva reserva */
export async function crearReserva(body: ReservaRequestDto): Promise<ReservaResponseDto> {
  const data = await apiClient.post<any>(RESOURCE, body);
  return normalizeReserva(data);
}

/** PUT /api/reservas/:idReserva/cancelar — Cancelar reserva */
export async function cancelarReserva(idReserva: number): Promise<ReservaResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${idReserva}/cancelar`);
  return normalizeReserva(data);
}

/** PUT /api/reservas/:idReserva/reprogramar — Reprogramar reserva */
export async function reprogramarReserva(
  idReserva: number,
  body: ReprogramarReservaRequestDto
): Promise<ReservaResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${idReserva}/reprogramar`, body);
  return normalizeReserva(data);
}

/** GET /api/reservas con paginación Spring Data */
export async function getReservasPaginadas(
  params: GetReservasParams = {}
): Promise<PageResponse<ReservaResponseDto>> {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.get<any>(`${RESOURCE}${queryString}`);
  return normalizePageResponse<any, ReservaResponseDto>(data, normalizeReserva);
}

/** GET /api/reservas (todas) */
export async function getReservas(
  params: GetReservasParams = {}
): Promise<ReservaResponseDto[]> {
  const res = await getReservasPaginadas(params);
  return res.content;
}

/**
 * Obtener todas las reservas del sistema.
 * Ahora utiliza el endpoint nativo GET /api/reservas del backend con fallback a usuarios.
 */
export async function getAllReservas(userIds: number[] = []): Promise<ReservaResponseDto[]> {
  try {
    const res = await getReservasPaginadas({ size: 200, sort: 'fechaReserva,desc' });
    if (res.content.length > 0 || userIds.length === 0) {
      return res.content;
    }
  } catch (err) {
    console.warn('Fallback a iteración de usuarios para reservas:', err);
  }

  const results = await Promise.all(
    userIds.map((id) => getReservasUsuario(id).catch(() => [] as ReservaResponseDto[]))
  );
  return results.flat();
}
