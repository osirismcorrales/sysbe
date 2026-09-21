/**
 * FechaInput.tsx
 * Componente reutilizable para campos de fecha (ej. Fecha de Nacimiento).
 * Permite escribir la fecha con formateo automático (DD/MM/AAAA) sin forzar
 * el uso del selector de calendario del navegador.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface FechaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  outputFormat?: 'iso-datetime' | 'iso-date' | 'display';
  error?: boolean;
}

/**
 * Convierte un string en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 * a formato legible DD/MM/AAAA. Si ya está formateado o parcial, lo mantiene.
 */
export function formatToDisplay(val: string): string {
  if (!val) return '';
  const d = val.substring(0, 10);
  if (d.length === 10 && d[4] === '-' && d[7] === '-') {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return val;
}

export const FechaInput = React.forwardRef<HTMLInputElement, FechaInputProps>(
  (
    {
      value,
      onChange,
      outputFormat = 'iso-date',
      error = false,
      placeholder = 'DD/MM/AAAA',
      className,
      ...props
    },
    ref
  ) => {
    const displayVal = formatToDisplay(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const prev = e.target.value;
      // Extraer solo dígitos numéricos (máximo 8 dígitos: DDMMAAAA)
      const digits = prev.replace(/\D/g, '').substring(0, 8);

      // Auto-formatear: DD → DD/ → DD/MM → DD/MM/ → DD/MM/AAAA
      let formatted = '';
      for (let i = 0; i < digits.length; i++) {
        if (i === 2 || i === 4) formatted += '/';
        formatted += digits[i];
      }

      // Si se completaron los 8 dígitos, emitir según el outputFormat deseado
      if (digits.length === 8) {
        const dd = digits.substring(0, 2);
        const mm = digits.substring(2, 4);
        const yyyy = digits.substring(4, 8);

        if (outputFormat === 'iso-datetime') {
          onChange(`${yyyy}-${mm}-${dd}T00:00:00`);
        } else if (outputFormat === 'iso-date') {
          onChange(`${yyyy}-${mm}-${dd}`);
        } else {
          onChange(formatted);
        }
      } else {
        // Valor parcial mientras el usuario está escribiendo
        onChange(formatted);
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={displayVal}
        onChange={handleChange}
        maxLength={10}
        className={cn(
          'h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs transition-colors',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
    );
  }
);

FechaInput.displayName = 'FechaInput';
export default FechaInput;
