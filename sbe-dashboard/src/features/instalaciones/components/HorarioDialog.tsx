/**
 * HorarioDialog.tsx
 * Modal presentacional para configurar los horarios de una instalación.
 * Recibe el estado del horario y callbacks sin lógica de negocio propia.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Clock, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface HorarioDia {
  habilitado: boolean;
  horaInicio: string;
  horaFin: string;
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

// ─── Props ──────────────────────────────────────────────────────────────────

interface HorarioDialogProps {
  open: boolean;
  nombreInstalacion: string;
  horario: Record<string, HorarioDia>;
  onHorarioChange: (dia: string, field: keyof HorarioDia, value: string | boolean) => void;
  onCopyToWeekdays: (sourceDia: string) => void;
  onSave: () => void;
  onClose: () => void;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function HorarioDialog({
  open,
  nombreInstalacion,
  horario,
  onHorarioChange,
  onCopyToWeekdays,
  onSave,
  onClose,
}: HorarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Configurar Horarios — {nombreInstalacion}
          </DialogTitle>
          <DialogDescription>
            Defina los días y franjas horarias en que esta instalación estará disponible para reservar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 mt-2">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_60px_100px_100px_40px] gap-2 items-center px-2 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
            <span>Día</span>
            <span className="text-center">Abierto</span>
            <span className="text-center">Apertura</span>
            <span className="text-center">Cierre</span>
            <span></span>
          </div>

          {/* Day rows */}
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className={cn(
                "grid grid-cols-[1fr_60px_100px_100px_40px] gap-2 items-center px-2 py-2 rounded-lg transition-colors",
                horario[dia]?.habilitado
                  ? "bg-white"
                  : "bg-gray-50 opacity-60"
              )}
            >
              {/* Day name */}
              <span className={cn(
                "font-bold text-xs",
                horario[dia]?.habilitado ? "text-gray-900" : "text-gray-400"
              )}>
                {dia}
              </span>

              {/* Toggle */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onHorarioChange(dia, 'habilitado', !horario[dia]?.habilitado)}
                  className={cn(
                    "w-9 h-5 rounded-full transition-colors cursor-pointer relative",
                    horario[dia]?.habilitado ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      horario[dia]?.habilitado ? "translate-x-4.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Start time */}
              <input
                type="time"
                value={horario[dia]?.horaInicio || '08:00'}
                onChange={(e) => onHorarioChange(dia, 'horaInicio', e.target.value)}
                disabled={!horario[dia]?.habilitado}
                className="h-7 px-2 border border-gray-200 rounded-md text-[10px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-300"
              />

              {/* End time */}
              <input
                type="time"
                value={horario[dia]?.horaFin || '21:00'}
                onChange={(e) => onHorarioChange(dia, 'horaFin', e.target.value)}
                disabled={!horario[dia]?.habilitado}
                className="h-7 px-2 border border-gray-200 rounded-md text-[10px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-300"
              />

              {/* Copy to weekdays */}
              <div className="flex justify-center">
                <button
                  type="button"
                  title={`Copiar horario de ${dia} a Lun-Vie`}
                  onClick={() => onCopyToWeekdays(dia)}
                  className="text-gray-300 hover:text-blue-600 transition-colors cursor-pointer p-1 rounded"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <p className="text-[10px] text-gray-400 font-medium mt-2 px-2">
          💡 Haga clic en el ícono <Copy className="inline h-3 w-3" /> para copiar el horario de un día a todos los días de semana (Lun-Vie).
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={onSave}
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            Guardar Horarios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
