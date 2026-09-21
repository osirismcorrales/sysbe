/**
 * useReservas.ts
 * Hook de la feature de reservas.
 * Carga todas las reservas iterando usuarios, junto con las listas de
 * usuarios e instalaciones para resolver nombres en la UI.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllReservas,
  crearReserva as apiCrear,
  cancelarReserva as apiCancelar,
  reprogramarReserva as apiReprogramar,
  type ReservaResponseDto,
  type ReservaRequestDto,
  type ReprogramarReservaRequestDto,
} from '../services/reservasApi';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { getInstalaciones, type InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';

export type { ReservaResponseDto, ReservaRequestDto, ReprogramarReservaRequestDto } from '../services/reservasApi';
export type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
export type { InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';

export interface UseReservasResult {
  reservas: ReservaResponseDto[];
  usuarios: UsuarioResponseDto[];
  instalaciones: InstalacionResponseDto[];
  usuarioMap: Map<number, UsuarioResponseDto>;
  instalacionMap: Map<number, InstalacionResponseDto>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  crear: (body: ReservaRequestDto) => Promise<ReservaResponseDto>;
  cancelar: (idReserva: number) => Promise<ReservaResponseDto>;
  reprogramar: (idReserva: number, body: ReprogramarReservaRequestDto) => Promise<ReservaResponseDto>;
}

export function useReservas(): UseReservasResult {
  const [reservas, setReservas] = useState<ReservaResponseDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [instalaciones, setInstalaciones] = useState<InstalacionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Primero cargamos usuarios e instalaciones
    Promise.all([
      getUsuarios().catch(() => [] as UsuarioResponseDto[]),
      getInstalaciones().catch(() => [] as InstalacionResponseDto[]),
    ])
      .then(async ([usuariosData, instalacionesData]) => {
        if (cancelled) return;
        setUsuarios(usuariosData);
        setInstalaciones(instalacionesData);

        // Luego iteramos sobre los usuarios para obtener todas las reservas
        const userIds = usuariosData.map((u) => u.id);
        const reservasData = await getAllReservas(userIds);
        if (!cancelled) {
          // Ordenar por fecha descendente y luego por horario
          reservasData.sort((a, b) => {
            const dateCompare = b.fechaReserva.localeCompare(a.fechaReserva);
            if (dateCompare !== 0) return dateCompare;
            return a.horarioInicio.localeCompare(b.horarioInicio);
          });
          setReservas(reservasData);
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

  // Mapas de lookup para resolver IDs → nombres
  const usuarioMap = useMemo(() => {
    const map = new Map<number, UsuarioResponseDto>();
    usuarios.forEach((u) => map.set(u.id, u));
    return map;
  }, [usuarios]);

  const instalacionMap = useMemo(() => {
    const map = new Map<number, InstalacionResponseDto>();
    instalaciones.forEach((i) => map.set(i.id, i));
    return map;
  }, [instalaciones]);

  const crear = useCallback(async (body: ReservaRequestDto) => {
    const nueva = await apiCrear(body);
    setReservas((prev) => [nueva, ...prev]);
    return nueva;
  }, []);

  const cancelar = useCallback(async (idReserva: number) => {
    const updated = await apiCancelar(idReserva);
    setReservas((prev) =>
      prev.map((r) => (r.idReserva === idReserva ? updated : r))
    );
    return updated;
  }, []);

  const reprogramar = useCallback(async (idReserva: number, body: ReprogramarReservaRequestDto) => {
    const updated = await apiReprogramar(idReserva, body);
    setReservas((prev) =>
      prev.map((r) => (r.idReserva === idReserva ? updated : r))
    );
    return updated;
  }, []);

  return {
    reservas,
    usuarios,
    instalaciones,
    usuarioMap,
    instalacionMap,
    loading,
    error,
    refresh,
    crear,
    cancelar,
    reprogramar,
  };
}
