/**
 * useSocios.ts
 * Hook de la feature de socios.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSocios,
  getCategorias,
  asignarCategoria,
  darDeBajaMembresia,
  sumarPuntos,
  canjearPuntos,
  type SocioResponseDto,
  type CategoriaResponseDto,
} from '../services/sociosApi';

export type { SocioResponseDto, CategoriaResponseDto } from '../services/sociosApi';

export interface UseSociosResult {
  socios: SocioResponseDto[];
  categorias: CategoriaResponseDto[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  cambiarCategoria: (dni: string, categoriaId: number) => Promise<SocioResponseDto>;
  darDeBaja: (dni: string) => Promise<SocioResponseDto>;
  agregarPuntos: (dni: string, puntos: number) => Promise<SocioResponseDto>;
  redimirPuntos: (dni: string, puntos: number) => Promise<SocioResponseDto>;
}

export function useSocios(): UseSociosResult {
  const [socios, setSocios] = useState<SocioResponseDto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getSocios(), getCategorias()])
      .then(([sociosData, categoriasData]) => {
        if (!cancelled) {
          setSocios(sociosData);
          setCategorias(categoriasData);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const cambiarCategoria = useCallback(async (dni: string, categoriaId: number) => {
    const updated = await asignarCategoria(dni, { categoriaId });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  const darDeBaja = useCallback(async (dni: string) => {
    const updated = await darDeBajaMembresia(dni);
    // El socio ahora es NO_SOCIO, puede desaparecer de la lista o actualizarse
    setSocios((prev) => prev.filter((s) => s.dni !== dni));
    return updated;
  }, []);

  const agregarPuntos = useCallback(async (dni: string, puntos: number) => {
    const updated = await sumarPuntos(dni, { puntos });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  const redimirPuntos = useCallback(async (dni: string, puntos: number) => {
    const updated = await canjearPuntos(dni, { puntos });
    setSocios((prev) => prev.map((s) => (s.dni === dni ? updated : s)));
    return updated;
  }, []);

  return { socios, categorias, loading, error, refresh, cambiarCategoria, darDeBaja, agregarPuntos, redimirPuntos };
}
