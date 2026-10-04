import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PaginationProps {
  /** Página actual basada en 0 (para compatibilidad directa con Spring Boot) */
  page: number;
  /** Cantidad total de páginas */
  totalPages: number;
  /** Cantidad total de elementos */
  totalElements: number;
  /** Cantidad de elementos por página */
  pageSize: number;
  /** Opciones disponibles para elementos por página */
  pageSizeOptions?: number[];
  /** Callback al cambiar de página (devuelve índice basado en 0) */
  onPageChange: (newPage: number) => void;
  /** Callback opcional al cambiar el tamaño de página */
  onPageSizeChange?: (newSize: number) => void;
  /** Deshabilitar botones (p.ej. durante carga) */
  disabled?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  disabled = false,
  className,
}) => {
  // Rango actual de elementos visibles (1-indexed para humanos)
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  const canPrev = page > 0 && !disabled;
  const canNext = page < totalPages - 1 && !disabled;

  // Generador de páginas con elipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | 'ellipsis')[] = [];
    const current = page;

    if (current <= 3) {
      // Al principio
      for (let i = 0; i < 5; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages - 1);
    } else if (current >= totalPages - 4) {
      // Al final
      pages.push(0);
      pages.push('ellipsis');
      for (let i = totalPages - 5; i < totalPages; i++) pages.push(i);
    } else {
      // En el medio
      pages.push(0);
      pages.push('ellipsis');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('ellipsis');
      pages.push(totalPages - 1);
    }

    return pages;
  };

  if (totalElements === 0 && totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-2.5 bg-white border-t border-gray-200 text-xs text-gray-600 select-none',
        className
      )}
    >
      {/* Información del conteo y selector de tamaño */}
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
        <span className="text-gray-500 font-medium">
          Mostrando <strong className="text-gray-900 font-semibold">{startItem}</strong> -{' '}
          <strong className="text-gray-900 font-semibold">{endItem}</strong> de{' '}
          <strong className="text-gray-900 font-semibold">{totalElements}</strong> registros
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Mostrar</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Registros por página"
              className="h-7 px-2 border border-gray-200 bg-gray-50/50 rounded-md text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>por pág.</span>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-1">
        {/* Primera página */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={!canPrev}
          title="Primera página"
          aria-label="Primera página"
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors',
            canPrev
              ? 'hover:bg-gray-100 hover:text-gray-900 cursor-pointer active:scale-95'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>

        {/* Página anterior */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          title="Página anterior"
          aria-label="Página anterior"
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors',
            canPrev
              ? 'hover:bg-gray-100 hover:text-gray-900 cursor-pointer active:scale-95'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-6 text-center text-gray-400 select-none text-[11px]"
                >
                  •••
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={disabled || isCurrent}
                aria-label={`Página ${p + 1}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'h-7 min-w-[28px] px-1.5 flex items-center justify-center rounded-md text-xs font-semibold transition-all',
                  isCurrent
                    ? 'bg-brand-red text-white shadow-xs pointer-events-none'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer active:scale-95'
                )}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Página siguiente */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          title="Página siguiente"
          aria-label="Página siguiente"
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors',
            canNext
              ? 'hover:bg-gray-100 hover:text-gray-900 cursor-pointer active:scale-95'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Última página */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNext}
          title="Última página"
          aria-label="Última página"
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors',
            canNext
              ? 'hover:bg-gray-100 hover:text-gray-900 cursor-pointer active:scale-95'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
