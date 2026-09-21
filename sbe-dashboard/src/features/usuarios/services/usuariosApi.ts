/**
 * usuariosApi.ts
 * Servicio de la feature "usuarios" que usa el apiClient centralizado.
 */

import { apiClient } from '../../../lib/apiClient';

// ─── Tipos auxiliares del backend ────────────────────────────────────────────

export interface Rol {
  idRol: number;
  nombreRol: string;
  desc?: string;
}

export interface Categoria {
  idCategoria: number;
  tipoSocio: string;
  vinculoUnse?: string;
  descuento?: number;
  cuotaMensual?: number;
  cuotaTrimestral?: number;
  cuotaAnual?: number;
}

// ─── DTOs del backend ────────────────────────────────────────────────────────

export interface UsuarioResponseDto {
  id: number;
  dni: string;
  nombreCompleto: string;
  email: string;
  fechaNacimiento: string;
  puntosAc: number;
  estado: string;
  domicilio: string;
  rol: Rol | null;
  categoria: Categoria | null;
}

export interface UsuarioRequestDto {
  dni: string;
  nombreCompleto: string;
  email: string;
  fechaNacimiento: string;
  estado: string;
  domicilio: string;
  passwordHash: string;
  rolId: number;
  categoriaId: number;
}

/** PUT /api/usuarios/:id — UsuarioUpdateDto (sin contraseña) */
export interface UsuarioUpdateDto {
  dni: string;
  nombreCompleto: string;
  email: string;
  fechaNacimiento: string;
  estado: string;
  domicilio: string;
  rolId: number;
  categoriaId: number;
}

// ─── Normalización ───────────────────────────────────────────────────────────

export function normalizeUsuario(raw: any): UsuarioResponseDto {
  if (!raw) {
    return {
      id: 0,
      dni: '',
      nombreCompleto: '',
      email: '',
      fechaNacimiento: '',
      puntosAc: 0,
      estado: 'ACTIVO',
      domicilio: '',
      rol: null,
      categoria: null,
    };
  }
  return {
    id: raw.id ?? 0,
    dni: raw.dni ?? '',
    // El backend puede devolver camelCase o snake_case
    nombreCompleto: raw.nombreCompleto ?? raw.nombre_completo ?? raw.nombre ?? '',
    email: raw.email ?? '',
    fechaNacimiento: raw.fechaNacimiento ?? raw.fecha_nacimiento ?? '',
    puntosAc: raw.puntosAc ?? raw.puntos_ac ?? 0,
    estado: raw.estado ?? 'ACTIVO',
    domicilio: raw.domicilio ?? '',
    rol: raw.rol ? { idRol: raw.rol.idRol ?? raw.rol.id ?? 0, nombreRol: raw.rol.nombreRol ?? raw.rol.nombre ?? '', desc: raw.rol.desc } : null,
    categoria: raw.categoria ? { idCategoria: raw.categoria.idCategoria ?? raw.categoria.id ?? 0, tipoSocio: raw.categoria.tipoSocio ?? raw.categoria.nombre ?? '', vinculoUnse: raw.categoria.vinculoUnse, descuento: raw.categoria.descuento, cuotaMensual: raw.categoria.cuotaMensual, cuotaTrimestral: raw.categoria.cuotaTrimestral, cuotaAnual: raw.categoria.cuotaAnual } : null,
  };
}

// ─── Endpoint base ───────────────────────────────────────────────────────────

const RESOURCE = '/usuarios';

// ─── API Methods ─────────────────────────────────────────────────────────────

/** GET /api/usuarios */
export async function getUsuarios(): Promise<UsuarioResponseDto[]> {
  const data = await apiClient.get<any[]>(RESOURCE);
  return (Array.isArray(data) ? data : []).map(normalizeUsuario);
}

/** GET /api/usuarios/:id */
export async function getUsuarioById(id: number): Promise<UsuarioResponseDto> {
  const data = await apiClient.get<any>(`${RESOURCE}/${id}`);
  return normalizeUsuario(data);
}

/** POST /api/usuarios */
export async function createUsuario(
  body: UsuarioRequestDto
): Promise<UsuarioResponseDto> {
  const data = await apiClient.post<any>(RESOURCE, body);
  return normalizeUsuario(data);
}

/** PUT /api/usuarios/:id */
export async function updateUsuario(
  id: number,
  body: UsuarioUpdateDto
): Promise<UsuarioResponseDto> {
  const data = await apiClient.put<any>(`${RESOURCE}/${id}`, body);
  return normalizeUsuario(data);
}

/** DELETE /api/usuarios/:id (baja lógica) */
export async function desactivarUsuario(id: number): Promise<void> {
  await apiClient.del(`${RESOURCE}/${id}`);
}
