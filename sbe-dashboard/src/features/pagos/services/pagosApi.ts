/**
 * pagosApi.ts
 * Servicio de la feature "pagos" que usa el apiClient centralizado.
 *
 * Endpoints del PagoController del backend:
 *  - POST   /api/pagos                             → crearPago
 *  - GET    /api/pagos                             → listarTodos (Pageable + filtros)
 *  - GET    /api/pagos/:id                         → buscarPorId
 *  - GET    /api/pagos/usuario/:idUsuario          → listarHistorialUsuario
 *  - GET    /api/pagos/me                          → listarMisPagos
 *  - PUT    /api/pagos/:id/aprobar                 → aprobarPago
 *  - PUT    /api/pagos/:id/rechazar                → rechazarPago
 *  - PUT    /api/pagos/:id/anular                  → anularPago
 *  - PUT    /api/pagos/:id/estado                  → cambiarEstadoPago
 */

import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';
import type {
  CambiarEstadoPagoRequestDto,
  EstadoPago,
  GetPagosParams,
  PagoRequestDto,
  PagoResponseDto,
} from '../types/pagos.types';

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizePago(raw: any): PagoResponseDto {
  if (!raw) {
    return {
      idPago: 0,
      idUsuario: 0,
      dniUsuario: '',
      nombreUsuario: '',
      idReserva: null,
      tipoPago: 'CUOTA_MEMBRESIA',
      periodo: null,
      montoPago: 0,
      metodoPago: 'EFECTIVO',
      estadoPago: 'PENDIENTE',
      fechaCreacion: '',
      fechaPago: null,
      registradoPorId: null,
      registradoPorNombre: null,
    };
  }

  const rawIdReserva = raw.idReserva ?? raw.id_reserva ?? null;
  const rawRegistradoPorId = raw.registradoPorId ?? raw.registrado_por_id ?? null;

  return {
    idPago: Number(raw.idPago ?? raw.id_pago ?? raw.id ?? 0),
    idUsuario: Number(raw.idUsuario ?? raw.id_usuario ?? 0),
    dniUsuario: raw.dniUsuario ?? raw.dni_usuario ?? raw.dni ?? '',
    nombreUsuario: raw.nombreUsuario ?? raw.nombre_usuario ?? raw.nombreCompleto ?? '',
    idReserva: rawIdReserva != null ? Number(rawIdReserva) : null,
    tipoPago: raw.tipoPago ?? raw.tipo_pago ?? 'CUOTA_MEMBRESIA',
    periodo: raw.periodo ?? null,
    montoPago: Number(raw.montoPago ?? raw.monto_pago ?? raw.monto ?? 0),
    metodoPago: raw.metodoPago ?? raw.metodo_pago ?? 'EFECTIVO',
    estadoPago: raw.estadoPago ?? raw.estado_pago ?? 'PENDIENTE',
    fechaCreacion: raw.fechaCreacion ?? raw.fecha_creacion ?? '',
    fechaPago: raw.fechaPago ?? raw.fecha_pago ?? null,
    registradoPorId: rawRegistradoPorId != null ? Number(rawRegistradoPorId) : null,
    registradoPorNombre:
      raw.registradoPorNombre ?? raw.registrado_por_nombre ?? null,
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/pagos';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/pagos con paginación y filtros opcionales */
export async function getPagosPaginados(
  params: GetPagosParams = {}
): Promise<PageResponse<PagoResponseDto>> {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);
  if (params.idUsuario != null) query.set('idUsuario', String(params.idUsuario));
  if (params.estadoPago) query.set('estadoPago', params.estadoPago);
  if (params.tipoPago) query.set('tipoPago', params.tipoPago);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.get<any>(`${RESOURCE}${queryString}`);
  return normalizePageResponse<any, PagoResponseDto>(data, normalizePago);
}

/** GET /api/pagos/:id */
export async function getPagoById(idPago: number): Promise<PagoResponseDto> {
  const data = await apiClient.get<any>(`${RESOURCE}/${idPago}`);
  return normalizePago(data);
}

/** GET /api/pagos/usuario/:idUsuario — Historial de pagos de un usuario */
export async function getPagosUsuario(idUsuario: number): Promise<PagoResponseDto[]> {
  const data = await apiClient.get<any[]>(`${RESOURCE}/usuario/${idUsuario}`);
  return (Array.isArray(data) ? data : []).map(normalizePago);
}

/** GET /api/pagos/me — Pagos del usuario autenticado */
export async function getMisPagos(): Promise<PagoResponseDto[]> {
  const data = await apiClient.get<any[]>(`${RESOURCE}/me`);
  return (Array.isArray(data) ? data : []).map(normalizePago);
}

/** POST /api/pagos — Registrar un nuevo pago */
export async function crearPago(body: PagoRequestDto): Promise<PagoResponseDto> {
  const data = await apiClient.post<any>(RESOURCE, body);
  return normalizePago(data);
}

/** PUT /api/pagos/:id/aprobar */
export async function aprobarPago(idPago: number): Promise<PagoResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${idPago}/aprobar`);
  return normalizePago(data);
}

/** PUT /api/pagos/:id/rechazar */
export async function rechazarPago(idPago: number): Promise<PagoResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${idPago}/rechazar`);
  return normalizePago(data);
}

/** PUT /api/pagos/:id/anular */
export async function anularPago(idPago: number): Promise<PagoResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${idPago}/anular`);
  return normalizePago(data);
}

/** PUT /api/pagos/:id/estado */
export async function cambiarEstadoPago(
  idPago: number,
  estadoPago: EstadoPago
): Promise<PagoResponseDto> {
  const body: CambiarEstadoPagoRequestDto = { estadoPago };
  const data = await apiClient.put<any>(`${RESOURCE}/${idPago}/estado`, body);
  return normalizePago(data);
}
