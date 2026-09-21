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
  if (socios.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 font-medium text-xs">
        No se encontraron socios.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─── Vista Móvil / Tablet: Tarjetas fluidas (block md:hidden) ─────────── */}
      <div className="block md:hidden divide-y divide-gray-100 p-2 sm:p-2.5 space-y-2.5">
        {socios.map((socio) => (
          <div
            key={socio.dni}
            className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs space-y-2.5 transition-all"
          >
            {/* Cabecera: Nombre + Estado */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-gray-950 text-xs truncate">
                  {socio.nombreCompleto}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-normal truncate mt-0.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{socio.email}</span>
                </div>
              </div>
              <div className="shrink-0">
                {getEstadoBadge(socio.estado)}
              </div>
            </div>

            {/* Fila de datos: DNI, Categoría, Vínculo, Puntos */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">DNI</span>
                <span className="font-bold text-gray-800 text-[11px]">{socio.dni}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Puntos Acumulados</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-xs">
                  <Award className="h-3.5 w-3.5" />
                  {socio.puntosAc ?? 0} pts
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Categoría</span>
                <div className="mt-0.5">{getCategoriaBadge(socio.tipoSocio)}</div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Vínculo UNSE</span>
                <span className="text-[11px] font-semibold text-gray-600 mt-0.5 block truncate">
                  {socio.vinculoUnse || 'Sin vínculo'}
                </span>
              </div>
            </div>

            {/* Botones de acción móviles */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAjustePuntos(socio)}
                className="h-7 px-2 text-[10px] font-bold cursor-pointer justify-center text-amber-700 border-amber-200 hover:bg-amber-50"
                title="Gestionar puntos"
              >
                <Award className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">Puntos</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(socio)}
                className="h-7 px-2 text-[10px] font-bold cursor-pointer justify-center text-blue-700 border-blue-200 hover:bg-blue-50"
                title="Cambiar categoría"
              >
                <Edit2 className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">Categoría</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDarDeBaja(socio)}
                className="h-7 px-2 text-[10px] font-bold cursor-pointer justify-center text-red-600 border-red-200 hover:bg-red-50"
                title="Dar de baja membresía"
              >
                <UserX className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">Baja</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Vista Desktop: Tabla Adaptable al 100% de ancho sin scroll horizontal (hidden md:block) ────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">DNI</th>
              <th className="py-2.5 px-3">Nombre</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-32">Categoría</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Puntos</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Estado</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap w-36">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-xs">
            {socios.map((socio) => (
              <tr key={socio.dni} className="hover:bg-gray-50/40 transition-colors">
                <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap text-xs">{socio.dni}</td>
                <td className="py-2.5 px-3 min-w-0">
                  <div
                    className="font-bold text-gray-900 text-xs leading-tight truncate max-w-[180px] lg:max-w-[260px]"
                    title={socio.nombreCompleto}
                  >
                    {socio.nombreCompleto}
                  </div>
                  <div
                    className="flex items-center gap-1 text-gray-400 font-normal text-[10px] truncate max-w-[180px] lg:max-w-[260px]"
                    title={socio.email}
                  >
                    <Mail className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{socio.email}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div>{getCategoriaBadge(socio.tipoSocio)}</div>
                  {socio.vinculoUnse && (
                    <span
                      className="text-[10px] font-semibold text-gray-400 block mt-0.5 truncate max-w-[130px]"
                      title={socio.vinculoUnse}
                    >
                      {socio.vinculoUnse}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="flex items-center gap-1 font-bold text-amber-600 text-xs">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    {socio.puntosAc ?? 0} pts
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {getEstadoBadge(socio.estado)}
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAjustePuntos(socio)}
                      className="h-7 px-2 text-[10px] font-semibold cursor-pointer"
                      title="Gestionar puntos"
                    >
                      <Award className="h-3 w-3 mr-1 text-amber-500" />
                      Puntos
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(socio)}
                      className="h-7 w-7 p-0 cursor-pointer"
                      title="Cambiar categoría"
                    >
                      <Edit2 className="h-3 w-3 text-gray-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDarDeBaja(socio)}
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      title="Dar de baja membresía"
                    >
                      <UserX className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
