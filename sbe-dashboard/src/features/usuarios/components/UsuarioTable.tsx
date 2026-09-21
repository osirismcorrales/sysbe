/**
 * UsuarioTable.tsx
 * Componente presentacional — tabla de usuarios.
 * No contiene lógica de negocio, solo renderiza datos y delega eventos.
 */

import React from 'react';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { UsuarioResponseDto } from '../services/usuariosApi';

// ─── Props ──────────────────────────────────────────────────────────────────

interface UsuarioTableProps {
  usuarios: UsuarioResponseDto[];
  onToggleStatus: (usuario: UsuarioResponseDto) => void;
  onEdit: (usuario: UsuarioResponseDto) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRolBadge(rol: UsuarioResponseDto['rol']) {
  const nombre = rol?.nombreRol ?? 'Sin rol';
  switch (nombre.toUpperCase()) {
    case 'ADMINISTRADOR':
    case 'ADMIN':
      return <Badge variant="destructive" className="text-[9px] font-bold px-2 py-0.5">Admin</Badge>;
    case 'EMPLEADO':
      return <Badge variant="info" className="text-[9px] font-bold px-2 py-0.5">Empleado</Badge>;
    default:
      return <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5">{nombre}</Badge>;
  }
}

function getEstadoBadge(estado: string) {
  const isActive = estado?.toUpperCase() !== 'DE_BAJA';
  return (
    <Badge
      variant={isActive ? 'success' : 'destructive'}
      className="text-[9px] font-bold px-2 py-0.5"
    >
      {isActive ? 'Activo' : 'De baja'}
    </Badge>
  );
}

function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return fecha;
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function UsuarioTable({ usuarios, onToggleStatus, onEdit }: UsuarioTableProps) {
  if (usuarios.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 font-medium text-xs">
        No hay usuarios registrados.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─── Vista Móvil / Tablet: Tarjetas fluidas (block md:hidden) ─────────── */}
      <div className="block md:hidden p-2 sm:p-3 space-y-2.5">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs space-y-2.5 transition-all"
          >
            {/* Cabecera de la tarjeta: Nombre + Estado */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-gray-950 text-xs truncate">
                  {usuario.nombreCompleto}
                </div>
                <div className="text-[11px] text-gray-500 font-normal truncate">
                  {usuario.email}
                </div>
              </div>
              <div className="shrink-0">
                {getEstadoBadge(usuario.estado)}
              </div>
            </div>

            {/* Datos secundarios */}
            <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 border-t border-gray-100">
              <div>
                <span className="text-[9px] text-gray-400 font-medium block">DNI</span>
                <span className="font-bold text-gray-800 text-[11px]">{usuario.dni}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-medium block">Rol</span>
                <div className="mt-0.5">{getRolBadge(usuario.rol)}</div>
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-medium">Categoría:</span>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                  {usuario.categoria?.tipoSocio ?? 'Sin categoría'}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(usuario)}
                className="w-full h-7 text-[10px] font-semibold cursor-pointer justify-center"
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleStatus(usuario)}
                className="w-full h-7 text-[10px] font-semibold text-gray-600 cursor-pointer justify-center"
              >
                {usuario.estado?.toUpperCase() !== 'DE_BAJA' ? 'Dar de baja' : 'Activar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Vista Desktop: Tabla Adaptable y Limpia (hidden md:block) ────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">DNI</th>
              <th className="py-2.5 px-3">Nombre</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-28">Rol</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-28">Categoría</th>
              <th className="py-2.5 px-3 whitespace-nowrap w-24">Estado</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap w-36">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-xs">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">{usuario.dni}</td>
                <td className="py-2.5 px-3 min-w-0">
                  <div
                    className="font-bold text-gray-950 text-xs truncate max-w-[180px] lg:max-w-[240px] xl:max-w-[320px]"
                    title={usuario.nombreCompleto}
                  >
                    {usuario.nombreCompleto}
                  </div>
                  <div
                    className="text-gray-400 font-normal text-[11px] truncate max-w-[180px] lg:max-w-[240px] xl:max-w-[320px]"
                    title={usuario.email}
                  >
                    {usuario.email}
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{getRolBadge(usuario.rol)}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {usuario.categoria?.tipoSocio ?? '—'}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">{getEstadoBadge(usuario.estado)}</td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(usuario)}
                      className="h-6.5 px-2 text-[10px] font-semibold cursor-pointer"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleStatus(usuario)}
                      className="h-6.5 px-2 text-[10px] font-semibold text-gray-600 cursor-pointer"
                    >
                      {usuario.estado?.toUpperCase() !== 'DE_BAJA' ? 'Dar de baja' : 'Activar'}
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
