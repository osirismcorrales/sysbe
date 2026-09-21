/**
 * FechaInput.tsx
 * Campo de fecha editable por segmentos (día / mes / año) con HeroUI DateField.
 * Mantiene el contrato de string ISO que espera el backend.
 */

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { DateField } from '@heroui/react';
import { parseDate, today, getLocalTimeZone } from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { cn } from '../../lib/utils';

export interface FechaInputProps {
  value: string;
  onChange: (value: string) => void;
  outputFormat?: 'iso-datetime' | 'iso-date' | 'display';
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  minValue?: DateValue;
  maxValue?: DateValue;
}

function toDateValue(val: string): DateValue | null {
  if (!val) return null;
  const iso = val.substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

function formatOutput(date: DateValue, outputFormat: FechaInputProps['outputFormat']): string {
  const iso = date.toString();
  if (outputFormat === 'iso-datetime') return `${iso}T00:00:00`;
  if (outputFormat === 'display') {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  return iso;
}

export function formatToDisplay(val: string): string {
  if (!val) return '';
  const d = val.substring(0, 10);
  if (d.length === 10 && d[4] === '-' && d[7] === '-') {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return val;
}

export const FechaInput = React.forwardRef<HTMLDivElement, FechaInputProps>(
  (
    {
      value,
      onChange,
      outputFormat = 'iso-date',
      error = false,
      required = false,
      disabled = false,
      className,
      'aria-label': ariaLabel = 'Fecha',
      minValue: propMinValue,
      maxValue: propMaxValue,
    },
    _ref
  ) => {
    const dateValue = useMemo(() => toDateValue(value), [value]);
    const defaultMaxValue = useMemo(() => today(getLocalTimeZone()), []);
    const defaultMinValue = useMemo(() => {
      const minYear = new Date().getFullYear() - 120;
      return parseDate(`${minYear}-01-01`);
    }, []);

    const effectiveMaxValue = propMaxValue ?? defaultMaxValue;
    const effectiveMinValue = propMinValue ?? defaultMinValue;

    return (
      <DateField
        aria-label={ariaLabel}
        className={cn('w-full', className)}
        granularity="day"
        isDisabled={disabled}
        isInvalid={error}
        isRequired={required}
        minValue={effectiveMinValue}
        maxValue={effectiveMaxValue}
        shouldForceLeadingZeros
        value={dateValue}
        onChange={(next) => {
          onChange(next ? formatOutput(next, outputFormat) : '');
        }}
      >
        <DateField.Group variant="secondary" className="h-9 min-h-9 w-full text-xs">
          <DateField.Prefix>
            <Calendar className="size-3.5 text-gray-400" />
          </DateField.Prefix>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
      </DateField>
    );
  }
);

FechaInput.displayName = 'FechaInput';
export default FechaInput;
