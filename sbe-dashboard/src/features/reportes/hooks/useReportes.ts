import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getReportePagosPaginado,
  getReporteReservasServicioPaginado,
  getReporteSociosActivosPaginado,
} from '../services/reportesApi';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { getInstalaciones, type InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import type {
  TipoReporte,
  ReservaReporteDto,
  SocioActivoReporteDto,
  PagoReporteDto,
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
  const [pagosReporte, setPagosReporte] = useState<PagoReporteDto[]>([]);

  // Estados de paginación (inicia en 5 para coincidir con el primer valor de pageSizeOptions)
  const [page, setPageState] = useState(0);
  const [size, setSizeState] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Referencias mutables para mantener el tamaño y filtros vigentes sin problemas de closures
  const filtrosRef = useRef<ReporteFiltrosRequestDto>({});
  const sizeRef = useRef(5);
  sizeRef.current = size;

  useEffect(() => {
    getUsuarios({ size: 100 })
      .then((data) => setUsuarios(data || []))
      .catch(() => setUsuarios([]));

    getInstalaciones({ size: 100 })
      .then((data) => setInstalaciones(data || []))
      .catch(() => setInstalaciones([]));
  }, []);

  const construirPayload = (filtros: ReporteFiltrosRequestDto): ReporteFiltrosRequestDto => {
    const payload: ReporteFiltrosRequestDto = {};
    if (filtros.dni?.trim()) payload.dni = filtros.dni.trim();
    if (filtros.nombreUsuario?.trim()) payload.nombreUsuario = filtros.nombreUsuario.trim();
    if (filtros.tipoUsuario?.trim()) payload.tipoUsuario = filtros.tipoUsuario.trim();
    if (filtros.tipoInstalacion?.trim()) payload.tipoInstalacion = filtros.tipoInstalacion.trim();
    if (filtros.tipoServicio?.trim()) payload.tipoInstalacion = filtros.tipoServicio.trim();
    if (filtros.tipoPago?.trim()) payload.tipoPago = filtros.tipoPago.trim();
    if (filtros.estado?.trim()) payload.estado = filtros.estado.trim();
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
          const payloadSocios: ReporteFiltrosRequestDto = {};
          if (payload.dni) payloadSocios.dni = payload.dni;
          if (payload.nombreUsuario) payloadSocios.nombreUsuario = payload.nombreUsuario;
          if (payload.tipoUsuario) payloadSocios.tipoUsuario = payload.tipoUsuario;

          const pageData = await getReporteSociosActivosPaginado(payloadSocios, {
            page: targetPage,
            size: targetSize,
          });
          setSociosReporte(pageData.content);
          setTotalPages(pageData.totalPages);
          setTotalElements(pageData.totalElements);
        } else if (tipo === 'pagos') {
          const payloadPagos: ReporteFiltrosRequestDto = {};
          if (payload.dni) payloadPagos.dni = payload.dni;
          if (payload.nombreUsuario) payloadPagos.nombreUsuario = payload.nombreUsuario;
          if (payload.tipoPago) payloadPagos.tipoPago = payload.tipoPago;
          if (payload.estado) payloadPagos.estado = payload.estado;
          if (payload.fechaDesde) payloadPagos.fechaDesde = payload.fechaDesde;
          if (payload.fechaHasta) payloadPagos.fechaHasta = payload.fechaHasta;

          const pageData = await getReportePagosPaginado(payloadPagos, {
            page: targetPage,
            size: targetSize,
          });
          setPagosReporte(pageData.content);
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
      ejecutarConsulta(filtrosRaw, tipo, 0, sizeRef.current);
    },
    [tipoReporte, ejecutarConsulta]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      ejecutarConsulta(filtrosRef.current, tipoReporte, newPage, sizeRef.current);
    },
    [tipoReporte, ejecutarConsulta]
  );

  const setSize = useCallback(
    (newSize: number) => {
      setSizeState(newSize);
      sizeRef.current = newSize;
      setPageState(0);
      ejecutarConsulta(filtrosRef.current, tipoReporte, 0, newSize);
    },
    [tipoReporte, ejecutarConsulta]
  );

  const cambiarTipoReporte = useCallback(
    (nuevoTipo: TipoReporte) => {
      setTipoReporte(nuevoTipo);
      filtrosRef.current = {};
      setPageState(0);
      // Mantener el tamaño de página actual configurado por el usuario
      ejecutarConsulta({}, nuevoTipo, 0, sizeRef.current);
    },
    [ejecutarConsulta]
  );

  return {
    tipoReporte,
    cambiarTipoReporte,
    reservasReporte,
    sociosReporte,
    pagosReporte,
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
