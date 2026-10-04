/**
 * useInstalaciones.ts
 * Hook de la feature de instalaciones con soporte de paginación Pageable.
 * Endpoint: http://localhost:8080/api/instalaciones
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getInstalacionesPaginadas,
  createInstalacion,
  updateInstalacion,
  deleteInstalacion,
  type InstalacionResponseDto,
  type InstalacionRequestDto,
} from '../services/instalacionesApi';

export type { InstalacionResponseDto, InstalacionRequestDto };

export interface UseInstalacionesResult {
  instalaciones: InstalacionResponseDto[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalPages: number;
  totalElements: number;
  crear: (data: InstalacionRequestDto) => Promise<InstalacionResponseDto>;
  actualizar: (id: number, data: InstalacionRequestDto) => Promise<InstalacionResponseDto>;
  eliminar: (id: number) => Promise<void>;
  cambiarEstado: (
    id: number,
    estado: InstalacionResponseDto['estado']
  ) => Promise<InstalacionResponseDto>;
}

export function useInstalaciones(): UseInstalacionesResult {
  const [instalaciones, setInstalaciones] = useState<InstalacionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const handleSetSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getInstalacionesPaginadas({ page, size, sort: 'id,asc' })
      .then((pageData) => {
        if (!cancelled) {
          setInstalaciones(pageData.content);
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

  const crear = useCallback(
    async (data: InstalacionRequestDto) => {
      const nueva = await createInstalacion(data);
      refresh();
      return nueva;
    },
    [refresh]
  );

  const actualizar = useCallback(
    async (id: number, data: InstalacionRequestDto) => {
      const updated = await updateInstalacion(id, data);
      setInstalaciones((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    },
    []
  );

  const eliminar = useCallback(
    async (id: number) => {
      await deleteInstalacion(id);
      refresh();
    },
    [refresh]
  );

  const cambiarEstado = useCallback(
    async (id: number, estado: InstalacionResponseDto['estado']) => {
      const current = instalaciones.find((i) => i.id === id);
      if (!current) throw new Error(`Instalación ${id} no encontrada`);
      return actualizar(id, {
        nombre: current.nombre,
        descripcion: current.descripcion,
        precioBase: current.precioBase,
        duracionMinutos: current.duracionMinutos,
        estado,
      });
    },
    [instalaciones, actualizar]
  );

  return {
    instalaciones,
    loading,
    error,
    refresh,
    page,
    setPage,
    size,
    setSize: handleSetSize,
    totalPages,
    totalElements,
    crear,
    actualizar,
    eliminar,
    cambiarEstado,
  };
}
