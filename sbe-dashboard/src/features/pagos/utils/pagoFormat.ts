/**
 * pagoFormat.ts
 * Helpers de presentación compartidos por la feature de pagos.
 */

import type { EstadoPago, TipoPago } from '../types/pagos.types';
import { ESTADO_PAGO_LABELS, TIPO_PAGO_LABELS } from '../types/pagos.types';

/** Formatea un número como moneda argentina. */
export function formatMonto(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '$ 0,00';
  return `$ ${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Formatea una fecha ISO (LocalDateTime) a "DD/MM/AAAA HH:mm". */
export function formatFechaHora(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Devuelve la etiqueta humana del estado de un pago. */
export function getEstadoPagoLabel(estado: EstadoPago): string {
  return ESTADO_PAGO_LABELS[estado] ?? estado;
}

/** Devuelve la etiqueta humana del tipo de pago. */
export function getTipoPagoLabel(tipo: TipoPago): string {
  return TIPO_PAGO_LABELS[tipo] ?? tipo;
}

/** Describe el detalle variable del pago (reserva o período de membresía). */
export function getDetallePago(
  tipoPago: TipoPago,
  idReserva: number | null,
  periodo: string | null
): string {
  if (tipoPago === 'RESERVA') {
    return idReserva ? `Reserva #${idReserva}` : 'Sin reserva asociada';
  }
  return periodo ? `Período ${periodo}` : 'Sin período';
}
