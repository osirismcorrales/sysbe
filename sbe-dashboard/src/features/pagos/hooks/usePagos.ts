/**
 * usePagos.ts
 * Hook de la feature de pagos con soporte de paginación Spring Data Pageable.
 * Consume GET /api/pagos con filtros opcionales (usuario, estado y tipo de pago)
 * y expone las acciones del PagoController para aprobar, rechazar y anular.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPagosPaginados,
  crearPago as apiCrearPago,
  aprobarPago as apiAprobarPago,
  rechazarPago as apiRechazarPago,
  anularPago as apiAnularPago,
  cambiarEstadoPago as apiCambiarEstadoPago,
} from '../services/pagosApi';
import type {
  PagoResponseDto,
  PagoRequestDto,
  EstadoPago,
  TipoPago,
} from '../types/pagos.types';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';

export type {
  PagoResponseDto,
  PagoRequestDto,
  EstadoPago,
  TipoPago,
} from '../types/pagos.types';
export type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';

// ─── Filtros ─────────────────────────────────────────────────────────────────

export interface PagosFiltros {
  idUsuario: number | 'all';
  estadoPago: EstadoPago | 'all';
  tipoPago: TipoPago | 'all';
}

export interface UsePagosResult {
  pagos: PagoResponseDto[];
  usuarios: UsuarioResponseDto[];
  filtros: PagosFiltros;
  setIdUsuario: (idUsuario: number | 'all') => void;
  setEstadoPago: (estadoPago: EstadoPago | 'all') => void;
  setTipoPago: (tipoPago: TipoPago | 'all') => void;
  limpiarFiltros: () => void;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalPages: number;
  totalElements: number;
  crear: (body: PagoRequestDto) => Promise<PagoResponseDto>;
  aprobar: (idPago: number) => Promise<PagoResponseDto>;
  rechazar: (idPago: number) => Promise<PagoResponseDto>;
  anular: (idPago: number) => Promise<PagoResponseDto>;
  cambiarEstado: (idPago: number, estadoPago: EstadoPago) => Promise<PagoResponseDto>;
}

const FILTROS_INICIALES: PagosFiltros = {
  idUsuario: 'all',
  estadoPago: 'all',
  tipoPago: 'all',
};

export function usePagos(): UsePagosResult {
  const [pagos, setPagos] = useState<PagoResponseDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros del backend
  const [filtros, setFiltros] = useState<PagosFiltros>(FILTROS_INICIALES);

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

  const setIdUsuario = useCallback((idUsuario: number | 'all') => {
    setFiltros((prev) => ({ ...prev, idUsuario }));
    setPage(0);
  }, []);

  const setEstadoPago = useCallback((estadoPago: EstadoPago | 'all') => {
    setFiltros((prev) => ({ ...prev, estadoPago }));
    setPage(0);
  }, []);

  const setTipoPago = useCallback((tipoPago: TipoPago | 'all') => {
    setFiltros((prev) => ({ ...prev, tipoPago }));
    setPage(0);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    setPage(0);
  }, []);

  // Cargar usuarios para el selector de filtros y el formulario de alta
  useEffect(() => {
    let cancelled = false;

    getUsuarios({ size: 200 })
      .then((data) => {
        if (!cancelled) setUsuarios(data);
      })
      .catch((err) => {
        console.warn('No se pudieron cargar los usuarios para pagos:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar pagos paginados con filtros del backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPagosPaginados({
      page,
      size,
      sort: 'fechaCreacion,desc',
      idUsuario: filtros.idUsuario === 'all' ? undefined : filtros.idUsuario,
      estadoPago: filtros.estadoPago === 'all' ? undefined : filtros.estadoPago,
      tipoPago: filtros.tipoPago === 'all' ? undefined : filtros.tipoPago,
    })
      .then((pageData) => {
        if (!cancelled) {
          setPagos(pageData.content);
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
  }, [page, size, tick, filtros.idUsuario, filtros.estadoPago, filtros.tipoPago]);

  // ─── Acciones ─────────────────────────────────────────────────────────────

  const crear = useCallback(
    async (body: PagoRequestDto) => {
      const nuevo = await apiCrearPago(body);
      setPage(0);
      refresh();
      return nuevo;
    },
    [refresh]
  );

  const aprobar = useCallback(
    async (idPago: number) => {
      const updated = await apiAprobarPago(idPago);
      refresh();
      return updated;
    },
    [refresh]
  );

  const rechazar = useCallback(
    async (idPago: number) => {
      const updated = await apiRechazarPago(idPago);
      refresh();
      return updated;
    },
    [refresh]
  );

  const anular = useCallback(
    async (idPago: number) => {
      const updated = await apiAnularPago(idPago);
      refresh();
      return updated;
    },
    [refresh]
  );

  const cambiarEstado = useCallback(
    async (idPago: number, estadoPago: EstadoPago) => {
      const updated = await apiCambiarEstadoPago(idPago, estadoPago);
      refresh();
      return updated;
    },
    [refresh]
  );

  return {
    pagos,
    usuarios,
    filtros,
    setIdUsuario,
    setEstadoPago,
    setTipoPago,
    limpiarFiltros,
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
    aprobar,
    rechazar,
    anular,
    cambiarEstado,
  };
}
