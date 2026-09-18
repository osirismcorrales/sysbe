import React, { useState } from 'react';
import { useData, type Socio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Shield, ShieldAlert, ShieldCheck, Edit, Trash2 } from 'lucide-react';

interface Usuario {
  dni: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Empleado' | 'Usuario';
  estado: 'Activo' | 'De baja';
}

const initialUsuarios: Usuario[] = [
  { dni: '20123456', nombre: 'Manuel Álvarez', email: 'm.alvarez@unse.edu.ar', rol: 'Administrador', estado: 'Activo' },
  { dni: '30456789', nombre: 'Lucía Fernández', email: 'lfernandez@unse.edu.ar', rol: 'Empleado', estado: 'Activo' },
  { dni: '38123456', nombre: 'Juan Pérez', email: 'juan.perez@gmail.com', rol: 'Usuario', estado: 'Activo' },
  { dni: '40987654', nombre: 'Martina González', email: 'm.gonzalez@hotmail.com', rol: 'Usuario', estado: 'Activo' },
  { dni: '35123987', nombre: 'Luis Ramos', email: 'lramos@gmail.com', rol: 'Usuario', estado: 'Activo' }
];

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);

  const handleRoleChange = (dni: string, newRol: Usuario['rol']) => {
    setUsuarios(prev =>
      prev.map(u => (u.dni === dni ? { ...u, rol: newRol } : u))
    );
  };

  const handleToggleStatus = (dni: string) => {
    setUsuarios(prev =>
      prev.map(u => (u.dni === dni ? { ...u, estado: u.estado === 'Activo' ? 'De baja' : 'Activo' } : u))
    );
  };

  const getRoleBadge = (rol: Usuario['rol']) => {
    switch (rol) {
      case 'Administrador':
        return <Badge variant="destructive" className="text-[9px] font-bold px-2 py-0.5">Admin</Badge>;
      case 'Empleado':
        return <Badge variant="info" className="text-[9px] font-bold px-2 py-0.5">Empleado</Badge>;
      case 'Usuario':
      default:
        return <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5">Socio</Badge>;
    }
  };

  return (
    <Card className="shadow-sm overflow-hidden text-xs select-none">
      <CardHeader className="pb-3 border-b border-gray-100 bg-white">
        <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-brand-red" />
          Control de Cuentas y Roles de Usuario
        </CardTitle>
        <CardDescription className="text-[10px]">Administre las credenciales, accesos y permisos del sistema (Administrador, Empleado, Usuario).</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                <th className="py-2.5 px-6">DNI</th>
                <th className="py-2.5 px-6">NOMBRE COMPLETO</th>
                <th className="py-2.5 px-6">CORREO ELECTRÓNICO</th>
                <th className="py-2.5 px-6">ROL ASIGNADO</th>
                <th className="py-2.5 px-6">ESTADO</th>
                <th className="py-2.5 px-6 text-right">ACCIONES / PERMISOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {usuarios.map((usuario) => (
                <tr key={usuario.dni} className="hover:bg-gray-50/20">
                  <td className="py-3.5 px-6 font-bold text-gray-900">{usuario.dni}</td>
                  <td className="py-3.5 px-6 font-bold text-gray-950">{usuario.nombre}</td>
                  <td className="py-3.5 px-6 text-gray-500 font-normal">{usuario.email}</td>
                  <td className="py-3.5 px-6">{getRoleBadge(usuario.rol)}</td>
                  <td className="py-3.5 px-6">
                    <Badge
                      variant={usuario.estado === 'Activo' ? 'success' : 'destructive'}
                      className="text-[9px] font-bold px-2 py-0.5"
                    >
                      {usuario.estado}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select
                        value={usuario.rol}
                        onChange={(e) => handleRoleChange(usuario.dni, e.target.value as Usuario['rol'])}
                        className="h-7 px-1.5 border border-gray-200 bg-white rounded-md text-[10px] font-bold cursor-pointer focus:outline-none"
                      >
                        <option value="Usuario">Usuario / Socio</option>
                        <option value="Empleado">Empleado</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(usuario.dni)}
                        className="h-7 px-2.5 text-[10px] font-semibold text-gray-600 cursor-pointer"
                      >
                        {usuario.estado === 'Activo' ? 'Suspender' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
export default UsuariosPage;
