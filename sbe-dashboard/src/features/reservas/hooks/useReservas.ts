/**
 * useReservas.ts
 * Hook de la feature de reservas con soporte de paginación Spring Data Pageable.
 * Carga reservas directamente mediante GET /api/reservas con paginación,
 * y mapea usuarios e instalaciones para nombres en la UI.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getReservasPaginadas,
  crearReserva as apiCrear,
  cancelarReserva as apiCancelar,
  reprogramarReserva as apiReprogramar,
  type ReservaResponseDto,
  type ReservaRequestDto,
  type ReprogramarReservaRequestDto,
} from '../services/reservasApi';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { getInstalaciones, type InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import { getPagosPaginados } from '../../pagos/services/pagosApi';
import type { PagoResponseDto } from '../../pagos/types/pagos.types';

export type { ReservaResponseDto, ReservaRequestDto, ReprogramarReservaRequestDto } from '../services/reservasApi';
export type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
export type { InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';

export interface UseReservasResult {
  reservas: ReservaResponseDto[];
  usuarios: UsuarioResponseDto[];
  instalaciones: InstalacionResponseDto[];
  usuarioMap: Map<number, UsuarioResponseDto>;
  instalacionMap: Map<number, InstalacionResponseDto>;
  /** Último pago (o el más relevante) asociado a cada reserva. */
  pagoPorReserva: Map<number, PagoResponseDto>;
  pagosLoading: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalPages: number;
  totalElements: number;
  crear: (body: ReservaRequestDto) => Promise<ReservaResponseDto>;
  cancelar: (idReserva: number) => Promise<ReservaResponseDto>;
  reprogramar: (idReserva: number, body: ReprogramarReservaRequestDto) => Promise<ReservaResponseDto>;
}

export function useReservas(): UseReservasResult {
  const [reservas, setReservas] = useState<ReservaResponseDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [instalaciones, setInstalaciones] = useState<InstalacionResponseDto[]>([]);
  const [pagosReserva, setPagosReserva] = useState<PagoResponseDto[]>([]);
  const [pagosLoading, setPagosLoading] = useState(false);
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

  // Cargar usuarios e instalaciones y actualizar el saldo tras usar puntos.
  useEffect(() => {
    Promise.all([
      getUsuarios({ size: 100 }).catch(() => [] as UsuarioResponseDto[]),
      getInstalaciones({ size: 100 }).catch(() => [] as InstalacionResponseDto[]),
    ]).then(([usuariosData, instalacionesData]) => {
      setUsuarios(usuariosData);
      setInstalaciones(instalacionesData);
    });
  }, [tick]);

  // Cargar reservas paginadas
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getReservasPaginadas({ page, size, sort: 'fechaCreacion,desc' })
      .then((pageData) => {
        if (!cancelled) {
          setReservas(pageData.content);
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

  // Cargar todas las páginas de pagos de tipo RESERVA para que una reserva
  // antigua no aparezca como "Sin pago" cuando su pago quede fuera de la
  // primera página.
  useEffect(() => {
    let cancelled = false;
    setPagosLoading(true);

    const cargarPagosReserva = async () => {
      const pageSize = 200;
      const primeraPagina = await getPagosPaginados({
        tipoPago: 'RESERVA',
        page: 0,
        size: pageSize,
        sort: 'fechaCreacion,desc',
      });
      const pagos = [...primeraPagina.content];

      for (let pagina = 1; pagina < primeraPagina.totalPages; pagina += 1) {
        const resultado = await getPagosPaginados({
          tipoPago: 'RESERVA',
          page: pagina,
          size: pageSize,
          sort: 'fechaCreacion,desc',
        });
        pagos.push(...resultado.content);
      }

      return pagos;
    };

    cargarPagosReserva()
      .then((pagos) => {
        if (!cancelled) setPagosReserva(pagos);
      })
      .catch(() => {
        if (!cancelled) setPagosReserva([]);
      })
      .finally(() => {
        if (!cancelled) setPagosLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  // Un pago por reserva: se prioriza el estado más relevante (aprobado >
  // pendiente > rechazado > anulado). Dentro del mismo estado, el más reciente.
  const pagoPorReserva = useMemo(() => {
    const prioridad: Record<string, number> = {
      APROBADO: 0,
      PENDIENTE: 1,
      RECHAZADO: 2,
      ANULADO: 3,
    };

    const map = new Map<number, PagoResponseDto>();
    pagosReserva.forEach((pago) => {
      if (pago.idReserva == null) return;

      const actual = map.get(pago.idReserva);
      if (!actual) {
        map.set(pago.idReserva, pago);
        return;
      }

      const prioridadNueva = prioridad[pago.estadoPago] ?? 9;
      const prioridadActual = prioridad[actual.estadoPago] ?? 9;

      if (
        prioridadNueva < prioridadActual ||
        (prioridadNueva === prioridadActual &&
          (pago.fechaCreacion || '') > (actual.fechaCreacion || ''))
      ) {
        map.set(pago.idReserva, pago);
      }
    });

    return map;
  }, [pagosReserva]);

  const crear = useCallback(
    async (body: ReservaRequestDto) => {
      const nueva = await apiCrear(body);
      refresh();
      return nueva;
    },
    [refresh]
  );

  const cancelar = useCallback(
    async (idReserva: number) => {
      const updated = await apiCancelar(idReserva);
      refresh();
      return updated;
    },
    [refresh]
  );

  const reprogramar = useCallback(
    async (idReserva: number, body: ReprogramarReservaRequestDto) => {
      const updated = await apiReprogramar(idReserva, body);
      refresh();
      return updated;
    },
    [refresh]
  );

  return {
    reservas,
    usuarios,
    instalaciones,
    usuarioMap,
    instalacionMap,
    pagoPorReserva,
    pagosLoading,
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
    cancelar,
    reprogramar,
  };
}
