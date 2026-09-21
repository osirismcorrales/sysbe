/**
 * UsuariosPage.tsx
 * Componente contenedor (smart component) para la gestión de usuarios.
 * Conecta con el backend via useUsuarios y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useUsuarios, type UsuarioResponseDto } from '../hooks/useUsuarios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Shield, Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// Componentes presentacionales
import { UsuarioTable } from '../components/UsuarioTable';
import { UsuarioFormDialog, type UsuarioFormData } from '../components/UsuarioFormDialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_FORM: UsuarioFormData = {
  dni: '',
  nombreCompleto: '',
  email: '',
  fechaNacimiento: '',
  estado: 'ACTIVO',
  domicilio: '',
  passwordHash: '',
  rolId: 0,
  categoriaId: 0,
};

// ─── Componente contenedor ──────────────────────────────────────────────────

export function UsuariosPage() {
  const {
    usuarios,
    categorias,
    loading,
    error,
    refresh,
    crear,
    actualizar,
    desactivar,
  } = useUsuarios();

  // ─── Modal states ───────────────────────────────────────────────────────

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newForm, setNewForm] = useState<UsuarioFormData>({ ...EMPTY_FORM });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UsuarioFormData>({ ...EMPTY_FORM });

  // ─── Handlers: Crear ────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear(newForm);
      setIsNewOpen(false);
      setNewForm({ ...EMPTY_FORM });
    } catch (err) {
      alert(`Error al crear usuario: ${(err as Error).message}`);
    }
  };

  // ─── Handlers: Editar ───────────────────────────────────────────────────

  const handleEditClick = (usuario: UsuarioResponseDto) => {
    setEditingId(usuario.id);
    setEditForm({
      dni: usuario.dni,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento,
      estado: usuario.estado,
      domicilio: usuario.domicilio,
      passwordHash: '', // No se muestra ni envía al editar
      rolId: usuario.rol?.idRol ?? 0,
      categoriaId: usuario.categoria?.idCategoria ?? 0,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await actualizar(editingId, editForm);
      setEditingId(null);
    } catch (err) {
      alert(`Error al actualizar usuario: ${(err as Error).message}`);
    }
  };

  // ─── Handlers: Toggle estado ────────────────────────────────────────────

  const handleToggleStatus = async (usuario: UsuarioResponseDto) => {
    try {
      if (usuario.estado?.toUpperCase() !== 'DE_BAJA') {
        await desactivar(usuario.id);
      } else {
        // Para reactivar, hacemos un PUT con el estado cambiado
        await actualizar(usuario.id, {
          dni: usuario.dni,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          fechaNacimiento: usuario.fechaNacimiento,
          estado: 'ACTIVO',
          domicilio: usuario.domicilio,
          passwordHash: '',
          rolId: usuario.rol?.idRol ?? 0,
          categoriaId: usuario.categoria?.idCategoria ?? 0,
        });
      }
    } catch (err) {
      alert(`Error al cambiar estado: ${(err as Error).message}`);
    }
  };

  // ─── Loading & Error states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <span className="text-sm font-medium">Cargando usuarios...</span>
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
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">
          Administre las cuentas, roles y permisos de los usuarios del sistema
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
            title="Actualizar desde el servidor"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => setIsNewOpen(true)}
            variant="brand"
            size="sm"
            className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 bg-white">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-brand-red" />
            Control de Cuentas y Roles de Usuario
          </CardTitle>
          <CardDescription className="text-[10px]">
            Listado de usuarios registrados en el sistema con sus roles y categorías asignadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UsuarioTable
            usuarios={usuarios}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditClick}
          />
        </CardContent>
      </Card>

      {/* Modal: Crear usuario */}
      <UsuarioFormDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        title="Registrar Nuevo Usuario"
        description="Complete los datos para crear una nueva cuenta de usuario en el sistema."
        submitLabel="Crear Usuario"
        formData={newForm}
        onFormChange={setNewForm}
        onSubmit={handleCreate}
        categorias={categorias}
      />

      {/* Modal: Editar usuario */}
      <UsuarioFormDialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Editar Usuario"
        description="Modifique los datos del usuario seleccionado."
        submitLabel="Guardar Cambios"
        formData={editForm}
        onFormChange={setEditForm}
        onSubmit={handleEditSubmit}
        hidePassword
        categorias={categorias}
      />
    </div>
  );
}

export default UsuariosPage;
