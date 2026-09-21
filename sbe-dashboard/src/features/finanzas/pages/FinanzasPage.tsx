import React from 'react';
import { Wallet } from 'lucide-react';
import { EnProgreso } from '../../../components/ui/EnProgreso';

export function FinanzasPage() {
  return (
    <EnProgreso
      modulo="Finanzas y Reportes"
      descripcion="El módulo de facturación, registro contable de pagos y emisión de reportes financieros se encuentra en desarrollo y se vinculará con la pasarela de pagos próximamente."
      icono={Wallet}
    />
  );
}

export default FinanzasPage;
