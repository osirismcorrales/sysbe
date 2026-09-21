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

import { apiClient } from '../../../lib/apiClient';

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

/**
 * Obtener todas las reservas del sistema iterando por cada usuario.
 * Nota: Esto es una solución temporal hasta que el backend exponga GET /api/reservas.
 */
export async function getAllReservas(userIds: number[]): Promise<ReservaResponseDto[]> {
  const results = await Promise.all(
    userIds.map((id) => getReservasUsuario(id).catch(() => [] as ReservaResponseDto[]))
  );
  return results.flat();
}
