import { useState, useCallback, useEffect } from 'react';
import {
  getReporteReservasServicio,
  getReporteSociosActivos,
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

  useEffect(() => {
    getUsuarios()
      .then((data) => setUsuarios(data || []))
      .catch(() => setUsuarios([]));

    getInstalaciones()
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

  const fetchReporte = useCallback(
    async (filtrosRaw: ReporteFiltrosRequestDto = {}, tipo = tipoReporte) => {
      setLoading(true);
      setError(null);

      const payload = construirPayload(filtrosRaw);

      try {
        if (tipo === 'socios-activos') {
          const payloadSocios: Record<string, any> = {};
          if (payload.nombreUsuario) payloadSocios.nombreUsuario = payload.nombreUsuario;
          if (payload.tipoUsuario) payloadSocios.tipoUsuario = payload.tipoUsuario;

          const data = await getReporteSociosActivos(payloadSocios);
          setSociosReporte(data || []);
        } else {
          const data = await getReporteReservasServicio(payload);
          setReservasReporte(data || []);
        }
      } catch (err) {
        setError((err as Error).message || 'Error al consultar datos en el servidor.');
      } finally {
        setLoading(false);
      }
    },
    [tipoReporte]
  );

  const cambiarTipoReporte = (nuevoTipo: TipoReporte) => {
    setTipoReporte(nuevoTipo);
    fetchReporte({}, nuevoTipo);
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
    fetchReporte,
  };
}