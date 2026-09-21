/**
 * ReservaFormDialog.tsx
 * Modal para crear una nueva reserva o reprogramar una existente.
 * Implementado con React Hook Form + Zod siguiendo ReservaRequestDto y ReprogramarReservaRequestDto.
 *
 * - Fecha: DatePickerCalendar con restricción de 48 horas corridas.
 * - Horarios: selector conectado a la API de disponibilidad en tiempo real (/api/plantillas-horario/disponibilidad).
 * - Validaciones: esquema Zod con mensajes amigables y componentes <FieldError />.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { DatePickerCalendar } from '../../../components/ui/DatePickerCalendar';
import { FieldError } from '../../../components/ui/FieldError';
import { CalendarDays, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import type { ReservaResponseDto, ReservaRequestDto, ReprogramarReservaRequestDto } from '../services/reservasApi';
import type { UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import type { InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import {
  listarPlantillas,
  consultarDisponibilidad,
  getDiaSemanaFromDate,
  formatHora,
  DIA_SEMANA_TO_LABEL,
  type PlantillaHorarioResponseDto,
  type BloqueDto,
} from '../../instalaciones/services/plantillasHorarioApi';
import {
  reservaRequestSchema,
  reprogramarReservaSchema,
  calcMax2Months,
  type ReservaRequestFormValues,
} from '../schemas/reservaSchemas';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ReservaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'crear' | 'reprogramar';
  reserva?: ReservaResponseDto | null;
  usuarios: UsuarioResponseDto[];
  instalaciones: InstalacionResponseDto[];
  onCrear: (body: ReservaRequestDto) => Promise<ReservaResponseDto>;
  onReprogramar: (idReserva: number, body: ReprogramarReservaRequestDto) => Promise<ReservaResponseDto>;
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

// ─── Helpers: 48 horas corridas ─────────────────────────────────────────────

/** Devuelve el Date exacto de ahora + 48 horas. */
function calcMin48h(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 48);
  return d;
}

/** Formatea un Date a "YYYY-MM-DD" usando hora local. */
function dateToLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Determina si un bloque horario queda dentro de las 48h de anticipación.
 */
