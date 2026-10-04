/**
 * useSocios.ts
 * Hook de la feature de socios con soporte para paginación Spring Data Pageable.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSociosPaginados,
  getCategorias,
  asignarCategoria,
  darDeBajaMembresia,
  sumarPuntos,
  canjearPuntos,
  type SocioResponseDto,
  type CategoriaResponseDto,
} from '../services/sociosApi';

export type { SocioResponseDto, CategoriaResponseDto } from '../services/sociosApi';

export interface UseSociosResult {
  socios: SocioResponseDto[];
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
  cambiarCategoria: (dni: string, categoriaId: number) => Promise<SocioResponseDto>;
  darDeBaja: (dni: string) => Promise<SocioResponseDto>;
  agregarPuntos: (dni: string, puntos: number) => Promise<SocioResponseDto>;
  redimirPuntos: (dni: string, puntos: number) => Promise<SocioResponseDto>;
}

export function useSocios(): UseSociosResult {
  const [socios, setSocios] = useState<SocioResponseDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const handleSetSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // Cargar categorías (solo una vez)
  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.warn('Error cargando categorías:', err));
  }, []);

  // Cargar socios paginados
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSociosPaginados({ page, size, sort: 'idUsuario,asc' })
      .then((pageData) => {
        if (!cancelled) {
          setSocios(pageData.content);
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
  }, [page, size, tick]);

  const cambiarCategoria = useCallback(async (dni: string, categoriaId: number) => {
    const updated = await asignarCategoria(dni, { categoriaId });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  const darDeBaja = useCallback(async (dni: string) => {
    const updated = await darDeBajaMembresia(dni);
    refresh();
    return updated;
  }, [refresh]);

  const agregarPuntos = useCallback(async (dni: string, puntos: number) => {
    const updated = await sumarPuntos(dni, { puntos });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  const redimirPuntos = useCallback(async (dni: string, puntos: number) => {
    const updated = await canjearPuntos(dni, { puntos });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  return {
    socios,
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
    cambiarCategoria,
    darDeBaja,
    agregarPuntos,
    redimirPuntos,
  };
}
