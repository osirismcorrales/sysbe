/**
 * UsuarioSearchSelect.tsx
 * Selector de usuario con búsqueda predictiva por DNI o nombre.
 *
 * No carga todos los usuarios de golpe: consulta GET /api/usuarios?busqueda=...
 * (el backend busca por DNI, nombre y email) y muestra solo las coincidencias.
 *
 * Se reutiliza en los filtros de pagos y en el formulario de reservas.
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  getUsuarios,
  getUsuarioById,
  type UsuarioResponseDto,
} from '../services/usuariosApi';

// ─── Props ──────────────────────────────────────────────────────────────────

interface UsuarioSearchSelectProps {
  /** id del usuario seleccionado; 0 o 'all' = sin selección */
  value: number | 'all';
  onChange: (value: number | 'all') => void;
  /** Muestra la opción "Todos los usuarios" para limpiar el filtro */
  allowAll?: boolean;
  /** Aplica el borde rojo de error (formularios) */
  error?: boolean;
  disabled?: boolean;
  className?: string;
  /** Clases extra para el input (ej. altura h-9 en formularios) */
  inputClassName?: string;
  placeholder?: string;
  title?: string;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 250;
const MAX_RESULTS = 8;

// ─── Componente ─────────────────────────────────────────────────────────────

export function UsuarioSearchSelect({
  value,
  onChange,
  allowAll = true,
  error = false,
  disabled = false,
  className,
  inputClassName,
  placeholder = 'Buscar por DNI o nombre…',
  title = 'Buscar usuario por DNI o nombre',
}: UsuarioSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UsuarioResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<UsuarioResponseDto | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const hasSelection = value !== 'all' && Number(value) > 0;

  // Resolver la etiqueta del usuario seleccionado si el valor llega desde afuera
  useEffect(() => {
    if (!hasSelection) {
      setSelected(null);
      return;
    }
    if (selected?.id === value) return;

    let cancelled = false;
    getUsuarioById(Number(value))
      .then((usuario) => {
        if (!cancelled) setSelected(usuario);
      })
      .catch(() => {
        if (!cancelled) setSelected(null);
      });

    return () => {
      cancelled = true;
    };
  }, [value, hasSelection, selected?.id]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda predictiva con debounce contra el backend
  useEffect(() => {
    if (!open) return;

    const term = query.trim();
    if (term.length === 0) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    const timer = window.setTimeout(() => {
      getUsuarios({ busqueda: term, size: MAX_RESULTS })
        .then((data) => {
          if (requestIdRef.current !== requestId) return;
          setResults(data);
          setActiveIndex(data.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) return;
          setResults([]);
          setActiveIndex(-1);
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, open]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const openDropdown = () => {
    if (disabled) return;

    // Abrir hacia arriba si no hay espacio suficiente debajo (modales)
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const espacioAbajo = window.innerHeight - rect.bottom;
      setDropUp(espacioAbajo < 260 && rect.top > espacioAbajo);
    }

    setOpen(true);
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const selectUsuario = (usuario: UsuarioResponseDto) => {
    setSelected(usuario);
    onChange(usuario.id);
    setOpen(false);
    setQuery('');
    setResults([]);
    inputRef.current?.blur();
  };

  const selectTodos = () => {
    setSelected(null);
    onChange('all');
    setOpen(false);
    setQuery('');
    setResults([]);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    setSelected(null);
    onChange(allowAll ? 'all' : 0);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        selectUsuario(results[activeIndex]);
      }
    }
  };

  // ─── Texto visible ────────────────────────────────────────────────────────

  const selectedLabel =
    selected != null
      ? `${selected.dni} — ${selected.nombreCompleto}`
      : allowAll
        ? 'Todos los usuarios'
        : '';

  const inputValue = open ? query : selected != null ? selectedLabel : '';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={inputValue}
          placeholder={selected ? selectedLabel : placeholder}
          title={title}
          onFocus={openDropdown}
          onClick={openDropdown}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-8 w-full pl-7 text-xs border bg-white rounded-lg',
            'focus:outline-none focus:ring-2',
            'font-medium cursor-pointer placeholder:text-gray-400',
            selected != null || open ? 'pr-7' : 'pr-2',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary focus:ring-primary/20',
            disabled && 'bg-gray-100 text-gray-400 cursor-not-allowed',
            inputClassName
          )}
        />

        {loading ? (
          <Loader2 className="absolute right-2 h-3.5 w-3.5 text-primary/60 animate-spin" />
        ) : hasSelection && !open ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Quitar selección"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              'absolute right-2 h-3.5 w-3.5 text-gray-400 pointer-events-none transition-transform',
              open && 'rotate-180'
            )}
          />
        )}
      </div>

      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {/* Opción para limpiar el filtro (solo si aplica) */}
          {allowAll && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={selectTodos}
              className={cn(
                'w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                'hover:bg-gray-50 border-b border-gray-100',
                !hasSelection ? 'text-primary bg-primary/5' : 'text-gray-700'
              )}
            >
              Todos los usuarios
            </button>
          )}

          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
            {query.trim().length === 0 ? (
              <p className="px-3 py-2.5 text-[11px] text-gray-400 font-medium">
                Escribí un DNI o nombre para buscar…
              </p>
            ) : loading ? (
              <p className="px-3 py-2.5 text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Buscando…
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2.5 text-[11px] text-gray-400 font-medium">
                Sin coincidencias para “{query.trim()}”.
              </p>
            ) : (
              results.map((usuario, index) => (
                <button
                  key={usuario.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectUsuario(usuario)}
                  className={cn(
                    'w-full text-left px-3 py-2 transition-colors flex items-center justify-between gap-2 cursor-pointer',
                    index === activeIndex ? 'bg-primary/5' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-gray-900 text-xs">
                      {usuario.dni}
                    </span>
                    <span className="text-gray-600 ml-2 text-xs truncate">
                      {usuario.nombreCompleto}
                    </span>
                  </div>
                  {usuario.estado && usuario.estado !== 'ACTIVO' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0 uppercase">
                      {usuario.estado}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuarioSearchSelect;
