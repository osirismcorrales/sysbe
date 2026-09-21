/**
 * InstalacionCard.tsx
 * Componente presentacional para mostrar una tarjeta de instalación.
 * Muestra detalladamente los días que abre y el rango de horarios de cada uno.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dumbbell, Edit, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DIAS_SEMANA_CONFIG, type DiaSemana } from '../services/plantillasHorarioApi';

export interface DiaHorarioInfo {
  diaSemana: DiaSemana;
  label: string;
  shortLabel: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
}

export interface InstalacionCardData {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  duracionMinutos: number;
  estado: string;
}

interface InstalacionCardProps {
  instalacion: InstalacionCardData;
  horariosList: DiaHorarioInfo[];
  horarioSummary: string;
  onStatusChange: (id: string, estado: string) => void;
  onEditInfo: (instalacion: InstalacionCardData) => void;
  onEditHorario: (instalacion: InstalacionCardData) => void;
}

function getEstadoBadgeVariant(estado: string) {
  if (estado === 'Habilitada') return 'success';
  if (estado === 'Mantenimiento') return 'warning';
  return 'destructive';
}

function getEstadoSelectClasses(estado: string) {
  if (estado === 'Habilitada') return 'text-green-700 border-green-200 bg-green-50/50';
  if (estado === 'Mantenimiento') return 'text-amber-700 border-amber-200 bg-amber-50/50';
  return 'text-red-700 border-red-200 bg-red-50/50';
}

export function InstalacionCard({
  instalacion,
  horariosList,
  horarioSummary,
  onStatusChange,
  onEditInfo,
  onEditHorario,
}: InstalacionCardProps) {
  // Conjunto de días en que abre para pintar los chips de la semana
  const diasAbiertosSet = new Set(horariosList.map((h) => h.diaSemana));

  return (
    <Card className="hover:shadow-md transition-all duration-200 flex flex-col justify-between border-slate-200 overflow-hidden bg-white">
      {/* Encabezado compacto */}
      <CardHeader className="p-2.5 sm:p-3 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-red-50 text-brand-red rounded-lg border border-red-100 shadow-2xs shrink-0">
              <Dumbbell className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xs font-bold text-slate-900 leading-tight truncate">
                {instalacion.nombre}
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-medium">
                ID #{instalacion.id}
              </span>
            </div>
          </div>
          <Badge
            variant={getEstadoBadgeVariant(instalacion.estado)}
            className="text-[9px] font-bold px-1.5 py-0.5 shrink-0"
          >
            {instalacion.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 p-2.5 sm:p-3 flex-1">
        {/* Descripción en 1 sola línea para ahorrar espacio vertical */}
        <p className="text-slate-600 text-[11px] leading-tight line-clamp-1">
          {instalacion.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* Sección: Días y Horarios de Apertura */}
        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wide">
              <Clock className="h-3 w-3 text-blue-600" />
              Horarios
            </span>
            <span
              className={cn(
                'text-[9px] font-bold px-1.5 py-0.5 rounded-full border',
                horariosList.length > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}
            >
              {horarioSummary}
            </span>
          </div>

          {/* Chips visuales de los 7 días de la semana */}
          <div className="grid grid-cols-7 gap-1 pt-0.5">
            {DIAS_SEMANA_CONFIG.map(({ key, shortLabel }) => {
              const isOpen = diasAbiertosSet.has(key);
              return (
                <div
                  key={key}
                  title={isOpen ? `${shortLabel}: Abierto` : `${shortLabel}: Cerrado`}
                  className={cn(
                    'flex flex-col items-center justify-center py-0.5 px-0.5 rounded text-[9px] font-bold transition-all text-center min-w-0',
                    isOpen
                      ? 'bg-white text-blue-700 border border-blue-200 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border border-transparent opacity-50'
                  )}
                >
                  <span className="truncate w-full text-center">{shortLabel}</span>
                  <span
                    className={cn(
                      'w-1 h-1 rounded-full mt-0.5 shrink-0',
                      isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Lista detallada compacta */}
          {horariosList.length > 0 ? (
            <div className="space-y-1 pt-0.5 max-h-24 overflow-y-auto pr-1">
              {horariosList.map((d) => (
                <div
                  key={d.diaSemana}
                  className="flex items-center justify-between px-2 py-1 rounded-md bg-white border border-slate-200/70 text-[10px] shadow-2xs hover:border-blue-200 transition-colors gap-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      {d.horaInicio} - {d.horaFin} hs
                    </span>
                    {d.horasTotales > 0 && (
                      <span className="text-[9px] text-slate-400 font-medium">
                        ({d.horasTotales}h)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-2 bg-white rounded-md border border-dashed border-slate-200 text-slate-500 text-[10px]">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Sin horarios configurados</span>
            </div>
          )}
        </div>

        {/* Tarifa y Duración */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {instalacion.duracionMinutos ?? 60} min / turno
          </span>
          <span className="text-xs font-black text-slate-900">
            ${(instalacion.precioBase ?? 0).toLocaleString('es-AR')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/60 p-2 sm:p-2.5 border-t border-slate-100 flex flex-col gap-2">
        {/* Selector de Estado */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estado:</span>
            <select
              value={instalacion.estado}
              onChange={(e) => onStatusChange(instalacion.id, e.target.value)}
              className={cn(
                'h-6 px-1.5 border rounded text-[9px] font-bold cursor-pointer focus:outline-none transition-colors',
                getEstadoSelectClasses(instalacion.estado)
              )}
            >
              <option value="Habilitada">Habilitada</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Deshabilitada">Deshabilitada</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-1.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditHorario(instalacion)}
            className="w-full h-7 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">Horarios</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditInfo(instalacion)}
            className="w-full h-7 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <Edit className="h-3 w-3 shrink-0" />
            <span className="truncate">Editar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
