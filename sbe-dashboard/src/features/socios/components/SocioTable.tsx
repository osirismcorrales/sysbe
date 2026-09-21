/**
 * SocioTable.tsx
 * Componente presentacional — tabla de socios.
 */

import React from 'react';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Edit2, UserX, Award, Mail, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { SocioResponseDto } from '../services/sociosApi';

// ─── Props ──────────────────────────────────────────────────────────────────

interface SocioTableProps {
  socios: SocioResponseDto[];
  onEdit: (socio: SocioResponseDto) => void;
  onDarDeBaja: (socio: SocioResponseDto) => void;
  onAjustePuntos: (socio: SocioResponseDto) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCategoriaBadge(tipoSocio: string) {
  const tipo = tipoSocio?.toUpperCase();
  if (tipo === 'INTERNO') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200">
        Interno
      </span>
    );
  }
  if (tipo === 'EXTERNO') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
        Externo
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-gray-50 text-gray-700 border-gray-200">
      {tipoSocio || 'No socio'}
    </span>
  );
}

function getEstadoBadge(estado: string) {
  const isActive = estado?.toUpperCase() === 'ACTIVO';
  return (
    <Badge
      variant={isActive ? 'success' : 'destructive'}
      className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
    >
      {isActive ? 'Activo' : 'De baja'}
    </Badge>
  );
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function SocioTable({ socios, onEdit, onDarDeBaja, onAjustePuntos }: SocioTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
            <th className="py-3 px-6">DNI</th>
            <th className="py-3 px-6">NOMBRE Y CONTACTO</th>
            <th className="py-3 px-6">CATEGORÍA</th>
            <th className="py-3 px-6">VÍNCULO</th>
            <th className="py-3 px-6">PUNTOS</th>
            <th className="py-3 px-6">ESTADO</th>
            <th className="py-3 px-6 text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {socios.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-400 font-medium bg-gray-50/10">
                No se encontraron socios.
              </td>
            </tr>
          )}
          {socios.map((socio) => (
            <tr key={socio.dni} className="hover:bg-gray-50/30 transition-colors">
              {/* DNI */}
              <td className="py-4 px-6 font-semibold text-gray-900">{socio.dni}</td>

              {/* Nombre y Contacto */}
              <td className="py-4 px-6 space-y-1">
                <div className="font-bold text-gray-950 text-sm">{socio.nombreCompleto}</div>
                <div className="flex items-center gap-1 text-gray-400 font-normal">
                  <Mail className="h-3 w-3" />
                  {socio.email}
                </div>
              </td>

              {/* Categoría */}
              <td className="py-4 px-6">
                {getCategoriaBadge(socio.tipoSocio)}
              </td>

              {/* Vínculo */}
              <td className="py-4 px-6">
                <span className="text-[10px] font-bold text-gray-500">
                  {socio.vinculoUnse || '—'}
                </span>
              </td>

              {/* Puntos */}
              <td className="py-4 px-6">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Award className="h-4 w-4" />
                  {socio.puntosAc ?? 0} pts
                </span>
              </td>

              {/* Estado */}
              <td className="py-4 px-6">
                {getEstadoBadge(socio.estado)}
              </td>

              {/* Acciones */}
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAjustePuntos(socio)}
                    className="h-8 px-2.5 text-[10px] font-semibold cursor-pointer"
                    title="Gestionar puntos"
                  >
                    <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Puntos
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(socio)}
                    className="h-8 w-8 p-0 cursor-pointer"
                    title="Cambiar categoría"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDarDeBaja(socio)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    title="Dar de baja membresía"
                  >
                    <UserX className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
