/**
 * SociosPage.tsx
 * Componente contenedor (smart component) para la gestión de socios.
 * Conecta con el backend via useSocios y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useSocios, type SocioResponseDto } from '../hooks/useSocios';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Users, RefreshCw, AlertCircle, Loader2, Award } from 'lucide-react';

// Componentes presentacionales
import { SocioTable } from '../components/SocioTable';

// ─── Componente contenedor ──────────────────────────────────────────────────

export function SociosPage() {
  const {
    socios,
    categorias,
    loading,
    error,
    refresh,
    cambiarCategoria,
    darDeBaja,
    agregarPuntos,
    redimirPuntos,
  } = useSocios();

  // ─── Filtros locales ──────────────────────────────────────────────────────

  const [catFilter, setCatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSocios = socios.filter((socio) => {
    const matchesSearch =
      socio.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      socio.dni.includes(searchQuery);

    const matchesCat = catFilter === 'all' || socio.idCategoria === Number(catFilter);

    return matchesSearch && matchesCat;
  });

  // Lista única de tipos de socios disponibles desde el backend
  const availableTipos = Array.from(new Set(categorias.map((c) => c.tipoSocio))).filter(Boolean);

  // ─── Modal: Cambiar categoría y vínculo ────────────────────────────────────

  const [editingSocio, setEditingSocio] = useState<SocioResponseDto | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedVinculo, setSelectedVinculo] = useState<string>('');

  const handleEditClick = (socio: SocioResponseDto) => {
    setEditingSocio(socio);
    const catActual = categorias.find((c) => c.idCategoria === socio.idCategoria);
    const tipo = catActual ? catActual.tipoSocio : (socio.tipoSocio || (categorias[0]?.tipoSocio ?? ''));
    setSelectedTipo(tipo);

    const vinculosForTipo = categorias.filter((c) => c.tipoSocio === tipo);
    const matchedVinculo = catActual
      ? (catActual.vinculoUnse ?? '')
      : (socio.vinculoUnse || (vinculosForTipo[0]?.vinculoUnse ?? ''));
    setSelectedVinculo(matchedVinculo);
  };

  const handleTipoChange = (newTipo: string) => {
    setSelectedTipo(newTipo);
    const vinculosForTipo = categorias.filter((c) => c.tipoSocio === newTipo);
    if (vinculosForTipo.length > 0) {
      setSelectedVinculo(vinculosForTipo[0].vinculoUnse ?? '');
    } else {
      setSelectedVinculo('');
    }
  };

  // Vínculos disponibles para el tipo seleccionado
  const availableVinculosForTipo = categorias.filter((c) => c.tipoSocio === selectedTipo);

  // Categoría seleccionada según la combinación elegida
  const selectedCategoria =
    categorias.find(
      (c) =>
        c.tipoSocio === selectedTipo &&
        (c.vinculoUnse ?? '') === (selectedVinculo ?? '')
    ) ||
    availableVinculosForTipo[0] ||
    null;

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocio || !selectedCategoria) return;
    try {
      await cambiarCategoria(editingSocio.dni, selectedCategoria.idCategoria);
      setEditingSocio(null);
    } catch (err) {
      alert(`Error al cambiar categoría: ${(err as Error).message}`);
    }
  };

  // ─── Modal: Gestionar puntos ──────────────────────────────────────────────

  const [puntosSocio, setPuntosSocio] = useState<SocioResponseDto | null>(null);
  const [puntosValue, setPuntosValue] = useState<number>(0);

  const handleSumarPuntos = async () => {
    if (!puntosSocio || puntosValue <= 0) return;
    try {
      await agregarPuntos(puntosSocio.dni, puntosValue);
      setPuntosSocio(null);
      setPuntosValue(0);
    } catch (err) {
      alert(`Error al sumar puntos: ${(err as Error).message}`);
    }
  };

  const handleCanjearPuntos = async () => {
    if (!puntosSocio || puntosValue <= 0) return;
    try {
      await redimirPuntos(puntosSocio.dni, puntosValue);
      setPuntosSocio(null);
      setPuntosValue(0);
    } catch (err) {
      alert(`Error al canjear puntos: ${(err as Error).message}`);
    }
  };

  // ─── Handler: Dar de baja ─────────────────────────────────────────────────

  const handleDarDeBaja = async (socio: SocioResponseDto) => {
    if (!confirm(`¿Dar de baja la membresía de ${socio.nombreCompleto}? Pasará a ser NO_SOCIO.`)) return;
    try {
      await darDeBaja(socio.dni);
    } catch (err) {
      alert(`Error al dar de baja: ${(err as Error).message}`);
    }
  };

  // ─── Loading & Error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <span className="text-sm font-medium">Cargando socios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="font-semibold text-sm">Error al conectar con el backend</span>
        </div>
        <p className="text-xs text-gray-400 max-w-sm text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh} className="flex items-center gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Filtros */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Buscar:</span>
            <input
              type="text"
              placeholder="DNI o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 px-3 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Categoría:</span>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.etiqueta || (cat.vinculoUnse ? `${cat.tipoSocio} · ${cat.vinculoUnse}` : cat.tipoSocio)}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
            title="Actualizar desde el servidor"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <div className="ml-auto text-gray-400 font-medium">
            Mostrando <span className="font-bold text-gray-800">{filteredSocios.length}</span> de{' '}
            <span className="font-bold text-gray-800">{socios.length}</span> socios
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <SocioTable
            socios={filteredSocios}
            onEdit={handleEditClick}
            onDarDeBaja={handleDarDeBaja}
            onAjustePuntos={(socio) => {
              setPuntosSocio(socio);
              setPuntosValue(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Modal: Cambiar categoría y vínculo */}
      {editingSocio && (
        <Dialog open={!!editingSocio} onOpenChange={(open) => !open && setEditingSocio(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Categoría de Socio</DialogTitle>
              <DialogDescription>
                Modifique la membresía y vínculo de <span className="font-bold text-gray-900">{editingSocio.nombreCompleto}</span> (DNI: {editingSocio.dni}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCategoriaSubmit} className="space-y-4 mt-2">
              {/* Selector 1: Tipo de Socio */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Tipo de Socio</label>
                <select
                  value={selectedTipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer font-medium"
                  required
                >
                  <option value="" disabled>Seleccionar tipo...</option>
                  {availableTipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo === 'INTERNO'
                        ? 'Socio Interno'
                        : tipo === 'EXTERNO'
                        ? 'Socio Externo'
                        : tipo === 'NO_SOCIO'
                        ? 'No Socio'
                        : tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector 2: Vínculo UNSE */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Vínculo UNSE</label>
                <select
                  value={selectedVinculo}
                  onChange={(e) => setSelectedVinculo(e.target.value)}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer font-medium disabled:bg-gray-100 disabled:text-gray-400"
                  required
                  disabled={availableVinculosForTipo.length <= 1 && !availableVinculosForTipo[0]?.vinculoUnse}
                >
                  {availableVinculosForTipo.map((cat) => (
                    <option key={cat.idCategoria} value={cat.vinculoUnse ?? ''}>
                      {cat.vinculoUnse ? cat.vinculoUnse : 'Sin vínculo'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condiciones resultantes: Cuota y Descuento */}
              {selectedCategoria && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Condiciones de la categoría
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-gray-400 block text-[11px] font-medium">Cuota mensual</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {selectedCategoria.cuotaMensual > 0
                          ? `$${selectedCategoria.cuotaMensual.toLocaleString('es-AR')}`
                          : 'Sin costo ($0)'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-gray-400 block text-[11px] font-medium">Descuento</span>
                      <span className={`font-bold text-sm ${selectedCategoria.descuento > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        {selectedCategoria.descuento}%
                      </span>
                    </div>
                    {selectedCategoria.cuotaTrimestral > 0 && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                        <span className="text-gray-400 block text-[10px] font-medium">Cuota trimestral</span>
                        <span className="font-semibold text-gray-800 text-xs">
                          ${selectedCategoria.cuotaTrimestral.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                    {selectedCategoria.cuotaAnual > 0 && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                        <span className="text-gray-400 block text-[10px] font-medium">Cuota anual</span>
                        <span className="font-semibold text-gray-800 text-xs">
                          ${selectedCategoria.cuotaAnual.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingSocio(null)} className="text-xs">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={!selectedCategoria}
                  className="text-xs font-semibold"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal: Gestionar puntos */}
      {puntosSocio && (
        <Dialog open={!!puntosSocio} onOpenChange={(open) => !open && setPuntosSocio(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Gestionar Puntos
              </DialogTitle>
              <DialogDescription>
                <span className="font-bold">{puntosSocio.nombreCompleto}</span> tiene actualmente{' '}
                <span className="font-bold text-amber-600">{puntosSocio.puntosAc} puntos</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Cantidad de Puntos</label>
                <input
                  type="number"
                  min="1"
                  value={puntosValue || ''}
                  onChange={(e) => setPuntosValue(Number(e.target.value))}
                  placeholder="Ej. 50"
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setPuntosSocio(null)} className="text-xs">
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCanjearPuntos}
                  disabled={puntosValue <= 0}
                  className="text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
                >
                  Canjear
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={handleSumarPuntos}
                  disabled={puntosValue <= 0}
                  className="text-xs font-semibold"
                >
                  Sumar Puntos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default SociosPage;
