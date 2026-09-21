import React from 'react';
import { ClipboardList } from 'lucide-react';
import { EnProgreso } from '../../../components/ui/EnProgreso';

export function EncuestasPage() {
  return (
    <EnProgreso
      modulo="Encuestas de Satisfacción"
      descripcion="El módulo de encuestas y medición de satisfacción sobre los servicios del polideportivo se encuentra en desarrollo."
      icono={ClipboardList}
    />
  );
}

export default EncuestasPage;
