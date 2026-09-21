import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Emisor global fuera de React para apiClient o interceptores
type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success(message: string, title?: string) {
    emitToast({ id: Math.random().toString(36).slice(2), type: 'success', message, title });
  },
  error(message: string, title?: string) {
    emitToast({ id: Math.random().toString(36).slice(2), type: 'error', message, title });
  },
  warning(message: string, title?: string) {
    emitToast({ id: Math.random().toString(36).slice(2), type: 'warning', message, title });
  },
  info(message: string, title?: string) {
    emitToast({ id: Math.random().toString(36).slice(2), type: 'info', message, title });
  },
};

function emitToast(t: ToastItem) {
  listeners.forEach((l) => l(t));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  // Conectar con emisor global
  React.useEffect(() => {
    const listener: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      const dur = t.duration ?? 4000;
      if (dur > 0) {
        setTimeout(() => removeToast(t.id), dur);
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs transition-all animate-in fade-in slide-in-from-bottom-3 duration-200',
              t.type === 'success' && 'bg-emerald-50 text-emerald-900 border-emerald-200',
              t.type === 'error' && 'bg-red-50 text-red-900 border-red-200',
              t.type === 'warning' && 'bg-amber-50 text-amber-900 border-amber-200',
              t.type === 'info' && 'bg-blue-50 text-blue-900 border-blue-200'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              {t.title && <p className="font-bold text-xs mb-0.5">{t.title}</p>}
              <p className="font-medium leading-relaxed break-words">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
}
