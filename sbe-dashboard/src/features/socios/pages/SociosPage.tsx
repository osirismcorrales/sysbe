/**
 * SociosPage.tsx
 * Componente contenedor (smart component) para la gestión de socios.
 * Conecta con el backend via useSocios y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useSocios, type SocioResponseDto } from '../hooks/useSocios';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// Componentes presentacionales
import { SocioTable } from '../components/SocioTable';
import { CambiarCategoriaDialog } from '../components/CambiarCategoriaDialog';
import { GestionarPuntosDialog } from '../components/GestionarPuntosDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { toast } from '../../../components/ui/Toast';

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
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSocios = socios.filter((socio) => {
    const matchesSearch =
      socio.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      socio.dni.includes(searchQuery);

    const matchesCat = catFilter === 'all' || socio.idCategoria === Number(catFilter);

    const isActivo = socio.estado?.toUpperCase() === 'ACTIVO' && socio.tipoSocio?.toUpperCase() !== 'NO_SOCIO';
    const matchesEstado =
      estadoFilter === 'all' ||
      (estadoFilter === 'ACTIVO' && isActivo) ||
      (estadoFilter === 'DE_BAJA' && !isActivo);

    return matchesSearch && matchesCat && matchesEstado;
  });

  // Modales
  const [editingSocio, setEditingSocio] = useState<SocioResponseDto | null>(null);
  const [puntosSocio, setPuntosSocio] = useState<SocioResponseDto | null>(null);
  const [bajaTarget, setBajaTarget] = useState<SocioResponseDto | null>(null);
  const [bajaLoading, setBajaLoading] = useState(false);

  // ─── Handler: Dar de baja ─────────────────────────────────────────────────

  const handleDarDeBajaClick = (socio: SocioResponseDto) => {
    setBajaTarget(socio);
  };

  const handleConfirmBaja = async () => {
    if (!bajaTarget) return;
    setBajaLoading(true);
    try {
      await darDeBaja(bajaTarget.dni);
      toast.success(`Membresía de ${bajaTarget.nombreCompleto} dada de baja correctamente.`);
      setBajaTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al dar de baja el socio.', 'Error');
    } finally {
      setBajaLoading(false);
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
    <div className="space-y-4 select-none text-xs">
      {/* Barra de herramientas compacta y unificada */}
      <Card className="shadow-xs">
        <CardContent className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">Socios</span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {filteredSocios.length} de {socios.length}
            </span>
          </div>

          <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap min-w-[200px] max-w-2xl">
            <input
              type="text"
              placeholder="Buscar por DNI o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[140px] h-8 px-2.5 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-gray-500 text-[11px] whitespace-nowrap hidden sm:inline">Categoría:</span>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer max-w-[140px] sm:max-w-xs"
              >
                <option value="all">Todas</option>
                {categorias.map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>
                    {cat.etiqueta || (cat.vinculoUnse ? `${cat.tipoSocio} · ${cat.vinculoUnse}` : cat.tipoSocio)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-gray-500 text-[11px] whitespace-nowrap hidden sm:inline">Estado:</span>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer shrink-0"
              >
                <option value="all">Todos</option>
                <option value="ACTIVO">Activos</option>
                <option value="DE_BAJA">De baja</option>
              </select>
            </div>
          </div>

          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center font-semibold rounded-lg shadow-xs cursor-pointer shrink-0"
            title="Actualizar desde el servidor"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Tabla adaptable */}
      <Card className="shadow-xs overflow-hidden border-gray-200 bg-white">
        <CardContent className="p-0">
          <SocioTable
            socios={filteredSocios}
            onEdit={(socio) => setEditingSocio(socio)}
            onDarDeBaja={handleDarDeBajaClick}
            onAjustePuntos={(socio) => setPuntosSocio(socio)}
          />
        </CardContent>
      </Card>

      {/* Modal: Confirmación de baja de membresía */}
      <ConfirmDialog
        open={!!bajaTarget}
        onOpenChange={(open) => {
          if (!open && !bajaLoading) setBajaTarget(null);
        }}
        title="Confirmar Baja de Membresía"
        description={
          <>
            ¿Está seguro de que desea dar de baja la membresía de{' '}
            <span className="font-bold text-gray-900">{bajaTarget?.nombreCompleto}</span> (DNI: {bajaTarget?.dni})?
            <br />
            <span className="text-xs text-red-600 mt-1.5 block font-medium">
              El socio pasará a la categoría de NO_SOCIO y perderá los beneficios de membresía activa.
            </span>
          </>
        }
        confirmText="Sí, dar de baja"
        cancelText="Cancelar"
        variant="destructive"
        loading={bajaLoading}
        onConfirm={handleConfirmBaja}
      />

      {/* Modal: Cambiar categoría y vínculo */}
      <CambiarCategoriaDialog
        open={!!editingSocio}
        onOpenChange={(open) => !open && setEditingSocio(null)}
        socio={editingSocio}
        categorias={categorias}
        onSubmit={cambiarCategoria}
      />

      {/* Modal: Gestionar puntos */}
      <GestionarPuntosDialog
        open={!!puntosSocio}
        onOpenChange={(open) => !open && setPuntosSocio(null)}
        socio={puntosSocio}
        onSumar={agregarPuntos}
        onCanjear={redimirPuntos}
      />
    </div>
  );
}

export default SociosPage;
