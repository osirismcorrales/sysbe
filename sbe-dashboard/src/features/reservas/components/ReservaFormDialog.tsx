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
import { CalendarDays, Loader2, AlertCircle, Clock, CheckCircle2, ChevronDown, Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { handleApiFormError } from '../../../lib/handleApiFormError';
import type { ReservaResponseDto, ReservaRequestDto, ReprogramarReservaRequestDto } from '../services/reservasApi';
import type { InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import { UsuarioSearchSelect } from '../../usuarios/components/UsuarioSearchSelect';
import { getUsuarioById, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
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
  METODOS_PAGO,
  METODO_PAGO_LABELS,
  ESTADO_PAGO_LABELS,
  type MetodoPago,
} from '../../pagos/types/pagos.types';
import {
  reservaRequestSchema,
  reprogramarReservaSchema,
  calcMax2Months,
  type ReservaRequestFormValues,
} from '../schemas/reservaSchemas';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface PagoCreacionData {
  metodoPago: MetodoPago;
  estadoPago: 'APROBADO';
  puntosUsados: number;
}

interface ReservaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'crear' | 'reprogramar';
  reserva?: ReservaResponseDto | null;
  instalaciones: InstalacionResponseDto[];
  onCrear: (body: ReservaRequestDto, pagoData?: PagoCreacionData) => Promise<ReservaResponseDto>;
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

  const idUsuario = mode === 'crear' ? (watch('idUsuario') || 0) : (reserva?.idUsuario ?? 0);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResponseDto | null>(null);

  // Estado del acordeón de pago integrado
  const [pagoAccordionOpen, setPagoAccordionOpen] = useState(true);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [puntosUsados, setPuntosUsados] = useState(0);

  useEffect(() => {
    const uid = Number(idUsuario);
    if (!uid) {
      setUsuarioSeleccionado(null);
      return;
    }
    let cancelled = false;
    getUsuarioById(uid)
      .then((u) => {
        if (!cancelled) setUsuarioSeleccionado(u);
      })
      .catch(() => {
        if (!cancelled) setUsuarioSeleccionado(null);
      });
    return () => {
      cancelled = true;
    };
  }, [idUsuario]);

  const tarifaCalculada = useMemo(() => {
    const base = Number(selectedInstalacion?.precioBase ?? 0);
    const cat = usuarioSeleccionado?.categoria;
    const descPct = Number(cat?.descuento ?? 0);
    const recPct = Number(cat?.recargo ?? 0);

    let montoFinal = base;
    let ajuste = 0;
    if (recPct > 0) {
      ajuste = Math.round((base * recPct) / 100);
      montoFinal = base + ajuste;
    } else if (descPct > 0) {
      ajuste = Math.round((base * descPct) / 100);
      montoFinal = Math.max(0, base - ajuste);
    }
    return {
      base,
      descPct,
      recPct,
      ajuste,
      montoFinal,
    };
  }, [selectedInstalacion, usuarioSeleccionado]);

  const maxPuntosAplicables = Math.min(
    usuarioSeleccionado?.puntosAc ?? 0,
    Math.floor(tarifaCalculada.montoFinal)
  );

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
      setPuntosUsados(0);
      setPagoAccordionOpen(true);
      setMetodoPago('EFECTIVO');
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
          idUsuario: 0,
          idInstalacion: instalaciones[0]?.id ?? 0,
        });
      }
    }
  }, [open, mode, reserva, instalaciones, reset]);

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
      // Re-verificar disponibilidad en tiempo real antes de enviar la reserva
      const instalacionId = mode === 'crear' ? Number(data.idInstalacion) : reserva?.idInstalacion;
      if (instalacionId) {
        try {
          const bloquesActuales = await consultarDisponibilidad(instalacionId, data.fechaReserva);
          const bloqueElegido = bloquesActuales.find(
            (b) => b.horaInicio.slice(0, 5) === data.horarioInicio.slice(0, 5)
          );
          if (bloqueElegido && !bloqueElegido.disponible) {
            setFormError('El turno seleccionado ya no se encuentra disponible. Por favor elige otro horario.');
            setSaving(false);
            return;
          }
        } catch {
          // Si la verificación falla por red, continuamos hacia la validación del backend
        }
      }

      if (mode === 'reprogramar' && reserva) {
        await onReprogramar(reserva.idReserva, {
          fechaReserva: data.fechaReserva,
          horarioInicio: data.horarioInicio,
          horarioFin: data.horarioFin,
        });
      } else {
        await onCrear(
          {
            fechaReserva: data.fechaReserva,
            horarioInicio: data.horarioInicio,
            horarioFin: data.horarioFin,
            idUsuario: Number(data.idUsuario),
            idInstalacion: Number(data.idInstalacion),
          },
          {
            metodoPago,
            estadoPago: 'APROBADO',
            puntosUsados: Math.min(puntosUsados, maxPuntosAplicables),
          }
        );
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

          {/* Usuario — solo en modo crear. Búsqueda predictiva por DNI o nombre. */}
          {mode === 'crear' && (
            <div>
              <label className={labelClassName}>Usuario</label>
              <Controller
                control={control}
                name="idUsuario"
                render={({ field }) => (
                  <UsuarioSearchSelect
                    value={field.value ? Number(field.value) : 0}
                    onChange={(usuarioId) =>
                      field.onChange(usuarioId === 'all' ? 0 : usuarioId)
                    }
                    allowAll={false}
                    error={!!errors.idUsuario}
                    inputClassName="h-9"
                    className="w-full"
                    placeholder="Buscar por DNI o nombre…"
                    title="Buscar usuario por DNI o nombre"
                  />
                )}
              />
              <FieldError message={errors.idUsuario?.message} />
            </div>
          )}

          {/* Mostrador de Tarifa de Reserva: Base, Descuento, Recargo y Total */}
          {selectedInstalacion && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Tarifa Estimada de la Reserva</span>
                <span className="text-[10px] font-normal normal-case text-gray-500">
                  {selectedInstalacion.nombre}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-gray-400 block text-[10px] font-medium">Precio Base</span>
                  <span className="font-bold text-gray-800 text-xs">
                    ${tarifaCalculada.base.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-gray-400 block text-[10px] font-medium">Descuento</span>
                  <span
                    className={`font-bold text-xs ${
                      tarifaCalculada.descPct > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {tarifaCalculada.descPct > 0 ? `-${tarifaCalculada.descPct}%` : 'Sin descuento'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-gray-400 block text-[10px] font-medium">Recargo</span>
                  <span
                    className={`font-bold text-xs ${
                      tarifaCalculada.recPct > 0 ? 'text-amber-600' : 'text-gray-500'
                    }`}
                  >
                    {tarifaCalculada.recPct > 0 ? `+${tarifaCalculada.recPct}%` : 'Sin recargo'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-semibold">
                <span className="text-gray-600">
                  {usuarioSeleccionado ? (
                    <>
                      Usuario:{' '}
                      <span className="font-bold text-gray-900">
                        {usuarioSeleccionado.nombreCompleto} (
                        {usuarioSeleccionado.categoria?.tipoSocio === 'NO_SOCIO'
                          ? 'No Socio'
                          : usuarioSeleccionado.categoria?.tipoSocio === 'SOCIO_INTERNO'
                          ? 'Socio Interno'
                          : usuarioSeleccionado.categoria?.tipoSocio === 'SOCIO_EXTERNO'
                          ? 'Socio Externo'
                          : usuarioSeleccionado.categoria?.tipoSocio ?? 'Sin categoría'}
                        )
                      </span>
                    </>
                  ) : (
                    'Tarifa estándar (seleccione un usuario)'
                  )}
                </span>
                <span className="text-sm font-black text-emerald-600">
                  ${tarifaCalculada.montoFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Acordeón: Registro de Pago Asociado (reutiliza los controles de pago) */}
          {mode === 'crear' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all">
              <button
                type="button"
                onClick={() => setPagoAccordionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-gray-900">
                    Registro de Pago Asociado
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      'bg-emerald-100 text-emerald-700'
                    )}
                  >
                    {ESTADO_PAGO_LABELS.APROBADO}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-500 transition-transform duration-200',
                    pagoAccordionOpen ? 'rotate-180' : ''
                  )}
                />
              </button>

              {pagoAccordionOpen && (
                <div className="p-3.5 space-y-3 border-t border-slate-200/80 bg-white">
                  <p className="text-[11px] text-gray-500">
                    Al crear la reserva se generará automáticamente el comprobante de pago vinculado con el monto de la tarifa.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClassName}>Método de pago</label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                        className={selectClass(false)}
                      >
                        {METODOS_PAGO.map((metodo) => (
                          <option key={metodo} value={metodo}>
                            {METODO_PAGO_LABELS[metodo]}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  <div>
                    <label className={labelClassName}>Puntos a usar (1 punto = $1)</label>
                    <input
                      type="number"
                      min={0}
                      max={maxPuntosAplicables}
                      step={1}
                      value={Math.min(puntosUsados, maxPuntosAplicables)}
                      onChange={(event) => setPuntosUsados(Math.max(0, Math.min(maxPuntosAplicables, Math.floor(Number(event.target.value) || 0))))}
                      disabled={maxPuntosAplicables === 0}
                      className={inputClass(false)}
                    />
                    <p className="mt-1 text-[10px] text-gray-500">Disponibles: {usuarioSeleccionado?.puntosAc ?? 0} · Máximo aplicable: {maxPuntosAplicables}</p>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                    <span className="text-gray-500 font-medium">Monto del pago a registrar:</span>
                    <span className="font-bold text-gray-900">
                      ${(tarifaCalculada.montoFinal - Math.min(puntosUsados, maxPuntosAplicables)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
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
