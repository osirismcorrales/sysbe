/**
 * instalacionesApi.ts
 * Servicio de la feature "instalaciones" que usa el apiClient centralizado.
 */

import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';

export interface GetInstalacionesParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ─── DTOs del backend ────────────────────────────────────────────────────────

export interface InstalacionResponseDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionMinutos: number;
  estado: string;
}

export interface InstalacionRequestDto {
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionMinutos: number;
  estado: string;
}

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizeInstalacion(raw: any): InstalacionResponseDto {
  if (!raw) {
    return {
      id: 0,
      nombre: '',
      descripcion: '',
      precioBase: 0,
      duracionMinutos: 60,
      estado: 'Habilitada',
    };
  }
  return {
    id: raw.id ?? 0,
    nombre: raw.nombre ?? '',
    descripcion: raw.descripcion ?? '',
    // El backend puede devolver "precioBase" (camelCase) o "precio_base" (snake_case)
    precioBase: raw.precioBase ?? raw.precio_base ?? raw.precio ?? 0,
    // Idem: "duracionMinutos" o "duracion_minutos"
    duracionMinutos: raw.duracionMinutos ?? raw.duracion_minutos ?? raw.duracion ?? 60,
    estado: raw.estado || 'Habilitada',
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/instalaciones';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/instalaciones con paginación */
export async function getInstalacionesPaginadas(
  params: GetInstalacionesParams = {}
): Promise<PageResponse<InstalacionResponseDto>> {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  try {
    const data = await apiClient.get<any>(`/instalaciones/todas${queryString}`);
    return normalizePageResponse<any, InstalacionResponseDto>(data, normalizeInstalacion);
  } catch {
    const data = await apiClient.get<any>(`${RESOURCE}${queryString}`);
    return normalizePageResponse<any, InstalacionResponseDto>(data, normalizeInstalacion);
  }
}

/** GET /api/instalaciones (compatibilidad) */
export async function getInstalaciones(
  params: GetInstalacionesParams = {}
): Promise<InstalacionResponseDto[]> {
  const res = await getInstalacionesPaginadas(params);
  return res.content;
}

/** GET /api/instalaciones/:id */
export async function getInstalacionById(id: number): Promise<InstalacionResponseDto> {
  const data = await apiClient.get<any>(`${RESOURCE}/${id}`);
  return normalizeInstalacion(data);
}

/** POST /api/instalaciones */
export async function createInstalacion(
  body: InstalacionRequestDto
): Promise<InstalacionResponseDto> {
  const data = await apiClient.post<any>(RESOURCE, body);
  return normalizeInstalacion(data);
}

/** PUT /api/instalaciones/:id */
export async function updateInstalacion(
  id: number,
  body: InstalacionRequestDto
): Promise<InstalacionResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${id}`, body);
  return normalizeInstalacion(data);
}

/** DELETE /api/instalaciones/:id */
export async function deleteInstalacion(id: number): Promise<void> {
  await apiClient.del(`${RESOURCE}/${id}`);
}
