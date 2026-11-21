/**
 * PagoFormDialog.tsx
 * Modal para registrar un nuevo pago.
 * Implementado con React Hook Form + Zod siguiendo PagoRequestDto del backend.
 *
 * - Usuario: obligatorio.
 * - Tipo de pago: RESERVA (requiere reserva del usuario) o CUOTA_MEMBRESIA (requiere período).
 * - Monto: se autocompleta al elegir una reserva y puede editarse.
 * - Estado inicial: PENDIENTE o APROBADO.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import type { PagoRequestDto, PagoResponseDto } from '../types/pagos.types';
import {
  ESTADOS_PAGO,
  ESTADO_PAGO_LABELS,
  METODOS_PAGO,
  METODO_PAGO_LABELS,
  TIPOS_PAGO,
  TIPO_PAGO_LABELS,
  type MetodoPago,
  type TipoPago,
} from '../types/pagos.types';
import type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import {
  getReservasUsuario,
  type ReservaResponseDto,
} from '../../reservas/services/reservasApi';
import { pagoRequestSchema, getPeriodoActual, type PagoFormValues } from '../schemas/pagoSchemas';
import { formatMonto } from '../utils/pagoFormat';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface PagoFormPrefill {
  idUsuario: number;
  idReserva?: number | null;
  montoPago?: number;
  tipoPago?: TipoPago;
}

interface PagoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarios: UsuarioResponseDto[];
  onCrear: (body: PagoRequestDto) => Promise<PagoResponseDto>;
  /** Datos iniciales para registrar un pago desde una reserva. */
  prefill?: PagoFormPrefill | null;
}

// ─── Estilos comunes ────────────────────────────────────────────────────────

function inputClass(error?: boolean, extra?: string) {
  return cn(
    'h-9 px-3 w-full border rounded-lg focus:outline-none focus:ring-2 text-xs transition-colors bg-white',
    extra,
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
  );
}

function selectClass(error?: boolean, extra?: string) {
  return cn(
    'h-9 px-3 w-full border rounded-lg focus:outline-none focus:ring-2 text-xs transition-colors bg-white cursor-pointer appearance-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    extra,
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
  );
}

