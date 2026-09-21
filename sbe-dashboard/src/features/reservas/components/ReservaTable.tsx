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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50 text-[11px] uppercase tracking-wider">
            <th className="py-3 px-5">Instalación</th>
            <th className="py-3 px-5">Usuario</th>
            <th className="py-3 px-5">Fecha</th>
            <th className="py-3 px-5">Horario</th>
            <th className="py-3 px-5">Monto</th>
            <th className="py-3 px-5">Estado</th>
            <th className="py-3 px-5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-sm">
          {reservas.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-gray-400 font-medium bg-gray-50/10">
                No se encontraron reservas.
              </td>
            </tr>
          )}
          {reservas.map((reserva) => {
            const usuario = usuarioMap.get(reserva.idUsuario);
            const instalacion = instalacionMap.get(reserva.idInstalacion);
            const isActive = reserva.estadoReserva === 'RESERVADA' || reserva.estadoReserva === 'REPROGRAMADA';

            return (
              <tr key={reserva.idReserva} className="hover:bg-gray-50/30 transition-colors">
                {/* Instalación */}
                <td className="py-4 px-5">
                  <div className="font-bold text-gray-950 text-sm">
                    {instalacion?.nombre || `Instalación #${reserva.idInstalacion}`}
                  </div>
                </td>

                {/* Usuario */}
                <td className="py-4 px-5">
                  <div className="font-semibold text-gray-800">
                    {usuario?.nombreCompleto || `Usuario #${reserva.idUsuario}`}
                  </div>
                  <div className="text-gray-400 text-xs font-normal">
                    {usuario?.dni || ''}
                  </div>
                </td>

                {/* Fecha */}
                <td className="py-4 px-5">
                  <span className="font-semibold text-gray-900">
                    {formatFecha(reserva.fechaReserva)}
                  </span>
                </td>

                {/* Horario */}
                <td className="py-4 px-5">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {formatHora(reserva.horarioInicio)} – {formatHora(reserva.horarioFin)}
                  </span>
                </td>

                {/* Monto */}
                <td className="py-4 px-5">
                  <span className="font-bold text-emerald-600">
                    ${reserva.montoReserva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </td>

                {/* Estado */}
                <td className="py-4 px-5">
                  {getEstadoBadge(reserva.estadoReserva)}
                </td>

                {/* Acciones */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isActive && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReprogramar(reserva)}
                          className="h-8 px-2.5 text-[10px] font-semibold cursor-pointer"
                          title="Reprogramar"
                        >
                          <CalendarClock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          Reprogramar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelar(reserva)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
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
  );
}
