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

import { apiClient, type PageResponse, normalizePageResponse } from '../../../lib/apiClient';

export interface GetSociosParams {
  page?: number;
  size?: number;
  sort?: string;
}

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
  recargoPorcentaje?: number;
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
  recargo: number;
  cuotaMensual: number;
  cuotaTrimestral: number;
  cuotaAnual: number;
}

// ─── Helpers de formateo ─────────────────────────────────────────────────────

/**
 * Formatea el vínculo UNSE para que no muestre cadenas crudas como "SIN_VINCULO_UNSE"
 */
export function formatVinculo(vinculo?: string | null): string {
  if (!vinculo) return 'Sin vínculo';
  const raw = vinculo.trim().toUpperCase();
  if (
    raw === 'SIN_VINCULO_UNSE' ||
    raw === 'SIN_VINCULO' ||
    raw === 'NINGUNO' ||
    raw === 'SIN VINCULO'
  ) {
    return 'Sin vínculo';
  }
  if (raw === 'ALUMNO') return 'Alumno';
  if (raw === 'DOCENTE') return 'Docente';
  if (raw === 'NODOCENTE' || raw === 'NO_DOCENTE' || raw === 'NO DOCENTE') {
    return 'No Docente';
  }
  return vinculo.charAt(0).toUpperCase() + vinculo.slice(1).toLowerCase();
}

/**
 * Formatea el tipo de socio de la categoría
 */
export function formatTipoSocio(tipo?: string | null): string {
  if (!tipo) return 'No Socio';
  const raw = tipo.trim().toUpperCase();
  if (raw === 'SOCIO_INTERNO' || raw === 'INTERNO') return 'Socio Interno';
  if (raw === 'SOCIO_EXTERNO' || raw === 'EXTERNO') return 'Socio Externo';
  if (raw === 'NO_SOCIO' || raw === 'NO SOCIO') return 'No Socio';
  return tipo;
}

/**
 * Formatea el nombre completo de una categoría de forma legible
 */
export function formatCategoriaNombre(cat: {
  tipoSocio?: string | null;
  vinculoUnse?: string | null;
  etiqueta?: string | null;
}): string {
  if (
    cat.etiqueta &&
    cat.etiqueta.trim().length > 0 &&
    !cat.etiqueta.toUpperCase().includes('SIN_VINCULO') &&
    !cat.etiqueta.toUpperCase().includes('NO_SOCIO') &&
    !cat.etiqueta.toUpperCase().includes('SOCIO_INTERNO') &&
    !cat.etiqueta.toUpperCase().includes('SOCIO_EXTERNO')
  ) {
    return cat.etiqueta;
  }
  const tipo = formatTipoSocio(cat.tipoSocio);
  const vinculoRaw = (cat.vinculoUnse || '').trim().toUpperCase();
  if (!vinculoRaw || vinculoRaw === 'SIN_VINCULO_UNSE' || vinculoRaw === 'NINGUNO') {
    return tipo;
  }
  return `${tipo} · ${formatVinculo(cat.vinculoUnse)}`;
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
    recargoPorcentaje: raw.recargoPorcentaje ?? raw.recargo_porcentaje ?? raw.recargo ?? 0,
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/socios';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/socios con paginación */
export async function getSociosPaginados(
  params: GetSociosParams = {}
): Promise<PageResponse<SocioResponseDto>> {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const data = await apiClient.get<any>(`${RESOURCE}${queryString}`);
  return normalizePageResponse<any, SocioResponseDto>(data, normalizeSocio);
}

/** GET /api/socios — Listar socios activos (compatibilidad) */
export async function getSocios(
  params: GetSociosParams = {}
): Promise<SocioResponseDto[]> {
  const res = await getSociosPaginados(params);
  return res.content;
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
    descuento: Number(raw.descuento ?? raw.descuento_porcentaje ?? raw.descuentoPorcentaje ?? 0),
    recargo: Number(raw.recargo ?? raw.recargo_porcentaje ?? raw.recargoPorcentaje ?? 0),
    cuotaMensual: Number(raw.cuotaMensual ?? raw.cuota_mensual ?? 0),
    cuotaTrimestral: Number(raw.cuotaTrimestral ?? raw.cuota_trimestral ?? 0),
    cuotaAnual: Number(raw.cuotaAnual ?? raw.cuota_anual ?? 0),
  }));
}
