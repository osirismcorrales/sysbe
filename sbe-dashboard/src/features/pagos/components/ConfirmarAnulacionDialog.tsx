/**
 * ConfirmarAnulacionDialog.tsx
 * Confirmación previa a la anulación de un pago.
 */

import React from 'react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { PagoResponseDto } from '../types/pagos.types';
import { formatMonto } from '../utils/pagoFormat';

interface ConfirmarAnulacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoResponseDto | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmarAnulacionDialog({
  open,
  onOpenChange,
  pago,
  loading = false,
  onConfirm,
}: ConfirmarAnulacionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Anular Pago"
      description={
        pago ? (
          <>
            ¿Está seguro de que desea anular el pago{' '}
            <span className="font-bold text-gray-900">#{pago.idPago}</span> de{' '}
            <span className="font-bold text-gray-900">{pago.nombreUsuario}</span> por{' '}
            <span className="font-bold text-gray-900">{formatMonto(pago.montoPago)}</span>?
            <br />
            <span className="text-xs text-amber-700 mt-1.5 block font-medium">
              El pago quedará marcado como ANULADO y dejará de considerarse válido en el sistema.
            </span>
          </>
        ) : (
          '¿Está seguro de que desea anular este pago?'
        )
      }
      confirmText="Sí, anular pago"
      cancelText="Cancelar"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}

export default ConfirmarAnulacionDialog;
