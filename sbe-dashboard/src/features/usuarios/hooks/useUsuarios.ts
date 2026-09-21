/**
 * useUsuarios.ts
 * Hook de la feature de usuarios.
 * Endpoint: http://localhost:8080/api/usuarios
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  desactivarUsuario,
  type UsuarioResponseDto,
  type UsuarioRequestDto,
} from '../services/usuariosApi';
import { getCategorias, type CategoriaResponseDto } from '../../socios/services/sociosApi';

export type { UsuarioResponseDto, UsuarioRequestDto };
export type { Rol, Categoria } from '../services/usuariosApi';
export type { CategoriaResponseDto };

export interface UseUsuariosResult {
  usuarios: UsuarioResponseDto[];
  categorias: CategoriaResponseDto[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  crear: (data: UsuarioRequestDto) => Promise<UsuarioResponseDto>;
  actualizar: (id: number, data: UsuarioRequestDto) => Promise<UsuarioResponseDto>;
  desactivar: (id: number) => Promise<void>;
}

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getUsuarios(), getCategorias()])
      .then(([usuariosData, categoriasData]) => {
        if (!cancelled) {
          setUsuarios(usuariosData);
          setCategorias(categoriasData);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const crear = useCallback(async (data: UsuarioRequestDto) => {
    const nuevo = await createUsuario(data);
    setUsuarios((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizar = useCallback(async (id: number, data: UsuarioRequestDto) => {
    const updated = await updateUsuario(id, data);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const desactivar = useCallback(async (id: number) => {
    await desactivarUsuario(id);
    // Actualizamos el estado local (baja lógica)
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estado: 'DE_BAJA' } : u)));
  }, []);

  return { usuarios, categorias, loading, error, refresh, crear, actualizar, desactivar };
}
