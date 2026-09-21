/**
 * sociosApi.ts
 * Servicio de la feature "socios" que usa el apiClient centralizado.
 *
 * Endpoints basados en el SocioService del backend:
 *  - GET    /api/socios              → listarSociosActivos
 *  - GET    /api/socios/:dni         → buscarSocioPorDni
 *  - PUT    /api/socios/:dni/categoria → asignarCategoria
 *  - PUT    /api/socios/:dni/baja-membresia → darDeBajaMembresia
 *  - POST   /api/socios/:dni/puntos/sumar  → sumarPuntos
 *  - POST   /api/socios/:dni/puntos/canjear → canjearPuntos
 *  - GET    /api/categorias          → listarTodas (categorías)
 */

import { apiClient } from '../../../lib/apiClient';

// ─── DTOs del backend ────────────────────────────────────────────────────────

export interface SocioResponseDto {
  idUsuario: number;
  dni: string;
  nombreCompleto: string;
  email: string;
  estado: string;
  puntosAc: number;
  idCategoria: number;
  tipoSocio: string;
  vinculoUnse: string;
  descuentoPorcentaje: number;
}

export interface AsignarCategoriaRequestDto {
  categoriaId: number;
}

export interface AjustePuntosRequestDto {
  puntos: number;
}

export interface CategoriaResponseDto {
  idCategoria: number;
  tipoSocio: string;
  vinculoUnse: string | null;
  etiqueta: string;
  descuento: number;
  cuotaMensual: number;
  cuotaTrimestral: number;
  cuotaAnual: number;
}

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizeSocio(raw: any): SocioResponseDto {
  if (!raw) {
    return {
      idUsuario: 0,
      dni: '',
      nombreCompleto: '',
      email: '',
      estado: 'ACTIVO',
      puntosAc: 0,
      idCategoria: 0,
      tipoSocio: '',
      vinculoUnse: '',
      descuentoPorcentaje: 0,
    };
  }
  return {
    idUsuario: raw.idUsuario ?? raw.id_usuario ?? raw.id ?? 0,
    dni: raw.dni ?? '',
    nombreCompleto: raw.nombreCompleto ?? raw.nombre_completo ?? '',
    email: raw.email ?? '',
    estado: raw.estado ?? 'ACTIVO',
    puntosAc: raw.puntosAc ?? raw.puntos_ac ?? 0,
    idCategoria: raw.idCategoria ?? raw.id_categoria ?? 0,
    tipoSocio: raw.tipoSocio ?? raw.tipo_socio ?? '',
    vinculoUnse: raw.vinculoUnse ?? raw.vinculo_unse ?? '',
    descuentoPorcentaje: raw.descuentoPorcentaje ?? raw.descuento_porcentaje ?? raw.descuento ?? 0,
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/socios';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/socios — Listar socios activos (excluyendo NO_SOCIO) */
export async function getSocios(): Promise<SocioResponseDto[]> {
  const data = await apiClient.get<any[]>(RESOURCE);
  return (Array.isArray(data) ? data : []).map(normalizeSocio);
}

/** GET /api/socios/:dni — Buscar socio por DNI */
export async function getSocioPorDni(dni: string): Promise<SocioResponseDto> {
  const data = await apiClient.get<any>(`${RESOURCE}/${dni}`);
  return normalizeSocio(data);
}

/** PUT /api/socios/:dni/categoria — Asignar o cambiar categoría */
export async function asignarCategoria(
  dni: string,
  body: AsignarCategoriaRequestDto
): Promise<SocioResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${dni}/categoria`, body);
  return normalizeSocio(data);
}

/** PUT /api/socios/:dni/baja-membresia — Dar de baja membresía (vuelve a NO_SOCIO) (CU-02.3) */
export async function darDeBajaMembresia(dni: string): Promise<SocioResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${dni}/baja-membresia`);
  return normalizeSocio(data);
}

/** POST /api/socios/:dni/puntos/sumar — Sumar puntos */
export async function sumarPuntos(
  dni: string,
  body: AjustePuntosRequestDto
): Promise<SocioResponseDto> {
  const data = await apiClient.post<any>(`${RESOURCE}/${dni}/puntos/sumar`, body);
  return normalizeSocio(data);
}

/** POST /api/socios/:dni/puntos/canjear — Canjear puntos */
export async function canjearPuntos(
  dni: string,
  body: AjustePuntosRequestDto
): Promise<SocioResponseDto> {
  const data = await apiClient.post<any>(`${RESOURCE}/${dni}/puntos/canjear`, body);
  return normalizeSocio(data);
}

/** GET /api/categorias — Listar todas las categorías disponibles */
export async function getCategorias(): Promise<CategoriaResponseDto[]> {
  const data = await apiClient.get<any[]>('/categorias');
  return (Array.isArray(data) ? data : []).map((raw) => ({
    idCategoria: raw.idCategoria ?? raw.id_categoria ?? raw.id ?? 0,
    tipoSocio: raw.tipoSocio ?? raw.tipo_socio ?? raw.nombre ?? '',
    vinculoUnse: raw.vinculoUnse ?? raw.vinculo_unse ?? null,
    etiqueta: raw.etiqueta ?? (raw.vinculoUnse ? `${raw.tipoSocio} · ${raw.vinculoUnse}` : raw.tipoSocio),
    descuento: Number(raw.descuento ?? 0),
    cuotaMensual: Number(raw.cuotaMensual ?? raw.cuota_mensual ?? 0),
    cuotaTrimestral: Number(raw.cuotaTrimestral ?? raw.cuota_trimestral ?? 0),
    cuotaAnual: Number(raw.cuotaAnual ?? raw.cuota_anual ?? 0),
  }));
}
