/**
 * InstalacionCard.tsx
 * Componente presentacional para mostrar una tarjeta de instalación.
 * No contiene lógica de negocio, solo renderiza datos y delega eventos.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Dumbbell, Edit, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
  horarioSummary: string;
  horarioHours: string;
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
  horarioSummary,
  horarioHours,
  onStatusChange,
  onEditInfo,
  onEditHorario,
}: InstalacionCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-red-50 rounded-lg text-brand-red">
              <Dumbbell className="h-4 w-4" />
            </div>
            {instalacion.nombre}
          </CardTitle>
        </div>
        <Badge
          variant={getEstadoBadgeVariant(instalacion.estado)}
          className="text-[9px] font-bold px-2 py-0.5"
        >
          {instalacion.estado}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 py-3 flex-1">
        <p className="text-gray-500 font-medium leading-relaxed">
          {instalacion.descripcion}
        </p>

        {/* Schedule summary row */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-gray-50 rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-gray-300" />
          <span>{horarioSummary}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">{horarioHours}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-300" />
            {instalacion.duracionMinutos ?? 60} min / turno
          </span>
          <span className="text-xs font-black text-gray-900">
            ${(instalacion.precioBase ?? 0).toLocaleString('es-AR')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-col gap-3">
        {/* Estado selector row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400">Estado:</span>
            <select
              value={instalacion.estado}
              onChange={(e) => onStatusChange(instalacion.id, e.target.value)}
              className={cn(
                "h-7 px-1.5 border rounded-md text-[10px] font-bold cursor-pointer focus:outline-none",
                getEstadoSelectClasses(instalacion.estado)
              )}
            >
              <option value="Habilitada">Habilitada</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Deshabilitada">Deshabilitada</option>
            </select>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditHorario(instalacion)}
            className="flex-1 h-8 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Clock className="h-3.5 w-3.5" />
            Editar Horarios
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditInfo(instalacion)}
            className="flex-1 h-8 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar Info
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
