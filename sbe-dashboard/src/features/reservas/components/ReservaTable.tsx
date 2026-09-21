/**
 * ReservaTable.tsx
 * Componente presentacional — tabla de reservas.
 */

import React from 'react';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { XCircle, CalendarClock, Clock } from 'lucide-react';
import type { ReservaResponseDto, EstadoReserva } from '../services/reservasApi';
import type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import type { InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ReservaTableProps {
  reservas: ReservaResponseDto[];
  usuarioMap: Map<number, UsuarioResponseDto>;
  instalacionMap: Map<number, InstalacionResponseDto>;
  onCancelar: (reserva: ReservaResponseDto) => void;
  onReprogramar: (reserva: ReservaResponseDto) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  // fecha viene como "YYYY-MM-DD"
  const parts = fecha.split('-');
  if (parts.length !== 3) return fecha;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatHora(hora: string): string {
  if (!hora) return '—';
  // Truncar a HH:mm (puede venir como HH:mm:ss)
  return hora.substring(0, 5);
}

const estadoConfig: Record<EstadoReserva, { label: string; variant: 'success' | 'destructive' | 'secondary' | 'warning' | 'info' }> = {
  RESERVADA: { label: 'Reservada', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'destructive' },
  REPROGRAMADA: { label: 'Reprogramada', variant: 'info' },
  FINALIZADA: { label: 'Finalizada', variant: 'secondary' },
  BLOQUEADA: { label: 'Bloqueada', variant: 'warning' },
};

function getEstadoBadge(estado: EstadoReserva) {
  const config = estadoConfig[estado] || { label: estado, variant: 'secondary' as const };
  return (
    <Badge
      variant={config.variant}
      className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
    >
      {config.label}
    </Badge>
  );
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function ReservaTable({
  reservas,
  usuarioMap,
  instalacionMap,
  onCancelar,
  onReprogramar,
}: ReservaTableProps) {
  if (reservas.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 font-medium text-xs">
        No se encontraron reservas.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─── Vista Móvil / Tablet: Tarjetas fluidas (block md:hidden) ─────────── */}
      <div className="block md:hidden divide-y divide-gray-100 p-2 sm:p-2.5 space-y-2.5">
        {reservas.map((reserva) => {
          const usuario = usuarioMap.get(reserva.idUsuario);
          const instalacion = instalacionMap.get(reserva.idInstalacion);
          const isActive = reserva.estadoReserva === 'RESERVADA' || reserva.estadoReserva === 'REPROGRAMADA';

          return (
            <div
              key={reserva.idReserva}
              className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs space-y-2.5 transition-all"
            >
              {/* Encabezado: Instalación y Estado */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-gray-950 text-xs truncate">
                    {instalacion?.nombre || `Instalación #${reserva.idInstalacion}`}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                    {usuario?.nombreCompleto || `Usuario #${reserva.idUsuario}`}{' '}
                    {usuario?.dni && <span className="text-gray-400 font-normal">({usuario.dni})</span>}
                  </div>
                </div>
                <div className="shrink-0">
                  {getEstadoBadge(reserva.estadoReserva)}
                </div>
              </div>

              {/* Fecha, Horario y Monto */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Fecha</span>
                  <span className="font-bold text-gray-800 text-[11px]">{formatFecha(reserva.fechaReserva)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Horario</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-700 text-xs">
                    <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                    {formatHora(reserva.horarioInicio)} – {formatHora(reserva.horarioFin)} hs
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400 font-medium">Monto total:</span>
                  <span className="text-xs font-black text-emerald-600">
                    ${reserva.montoReserva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Botones de acción móviles */}
              {isActive && (
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReprogramar(reserva)}
                    className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    <CalendarClock className="h-3 w-3 mr-1 shrink-0" />
                    Reprogramar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancelar(reserva)}
                    className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-3 w-3 mr-1 shrink-0" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Vista Desktop: Tabla Adaptable al 100% de ancho sin scroll horizontal (hidden md:block) ────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Instalación</th>
              <th className="py-2.5 px-3">Usuario</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Fecha</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-28">Horario</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Monto</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Estado</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap w-36">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-xs">
            {reservas.map((reserva) => {
              const usuario = usuarioMap.get(reserva.idUsuario);
              const instalacion = instalacionMap.get(reserva.idInstalacion);
              const isActive = reserva.estadoReserva === 'RESERVADA' || reserva.estadoReserva === 'REPROGRAMADA';

              return (
                <tr key={reserva.idReserva} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-2.5 px-3 min-w-0">
                    <div
                      className="font-bold text-gray-900 text-xs truncate max-w-[150px] lg:max-w-[220px] xl:max-w-none"
                      title={instalacion?.nombre || `Instalación #${reserva.idInstalacion}`}
                    >
                      {instalacion?.nombre || `Instalación #${reserva.idInstalacion}`}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 min-w-0">
                    <div
                      className="font-semibold text-gray-900 text-xs truncate max-w-[150px] lg:max-w-[220px] xl:max-w-none"
                      title={usuario?.nombreCompleto || `Usuario #${reserva.idUsuario}`}
                    >
                      {usuario?.nombreCompleto || `Usuario #${reserva.idUsuario}`}
                    </div>
                    <div className="text-gray-400 text-[10px] font-normal">
                      {usuario?.dni || ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-gray-800 text-xs">
                      {formatFecha(reserva.fechaReserva)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-gray-600 text-xs font-mono">
                      <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                      {formatHora(reserva.horarioInicio)} – {formatHora(reserva.horarioFin)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-emerald-600 text-xs">
                      ${reserva.montoReserva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getEstadoBadge(reserva.estadoReserva)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReprogramar(reserva)}
                            className="h-7 px-2 text-[10px] font-semibold cursor-pointer"
                            title="Reprogramar"
                          >
                            <CalendarClock className="h-3 w-3 mr-1 text-blue-500" />
                            Reprogramar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancelar(reserva)}
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            title="Cancelar reserva"
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
