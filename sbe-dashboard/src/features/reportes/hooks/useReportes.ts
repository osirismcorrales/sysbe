import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getReporteReservasServicioPaginado,
  getReporteSociosActivosPaginado,
} from '../services/reportesApi';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { getInstalaciones, type InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import type {
  TipoReporte,
  ReservaReporteDto,
  SocioActivoReporteDto,
  ReporteFiltrosRequestDto,
} from '../types/reportes.types';

export function useReportes() {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('reservas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [instalaciones, setInstalaciones] = useState<InstalacionResponseDto[]>([]);

  const [reservasReporte, setReservasReporte] = useState<ReservaReporteDto[]>([]);
  const [sociosReporte, setSociosReporte] = useState<SocioActivoReporteDto[]>([]);

  // Estados de paginación
  const [page, setPageState] = useState(0);
  const [size, setSizeState] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Mantener filtros vigentes para paginación
  const filtrosRef = useRef<ReporteFiltrosRequestDto>({});

  useEffect(() => {
    getUsuarios({ size: 100 })
      .then((data) => setUsuarios(data || []))
      .catch(() => setUsuarios([]));

    getInstalaciones({ size: 100 })
      .then((data) => setInstalaciones(data || []))
      .catch(() => setInstalaciones([]));
  }, []);

  const construirPayload = (filtros: ReporteFiltrosRequestDto): Record<string, any> => {
    const payload: Record<string, any> = {};
    if (filtros.nombreUsuario?.trim()) payload.nombreUsuario = filtros.nombreUsuario.trim();
    if (filtros.tipoUsuario?.trim()) payload.tipoUsuario = filtros.tipoUsuario.trim();
    if (filtros.tipoServicio?.trim()) payload.tipoInstalacion = filtros.tipoServicio.trim();
    if (filtros.fechaDesde?.trim()) payload.fechaDesde = filtros.fechaDesde.trim();
    if (filtros.fechaHasta?.trim()) payload.fechaHasta = filtros.fechaHasta.trim();
    return payload;
  };

  const ejecutarConsulta = useCallback(
    async (
      filtrosRaw: ReporteFiltrosRequestDto,
      tipo: TipoReporte,
      targetPage: number,
      targetSize: number
    ) => {
      setLoading(true);
      setError(null);

      const payload = construirPayload(filtrosRaw);

      try {
        if (tipo === 'socios-activos') {
          const payloadSocios: Record<string, any> = {};
          if (payload.nombreUsuario) payloadSocios.nombreUsuario = payload.nombreUsuario;
          if (payload.tipoUsuario) payloadSocios.tipoUsuario = payload.tipoUsuario;

          const pageData = await getReporteSociosActivosPaginado(payloadSocios, {
            page: targetPage,
            size: targetSize,
          });
          setSociosReporte(pageData.content);
          setTotalPages(pageData.totalPages);
          setTotalElements(pageData.totalElements);
        } else {
          const pageData = await getReporteReservasServicioPaginado(payload, {
            page: targetPage,
            size: targetSize,
          });
          setReservasReporte(pageData.content);
          setTotalPages(pageData.totalPages);
          setTotalElements(pageData.totalElements);
        }
      } catch (err) {
        setError((err as Error).message || 'Error al consultar datos en el servidor.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReporte = useCallback(
    (filtrosRaw: ReporteFiltrosRequestDto = {}, tipo = tipoReporte) => {
      filtrosRef.current = filtrosRaw;
      setPageState(0);
      ejecutarConsulta(filtrosRaw, tipo, 0, size);
    },
    [tipoReporte, size, ejecutarConsulta]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      ejecutarConsulta(filtrosRef.current, tipoReporte, newPage, size);
    },
    [tipoReporte, size, ejecutarConsulta]
  );

  const setSize = useCallback(
    (newSize: number) => {
      setSizeState(newSize);
      setPageState(0);
      ejecutarConsulta(filtrosRef.current, tipoReporte, 0, newSize);
    },
    [tipoReporte, ejecutarConsulta]
  );

  const cambiarTipoReporte = (nuevoTipo: TipoReporte) => {
    setTipoReporte(nuevoTipo);
    filtrosRef.current = {};
    setPageState(0);
    ejecutarConsulta({}, nuevoTipo, 0, size);
  };

  return {
    tipoReporte,
    cambiarTipoReporte,
    reservasReporte,
    sociosReporte,
    usuarios,
    instalaciones,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    fetchReporte,
  };
}