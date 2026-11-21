import React, { useState, useMemo, useEffect } from 'react';
import type {
  TipoReporte,
  ReservaReporteDto,
  SocioActivoReporteDto,
  PagoReporteDto,
  GrupoReservasPersona,
  ReporteMetadata,
} from '../types/reportes.types';
import Badge from '../../../components/ui/Badge';
import {
  User,
  CheckCircle2,
  Clock,
  Tag,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

interface ReporteTableProps {
  tipoReporte: TipoReporte;
  reservas: ReservaReporteDto[];
  socios: SocioActivoReporteDto[];
  pagos: PagoReporteDto[];
  metadata: ReporteMetadata;
}

/**
 * Formatea cadenas tipo "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss" a "DD/MM/YYYY"
 * sin utilizar new Date() local para prevenir cualquier desfasaje de zona horaria.
 */
export function formatFechaSinDesfase(fechaStr?: string | null): string {
  if (!fechaStr) return '-';
  const soloFecha = fechaStr.split('T')[0];
  const partes = soloFecha.split('-');
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;
  }
  return fechaStr;
}

function getBadgeVariant(estado?: string): 'success' | 'destructive' | 'warning' | 'secondary' | 'outline' {
  const est = estado?.toUpperCase() || '';
  if (est === 'RESERVADA' || est === 'CONFIRMADA') return 'success';
  if (est === 'CANCELADA') return 'destructive';
  if (est === 'REPROGRAMADA') return 'warning';
  if (est === 'FINALIZADA') return 'secondary';
  return 'outline';
}

const TIPO_PAGO_LABELS: Record<string, string> = {
  RESERVA: 'Reserva',
  CUOTA_MEMBRESIA: 'Cuota de membresía',
};

const METODO_PAGO_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  DEBITO: 'Débito',
  MERCADO_PAGO: 'Mercado Pago',
};

function getPagoBadgeVariant(estado?: string): 'success' | 'destructive' | 'warning' | 'secondary' | 'outline' {
  const est = estado?.toUpperCase() || '';
  if (est === 'APROBADO') return 'success';
  if (est === 'RECHAZADO') return 'destructive';
  if (est === 'PENDIENTE') return 'warning';
  if (est === 'ANULADO') return 'secondary';
  return 'outline';
}

function formatMontoPago(monto?: number): string {
  return `$ ${Number(monto ?? 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function detallePago(pago: PagoReporteDto): string {
  if (pago.tipoPago === 'RESERVA') {
    return pago.idReserva != null ? `Reserva #${pago.idReserva}` : 'Reserva';
  }
  if (pago.tipoPago === 'CUOTA_MEMBRESIA') {
    return pago.periodo ? `Período ${pago.periodo}` : 'Cuota de membresía';
  }
  return pago.periodo || '-';
}

