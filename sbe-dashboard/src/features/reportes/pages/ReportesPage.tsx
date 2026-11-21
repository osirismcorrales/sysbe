import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useReportes } from '../hooks/useReportes';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileText, Printer, Search, RefreshCw, AlertCircle, Loader2, X } from 'lucide-react';
import { ReporteTable, formatFechaSinDesfase } from '../components/ReporteTabla';
import { Pagination } from '../../../components/ui/Pagination';
import { getUserInfo } from '../../auth/utils/authUtils';
import type { FiltroItem, ReporteMetadata } from '../types/reportes.types';

const TIPO_PAGO_REPORTE_LABELS: Record<string, string> = {
  RESERVA: 'Reserva',
  CUOTA_MEMBRESIA: 'Cuota de membresía',
};

const ESTADO_PAGO_REPORTE_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  ANULADO: 'Anulado',
};

export function ReportesPage() {
  const {
    tipoReporte,
    cambiarTipoReporte: cambiarTipoReporteHook,
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
  } = useReportes();

  // Estados de Filtros
  const [dni, setDni] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [tipoInstalacion, setTipoInstalacion] = useState('');
  const [estadoReserva, setEstadoReserva] = useState('');
  const [tipoPago, setTipoPago] = useState('');
  const [estadoPago, setEstadoPago] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estados para dropdowns predictivos / autocompletado
  const [showDniDropdown, setShowDniDropdown] = useState(false);
  const [showNombreDropdown, setShowNombreDropdown] = useState(false);
  const dniContainerRef = useRef<HTMLDivElement>(null);
  const nombreContainerRef = useRef<HTMLDivElement>(null);

  // Metadatos congelados al momento de ejecutar la última búsqueda
  const [filtrosActivos, setFiltrosActivos] = useState<FiltroItem[]>([]);
  const [fechaHoraEmision, setFechaHoraEmision] = useState(() =>
    new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  );

  const usuarioLogueado = useMemo(() => {
    const info = getUserInfo();
    return info?.nombre || 'Administrador';
  }, []);

  // Cierre de dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dniContainerRef.current && !dniContainerRef.current.contains(event.target as Node)) {
        setShowDniDropdown(false);
      }
      if (nombreContainerRef.current && !nombreContainerRef.current.contains(event.target as Node)) {
        setShowNombreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Coincidencias en tiempo real para DNI
  const sugerenciasDni = useMemo(() => {
    const busqueda = dni.trim().toLowerCase();
    if (!busqueda) return [];
    return usuarios
      .filter((u) => u.dni && u.dni.toLowerCase().includes(busqueda))
      .slice(0, 6);
  }, [dni, usuarios]);

  // Coincidencias en tiempo real para Nombre
  const sugerenciasNombre = useMemo(() => {
    const busqueda = nombreUsuario.trim().toLowerCase();
    if (!busqueda) return [];
    return usuarios
      .filter((u) => u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(busqueda))
      .slice(0, 6);
  }, [nombreUsuario, usuarios]);

  // Construye la lista de chips de filtros aplicados
  const construirFiltrosAplicados = (
    dniVal: string,
    nombreVal: string,
    tipoUsuVal: string,
    tipoInstVal: string,
    estadoVal: string,
    tipoPagoVal: string,
    desdeVal: string,
    hastaVal: string,
    tipoRep: typeof tipoReporte
  ): FiltroItem[] => {
    const lista: FiltroItem[] = [];

    if (dniVal.trim()) {
      lista.push({ etiqueta: 'DNI', valor: dniVal.trim() });
    }
    if (nombreVal.trim()) {
      lista.push({ etiqueta: 'Nombre', valor: nombreVal.trim() });
    }
    if (tipoRep !== 'pagos' && tipoUsuVal.trim()) {
      const labelTipo =
        tipoUsuVal === 'SOCIO_INTERNO'
          ? 'Socio Interno'
          : tipoUsuVal === 'SOCIO_EXTERNO'
          ? 'Socio Externo'
          : 'No Socio';
      lista.push({ etiqueta: 'Categoría', valor: labelTipo });
    }

    if (tipoRep === 'reservas') {
      if (tipoInstVal.trim()) {
        lista.push({ etiqueta: 'Instalación', valor: tipoInstVal.trim() });
      }
      if (estadoVal.trim()) {
        lista.push({ etiqueta: 'Estado', valor: estadoVal.trim() });
      }
      if (desdeVal.trim()) {
        lista.push({
          etiqueta: 'Fecha Reserva Desde',
          valor: formatFechaSinDesfase(desdeVal.trim()),
        });
      }
      if (hastaVal.trim()) {
        lista.push({
          etiqueta: 'Fecha Reserva Hasta',
          valor: formatFechaSinDesfase(hastaVal.trim()),
        });
      }
    }

    if (tipoRep === 'pagos') {
      if (tipoPagoVal.trim()) {
        lista.push({
          etiqueta: 'Tipo de Pago',
          valor: TIPO_PAGO_REPORTE_LABELS[tipoPagoVal] || tipoPagoVal,
        });
      }
      if (estadoVal.trim()) {
        lista.push({
          etiqueta: 'Estado del Pago',
          valor: ESTADO_PAGO_REPORTE_LABELS[estadoVal] || estadoVal,
        });
      }
      if (desdeVal.trim()) {
        lista.push({
          etiqueta: 'Fecha Desde',
          valor: formatFechaSinDesfase(desdeVal.trim()),
        });
      }
      if (hastaVal.trim()) {
        lista.push({
          etiqueta: 'Fecha Hasta',
          valor: formatFechaSinDesfase(hastaVal.trim()),
        });
      }
    }

    return lista;
  };

  // Limpiar filtros al cambiar de pestaña
  const handleCambiarTipoReporte = (nuevoTipo: typeof tipoReporte) => {
    setDni('');
    setNombreUsuario('');
    setTipoUsuario('');
    setTipoInstalacion('');
    setEstadoReserva('');
    setTipoPago('');
    setEstadoPago('');
    setFechaDesde('');
    setFechaHasta('');
    setValidationError(null);
    setFiltrosActivos([]);
    setShowDniDropdown(false);
    setShowNombreDropdown(false);
    setFechaHoraEmision(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }));
    cambiarTipoReporteHook(nuevoTipo);
  };

  useEffect(() => {
    fetchReporte({});
    setFiltrosActivos([]);
  }, []);

  // Control estricto del input de fecha para forzar máximo 4 dígitos en el año
  const handleFechaInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const val = e.target.value;
    if (!val) {
      setter('');
      return;
    }

    const parts = val.split('-');
    if (parts[0] && parts[0].length > 4) {
      parts[0] = parts[0].substring(0, 4);
      setter(parts.join('-'));
      return;
    }
    setter(val);
  };

  const handleBuscar = () => {
    setValidationError(null);
    setShowDniDropdown(false);
    setShowNombreDropdown(false);

    // Validación: "desde" no mayor que "hasta"
    if (
      tipoReporte !== 'socios-activos' &&
      fechaDesde &&
      fechaHasta &&
      fechaDesde > fechaHasta
    ) {
      setValidationError('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
      return;
    }

    const estadoFiltro = tipoReporte === 'pagos' ? estadoPago : estadoReserva;
    const esPagos = tipoReporte === 'pagos';

    const nuevosFiltros = construirFiltrosAplicados(
      dni,
      nombreUsuario,
      tipoUsuario,
      tipoInstalacion,
      estadoFiltro,
      tipoPago,
      fechaDesde,
      fechaHasta,
      tipoReporte
    );

    setFiltrosActivos(nuevosFiltros);
    setFechaHoraEmision(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }));

    fetchReporte({
      dni: dni || undefined,
      nombreUsuario: nombreUsuario || undefined,
      tipoUsuario: !esPagos ? tipoUsuario || undefined : undefined,
      tipoPago: esPagos ? tipoPago || undefined : undefined,
      tipoInstalacion: tipoReporte === 'reservas' ? tipoInstalacion || undefined : undefined,
      estado:
        tipoReporte === 'reservas'
          ? estadoReserva || undefined
          : esPagos
          ? estadoPago || undefined
          : undefined,
      fechaDesde: tipoReporte !== 'socios-activos' ? fechaDesde || undefined : undefined,
      fechaHasta: tipoReporte !== 'socios-activos' ? fechaHasta || undefined : undefined,
    });
  };

  const handleLimpiarFiltros = () => {
    setDni('');
    setNombreUsuario('');
    setTipoUsuario('');
    setTipoInstalacion('');
    setEstadoReserva('');
    setTipoPago('');
    setEstadoPago('');
    setFechaDesde('');
    setFechaHasta('');
    setValidationError(null);
    setFiltrosActivos([]);
    setShowDniDropdown(false);
    setShowNombreDropdown(false);
    setFechaHoraEmision(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }));
    fetchReporte({});
  };

  const handleExportarPdf = () => {
    window.print();
  };

  const metadataReporte: ReporteMetadata = useMemo(
    () => ({
      filtrosAplicados: filtrosActivos,
      fechaHoraEmision,
      usuarioGenerador: usuarioLogueado,
      totalRegistros: totalElements,
    }),
    [filtrosActivos, fechaHoraEmision, usuarioLogueado, totalElements]
  );

  return (
    <>
      {/* Estilos CSS específicos para la vista de impresión/PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #seccion-reporte-imprimible, #seccion-reporte-imprimible * {
            visibility: visible;
          }
          #seccion-reporte-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10px;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-4 select-none text-xs">
        {/* Banner de Errores */}
        {(error || validationError) && (
          <div className="no-print flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError || `Error al consultar reportes: ${error}`}</span>
          </div>
        )}

        {/* Encabezado Superior */}
        <Card className="shadow-xs no-print">
          <CardContent className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Gestión de Reportes</span>
              {totalElements > 0 && (
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {totalElements} {totalElements === 1 ? 'registro' : 'registros'}
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant="brand"
              onClick={handleExportarPdf}
              className="h-8 px-3 text-xs font-semibold cursor-pointer shrink-0"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Exportar PDF / Imprimir</span>
            </Button>
          </CardContent>
        </Card>

        {/* Selección de Tipo de Reporte */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print">
          <button
            onClick={() => handleCambiarTipoReporte('reservas')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              tipoReporte === 'reservas'
                ? 'border-brand-red bg-red-50/50 ring-1 ring-brand-red/30'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-bold text-xs text-gray-900">Reporte de Reservas</div>
            <div className="text-[10px] text-gray-500">Agrupado por persona, historial de movimientos y estados</div>
          </button>

          <button
            onClick={() => handleCambiarTipoReporte('socios-activos')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              tipoReporte === 'socios-activos'
                ? 'border-brand-red bg-red-50/50 ring-1 ring-brand-red/30'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-bold text-xs text-gray-900">Socios Activos</div>
            <div className="text-[10px] text-gray-500">Padrón de miembros activos del club</div>
          </button>

          <button
            onClick={() => handleCambiarTipoReporte('pagos')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              tipoReporte === 'pagos'
                ? 'border-brand-red bg-red-50/50 ring-1 ring-brand-red/30'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-bold text-xs text-gray-900">Reporte de Pagos</div>
            <div className="text-[10px] text-gray-500">Pagos de reservas y cuotas de membresía por estado</div>
          </button>
        </div>

        {/* Panel de Filtros */}
        <Card className="shadow-xs no-print">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Search className="h-3.5 w-3.5 text-gray-400" />
                <span>Filtros de Búsqueda</span>
              </div>
              <button
                onClick={handleLimpiarFiltros}
                className="text-[11px] text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* DNI con autocompletado predictivo */}
              <div ref={dniContainerRef} className="relative">
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  DNI (Buscar / Seleccionar)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Escribí para buscar DNI..."
                    value={dni}
                    onFocus={() => {
                      if (dni.trim()) setShowDniDropdown(true);
                    }}
                    onChange={(e) => {
                      setDni(e.target.value);
                      setShowDniDropdown(true);
                    }}
                    className="w-full h-8 pl-2 pr-7 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  {dni && (
                    <button
                      type="button"
                      onClick={() => {
                        setDni('');
                        setShowDniDropdown(false);
                      }}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Borrar DNI"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Dropdown de opciones predictivas de DNI */}
                {showDniDropdown && sugerenciasDni.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {sugerenciasDni.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setDni(u.dni);
                          setNombreUsuario(u.nombreCompleto);
                          setShowDniDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-gray-900 text-xs">{u.dni}</span>
                          <span className="text-gray-600 ml-2 text-xs truncate">{u.nombreCompleto}</span>
                        </div>
                        {u.categoria?.tipoSocio && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                            {u.categoria.tipoSocio}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nombre de Usuario con autocompletado predictivo */}
              <div ref={nombreContainerRef} className="relative">
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  Nombre de Usuario (Buscar / Seleccionar)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Escribí para buscar nombre..."
                    value={nombreUsuario}
                    onFocus={() => {
                      if (nombreUsuario.trim()) setShowNombreDropdown(true);
                    }}
                    onChange={(e) => {
                      setNombreUsuario(e.target.value);
                      setShowNombreDropdown(true);
                    }}
                    className="w-full h-8 pl-2 pr-7 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  {nombreUsuario && (
                    <button
                      type="button"
                      onClick={() => {
                        setNombreUsuario('');
                        setShowNombreDropdown(false);
                      }}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Borrar Nombre"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Dropdown de opciones predictivas de Nombre */}
                {showNombreDropdown && sugerenciasNombre.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {sugerenciasNombre.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setNombreUsuario(u.nombreCompleto);
                          setDni(u.dni);
                          setShowNombreDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 text-xs">{u.nombreCompleto}</span>
                          <span className="font-mono text-gray-500 ml-2 text-[11px]">({u.dni})</span>
                        </div>
                        {u.categoria?.tipoSocio && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                            {u.categoria.tipoSocio}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categoría / Tipo (no aplica al reporte de pagos) */}
              {tipoReporte !== 'pagos' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Tipo de Usuario / Categoría
                  </label>
                  <select
                    value={tipoUsuario}
                    onChange={(e) => setTipoUsuario(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-medium"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="SOCIO_INTERNO">Socio Interno</option>
                    <option value="SOCIO_EXTERNO">Socio Externo</option>
                    {tipoReporte !== 'socios-activos' && (
                      <option value="NO_SOCIO">No Socio</option>
                    )}
                  </select>
                </div>
              )}

              {/* Instalación (Solo en Reservas) */}
              {tipoReporte === 'reservas' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Tipo de Instalación
                  </label>
                  <select
                    value={tipoInstalacion}
                    onChange={(e) => setTipoInstalacion(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="">Todas las instalaciones</option>
                    {instalaciones.map((inst) => (
                      <option key={inst.id} value={inst.nombre}>
                        {inst.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tipo de Pago (Solo en Pagos) */}
              {tipoReporte === 'pagos' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={tipoPago}
                    onChange={(e) => setTipoPago(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="RESERVA">Reserva</option>
                    <option value="CUOTA_MEMBRESIA">Cuota de membresía</option>
                  </select>
                </div>
              )}

              {/* Estado de Pago (Solo en Pagos) */}
              {tipoReporte === 'pagos' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Estado del Pago
                  </label>
                  <select
                    value={estadoPago}
                    onChange={(e) => setEstadoPago(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                    <option value="ANULADO">Anulado</option>
                  </select>
                </div>
              )}

              {/* Estado de Reserva (Solo en Reservas) */}
              {tipoReporte === 'reservas' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Estado de Reserva
                  </label>
                  <select
                    value={estadoReserva}
                    onChange={(e) => setEstadoReserva(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="">Todos los estados</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="REPROGRAMADA">Reprogramada</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="BLOQUEADA">Bloqueada</option>
                  </select>
                </div>
              )}

              {/* Fechas (Rango aclarando que se filtra por fecha de reserva) */}
              {tipoReporte !== 'socios-activos' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      {tipoReporte === 'pagos' ? 'Fecha Desde' : 'Fecha Reserva Desde'}
                    </label>
                    <input
                      type="date"
                      min="2020-01-01"
                      max="2099-12-31"
                      value={fechaDesde}
                      onChange={(e) => handleFechaInputChange(e, setFechaDesde)}
                      className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      {tipoReporte === 'pagos' ? 'Fecha Hasta' : 'Fecha Reserva Hasta'}
                    </label>
                    <input
                      type="date"
                      min="2020-01-01"
                      max="2099-12-31"
                      value={fechaHasta}
                      onChange={(e) => handleFechaInputChange(e, setFechaHasta)}
                      className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-medium"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={handleBuscar}
                disabled={loading}
                className="h-8 px-3 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Área Exclusiva Imprimible PDF */}
        <div id="seccion-reporte-imprimible">
          <div className="hidden print:block mb-4 border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-bold text-gray-900">SBE UNSE - Secretaría de Bienestar Estudiantil</h1>
                <p className="text-xs text-gray-600">
                  Reporte Oficial de{' '}
                  {tipoReporte === 'socios-activos'
                    ? 'Socios Activos'
                    : tipoReporte === 'pagos'
                    ? 'Pagos'
                    : 'Reservas'}
                </p>
              </div>
              <div className="text-right text-[11px] text-gray-500">
                <p>Fecha de emisión: {fechaHoraEmision}</p>
                <p>Generado por: {usuarioLogueado}</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xs overflow-hidden border-gray-200 bg-white relative print:border-none print:shadow-none">
            <CardContent className="p-0">
              {loading && (
                <div className="no-print absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs text-xs font-semibold text-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
                    Cargando datos...
                  </div>
                </div>
              )}

              <ReporteTable
                tipoReporte={tipoReporte}
                reservas={reservasReporte}
                socios={sociosReporte}
                pagos={pagosReporte}
                metadata={metadataReporte}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={size}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setPage}
                onPageSizeChange={setSize}
                disabled={loading}
                className="no-print"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ReportesPage;
