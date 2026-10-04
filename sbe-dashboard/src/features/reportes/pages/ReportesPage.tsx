import React, { useEffect, useState } from 'react';
import { useReportes } from '../hooks/useReportes';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FileText, Printer, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { ReporteTable } from '../components/ReporteTabla';

export function ReportesPage() {
  const {
    tipoReporte,
    cambiarTipoReporte: cambiarTipoReporteHook,
    reservasReporte,
    sociosReporte,
    usuarios,
    instalaciones,
    loading,
    error,
    fetchReporte,
  } = useReportes();

  // Estados de Filtros
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [tipoInstalacion, setTipoInstalacion] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Limpiar filtros al cambiar de pestaña
  const handleCambiarTipoReporte = (nuevoTipo: typeof tipoReporte) => {
    setNombreUsuario('');
    setTipoUsuario('');
    setTipoInstalacion('');
    setFechaDesde('');
    setFechaHasta('');
    setValidationError(null);
    cambiarTipoReporteHook(nuevoTipo);
  };

  useEffect(() => {
    fetchReporte({});
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

    if (
      tipoReporte !== 'socios-activos' &&
      fechaDesde &&
      fechaHasta &&
      new Date(fechaDesde) > new Date(fechaHasta)
    ) {
      setValidationError('La "Fecha Desde" no puede ser posterior a la "Fecha Hasta".');
      return;
    }

    fetchReporte({
      nombreUsuario: nombreUsuario || undefined,
      tipoUsuario: tipoUsuario || undefined,
      tipoServicio: tipoReporte !== 'socios-activos' ? tipoInstalacion || undefined : undefined,
      fechaDesde: tipoReporte !== 'socios-activos' ? fechaDesde || undefined : undefined,
      fechaHasta: tipoReporte !== 'socios-activos' ? fechaHasta || undefined : undefined,
    });
  };

  const handleLimpiarFiltros = () => {
    setNombreUsuario('');
    setTipoUsuario('');
    setTipoInstalacion('');
    setFechaDesde('');
    setFechaHasta('');
    setValidationError(null);
    fetchReporte({});
  };

  const handleExportarPdf = () => {
    window.print();
  };

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
            padding: 20px;
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
            </div>

            <Button
              size="sm"
              variant="brand"
              onClick={handleExportarPdf}
              className="h-8 px-3 text-xs font-semibold cursor-pointer shrink-0"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Exportar PDF</span>
            </Button>
          </CardContent>
        </Card>

        {/* Selección de Tipo de Reporte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 no-print">
          <button
            onClick={() => handleCambiarTipoReporte('reservas')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              tipoReporte === 'reservas'
                ? 'border-brand-red bg-red-50/50 ring-1 ring-brand-red/30'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-bold text-xs text-gray-900">Reporte de Reservas</div>
            <div className="text-[10px] text-gray-500">Filtrado por instalación, usuario o fechas</div>
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
              {/* Usuario */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  Usuario
                </label>
                <select
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.nombreCompleto}>
                      {u.nombreCompleto} ({u.dni})
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría / Tipo (NO_SOCIO excluido en Socios Activos) */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  Categoría / Tipo
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

              {/* Instalación (Oculto en Socios Activos) */}
              {tipoReporte !== 'socios-activos' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Instalación
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

              {/* Fechas (Oculto en Socios Activos, restringido a 4 dígitos en el año) */}
              {tipoReporte !== 'socios-activos' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Fecha Desde
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
                      Fecha Hasta
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
          <div className="hidden print:block mb-6 border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">SBE UNSE - Secretaría de Bienestar Estudiantil</h1>
                <p className="text-sm text-gray-600">
                  Reporte Oficial de {tipoReporte === 'socios-activos' ? 'Socios Activos' : 'Reservas'}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xs overflow-hidden border-gray-200 bg-white relative">
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
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ReportesPage;