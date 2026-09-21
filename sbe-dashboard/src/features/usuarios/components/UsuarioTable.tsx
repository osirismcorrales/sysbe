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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
            <th className="py-2.5 px-6">DNI</th>
            <th className="py-2.5 px-6">NOMBRE COMPLETO</th>
            <th className="py-2.5 px-6">CORREO ELECTRÓNICO</th>
            <th className="py-2.5 px-6">ROL</th>
            <th className="py-2.5 px-6">CATEGORÍA</th>
            <th className="py-2.5 px-6">ESTADO</th>
            <th className="py-2.5 px-6 text-right">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50/20">
              <td className="py-3.5 px-6 font-bold text-gray-900">{usuario.dni}</td>
              <td className="py-3.5 px-6 font-bold text-gray-950">{usuario.nombreCompleto}</td>
              <td className="py-3.5 px-6 text-gray-500 font-normal">{usuario.email}</td>
              <td className="py-3.5 px-6">{getRolBadge(usuario.rol)}</td>
              <td className="py-3.5 px-6">
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {usuario.categoria?.tipoSocio ?? '—'}
                </span>
              </td>
              <td className="py-3.5 px-6">{getEstadoBadge(usuario.estado)}</td>
              <td className="py-3.5 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(usuario)}
                    className="h-7 px-2.5 text-[10px] font-semibold cursor-pointer"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleStatus(usuario)}
                    className="h-7 px-2.5 text-[10px] font-semibold text-gray-600 cursor-pointer"
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
  );
}
