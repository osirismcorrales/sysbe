/**
 * ConfirmarRechazoDialog.tsx
 * Confirmación previa al rechazo de un pago pendiente.
 */

import React from 'react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { PagoResponseDto } from '../types/pagos.types';
import { formatMonto } from '../utils/pagoFormat';

interface ConfirmarRechazoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: PagoResponseDto | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmarRechazoDialog({
  open,
  onOpenChange,
  pago,
  loading = false,
  onConfirm,
}: ConfirmarRechazoDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rechazar Pago"
      description={
        pago ? (
          <>
            ¿Está seguro de que desea rechazar el pago{' '}
            <span className="font-bold text-gray-900">#{pago.idPago}</span> de{' '}
            <span className="font-bold text-gray-900">{pago.nombreUsuario}</span> por{' '}
            <span className="font-bold text-gray-900">{formatMonto(pago.montoPago)}</span>?
            <br />
            <span className="text-xs text-red-600 mt-1.5 block font-medium">
              El pago quedará marcado como RECHAZADO y no podrá aprobarse posteriormente.
            </span>
          </>
        ) : (
          '¿Está seguro de que desea rechazar este pago?'
        )
      }
      confirmText="Sí, rechazar pago"
      cancelText="Cancelar"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}

export default ConfirmarRechazoDialog;
