/**
 * HorarioDialog.tsx
 * Modal para configurar las plantillas de horarios de una instalación deportiva.
 * Conectado con el backend de Spring Boot (/api/plantillas-horario).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import {
  Clock,
  Copy,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  XCircle,
  SunMedium,
  Check,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  listarPlantillas,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  DIAS_SEMANA_CONFIG,
  formatHora,
  calcDuracionHoras,
  type DiaSemana,
  type PlantillaHorarioResponseDto,
} from '../services/plantillasHorarioApi';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface HorarioDiaEstado {
  id: number | null; // ID de la plantilla en el backend (si ya existe)
  diaSemana: DiaSemana;
  label: string;
  shortLabel: string;
  habilitado: boolean;
  horaInicio: string;
  horaFin: string;
}

interface HorarioDialogProps {
  open: boolean;
  instalacionId: number | null;
  nombreInstalacion: string;
  initialPlantillas?: PlantillaHorarioResponseDto[];
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_INICIO = '08:00';
const DEFAULT_FIN = '22:00';

export function buildDaysState(
  plantillas: PlantillaHorarioResponseDto[] = []
): Record<DiaSemana, HorarioDiaEstado> {
  const state = {} as Record<DiaSemana, HorarioDiaEstado>;
  
  // Por defecto, ningún día está habilitado a menos que exista en la plantilla
  DIAS_SEMANA_CONFIG.forEach(({ key, label, shortLabel }) => {
    state[key] = {
      id: null,
      diaSemana: key,
      label,
      shortLabel,
      habilitado: false,
      horaInicio: DEFAULT_INICIO,
      horaFin: DEFAULT_FIN,
    };
  });

  // Mapear exactamente las plantillas obtenidas
  plantillas.forEach((p) => {
    if (state[p.diaSemana]) {
      state[p.diaSemana] = {
        ...state[p.diaSemana],
        id: p.id,
        habilitado: true,
        horaInicio: formatHora(p.horaInicio) || DEFAULT_INICIO,
        horaFin: formatHora(p.horaFin) || DEFAULT_FIN,
      };
    }
  });

  return state;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function HorarioDialog({
  open,
  instalacionId,
  nombreInstalacion,
  initialPlantillas = [],
  onClose,
  onSaved,
}: HorarioDialogProps) {
  const [horarios, setHorarios] = useState<Record<DiaSemana, HorarioDiaEstado>>(() =>
    buildDaysState(initialPlantillas)
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Estados para aplicación masiva
  const [bulkInicio, setBulkInicio] = useState(() => {
    const first = initialPlantillas.find((p) => p.horaInicio && p.horaFin);
    return first ? formatHora(first.horaInicio) : DEFAULT_INICIO;
  });
  const [bulkFin, setBulkFin] = useState(() => {
    const first = initialPlantillas.find((p) => p.horaInicio && p.horaFin);
    return first ? formatHora(first.horaFin) : DEFAULT_FIN;
  });
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Cargar/sincronizar plantillas del backend al abrir el modal para la instalación
  useEffect(() => {
    if (!open || !instalacionId) return;

    // Si ya recibimos plantillas iniciales, reflejarlas inmediatamente sin esperar la API
    if (initialPlantillas && initialPlantillas.length > 0) {
      setHorarios(buildDaysState(initialPlantillas));
      const first = initialPlantillas.find((p) => p.horaInicio && p.horaFin);
      if (first) {
        setBulkInicio(formatHora(first.horaInicio));
        setBulkFin(formatHora(first.horaFin));
      }
    }

    let cancelled = false;
    // Solo mostrar el spinner grande si no teníamos plantillas iniciales en memoria
    if (!initialPlantillas || initialPlantillas.length === 0) {
      setLoading(true);
    }
    setError(null);
    setShowBulkPanel(false);

    listarPlantillas(instalacionId)
      .then((plantillas: PlantillaHorarioResponseDto[]) => {
        if (cancelled) return;
        setHorarios(buildDaysState(plantillas));
        const first = plantillas.find((p) => p.horaInicio && p.horaFin);
        if (first) {
          setBulkInicio(formatHora(first.horaInicio));
          setBulkFin(formatHora(first.horaFin));
        }
      })
      .catch((err: Error) => {
        if (!cancelled && (!initialPlantillas || initialPlantillas.length === 0)) {
          setError(`No se pudieron cargar los horarios: ${err.message}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, instalacionId, initialPlantillas]);

  // Manejador de cambios por día
  const handleHorarioChange = (
    diaKey: DiaSemana,
    field: 'habilitado' | 'horaInicio' | 'horaFin',
    value: string | boolean
  ) => {
    setHorarios((prev) => ({
      ...prev,
      [diaKey]: {
        ...prev[diaKey],
        [field]: value,
      },
    }));
  };

  // Copiar horarios de un día a días hábiles (Lun-Vie)
  const handleCopyToWeekdays = (sourceKey: DiaSemana) => {
    const source = horarios[sourceKey];
    setHorarios((prev) => {
      const updated = { ...prev };
      const weekdays: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
      weekdays.forEach((d) => {
        updated[d] = {
          ...updated[d],
          habilitado: source.habilitado,
          horaInicio: source.horaInicio,
          horaFin: source.horaFin,
        };
      });
      return updated;
    });

    setSuccessToast(`Horario de ${source.label} copiado a Lun-Vie`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // ─── Presets rápidos ────────────────────────────────────────────────────────

  const applyPreset = (type: 'lun-vie' | 'lun-sab' | 'todos' | 'cerrar') => {
    setHorarios((prev) => {
      const updated = { ...prev };
      DIAS_SEMANA_CONFIG.forEach(({ key }) => {
        if (type === 'lun-vie') {
          const isWeekday = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].includes(key);
          updated[key] = {
            ...updated[key],
            habilitado: isWeekday,
            horaInicio: '08:00',
            horaFin: '22:00',
          };
        } else if (type === 'lun-sab') {
          const isLunSab = key !== 'DOMINGO';
          updated[key] = {
            ...updated[key],
            habilitado: isLunSab,
            horaInicio: '08:00',
            horaFin: '21:00',
          };
        } else if (type === 'todos') {
          updated[key] = {
            ...updated[key],
            habilitado: true,
            horaInicio: '08:00',
            horaFin: '22:00',
          };
        } else if (type === 'cerrar') {
          updated[key] = {
            ...updated[key],
            habilitado: false,
          };
        }
      });
      return updated;
    });
  };

  // Aplicar rango horario masivo a todos los días habilitados
  const handleApplyBulkTimes = () => {
    if (bulkFin <= bulkInicio) {
      setError('La hora de cierre debe ser posterior a la de inicio.');
      return;
    }
    setError(null);
    setHorarios((prev) => {
      const updated = { ...prev };
      DIAS_SEMANA_CONFIG.forEach(({ key }) => {
        if (updated[key].habilitado) {
          updated[key] = {
            ...updated[key],
            horaInicio: bulkInicio,
            horaFin: bulkFin,
          };
        }
      });
      return updated;
    });
    setShowBulkPanel(false);
    setSuccessToast(`Horario (${bulkInicio} - ${bulkFin}) aplicado a los días abiertos`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Conteo de días habilitados
  const diasHabilitadosCount = useMemo(() => {
    return DIAS_SEMANA_CONFIG.filter(({ key }) => horarios[key]?.habilitado).length;
  }, [horarios]);

  // Guardar cambios en el backend
  const handleSave = async () => {
    if (!instalacionId) return;
    setError(null);

    // 1. Validaciones previas
    for (const { key, label } of DIAS_SEMANA_CONFIG) {
      const dia = horarios[key];
      if (dia.habilitado) {
        if (!dia.horaInicio || !dia.horaFin) {
          setError(`Por favor completa los horarios para el día ${label}.`);
          return;
        }
        if (dia.horaFin <= dia.horaInicio) {
          setError(`En el día ${label}, el horario de cierre debe ser posterior a la apertura.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const tasks: Promise<unknown>[] = [];

      for (const { key } of DIAS_SEMANA_CONFIG) {
        const dia = horarios[key];

        if (dia.habilitado) {
          if (dia.id) {
            // Actualizar existente
            tasks.push(
              actualizarPlantilla(dia.id, {
                idInstalacion: instalacionId,
                diaSemana: dia.diaSemana,
                horaInicio: dia.horaInicio,
                horaFin: dia.horaFin,
              })
            );
          } else {
            // Crear nueva plantilla
            tasks.push(
              crearPlantilla({
                idInstalacion: instalacionId,
                diaSemana: dia.diaSemana,
                horaInicio: dia.horaInicio,
                horaFin: dia.horaFin,
              })
            );
          }
        } else if (dia.id) {
          // Si existía en DB y se deshabilitó, eliminar
          tasks.push(eliminarPlantilla(dia.id));
        }
      }

      await Promise.all(tasks);
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar las plantillas de horario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !saving && onClose()} className="max-w-2xl sm:max-w-3xl w-full">
      <DialogContent className="w-full max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        {/* Header con gradiente elegante */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-white">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30 shadow-inner">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span>Configuración de Plantilla de Horarios</span>
                  <span className="block text-xs font-normal text-blue-200/80 mt-0.5">
                    {nombreInstalacion}
                  </span>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
                  diasHabilitadosCount > 0
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                )}>
                  {diasHabilitadosCount > 0 ? `${diasHabilitadosCount} días abiertos` : 'Cerrada'}
                </span>
              </div>
            </div>
            <DialogDescription className="text-gray-300 text-xs mt-1.5">
              Establezca los días de apertura y el rango horario para permitir reservas en el sistema.
            </DialogDescription>
          </DialogHeader>

          {/* Barra de Presets Rápidos */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('lun-vie')}
              className="text-[10px] font-semibold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-white/10"
            >
              Lun a Vie (08:00 - 22:00)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('lun-sab')}
              className="text-[10px] font-semibold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-white/10"
            >
              Lun a Sáb (08:00 - 21:00)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('todos')}
              className="text-[10px] font-semibold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-white/10"
            >
              Todos los días
            </button>
            <button
              type="button"
              onClick={() => applyPreset('cerrar')}
              className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-2 py-1 rounded-md transition-colors cursor-pointer border border-rose-400/20 ml-auto"
            >
              Cerrar todos
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
          {/* Mensajes de error o éxito */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successToast && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Panel de ajuste masivo opcional */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                <span>Aplicar mismo rango a todos los días abiertos</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPanel(!showBulkPanel)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {showBulkPanel ? 'Ocultar' : 'Ajustar'}
              </button>
            </div>

            {showBulkPanel && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Apertura:</span>
                  <input
                    type="time"
                    value={bulkInicio}
                    onChange={(e) => setBulkInicio(e.target.value)}
                    className="h-8 px-2 border border-slate-300 rounded-md text-xs font-semibold text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Cierre:</span>
                  <input
                    type="time"
                    value={bulkFin}
                    onChange={(e) => setBulkFin(e.target.value)}
                    className="h-8 px-2 border border-slate-300 rounded-md text-xs font-semibold text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleApplyBulkTimes}
                  className="h-8 text-xs font-semibold cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 ml-auto"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Aplicar a {diasHabilitadosCount} días
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Cargando plantillas de horario...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {DIAS_SEMANA_CONFIG.map(({ key, label, shortLabel }) => {
                const dia = horarios[key];
                const isHabilitado = dia?.habilitado;
                const duracion = calcDuracionHoras(dia?.horaInicio || '', dia?.horaFin || '');
                const isHorarioInvalido = isHabilitado && (dia?.horaFin <= dia?.horaInicio);

                return (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                      isHabilitado
                        ? "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                        : "bg-slate-100/70 border-dashed border-slate-200 opacity-60 hover:opacity-90"
                    )}
                  >
                    {/* Nombre del día e indicador */}
                    <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[130px]">
                      {/* Pill con abreviatura */}
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0",
                        isHabilitado
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                          : "bg-slate-200 text-slate-500"
                      )}>
                        {shortLabel}
                      </div>
                      <div className="min-w-0">
                        <span className={cn(
                          "font-bold text-xs block",
                          isHabilitado ? "text-slate-900" : "text-slate-500"
                        )}>
                          {label}
                        </span>
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.2 rounded inline-block mt-0.5",
                          isHabilitado
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-slate-200 text-slate-600"
                        )}>
                          {isHabilitado ? 'Abierto' : 'Cerrado'}
                        </span>
                      </div>
                    </div>

                    {/* Inputs de Horarios */}
                    {isHabilitado ? (
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:flex-1">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">De:</span>
                          <input
                            type="time"
                            value={dia?.horaInicio || DEFAULT_INICIO}
                            onChange={(e) => handleHorarioChange(key, 'horaInicio', e.target.value)}
                            disabled={saving}
                            className="h-6 px-1 text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                          />
                        </div>

                        <span className="text-slate-400 font-bold">→</span>

                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">A:</span>
                          <input
                            type="time"
                            value={dia?.horaFin || DEFAULT_FIN}
                            onChange={(e) => handleHorarioChange(key, 'horaFin', e.target.value)}
                            disabled={saving}
                            className="h-6 px-1 text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                          />
                        </div>

                        {/* Duración calculada */}
                        {!isHorarioInvalido && duracion > 0 && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 hidden md:inline-block">
                            {duracion} hs
                          </span>
                        )}

                        {isHorarioInvalido && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Cierre debe ser mayor a apertura
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 text-[11px] text-slate-400 italic">
                        Instalación cerrada este día (sin turnos de reserva)
                      </div>
                    )}

                    {/* Acciones: Copiar y Switch Toggle */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {isHabilitado && (
                        <button
                          type="button"
                          title={`Copiar horario de ${label} a Lun-Vie`}
                          onClick={() => handleCopyToWeekdays(key)}
                          disabled={saving}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}

                      {/* Switch toggle de habilitación */}
                      <button
                        type="button"
                        onClick={() => handleHorarioChange(key, 'habilitado', !isHabilitado)}
                        disabled={saving}
                        className={cn(
                          'w-11 h-6 rounded-full transition-colors cursor-pointer relative shadow-inner',
                          isHabilitado ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                        title={isHabilitado ? `Desactivar ${label}` : `Activar ${label}`}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center text-[10px] font-bold',
                            isHabilitado ? 'translate-x-5 text-emerald-600' : 'translate-x-0.5 text-slate-400'
                          )}
                        >
                          {isHabilitado ? '✓' : ''}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer del diálogo */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>
              Total: <strong className="text-slate-800">{diasHabilitadosCount}</strong> de 7 días configurados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleSave}
              disabled={loading || saving}
              className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando horarios…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Guardar Horarios
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
