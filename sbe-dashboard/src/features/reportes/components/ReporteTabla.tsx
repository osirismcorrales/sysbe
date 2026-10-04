import React from 'react';
import type { TipoReporte } from '../types/reportes.types';
import Badge from '../../../components/ui/Badge';

interface ReporteTableProps {
  tipoReporte: TipoReporte;
  reservas: any[];
  socios: any[];
}

export function ReporteTable({ tipoReporte, reservas, socios }: ReporteTableProps) {
  if (tipoReporte === 'socios-activos') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
              <th className="py-3 px-4">DNI</th>
              <th className="py-3 px-4">NOMBRE COMPLETO</th>
              <th className="py-3 px-4">TIPO DE SOCIO</th>
              <th className="py-3 px-4">EMAIL</th>
              <th className="py-3 px-4 text-right">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {socios.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No se encontraron socios activos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              socios.map((s, idx) => (
                <tr key={`${s.dniUsuario}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-600">{s.dniUsuario || '-'}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{s.nombreUsuario || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {s.tipoUsuario || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{s.email || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success" className="text-[10px] font-bold">
                      {s.estado || 'ACTIVO'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Tabla de Reservas
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
            <th className="py-3 px-4">DNI</th>
            <th className="py-3 px-4">USUARIO</th>
            <th className="py-3 px-4">TIPO</th>
            <th className="py-3 px-4">INSTALACIÓN</th>
            <th className="py-3 px-4">FECHA RESERVA</th>
            <th className="py-3 px-4 text-right">ESTADO</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {reservas.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400">
                No se encontraron reservas que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            reservas.map((r, idx) => (
              <tr key={`${r.dniUsuario}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-600">{r.dniUsuario || '-'}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{r.nombreUsuario || '-'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                    {r.tipoUsuario || '-'}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-brand-red">
                  {r.tipoInstalacion || '-'}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {r.fechaReserva ? new Date(r.fechaReserva).toLocaleDateString('es-AR') : '-'}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge
                    variant={r.estado === 'CONFIRMADA' || r.estado === 'RESERVADA' ? 'success' : 'warning'}
                    className="text-[10px] font-bold"
                  >
                    {r.estado || 'RESERVADA'}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}