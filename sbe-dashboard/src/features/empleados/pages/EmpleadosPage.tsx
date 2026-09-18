import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { UserCheck, Plus, Mail, Phone, Shield } from 'lucide-react';

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  sector: string;
  estado: 'Activo' | 'Licencia';
}

const initialEmpleados: Empleado[] = [
  { id: 'emp-1', nombre: 'Lucía Fernández', email: 'lfernandez@unse.edu.ar', telefono: '385-154123456', sector: 'Administración central', estado: 'Activo' },
  { id: 'emp-2', nombre: 'Fabián Ruiz', email: 'fruiz@unse.edu.ar', telefono: '385-154987654', sector: 'Coordinación deportiva', estado: 'Activo' },
  { id: 'emp-3', nombre: 'Luis Gómez', email: 'lgomez@unse.edu.ar', telefono: '385-155111222', sector: 'Mantenimiento e infraestructura', estado: 'Activo' }
];

export function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);

  return (
    <div className="space-y-6 select-none text-xs">
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">Gestión de personal administrativo y operativo del Polideportivo UNSE</span>
        <Button
          variant="brand"
          size="sm"
          className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-2.5 px-6">LEGAJO</th>
                  <th className="py-2.5 px-6">NOMBRE COMPLETO</th>
                  <th className="py-2.5 px-6">CONTACTO</th>
                  <th className="py-2.5 px-6">SECTOR / ÁREA</th>
                  <th className="py-2.5 px-6">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/20">
                    <td className="py-4 px-6 font-bold text-gray-400">{emp.id}</td>
                    <td className="py-4 px-6 font-bold text-gray-950">{emp.nombre}</td>
                    <td className="py-4 px-6 space-y-1 text-gray-500 font-normal">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {emp.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {emp.telefono}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-bold">{emp.sector}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={emp.estado === 'Activo' ? 'success' : 'warning'}
                        className="text-[9px] font-bold px-2 py-0.5"
                      >
                        {emp.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default EmpleadosPage;