export function ReporteTable({ tipoReporte, reservas, socios, pagos, metadata }: ReporteTableProps) {
  // Agrupamiento por DNI para reservas
  const gruposReservas: GrupoReservasPersona[] = useMemo(() => {
    if (tipoReporte !== 'reservas') return [];

    const mapa = new Map<string, GrupoReservasPersona>();

    for (const r of reservas) {
      const clave = r.dniUsuario || r.nombreUsuario || 'SIN_DNI';
      let grupo = mapa.get(clave);
      if (!grupo) {
        grupo = {
          dniUsuario: r.dniUsuario || 'Sin DNI',
          nombreUsuario: r.nombreUsuario || 'Sin Nombre',
          tipoUsuario: r.tipoUsuario || 'NO_SOCIO',
          totalMovimientos: 0,
          totalCancelados: 0,
          reservas: [],
        };
        mapa.set(clave, grupo);
      }
      grupo.totalMovimientos += 1;
      if (r.estado?.toUpperCase() === 'CANCELADA') {
        grupo.totalCancelados += 1;
      }
      grupo.reservas.push(r);
    }

    return Array.from(mapa.values());
  }, [reservas, tipoReporte]);

  // Estado para controlar qué acordeones de personas están expandidos
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Inicializar expandidos por defecto al cambiar la lista de grupos
  useEffect(() => {
    setExpandedKeys(new Set(gruposReservas.map((g) => g.dniUsuario)));
  }, [gruposReservas]);

  const toggleGrupo = (dni: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dni)) {
        next.delete(dni);
      } else {
        next.add(dni);
      }
      return next;
    });
  };

  const expandirTodos = () => {
    setExpandedKeys(new Set(gruposReservas.map((g) => g.dniUsuario)));
  };

  const colapsarTodos = () => {
    setExpandedKeys(new Set());
  };

  return (
    <div className="space-y-4 p-4 print:p-0">
      {/* Encabezado General del Reporte con Auditoría y Filtros */}
      <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-3 space-y-2.5 print:bg-white print:border-gray-400 print:p-3">
        {/* Metadatos de Auditoría */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>
              Generado:{' '}
              <strong className="text-gray-900">{metadata.fechaHoraEmision}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>
              Generado por:{' '}
              <strong className="text-gray-900">{metadata.usuarioGenerador}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              Total de registros:{' '}
              <strong className="text-gray-900">{metadata.totalRegistros}</strong>
            </span>
          </div>
        </div>

        {/* Filtros Aplicados */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 mr-1 shrink-0">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <span>Filtros aplicados:</span>
          </div>

          {metadata.filtrosAplicados.length === 0 ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
              Sin filtros
            </span>
          ) : (
            metadata.filtrosAplicados.map((f, i) => (
              <span
                key={`${f.etiqueta}-${i}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-brand-dark border border-red-200 print:bg-gray-100 print:text-black print:border-gray-300"
              >
                <strong className="text-gray-700 font-semibold">{f.etiqueta}:</strong>
                <span>{f.valor}</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* RENDERIZADO SEGÚN TIPO DE REPORTE */}
      {tipoReporte === 'socios-activos' ? (
        /* Reporte de Socios Activos: Tabla Simple */
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50/80">
                <th className="py-2.5 px-3">DNI</th>
                <th className="py-2.5 px-3">NOMBRE COMPLETO</th>
                <th className="py-2.5 px-3">CATEGORÍA / TIPO</th>
                <th className="py-2.5 px-3">CORREO ELECTRÓNICO</th>
                <th className="py-2.5 px-3 text-right">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 bg-white">
              {socios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-normal">
                    No se encontraron socios activos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                socios.map((s, idx) => (
                  <tr
                    key={`${s.dniUsuario}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">
                      {s.dniUsuario || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {s.nombreUsuario || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {s.tipoUsuario || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{s.email || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant="success" className="text-[10px] font-bold">
                        {s.estado || 'ACTIVO'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : tipoReporte === 'pagos' ? (
        /* Reporte de Pagos: Tabla Simple */
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50/80">
                <th className="py-2.5 px-3">DNI</th>
                <th className="py-2.5 px-3">NOMBRE COMPLETO</th>
                <th className="py-2.5 px-3">TIPO DE PAGO</th>
                <th className="py-2.5 px-3">DETALLE</th>
                <th className="py-2.5 px-3 text-right">MONTO</th>
                <th className="py-2.5 px-3">MÉTODO</th>
                <th className="py-2.5 px-3 text-right">ESTADO</th>
                <th className="py-2.5 px-3 text-right">FECHA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 bg-white">
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 font-normal">
                    No se encontraron pagos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                pagos.map((p, idx) => (
                  <tr
                    key={`${p.idPago}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">
                      {p.dniUsuario || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {p.nombreUsuario || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {TIPO_PAGO_LABELS[p.tipoPago] || p.tipoPago || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{detallePago(p)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      {formatMontoPago(p.montoPago)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {METODO_PAGO_LABELS[p.metodoPago] || p.metodoPago || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge
                        variant={getPagoBadgeVariant(p.estadoPago)}
                        className="text-[10px] font-bold"
                      >
                        {p.estadoPago || '-'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">
                      {formatFechaSinDesfase(p.fechaCreacion)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Reporte de Reservas: Menú Acordeón por Persona */
        <div className="space-y-3">
          {gruposReservas.length > 0 && (
            <div className="flex items-center justify-between no-print px-1">
              <span className="text-[11px] font-semibold text-gray-500">
                {gruposReservas.length} {gruposReservas.length === 1 ? 'persona' : 'personas'} con movimientos
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={expandirTodos}
                  className="text-[11px] font-semibold text-brand-dark hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  <span>Expandir todos</span>
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={colapsarTodos}
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  Colapsar todos
                </button>
              </div>
            </div>
          )}

          {gruposReservas.length === 0 ? (
            <div className="py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
              No se encontraron reservas que coincidan con los filtros aplicados.
            </div>
          ) : (
            gruposReservas.map((grupo) => {
              const estaExpandido = expandedKeys.has(grupo.dniUsuario);

              return (
                <div
                  key={grupo.dniUsuario}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs print:shadow-none print:border-gray-300 print:break-inside-avoid transition-all"
                >
                  {/* Cabecera del Grupo: Botón disparador del Acordeón */}
                  <button
                    type="button"
                    onClick={() => toggleGrupo(grupo.dniUsuario)}
                    aria-expanded={estaExpandido}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100/80 px-3.5 py-2.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2.5 transition-colors cursor-pointer select-none print:bg-gray-100"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-2xs">
                        <span className="text-[10px] text-gray-400 font-sans font-normal uppercase">
                          DNI
                        </span>
                        <span>{grupo.dniUsuario}</span>
                      </div>

                      <div className="text-xs sm:text-sm font-bold text-gray-900">
                        {grupo.nombreUsuario}
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {grupo.tipoUsuario}
                      </span>
                    </div>

                    {/* Resumen de movimientos y chevron */}
                    <div className="flex items-center gap-2.5 text-[11px]">
                      <span className="bg-white border border-gray-200 px-2 py-0.5 rounded font-medium text-gray-700 shadow-2xs">
                        Movimientos: <strong className="text-gray-900">{grupo.totalMovimientos}</strong>
                      </span>

                      {grupo.totalCancelados > 0 && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium">
                          Cancelados:{' '}
                          <strong className="text-red-900">{grupo.totalCancelados}</strong>
                        </span>
                      )}

                      <div className="no-print text-gray-400 p-0.5 ml-1">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            estaExpandido ? 'rotate-180 text-brand-dark' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Subtabla de movimientos (visible si está expandido, siempre forzada en impresión) */}
                  <div className={`${estaExpandido ? 'block' : 'hidden'} print:!block`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[11px] text-gray-500 font-semibold bg-white">
                            <th className="py-2 px-3.5 w-1/3">FECHA RESERVA</th>
                            <th className="py-2 px-3.5 w-1/3">INSTALACIÓN</th>
                            <th className="py-2 px-3.5 w-1/3 text-right">ESTADO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                          {grupo.reservas.map((r, rIdx) => (
                            <tr
                              key={`${r.fechaReserva}-${r.tipoInstalacion}-${rIdx}`}
                              className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent"
                            >
                              <td className="py-2 px-3.5 font-semibold text-gray-900">
                                {formatFechaSinDesfase(r.fechaReserva)}
                              </td>
                              <td className="py-2 px-3.5 font-semibold text-brand-red">
                                {r.tipoInstalacion || '-'}
                              </td>
                              <td className="py-2 px-3.5 text-right">
                                <Badge
                                  variant={getBadgeVariant(r.estado)}
                                  className="text-[10px] font-bold"
                                >
                                  {r.estado || 'RESERVADA'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
export default ReporteTable;
