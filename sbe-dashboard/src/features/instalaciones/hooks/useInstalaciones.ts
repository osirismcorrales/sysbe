/**
 * useInstalaciones.ts
 * Hook de la feature de instalaciones.
 * Endpoint: http://localhost:8080/api/instalaciones
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getInstalaciones,
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
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getInstalaciones()
      .then((data) => {
        if (!cancelled) setInstalaciones(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const crear = useCallback(async (data: InstalacionRequestDto) => {
    const nueva = await createInstalacion(data);
    setInstalaciones((prev) => [...prev, nueva]);
    return nueva;
  }, []);

  const actualizar = useCallback(async (id: number, data: InstalacionRequestDto) => {
    const updated = await updateInstalacion(id, data);
    setInstalaciones((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const eliminar = useCallback(async (id: number) => {
    await deleteInstalacion(id);
    setInstalaciones((prev) => prev.filter((i) => i.id !== id));
  }, []);

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

  return { instalaciones, loading, error, refresh, crear, actualizar, eliminar, cambiarEstado };
}
