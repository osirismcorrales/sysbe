/**
 * DatePickerCalendar.tsx
 * Componente reutilizable de calendario basado en react-day-picker v10.
 *
 * - Locale español (date-fns/locale/es)
 * - Días disponibles en color primario, no disponibles en rojo
 * - Soporte para fecha mínima y matchers de deshabilitación personalizados
 * - Diseño premium con glassmorphism y micro-animaciones
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale/es';
import { CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';

import 'react-day-picker/style.css';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface DatePickerCalendarProps {
  /** Fecha seleccionada en formato "YYYY-MM-DD" */
  value: string;
  /** Callback con la fecha seleccionada en formato "YYYY-MM-DD" */
  onChange: (dateStr: string) => void;
  /** Fecha mínima permitida en formato "YYYY-MM-DD" */
  minDate?: string;
  /** Fecha máxima permitida en formato "YYYY-MM-DD" */
  maxDate?: string;
  /** Días de la semana deshabilitados (0=Dom, 1=Lun, ..., 6=Sáb) */
  disabledDaysOfWeek?: number[];
  /** Placeholder cuando no hay fecha */
  placeholder?: string;
  /** Deshabilitar el input */
  disabled?: boolean;
  /** Indica que la instalación no tiene ningún día abierto configurado */
  noOpenDays?: boolean;
  /** Mensaje personalizado cuando no hay días abiertos */
  noOpenDaysMessage?: string;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Texto informativo debajo del input */
  helperText?: React.ReactNode;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDate(str: string): Date | undefined {
  if (!str) return undefined;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(str: string): string {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function DatePickerCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDaysOfWeek = [],
  placeholder = 'Seleccionar fecha…',
  disabled = false,
  noOpenDays = false,
  noOpenDaysMessage = 'Esta instalación no tiene días de apertura configurados.',
  className,
  helperText,
}: DatePickerCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const selectedDate = parseDate(value);
  const min = parseDate(minDate || '');
  const max = parseDate(maxDate || '');
  const maxForMatcher = max
    ? new Date(max.getFullYear(), max.getMonth(), max.getDate(), 23, 59, 59, 999)
    : undefined;

  // Construir matchers para disabled
  const disabledMatchers: Array<
    | { before: Date }
    | { after: Date }
    | { dayOfWeek: number[] }
  > = [];
  if (min) disabledMatchers.push({ before: min });
  if (maxForMatcher) disabledMatchers.push({ after: maxForMatcher });
  if (disabledDaysOfWeek.length > 0) {
    disabledMatchers.push({ dayOfWeek: disabledDaysOfWeek });
  }

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange(formatDateToISO(date));
        setIsOpen(false);
      }
    },
    [onChange]
  );

  // Mes por defecto al abrir: la fecha seleccionada, o el mes actual (hoy)
  const today = new Date();
  const defaultMonth = selectedDate || today;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'h-9 px-3 w-full border rounded-lg text-xs transition-all duration-200 flex items-center gap-2 text-left',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white border-gray-300 cursor-pointer hover:border-primary/50 hover:shadow-sm',
          isOpen && 'ring-2 ring-primary/20 border-primary shadow-sm',
          value ? 'text-gray-900 font-medium' : 'text-gray-400'
        )}
      >
        <CalendarDays
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-colors',
            isOpen ? 'text-primary' : 'text-gray-400'
          )}
        />
        <span className="flex-1 truncate">
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <svg
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Helper text */}
      {helperText && (
        <div className="mt-1">
          {helperText}
        </div>
      )}

      {/* Inline calendar (renders in flow, not absolute) */}
      {isOpen && noOpenDays && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {noOpenDaysMessage}
        </div>
      )}
      {isOpen && !noOpenDays && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 ring-1 ring-black/5">
            <DayPicker
              mode="single"
              locale={es}
              today={today}
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={defaultMonth}
              startMonth={min}
              endMonth={max}
              disabled={disabledMatchers}
              weekStartsOn={1}
              showOutsideDays
              classNames={{
                root: 'rdp-sbe',
                months: 'rdp-sbe-months',
                month_caption: 'rdp-sbe-caption',
                nav: 'rdp-sbe-nav',
                day: 'rdp-sbe-day',
                today: 'rdp-sbe-today',
                selected: 'rdp-sbe-selected',
                disabled: 'rdp-sbe-disabled',
                outside: 'rdp-sbe-outside',
                weekday: 'rdp-sbe-weekday',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePickerCalendar;