function isBloqueWithin48h(fechaReserva: string, horaInicio: string, min48h: Date): boolean {
  const [h, m] = horaInicio.split(':').map(Number);
  const [y, mo, d] = fechaReserva.split('-').map(Number);
  const bloqueDate = new Date(y, mo - 1, d, h, m, 0);
  return bloqueDate.getTime() < min48h.getTime();
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function ReservaFormDialog({
  open,
  onOpenChange,
  mode,
  reserva,
  usuarios,
  instalaciones,
  onCrear,
  onReprogramar,
}: ReservaFormDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Hook Form configurado con el esquema Zod respectivo según el modo
  const currentSchema = mode === 'crear' ? reservaRequestSchema : reprogramarReservaSchema;
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReservaRequestFormValues>({
    resolver: zodResolver(currentSchema) as any,
    defaultValues: {
      fechaReserva: '',
      horarioInicio: '',
      horarioFin: '',
      idUsuario: 0,
      idInstalacion: 0,
    },
  });

  const fechaReserva = watch('fechaReserva');
  const horarioInicio = watch('horarioInicio');
  const horarioFin = watch('horarioFin');
  const idInstalacion = mode === 'crear' ? (watch('idInstalacion') || 0) : (reserva?.idInstalacion ?? 0);

  // Plantillas de horario de la instalación
  const [plantillasInstalacion, setPlantillasInstalacion] = useState<PlantillaHorarioResponseDto[]>([]);
  const [loadingPlantillas, setLoadingPlantillas] = useState(false);

  // Bloques de disponibilidad calculados EXCLUSIVAMENTE por el backend (API)
  const [bloques, setBloques] = useState<BloqueDto[]>([]);
  const [loadingBloques, setLoadingBloques] = useState(false);

  // Cargar plantillas cuando cambia la instalación seleccionada
  useEffect(() => {
    if (!idInstalacion) {
      setPlantillasInstalacion([]);
      return;
    }
    let cancelled = false;
    setLoadingPlantillas(true);
    listarPlantillas(idInstalacion)
      .then((data) => {
        if (!cancelled) setPlantillasInstalacion(data);
      })
      .catch(() => {
        if (!cancelled) setPlantillasInstalacion([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPlantillas(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idInstalacion]);

  // Consultar disponibilidad real a la API cuando cambie idInstalacion o fechaReserva
  useEffect(() => {
    if (!idInstalacion || !fechaReserva) {
      setBloques([]);
      return;
    }

    let cancelled = false;
    setLoadingBloques(true);
    setValue('horarioInicio', '');
    setValue('horarioFin', '');

    consultarDisponibilidad(idInstalacion, fechaReserva)
      .then((data) => {
        if (!cancelled) setBloques(data);
      })
      .catch(() => {
        if (!cancelled) setBloques([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBloques(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idInstalacion, fechaReserva, setValue]);

  // Duración requerida por la instalación
  const selectedInstalacion = useMemo(() => {
    return instalaciones.find((i) => i.id === Number(idInstalacion));
  }, [instalaciones, idInstalacion]);

  const duracionMinutos = selectedInstalacion?.duracionMinutos ?? 60;

  // Umbral exacto: ahora + 48 horas corridas
  const min48h = useMemo(() => calcMin48h(), []);
  const minDate = useMemo(() => dateToLocalISO(min48h), [min48h]);

  // Límite máximo: hoy + 2 meses
  const max2Months = useMemo(() => calcMax2Months(), []);
  const maxDate = useMemo(() => dateToLocalISO(max2Months), [max2Months]);

  // Fechas formateadas para mostrar al usuario (DD/MM/YYYY)
  const minDateDisplay = useMemo(() => {
    const [y, m, d] = minDate.split('-');
    return `${d}/${m}/${y}`;
  }, [minDate]);

  const maxDateDisplay = useMemo(() => {
    const [y, m, d] = maxDate.split('-');
    return `${d}/${m}/${y}`;
  }, [maxDate]);

  // Determinar día de la semana y plantilla para la fecha elegida
  const diaSemanaSeleccionado = useMemo(() => {
    if (!fechaReserva) return null;
    return getDiaSemanaFromDate(fechaReserva);
  }, [fechaReserva]);

  const plantillasDelDia = useMemo(() => {
    if (!diaSemanaSeleccionado) return [];
    return plantillasInstalacion.filter((p) => p.diaSemana === diaSemanaSeleccionado);
  }, [plantillasInstalacion, diaSemanaSeleccionado]);

  const esDiaCerrado = useMemo(() => {
    if (loadingPlantillas || !fechaReserva || plantillasInstalacion.length === 0) return false;
    return plantillasDelDia.length === 0;
  }, [loadingPlantillas, fechaReserva, plantillasInstalacion, plantillasDelDia]);

  // Días de la semana deshabilitados (sin plantilla configurada para la instalación)
  const disabledDaysOfWeek = useMemo(() => {
    if (plantillasInstalacion.length === 0) return [];
    const DIA_TO_JS_INDEX: Record<string, number> = {
      DOMINGO: 0, LUNES: 1, MARTES: 2, MIERCOLES: 3,
      JUEVES: 4, VIERNES: 5, SABADO: 6,
    };
    const diasConPlantilla = new Set(
      plantillasInstalacion.map((p) => DIA_TO_JS_INDEX[p.diaSemana])
    );
    return [0, 1, 2, 3, 4, 5, 6].filter((d) => !diasConPlantilla.has(d));
  }, [plantillasInstalacion]);

  // Reset y precarga de formulario al abrir
  useEffect(() => {
    if (open) {
      setFormError(null);
      if (mode === 'reprogramar' && reserva) {
        reset({
          fechaReserva: reserva.fechaReserva,
          horarioInicio: reserva.horarioInicio.substring(0, 5),
          horarioFin: reserva.horarioFin.substring(0, 5),
          idUsuario: reserva.idUsuario,
          idInstalacion: reserva.idInstalacion,
        });
      } else {
        reset({
          fechaReserva: '',
          horarioInicio: '',
          horarioFin: '',
          idUsuario: usuarios[0]?.id ?? 0,
          idInstalacion: instalaciones[0]?.id ?? 0,
        });
      }
    }
  }, [open, mode, reserva, usuarios, instalaciones, reset]);

  // Al seleccionar turno desde los bloques devueltos por la API
  const handleBloqueSelect = (inicio: string) => {
    setValue('horarioInicio', inicio, { shouldValidate: true });
    if (!inicio) {
      setValue('horarioFin', '', { shouldValidate: true });
      return;
    }

    const match = bloques.find((b) => formatHora(b.horaInicio) === inicio);
    if (match) {
      setValue('horarioFin', formatHora(match.horaFin), { shouldValidate: true });
    } else {
      setValue('horarioFin', '', { shouldValidate: true });
    }
  };

  const onSubmitValid = async (data: ReservaRequestFormValues) => {
    setFormError(null);

    // Validar anticipación de 48h
    if (data.fechaReserva < minDate) {
      setFormError('La reserva debe realizarse con al menos 48 horas de anticipación.');
      return;
    }

    // Validar límite máximo de 2 meses
    if (data.fechaReserva > maxDate) {
      setFormError(`La reserva no puede realizarse con más de 2 meses de anticipación (máximo ${maxDateDisplay}).`);
      return;
    }

    if (esDiaCerrado && diaSemanaSeleccionado) {
      setFormError(
        `La instalación está cerrada los días ${DIA_SEMANA_TO_LABEL[diaSemanaSeleccionado]}. Por favor elige otra fecha.`
      );
      return;
    }

    if (data.horarioInicio >= data.horarioFin) {
      setFormError('El horario de inicio debe ser anterior al de fin.');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'reprogramar' && reserva) {
        await onReprogramar(reserva.idReserva, {
          fechaReserva: data.fechaReserva,
          horarioInicio: data.horarioInicio,
          horarioFin: data.horarioFin,
        });
      } else {
        await onCrear({
          fechaReserva: data.fechaReserva,
          horarioInicio: data.horarioInicio,
          horarioFin: data.horarioFin,
          idUsuario: Number(data.idUsuario),
          idInstalacion: Number(data.idInstalacion),
        });
      }
      onOpenChange(false);
    } catch (err) {
      handleApiFormError(err, setError as any);
      setFormError((err as Error).message || 'Error al guardar la reserva.');
    } finally {
      setSaving(false);
    }
  };


  const disponiblesCount = useMemo(() => {
    return bloques.filter((b) => {
      if (!b.disponible) return false;
      if (fechaReserva && isBloqueWithin48h(fechaReserva, formatHora(b.horaInicio), min48h)) return false;
      return true;
    }).length;
  }, [bloques, fechaReserva, min48h]);

  const ocupadosCount = useMemo(() => {
    return bloques.length - disponiblesCount;
  }, [bloques, disponiblesCount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg sm:max-w-xl w-full">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {mode === 'crear' ? 'Nueva Reserva' : 'Reprogramar Reserva'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'crear'
              ? 'Completa los datos para registrar una nueva reserva.'
              : `Modificar fecha y horario de la reserva #${reserva?.idReserva ?? ''}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitValid)} className="space-y-4 mt-2">
          {/* Instalación — solo en modo crear */}
          {mode === 'crear' && (
            <div>
              <label className={labelClassName}>Instalación</label>
              <select
                {...register('idInstalacion', {
                  onChange: () => {
                    setValue('horarioInicio', '');
                    setValue('horarioFin', '');
                  },
                })}
                className={selectClass(!!errors.idInstalacion)}
              >
                <option value={0} disabled>Selecciona una instalación…</option>
                {instalaciones.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre} ({i.duracionMinutos ?? 60} min / turno)
                  </option>
                ))}
              </select>
              <FieldError message={errors.idInstalacion?.message} />
            </div>
          )}

          {/* Fecha con calendario react-day-picker a través de Controller */}
          <div>
            <label className={labelClassName}>Fecha de la Reserva</label>
            <Controller
              control={control}
              name="fechaReserva"
              render={({ field }) => (
                <DatePickerCalendar
                  value={field.value}
                  onChange={(dateStr) => {
                    field.onChange(dateStr);
                    setValue('horarioInicio', '');
                    setValue('horarioFin', '');
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDaysOfWeek={disabledDaysOfWeek}
                  noOpenDays={!loadingPlantillas && Number(idInstalacion) > 0 && plantillasInstalacion.length === 0}
                  noOpenDaysMessage="Esta instalación no tiene días de apertura configurados. Configure los horarios primero."
                  placeholder="Seleccionar fecha de reserva…"
                  helperText={
                    <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>
                            Desde {minDateDisplay} (mín. 48 hs) hasta {maxDateDisplay} (máx. 2 meses).
                          </span>
                        </span>
                        {diaSemanaSeleccionado && (
                          <span className="font-semibold text-gray-700 shrink-0">
                            {DIA_SEMANA_TO_LABEL[diaSemanaSeleccionado]}
                          </span>
                        )}
                      </div>
                    </div>
                  }
                />
              )}
            />
            <FieldError message={errors.fechaReserva?.message} />

            {/* Aviso si la instalación está cerrada ese día según plantillas */}
            {esDiaCerrado && diaSemanaSeleccionado && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>La instalación seleccionada permanece cerrada los días {DIA_SEMANA_TO_LABEL[diaSemanaSeleccionado]}.</span>
              </div>
            )}

            {plantillasDelDia.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Clock className="h-3 w-3" />
                <span>
                  Horario de atención: {formatHora(plantillasDelDia[0].horaInicio)} a {formatHora(plantillasDelDia[0].horaFin)} hs
                </span>
              </div>
            )}
          </div>

          {/* Horarios obtenidos de la API */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Horario de Inicio</label>
                {loadingBloques && (
                  <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Consultando API…
                  </span>
                )}
              </div>
              <select
                value={horarioInicio}
                onChange={(e) => handleBloqueSelect(e.target.value)}
                className={selectClass(!!errors.horarioInicio)}
                disabled={esDiaCerrado || !fechaReserva || loadingBloques || bloques.length === 0}
              >
                {!fechaReserva ? (
                  <option value="" disabled>Selecciona una fecha primero…</option>
                ) : loadingBloques ? (
                  <option value="" disabled>Consultando turnos en servidor…</option>
                ) : esDiaCerrado ? (
                  <option value="" disabled>Instalación cerrada este día</option>
                ) : bloques.length === 0 ? (
                  <option value="" disabled>No hay turnos disponibles para esta fecha</option>
                ) : (
                  <option value="" disabled>Seleccionar turno disponible…</option>
                )}

                {/* Turnos obtenidos de la API */}
                {bloques.map((b) => {
                  const ini = formatHora(b.horaInicio);
                  const fin = formatHora(b.horaFin);
                  const within48h = fechaReserva ? isBloqueWithin48h(fechaReserva, ini, min48h) : false;
                  const isDisabled = !b.disponible || within48h;
                  const label = within48h
                    ? `${ini} a ${fin} hs · (Dentro de 48h)`
                    : `${ini} a ${fin} hs ${b.disponible ? '· Disponible' : '· (Ocupado)'}`;
                  return (
                    <option
                      key={ini}
                      value={ini}
                      disabled={isDisabled}
                      className={!isDisabled ? 'text-slate-900 font-medium' : 'text-slate-400 bg-slate-100 italic'}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>
              <FieldError message={errors.horarioInicio?.message} />

              {/* Indicador de disponibilidad en tiempo real */}
              {bloques.length > 0 && !loadingBloques && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {disponiblesCount} disponibles
                  </span>
                  {ocupadosCount > 0 && (
                    <span className="text-slate-400">
                      · {ocupadosCount} ocupado{ocupadosCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={labelClassName}>
                Horario Fin <span className="text-gray-400 font-normal">({duracionMinutos} min)</span>
              </label>
              <input
                type="text"
                value={horarioFin ? `${horarioFin} hs` : ''}
                readOnly
                placeholder="Se completa al elegir turno"
                className={inputClass(!!errors.horarioFin, 'bg-gray-50 text-gray-700 font-medium cursor-not-allowed')}
              />
              <FieldError message={errors.horarioFin?.message} />
            </div>
          </div>

          {/* Usuario — solo en modo crear */}
          {mode === 'crear' && (
            <div>
              <label className={labelClassName}>Usuario</label>
              <select
                {...register('idUsuario')}
                className={selectClass(!!errors.idUsuario)}
              >
                <option value={0} disabled>Selecciona un usuario…</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombreCompleto} ({u.dni})
                  </option>
                ))}
              </select>
              <FieldError message={errors.idUsuario?.message} />
            </div>
          )}

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
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              className="cursor-pointer"
              disabled={saving || esDiaCerrado || !horarioInicio}
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Guardando…
                </>
              ) : mode === 'crear' ? (
                'Crear Reserva'
              ) : (
                'Reprogramar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReservaFormDialog;
