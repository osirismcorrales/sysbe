/**
 * UsuariosPage.tsx
 * Componente contenedor (smart component) para la gestión de usuarios.
 * Conecta con el backend via useUsuarios y delega la presentación a componentes tontos.
 */

import React, { useState } from 'react';
import { useUsuarios, type UsuarioResponseDto } from '../hooks/useUsuarios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Shield, Plus, RefreshCw, AlertCircle, Loader2, Search } from 'lucide-react';

import { toast } from '../../../components/ui/Toast';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { UsuarioTable } from '../components/UsuarioTable';
import {
  UsuarioFormDialog,
  EMPTY_USUARIO_FORM,
  type UsuarioFormData,
} from '../components/UsuarioFormDialog';
import type { UsuarioRequestDto, UsuarioUpdateDto } from '../services/usuariosApi';

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

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UsuarioFormData>({ ...EMPTY_USUARIO_FORM });

  const handleCreate = async (data: UsuarioRequestDto | UsuarioUpdateDto) => {
    await crear(data as UsuarioRequestDto);
    toast.success('Usuario creado exitosamente');
  };

  const handleEditClick = (usuario: UsuarioResponseDto) => {
    setEditingId(usuario.id);
    setEditForm({
      dni: usuario.dni,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento,
      estado: usuario.estado === 'DE_BAJA' ? 'DE_BAJA' : 'ACTIVO',
      domicilio: usuario.domicilio,
      passwordHash: '',
      rolId: usuario.rol?.idRol ?? 0,
      categoriaId: usuario.categoria?.idCategoria ?? 0,
    });
  };

  const handleEditSubmit = async (data: UsuarioRequestDto | UsuarioUpdateDto) => {
    if (!editingId) return;
    const { passwordHash: _omit, ...updateDto } = data as UsuarioRequestDto;
    await actualizar(editingId, updateDto);
    toast.success('Usuario actualizado exitosamente');
    setEditingId(null);
  };

  const [bajaTarget, setBajaTarget] = useState<UsuarioResponseDto | null>(null);
  const [bajaLoading, setBajaLoading] = useState(false);

  const handleToggleStatus = async (usuario: UsuarioResponseDto) => {
    if (usuario.estado?.toUpperCase() !== 'DE_BAJA') {
      setBajaTarget(usuario);
      return;
    }

    try {
      await actualizar(usuario.id, {
        dni: usuario.dni,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        fechaNacimiento: usuario.fechaNacimiento,
        estado: 'ACTIVO',
        domicilio: usuario.domicilio,
        rolId: usuario.rol?.idRol ?? 0,
        categoriaId: usuario.categoria?.idCategoria ?? 0,
      });
      toast.success(`Usuario ${usuario.nombreCompleto} reactivado exitosamente.`);
    } catch (err) {
      toast.error((err as Error).message || 'Error al reactivar usuario.');
    }
  };

  const handleConfirmBaja = async () => {
    if (!bajaTarget) return;
    setBajaLoading(true);
    try {
      await desactivar(bajaTarget.id);
      toast.info(`Usuario ${bajaTarget.nombreCompleto} dado de baja exitosamente.`);
      setBajaTarget(null);
    } catch (err) {
      toast.error((err as Error).message || 'Error al dar de baja el usuario.');
    } finally {
      setBajaLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [rolFilter, setRolFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dni.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRol = rolFilter === 'all' || u.rol?.nombreRol === rolFilter;
    const isActivo = u.estado?.toUpperCase() === 'ACTIVO';
    const matchesEstado =
      estadoFilter === 'all' ||
      (estadoFilter === 'ACTIVO' && isActivo) ||
      (estadoFilter === 'DE_BAJA' && !isActivo);

    return matchesSearch && matchesRol && matchesEstado;
  });

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

  return (
    <div className="space-y-4 select-none text-xs">
      {/* Barra superior compacta y unificada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white px-3.5 py-2 border border-gray-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-red-50 text-brand-red rounded-lg border border-red-100 shrink-0">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 truncate">Usuarios</h2>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
            {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>

        {/* Búsqueda, Filtro y Acciones */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-56 lg:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            />
          </div>

          <select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
            className="h-8 px-2 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none text-xs font-semibold cursor-pointer shrink-0"
          >
            <option value="all">Todos los roles</option>
            <option value="ADMINISTRADOR">Admin</option>
            <option value="EMPLEADO">Empleado</option>
            <option value="SOCIO">Socio</option>
          </select>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-8 px-2 border border-gray-200 bg-gray-50/50 rounded-lg focus:outline-none text-xs font-semibold cursor-pointer shrink-0"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="DE_BAJA">Dados de baja</option>
          </select>

          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 cursor-pointer"
            title="Actualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={() => setIsNewOpen(true)}
            variant="brand"
            size="sm"
            className="h-8 px-2.5 font-semibold text-xs rounded-lg shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Contenedor de la tabla */}
      <Card className="shadow-xs overflow-hidden border-gray-200 bg-white">
        <CardContent className="p-0">
          <UsuarioTable
            usuarios={filteredUsuarios}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditClick}
          />
        </CardContent>
      </Card>

      <UsuarioFormDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        title="Registrar Nuevo Usuario"
        description="Complete los datos para crear una nueva cuenta de usuario en el sistema."
        submitLabel="Crear Usuario"
        onSubmit={handleCreate}
        categorias={categorias}
      />

      <UsuarioFormDialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Editar Usuario"
        description="Modifique los datos del usuario seleccionado."
        submitLabel="Guardar Cambios"
        initialValues={editForm}
        onSubmit={handleEditSubmit}
        hidePassword
        categorias={categorias}
      />

      <ConfirmDialog
        open={!!bajaTarget}
        onOpenChange={(open) => {
          if (!open && !bajaLoading) setBajaTarget(null);
        }}
        title="Confirmar Baja de Usuario"
        description={
          <>
            ¿Está seguro de que desea dar de baja al usuario{' '}
            <span className="font-bold text-gray-900">{bajaTarget?.nombreCompleto}</span> (DNI: {bajaTarget?.dni})?
            <br />
            <span className="text-xs text-red-600 mt-1.5 block font-medium">
              El usuario pasará al estado "De baja" y se suspenderá su acceso al sistema.
            </span>
          </>
        }
        confirmText="Sí, dar de baja"
        cancelText="Cancelar"
        variant="destructive"
        loading={bajaLoading}
        onConfirm={handleConfirmBaja}
      />
    </div>
  );
}

export default UsuariosPage;
