import React from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewSocioClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMenuClick?: () => void;
}

export function Header({
  title,
  subtitle = "Polideportivo UNSE - Mayo 2026",
  onNewSocioClick,
  searchQuery,
  onSearchChange,
  onMenuClick
}: HeaderProps) {
  const showActions = onSearchChange != null || onNewSocioClick != null;

  return (
    <header className="bg-white border-b border-gray-200 min-h-16 py-3 px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 select-none">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight m-0 p-0 leading-none">
            {title}
          </h1>
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Actions — only shown on relevant pages */}
      {showActions && (
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Search Bar */}
          {onSearchChange != null && (
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400 text-gray-700"
              />
            </div>
          )}

          {/* New Partner Button */}
          {onNewSocioClick && (
            <Button
              onClick={onNewSocioClick}
              variant="brand"
              size="sm"
              className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all h-9 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo socio</span>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
export default Header;
