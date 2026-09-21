import React from 'react';
import { UserCheck } from 'lucide-react';
import { EnProgreso } from '../../../components/ui/EnProgreso';

export function EmpleadosPage() {
  return (
    <EnProgreso
      modulo="Gestión de Empleados"
      descripcion="El módulo de administración y control de legajos de empleados del polideportivo se encuentra en desarrollo."
      icono={UserCheck}
    />
  );
}

export default EmpleadosPage;
