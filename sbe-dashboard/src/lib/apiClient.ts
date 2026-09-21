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

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string
  ) {
    super(`[${status}] ${body || statusText}`);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, res.statusText, body);
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
  return {
    'Content-Type': 'application/json',
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
