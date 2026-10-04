/**
 * useUsuarios.ts
 * Hook de la feature de usuarios con soporte de paginación Pageable y filtros del servidor.
 * Endpoint: http://localhost:8080/api/usuarios
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUsuariosPaginados,
  createUsuario,
  updateUsuario,
  desactivarUsuario,
  type UsuarioResponseDto,
  type UsuarioRequestDto,
  type UsuarioUpdateDto,
} from '../services/usuariosApi';
import { getCategorias, type CategoriaResponseDto } from '../../socios/services/sociosApi';

export type { UsuarioResponseDto, UsuarioRequestDto, UsuarioUpdateDto };
export type { Rol, Categoria } from '../services/usuariosApi';
export type { CategoriaResponseDto };

export interface UseUsuariosResult {
  usuarios: UsuarioResponseDto[];
  categorias: CategoriaResponseDto[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalPages: number;
  totalElements: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  rolFilter: string;
  setRolFilter: (r: string) => void;
  estadoFilter: string;
  setEstadoFilter: (e: string) => void;
  crear: (data: UsuarioRequestDto) => Promise<UsuarioResponseDto>;
  actualizar: (id: number, data: UsuarioUpdateDto) => Promise<UsuarioResponseDto>;
  desactivar: (id: number) => Promise<void>;
}

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Estados de filtros
  const [searchQuery, setSearchQueryState] = useState('');
  const [rolFilter, setRolFilterState] = useState('all');
  const [estadoFilter, setEstadoFilterState] = useState('all');

  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    setPage(0);
  }, []);

  const setRolFilter = useCallback((r: string) => {
    setRolFilterState(r);
    setPage(0);
  }, []);

  const setEstadoFilter = useCallback((e: string) => {
    setEstadoFilterState(e);
    setPage(0);
  }, []);

  const handleSetSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // Cargar categorías (solo una vez o cuando se refresca)
  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.warn('Error cargando categorías:', err));
  }, []);

  // Cargar usuarios paginados
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getUsuariosPaginados({
      page,
      size,
      busqueda: searchQuery.trim() || undefined,
      rol: rolFilter !== 'all' ? rolFilter : undefined,
      estado: estadoFilter !== 'all' ? estadoFilter : undefined,
      sort: 'idUsuario,asc',
    })
      .then((pageData) => {
        if (!cancelled) {
          setUsuarios(pageData.content);
          setTotalPages(pageData.totalPages);
          setTotalElements(pageData.totalElements);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, size, searchQuery, rolFilter, estadoFilter, tick]);

  const crear = useCallback(async (data: UsuarioRequestDto) => {
    const nuevo = await createUsuario(data);
    refresh();
    return nuevo;
  }, [refresh]);

  const actualizar = useCallback(async (id: number, data: UsuarioUpdateDto) => {
    const updated = await updateUsuario(id, data);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const desactivar = useCallback(async (id: number) => {
    await desactivarUsuario(id);
    refresh();
  }, [refresh]);

  return {
    usuarios,
    categorias,
    loading,
    error,
    refresh,
    page,
    setPage,
    size,
    setSize: handleSetSize,
    totalPages,
    totalElements,
    searchQuery,
    setSearchQuery,
    rolFilter,
    setRolFilter,
    estadoFilter,
    setEstadoFilter,
    crear,
    actualizar,
    desactivar,
  };
}
