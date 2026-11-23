/**
 * pagos.types.ts
 * Tipos y DTOs de la feature "pagos".
 * Alineados con PagoRequestDto / PagoResponseDto del backend Spring Boot.
 */

// ─── Enums del backend ───────────────────────────────────────────────────────

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

export type TipoPago = 'RESERVA' | 'CUOTA_MEMBRESIA';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface PagoResponseDto {
  idPago: number;
  idUsuario: number;
  dniUsuario: string;
  nombreUsuario: string;
  puntosSaldoUsuario?: number | null;
  idReserva: number | null;
  tipoPago: TipoPago;
  periodo: string | null;
  montoPago: number;
  puntosUsados: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  fechaCreacion: string;
  fechaPago: string | null;
  registradoPorId: number | null;
  registradoPorNombre: string | null;
}

export interface PagoRequestDto {
  idUsuario: number;
  idReserva?: number | null;
  tipoPago: TipoPago;
  periodo?: string | null;
  montoPago: number;
  puntosUsados?: number;
  metodoPago: MetodoPago;
  estadoPago?: EstadoPago;
}

export interface CambiarEstadoPagoRequestDto {
  estadoPago: EstadoPago;
}

export interface GetPagosParams {
  page?: number;
  size?: number;
  sort?: string;
  idUsuario?: number;
  estadoPago?: EstadoPago;
  tipoPago?: TipoPago;
}

// ─── Etiquetas para la UI ────────────────────────────────────────────────────

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  ANULADO: 'Anulado',
};

export const TIPO_PAGO_LABELS: Record<TipoPago, string> = {
  RESERVA: 'Reserva',
  CUOTA_MEMBRESIA: 'Cuota de membresía',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
};

export const ESTADOS_PAGO: EstadoPago[] = [
  'PENDIENTE',
  'APROBADO',
  'RECHAZADO',
  'ANULADO',
];

export const TIPOS_PAGO: TipoPago[] = ['RESERVA', 'CUOTA_MEMBRESIA'];

export const METODOS_PAGO: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA'];
