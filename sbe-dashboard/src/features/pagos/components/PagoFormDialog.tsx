/**
 * PagoFormDialog.tsx
 * Modal para registrar un nuevo pago.
 * Implementado con React Hook Form + Zod siguiendo PagoRequestDto del backend.
 *
 * - Usuario: obligatorio.
 * - Tipo de pago: RESERVA (requiere reserva del usuario) o CUOTA_MEMBRESIA (requiere período).
 * - Monto: se autocompleta al elegir una reserva y puede editarse.
 * - El estado inicial del pago siempre es APROBADO.
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import type { PagoRequestDto, PagoResponseDto } from '../types/pagos.types';
import {
  METODOS_PAGO,
  METODO_PAGO_LABELS,
  TIPOS_PAGO,
  TIPO_PAGO_LABELS,
  type MetodoPago,
  type TipoPago,
} from '../types/pagos.types';
import { getUsuarioById, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { UsuarioSearchSelect } from '../../usuarios/components/UsuarioSearchSelect';
import {
  getReservasUsuario,
  type ReservaResponseDto,
} from '../../reservas/services/reservasApi';
import { getPagosUsuario } from '../services/pagosApi';
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
  usuarios?: UsuarioResponseDto[];
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
  usuarios = [],
  onCrear,
  prefill = null,
}: PagoFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [reservasUsuario, setReservasUsuario] = useState<ReservaResponseDto[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [puntosUsados, setPuntosUsados] = useState(0);
  const [saldoPuntosUsuario, setSaldoPuntosUsuario] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    getValues,
    reset,
    control,
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
      estadoPago: 'APROBADO',
    },
  });

  const idUsuario = Number(watch('idUsuario')) || 0;
  const tipoPago = watch('tipoPago');
  const idReserva = Number(watch('idReserva')) || 0;
  const montoIngresado = Number(watch('montoPago')) || 0;
  const reservaSeleccionada = reservasUsuario.find((reserva) => reserva.idReserva === idReserva);
  const puntosDisponibles = saldoPuntosUsuario ?? usuarios.find((usuario) => usuario.id === idUsuario)?.puntosAc ?? 0;
  const montoParaPuntos = tipoPago === 'RESERVA'
    ? Number(reservaSeleccionada?.montoReserva ?? 0)
    : montoIngresado;
  const maxPuntosAplicables = Math.min(puntosDisponibles, Math.floor(Math.max(0, montoParaPuntos)));
  const puntosAplicados = Math.min(puntosUsados, maxPuntosAplicables);

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
    setPuntosUsados(0);
    reset({
      idUsuario: prefillIdUsuario || 0,
      tipoPago: prefillTipo,
      idReserva: prefillIdReserva,
      periodo: getPeriodoActual(),
      montoPago: prefillMonto,
      metodoPago: 'EFECTIVO',
      estadoPago: 'APROBADO',
    });
  }, [
    open,
    reset,
    prefillIdUsuario,
    prefillIdReserva,
    prefillMonto,
    prefillTipo,
  ]);

  useEffect(() => {
    let cancelled = false;
    setSaldoPuntosUsuario(null);
    if (!open || !idUsuario) return;

    getUsuarioById(idUsuario)
      .then((usuario) => {
        if (!cancelled) setSaldoPuntosUsuario(Number(usuario.puntosAc) || 0);
      })
      .catch(() => {
        if (!cancelled) setSaldoPuntosUsuario(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, idUsuario]);

  // Cargar las reservas del usuario elegido (solo para pagos de tipo RESERVA)
  useEffect(() => {
    let cancelled = false;

    if (!open || tipoPago !== 'RESERVA' || !idUsuario) {
      setReservasUsuario([]);
      setLoadingReservas(false);
      return;
    }

    setLoadingReservas(true);
    Promise.all([getReservasUsuario(idUsuario), getPagosUsuario(idUsuario)])
      .then(([data, pagos]) => {
        if (cancelled) return;
        const reservasConPagoPendiente = new Set(
          pagos
            .filter((pago) => pago.tipoPago === 'RESERVA' && pago.estadoPago === 'PENDIENTE' && pago.idReserva != null)
            .map((pago) => pago.idReserva as number)
        );
        setReservasUsuario(data.filter((reserva) => reservasConPagoPendiente.has(reserva.idReserva)));
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
    setPuntosUsados(0);

    if (nuevoTipo === 'CUOTA_MEMBRESIA' && !getValues('periodo')) {
      setValue('periodo', getPeriodoActual(), { shouldValidate: true });
    }
  };

  const handleUsuarioChange = () => {
    setValue('idReserva', 0);
    setValue('montoPago', 0);
    setPuntosUsados(0);
  };

  const handleReservaChange = (value: string) => {
    const nuevoId = Number(value) || 0;
    setValue('idReserva', nuevoId, { shouldValidate: true });

    const reserva = reservasUsuario.find((r) => r.idReserva === nuevoId);
    if (reserva) {
      setPuntosUsados(0);
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
        montoPago: Math.max(0, Number(data.montoPago) - puntosAplicados),
        puntosUsados: puntosAplicados,
        metodoPago: data.metodoPago as MetodoPago,
        estadoPago: 'APROBADO',
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
          {/* Usuario: Búsqueda predictiva por DNI o nombre */}
          <div>
            <label className={labelClassName}>Usuario</label>
            <Controller
              control={control}
              name="idUsuario"
              render={({ field }) => (
                <UsuarioSearchSelect
                  value={field.value ? Number(field.value) : 0}
                  onChange={(usuarioId) => {
                    const nuevoId = usuarioId === 'all' ? 0 : Number(usuarioId);
                    field.onChange(nuevoId);
                    handleUsuarioChange();
                  }}
                  allowAll={false}
                  error={!!errors.idUsuario}
                  disabled={isSubmitting}
                  inputClassName="h-9"
                  className="w-full"
                  placeholder="Buscar por DNI o nombre…"
                  title="Buscar usuario por DNI o nombre"
                />
              )}
            />
            <FieldError message={errors.idUsuario?.message} />
          </div>

          {/* Tipo de pago */}
          <div>
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
                  <option value={0} disabled>El usuario no tiene reservas con pago pendiente</option>
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
                  No se encontraron reservas con un pago pendiente para el usuario seleccionado.
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

          {tipoPago === 'RESERVA' && (
            <div>
              <label className={labelClassName}>Puntos a usar (1 punto = $1)</label>
              <input
                type="number"
                min={0}
                max={maxPuntosAplicables}
                step={1}
                value={puntosAplicados}
                onChange={(event) => setPuntosUsados(Math.max(0, Math.min(maxPuntosAplicables, Math.floor(Number(event.target.value) || 0))))}
                disabled={!reservaSeleccionada || maxPuntosAplicables === 0}
                className={inputClass()}
              />
              <p className="mt-1 text-[10px] text-gray-500">
                {!idUsuario
                  ? 'Selecciona un usuario para consultar sus puntos.'
                  : saldoPuntosUsuario === null
                    ? 'Consultando saldo de puntos…'
                    : `Disponibles: ${puntosDisponibles} puntos.`}
                {idUsuario && !reservaSeleccionada && ' Selecciona una reserva para aplicarlos.'}
                {reservaSeleccionada && ` Máximo aplicable: ${maxPuntosAplicables}.`}
              </p>
            </div>
          )}

          {tipoPago === 'CUOTA_MEMBRESIA' && (
            <div>
              <label className={labelClassName}>Puntos a usar (1 punto = $1)</label>
              <input
                type="number"
                min={0}
                max={maxPuntosAplicables}
                step={1}
                value={puntosAplicados}
                onChange={(event) => setPuntosUsados(Math.max(0, Math.min(maxPuntosAplicables, Math.floor(Number(event.target.value) || 0))))}
                disabled={montoIngresado <= 0 || maxPuntosAplicables === 0}
                className={inputClass()}
              />
              <p className="mt-1 text-[10px] text-gray-500">Disponibles: {puntosDisponibles} · Máximo aplicable: {maxPuntosAplicables}</p>
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
                readOnly={tipoPago === 'RESERVA' && !!reservaSeleccionada}
                className={inputClass(!!errors.montoPago)}
              />
              <FieldError message={errors.montoPago?.message} />
              {tipoPago === 'RESERVA' && reservaSeleccionada && (
                <p className="mt-1 text-[10px] text-gray-500">Importe a abonar: {formatMonto(Math.max(0, Number(reservaSeleccionada.montoReserva) - puntosAplicados))}</p>
              )}
              {tipoPago === 'CUOTA_MEMBRESIA' && puntosAplicados > 0 && (
                <p className="mt-1 text-[10px] text-gray-500">Importe a abonar: {formatMonto(Math.max(0, montoIngresado - puntosAplicados))}</p>
              )}
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
              disabled={isSubmitting}
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
