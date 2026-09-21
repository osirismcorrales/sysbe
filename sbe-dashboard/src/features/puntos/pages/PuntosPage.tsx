import React from 'react';
import { Gift } from 'lucide-react';
import { EnProgreso } from '../../../components/ui/EnProgreso';

export function PuntosPage() {
  return (
    <EnProgreso
      modulo="Sistema de Puntos y Promociones"
      descripcion="El catálogo de promociones y canjes automáticos por puntos se encuentra en desarrollo."
      icono={Gift}
    />
  );
}

export default PuntosPage;
