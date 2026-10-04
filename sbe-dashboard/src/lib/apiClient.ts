/**
 * apiClient.ts
 * Cliente HTTP centralizado para conectar con el backend de Spring Boot.
 *
 * Uso desde cualquier feature:
 *   import { apiClient } from '../../lib/apiClient';
 *   const data = await apiClient.get<MyDto[]>('/instalaciones');
 *   const created = await apiClient.post<MyDto>('/instalaciones', body);
 */

// ─── Configuración ──────────────────────────────────────────────────────────

const API_BASE_URL = 'http://localhost:8080/api';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Índice de página basado en 0 (Spring Boot)
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements?: number;
}

export function normalizePageResponse<T, R = T>(
  raw: any,
  itemNormalizer: (item: any) => R = (item) => item as unknown as R
): PageResponse<R> {
  if (!raw) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true,
    };
  }

  // Compatibilidad: si el backend devuelve un arreglo plano
  if (Array.isArray(raw)) {
    const items = raw.map(itemNormalizer);
    return {
      content: items,
      totalElements: items.length,
      totalPages: 1,
      size: items.length,
      number: 0,
      first: true,
      last: true,
      empty: items.length === 0,
    };
  }

  const contentArray = Array.isArray(raw.content) ? raw.content : [];
  return {
    content: contentArray.map(itemNormalizer),
    totalElements: typeof raw.totalElements === 'number' ? raw.totalElements : contentArray.length,
    totalPages: typeof raw.totalPages === 'number' ? raw.totalPages : 1,
    size: typeof raw.size === 'number' ? raw.size : 10,
    number: typeof raw.number === 'number' ? raw.number : 0,
    first: Boolean(raw.first ?? (raw.number === 0)),
    last: Boolean(raw.last ?? (raw.number >= (raw.totalPages ?? 1) - 1)),
    empty: Boolean(raw.empty ?? (contentArray.length === 0)),
    numberOfElements: raw.numberOfElements ?? contentArray.length,
  };
}

export interface BackendErrorResponse {
  timestamp?: string;
  status: number;
  error?: string;
  mensaje: string;
  path?: string;
  campos?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: string;
  backendError?: BackendErrorResponse;
  campos?: Record<string, string>;
  mensaje: string;

  constructor(
    status: number,
    statusText: string,
    body: string,
    backendError?: BackendErrorResponse
  ) {
    const mensaje = backendError?.mensaje || body || statusText;
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.backendError = backendError;
    this.campos = backendError?.campos;
    this.mensaje = mensaje;
  }
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const textBody = await res.text().catch(() => res.statusText);
    let backendError: BackendErrorResponse | undefined;
    try {
      backendError = JSON.parse(textBody) as BackendErrorResponse;
    } catch {
      // Body no era JSON
    }
    throw new ApiError(res.status, res.statusText, textBody, backendError);
  }
  // 204 No Content
  if (res.status === 204) return null as unknown as T;
  return res.json() as Promise<T>;
}

function buildUrl(path: string): string {
  // Permite pasar rutas con o sin "/" inicial
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function mergeHeaders(custom?: Record<string, string>): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...custom,
  };
}

// ─── Cliente ────────────────────────────────────────────────────────────────

export const apiClient = {
  /**
   * GET request
   * @example const items = await apiClient.get<Item[]>('/items');
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'GET',
      headers: mergeHeaders(options?.headers),
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  /**
   * POST request
   * @example const created = await apiClient.post<Item>('/items', newItem);
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: mergeHeaders(options?.headers),
      body: body != null ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  /**
   * PUT request
   * @example const updated = await apiClient.put<Item>('/items/1', updatedItem);
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: mergeHeaders(options?.headers),
      body: body != null ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },

  /**
   * DELETE request
   * @example await apiClient.delete('/items/1');
   */
  async del<T = void>(path: string, options?: RequestOptions): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers: mergeHeaders(options?.headers),
      signal: options?.signal,
    });
    return handleResponse<T>(res);
  },
};