const labelClassName = 'block text-xs font-semibold text-gray-700 mb-1';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFechaReserva(fecha: string): string {
  if (!fecha) return '—';
  const parts = fecha.split('-');
  if (parts.length !== 3) return fecha;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatHora(hora: string): string {
  if (!hora) return '—';
  return hora.substring(0, 5);
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function PagoFormDialog({
  open,
  onOpenChange,
  usuarios,
  onCrear,
  prefill = null,
}: PagoFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [reservasUsuario, setReservasUsuario] = useState<ReservaResponseDto[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoRequestSchema) as any,
    defaultValues: {
      idUsuario: 0,
      tipoPago: 'RESERVA',
      idReserva: 0,
      periodo: getPeriodoActual(),
      montoPago: 0,
      metodoPago: 'EFECTIVO',
      estadoPago: 'PENDIENTE',
    },
  });

  const idUsuario = Number(watch('idUsuario')) || 0;
  const tipoPago = watch('tipoPago');
  const idReserva = Number(watch('idReserva')) || 0;

  // Valores primitivos del prefill: evitan re-ejecutar el reset en cada render
  // por identidad del objeto.
  const prefillIdUsuario = prefill?.idUsuario ?? 0;
  const prefillIdReserva = prefill?.idReserva ?? 0;
  const prefillMonto = prefill?.montoPago ?? 0;
  const prefillTipo = prefill?.tipoPago ?? 'RESERVA';

  // Reset al abrir el modal (con prefill si viene desde una reserva)
  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setReservasUsuario([]);
    reset({
      idUsuario: prefillIdUsuario || usuarios[0]?.id || 0,
      tipoPago: prefillTipo,
      idReserva: prefillIdReserva,
      periodo: getPeriodoActual(),
      montoPago: prefillMonto,
      metodoPago: 'EFECTIVO',
      estadoPago: 'PENDIENTE',
    });
  }, [
    open,
    reset,
    usuarios,
    prefillIdUsuario,
    prefillIdReserva,
    prefillMonto,
    prefillTipo,
  ]);

  // Cargar las reservas del usuario elegido (solo para pagos de tipo RESERVA)
  useEffect(() => {
    let cancelled = false;

    if (!open || tipoPago !== 'RESERVA' || !idUsuario) {
      setReservasUsuario([]);
      setLoadingReservas(false);
      return;
    }

    setLoadingReservas(true);
    getReservasUsuario(idUsuario)
      .then((data) => {
        if (!cancelled) setReservasUsuario(data);
      })
      .catch(() => {
        if (!cancelled) setReservasUsuario([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingReservas(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, tipoPago, idUsuario]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleTipoPagoChange = (value: string) => {
    const nuevoTipo = value as TipoPago;
    setValue('tipoPago', nuevoTipo, { shouldValidate: true });
    setValue('idReserva', 0);
    setValue('montoPago', 0);

    if (nuevoTipo === 'CUOTA_MEMBRESIA' && !getValues('periodo')) {
      setValue('periodo', getPeriodoActual(), { shouldValidate: true });
    }
  };

  const handleUsuarioChange = () => {
    setValue('idReserva', 0);
    setValue('montoPago', 0);
  };

  const handleReservaChange = (value: string) => {
    const nuevoId = Number(value) || 0;
    setValue('idReserva', nuevoId, { shouldValidate: true });

    const reserva = reservasUsuario.find((r) => r.idReserva === nuevoId);
    if (reserva) {
      setValue('montoPago', Number(reserva.montoReserva), { shouldValidate: true });
    }
  };

  const onSubmitValid = async (data: PagoFormValues) => {
    setFormError(null);

    try {
      await onCrear({
        idUsuario: Number(data.idUsuario),
        tipoPago: data.tipoPago,
        idReserva: data.tipoPago === 'RESERVA' ? Number(data.idReserva) : null,
        periodo: data.tipoPago === 'CUOTA_MEMBRESIA' ? (data.periodo ?? '').trim() : null,
        montoPago: Number(data.montoPago),
        metodoPago: data.metodoPago as MetodoPago,
        estadoPago: data.estadoPago,
      });
      onOpenChange(false);
    } catch (err) {
      handleApiFormError(err, setError as any);
      setFormError((err as Error).message || 'Error al registrar el pago.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg sm:max-w-xl w-full">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Registrar Nuevo Pago
          </DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un pago de reserva o una cuota de membresía.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitValid)} className="space-y-4 mt-2">
          {/* Usuario */}
          <div>
            <label className={labelClassName}>Usuario</label>
            <select
              {...register('idUsuario', { onChange: handleUsuarioChange })}
              className={selectClass(!!errors.idUsuario)}
              disabled={usuarios.length === 0}
            >
              <option value={0} disabled>
                {usuarios.length === 0 ? 'No hay usuarios disponibles…' : 'Selecciona un usuario…'}
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombreCompleto} ({u.dni})
                </option>
              ))}
            </select>
            <FieldError message={errors.idUsuario?.message} />
          </div>

          {/* Tipo de pago / Estado inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClassName}>Tipo de pago</label>
              <select
                value={tipoPago}
                onChange={(e) => handleTipoPagoChange(e.target.value)}
                className={selectClass(!!errors.tipoPago)}
              >
                {TIPOS_PAGO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TIPO_PAGO_LABELS[tipo]}
                  </option>
                ))}
              </select>
              <FieldError message={errors.tipoPago?.message} />
            </div>

            <div>
              <label className={labelClassName}>Estado inicial</label>
              <select
                {...register('estadoPago')}
                className={selectClass(!!errors.estadoPago)}
              >
                {ESTADOS_PAGO.filter((estado) => estado === 'PENDIENTE' || estado === 'APROBADO').map(
                  (estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_PAGO_LABELS[estado]}
                    </option>
                  )
                )}
              </select>
              <FieldError message={errors.estadoPago?.message} />
            </div>
          </div>

          {/* Reserva o Período según el tipo */}
          {tipoPago === 'RESERVA' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Reserva asociada</label>
                {loadingReservas && (
                  <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Cargando reservas…
                  </span>
                )}
              </div>
              <select
                value={idReserva}
                onChange={(e) => handleReservaChange(e.target.value)}
                className={selectClass(!!errors.idReserva)}
                disabled={!idUsuario || loadingReservas || reservasUsuario.length === 0}
              >
                {!idUsuario ? (
                  <option value={0} disabled>Selecciona un usuario primero…</option>
                ) : loadingReservas ? (
                  <option value={0} disabled>Consultando reservas del usuario…</option>
                ) : reservasUsuario.length === 0 ? (
                  <option value={0} disabled>El usuario no tiene reservas registradas</option>
                ) : (
                  <option value={0} disabled>Selecciona una reserva…</option>
                )}

                {reservasUsuario.map((r) => (
                  <option key={r.idReserva} value={r.idReserva}>
                    #{r.idReserva} · {formatFechaReserva(r.fechaReserva)}{' '}
                    {formatHora(r.horarioInicio)}–{formatHora(r.horarioFin)} ·{' '}
                    {formatMonto(r.montoReserva)} · {r.estadoReserva}
                  </option>
                ))}
              </select>
              <FieldError message={errors.idReserva?.message} />
              {idUsuario > 0 && !loadingReservas && reservasUsuario.length === 0 && (
                <p className="mt-1 text-[10px] text-amber-700 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  No se encontraron reservas para el usuario seleccionado.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className={labelClassName}>Período de la cuota</label>
              <input
                type="month"
                {...register('periodo')}
                className={inputClass(!!errors.periodo)}
              />
              <FieldError message={errors.periodo?.message} />
              <p className="mt-1 text-[10px] text-gray-400 font-medium">
                Formato AAAA-MM. Ejemplo: {getPeriodoActual()}.
              </p>
            </div>
          )}

          {/* Monto / Método */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClassName}>Monto</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('montoPago')}
                className={inputClass(!!errors.montoPago)}
              />
              <FieldError message={errors.montoPago?.message} />
            </div>

            <div>
              <label className={labelClassName}>Método de pago</label>
              <select
                {...register('metodoPago')}
                className={selectClass(!!errors.metodoPago)}
              >
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {METODO_PAGO_LABELS[metodo]}
                  </option>
                ))}
              </select>
              <FieldError message={errors.metodoPago?.message} />
            </div>
          </div>

          {/* Error de servidor / validación de regla */}
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              className="cursor-pointer"
              disabled={isSubmitting || usuarios.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Registrando…
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PagoFormDialog;
