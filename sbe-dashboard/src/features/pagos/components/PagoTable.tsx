/**
 * PagoTable.tsx
 * Componente presentacional — tabla de pagos.
 * Incluye vista de tarjetas para móvil/tablet y tabla completa para desktop.
 */

import React from 'react';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Ban, CheckCircle2, Clock, Loader2, User, XCircle } from 'lucide-react';
import type { PagoResponseDto, EstadoPago } from '../types/pagos.types';
import {
  ESTADO_PAGO_LABELS,
  METODO_PAGO_LABELS,
  TIPO_PAGO_LABELS,
} from '../types/pagos.types';
import {
  formatFechaHora,
  formatMonto,
  getDetallePago,
} from '../utils/pagoFormat';

// ─── Props ──────────────────────────────────────────────────────────────────

interface PagoTableProps {
  pagos: PagoResponseDto[];
  onAprobar: (pago: PagoResponseDto) => void;
  onRechazar: (pago: PagoResponseDto) => void;
  onAnular: (pago: PagoResponseDto) => void;
  processingId?: number | null;
}

// ─── Helpers visuales ───────────────────────────────────────────────────────

const estadoConfig: Record<
  EstadoPago,
  { variant: 'success' | 'destructive' | 'secondary' | 'warning' }
> = {
  PENDIENTE: { variant: 'warning' },
  APROBADO: { variant: 'success' },
  RECHAZADO: { variant: 'destructive' },
  ANULADO: { variant: 'secondary' },
};

function getEstadoBadge(estado: EstadoPago) {
  const config = estadoConfig[estado] || { variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} className="text-[10px] font-bold px-2 py-0.5 shadow-2xs">
      {ESTADO_PAGO_LABELS[estado] ?? estado}
    </Badge>
  );
}

function getFechaPago(pago: PagoResponseDto): string {
  return pago.estadoPago === 'APROBADO' && pago.fechaPago
    ? pago.fechaPago
    : pago.fechaCreacion;
}

function puedeAprobar(pago: PagoResponseDto): boolean {
  return pago.estadoPago === 'PENDIENTE';
}

function puedeRechazar(pago: PagoResponseDto): boolean {
  return pago.estadoPago === 'PENDIENTE';
}

function puedeAnular(pago: PagoResponseDto): boolean {
  return pago.estadoPago === 'APROBADO' || pago.estadoPago === 'RECHAZADO';
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function PagoTable({
  pagos,
  onAprobar,
  onRechazar,
  onAnular,
  processingId = null,
}: PagoTableProps) {
  if (pagos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 font-medium text-xs">
        No se encontraron pagos.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─── Vista Móvil / Tablet: tarjetas ────────────────────────────────── */}
      <div className="block md:hidden divide-y divide-gray-100 p-2 sm:p-2.5 space-y-2.5">
        {pagos.map((pago) => {
          const processing = processingId === pago.idPago;
          const detalle = getDetallePago(pago.tipoPago, pago.idReserva, pago.periodo);

          return (
            <div
              key={pago.idPago}
              className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs space-y-2.5 transition-all"
            >
              {/* Encabezado */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-gray-950 text-xs truncate">
                    Pago #{pago.idPago} · {formatMonto(pago.montoPago)}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                    {pago.nombreUsuario || `Usuario #${pago.idUsuario}`}
                    {pago.dniUsuario && (
                      <span className="text-gray-400 font-normal"> ({pago.dniUsuario})</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">{getEstadoBadge(pago.estadoPago)}</div>
              </div>

              {/* Detalle */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-400 font-medium block">Concepto</span>
                  <span className="font-semibold text-gray-800 text-[11px]">
                    {TIPO_PAGO_LABELS[pago.tipoPago] ?? pago.tipoPago} · {detalle}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Método</span>
                  <span className="font-semibold text-gray-700 text-[11px]">
                    {METODO_PAGO_LABELS[pago.metodoPago] ?? pago.metodoPago}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Fecha</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-700 text-[11px]">
                    <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                    {formatFechaHora(getFechaPago(pago))}
                  </span>
                </div>
                {pago.registradoPorNombre && (
                  <div className="col-span-2 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <User className="h-3 w-3 shrink-0" />
                    Registrado por {pago.registradoPorNombre}
                  </div>
                )}
              </div>

              {/* Acciones */}
              {(puedeAprobar(pago) || puedeRechazar(pago) || puedeAnular(pago)) && (
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                  {puedeAprobar(pago) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAprobar(pago)}
                      disabled={processing}
                      className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      {processing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Aprobar
                    </Button>
                  )}
                  {puedeRechazar(pago) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRechazar(pago)}
                      disabled={processing}
                      className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Rechazar
                    </Button>
                  )}
                  {puedeAnular(pago) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAnular(pago)}
                      disabled={processing}
                      className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Anular
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Vista Desktop: tabla ──────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Usuario</th>
              <th className="py-2.5 px-3">Concepto</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-28">Monto</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-32">Método</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Estado</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-40">Fecha</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap w-48">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-xs">
            {pagos.map((pago) => {
              const processing = processingId === pago.idPago;
              const detalle = getDetallePago(pago.tipoPago, pago.idReserva, pago.periodo);

              return (
                <tr key={pago.idPago} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-2.5 px-3 min-w-0">
                    <div
                      className="font-bold text-gray-900 text-xs truncate max-w-[170px] lg:max-w-[220px] xl:max-w-none"
                      title={pago.nombreUsuario || `Usuario #${pago.idUsuario}`}
                    >
                      {pago.nombreUsuario || `Usuario #${pago.idUsuario}`}
                    </div>
                    <div className="text-gray-400 text-[10px] font-normal">
                      {pago.dniUsuario || ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 min-w-0">
                    <div className="font-semibold text-gray-800 text-xs truncate max-w-[210px]">
                      {TIPO_PAGO_LABELS[pago.tipoPago] ?? pago.tipoPago}
                    </div>
                    <div className="text-gray-400 text-[10px] font-normal">{detalle}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-emerald-600 text-xs">
                      {formatMonto(pago.montoPago)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-gray-700 text-xs">
                      {METODO_PAGO_LABELS[pago.metodoPago] ?? pago.metodoPago}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getEstadoBadge(pago.estadoPago)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-gray-600 text-xs font-medium">
                      <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                      {formatFechaHora(getFechaPago(pago))}
                    </span>
                    {pago.registradoPorNombre && (
                      <div className="text-gray-400 text-[10px] font-normal truncate max-w-[180px]">
                        Reg. por {pago.registradoPorNombre}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {puedeAprobar(pago) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAprobar(pago)}
                          disabled={processing}
                          className="h-7 px-2 text-[10px] font-semibold cursor-pointer text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          title="Aprobar pago"
                        >
                          {processing ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          Aprobar
                        </Button>
                      )}
                      {puedeRechazar(pago) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRechazar(pago)}
                          disabled={processing}
                          className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                          title="Rechazar pago"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {puedeAnular(pago) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAnular(pago)}
                          disabled={processing}
                          className="h-7 w-7 p-0 text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                          title="Anular pago"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
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

export default PagoTable;
