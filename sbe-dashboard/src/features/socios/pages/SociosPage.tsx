import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData, type Socio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Edit2, UserX, UserCheck, Award, Search, Mail, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { cn } from '../../../lib/utils';

export function SociosPage() {
  const { socios, updateSocio } = useData();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  
  // Local filters
  const [catFilter, setCatFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  
  // Edit Partner Modal State
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [editForm, setEditForm] = useState<{
    nombre: string;
    email: string;
    domicilio: string;
    categoria: Socio['categoria'];
    vinculo: Socio['vinculo'];
    estado: Socio['estado'];
  }>({
    nombre: '',
    email: '',
    domicilio: '',
    categoria: 'No socio',
    vinculo: 'Ninguno',
    estado: 'Activo'
  });

  // Handle edit click
  const handleEditClick = (socio: Socio) => {
    setEditingSocio(socio);
    setEditForm({
      nombre: socio.nombre,
      email: socio.email,
      domicilio: socio.domicilio,
      categoria: socio.categoria,
      vinculo: socio.vinculo || 'Ninguno',
      estado: socio.estado
    });
  };

  // Handle edit form submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocio) return;
    
    updateSocio(editingSocio.dni, editForm);
    setEditingSocio(null);
  };

  // Toggle status (Active / De baja)
  const handleToggleStatus = (socio: Socio) => {
    const newEstado: Socio['estado'] = socio.estado === 'Activo' ? 'De baja' : 'Activo';
    updateSocio(socio.dni, { estado: newEstado });
  };

  // Filtered socios list
  const filteredSocios = socios.filter((socio) => {
    const matchesSearch =
      socio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      socio.dni.includes(searchQuery);
      
    const matchesCat = catFilter === 'all' || socio.categoria === catFilter;
    const matchesState = stateFilter === 'all' || socio.estado === stateFilter;
    
    return matchesSearch && matchesCat && matchesState;
  });

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Filters Card */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Categoría:</span>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="Interno">Socio Interno</option>
              <option value="Externo">Socio Externo</option>
              <option value="No socio">No Socio</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-500">Estado:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-8 px-2 border border-gray-200 bg-white rounded-lg focus:outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="Activo">Activos</option>
              <option value="De baja">De baja</option>
            </select>
          </div>

          <div className="ml-auto text-gray-400 font-medium">
            Mostrando <span className="font-bold text-gray-800">{filteredSocios.length}</span> de{' '}
            <span className="font-bold text-gray-800">{socios.length}</span> usuarios
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-3 px-6">DNI</th>
                  <th className="py-3 px-6">NOMBRE Y CONTACTO</th>
                  <th className="py-3 px-6">FECHA NAC.</th>
                  <th className="py-3 px-6">CATEGORÍA</th>
                  <th className="py-3 px-6">PUNTOS</th>
                  <th className="py-3 px-6">ESTADO</th>
                  <th className="py-3 px-6 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredSocios.map((socio) => (
                  <tr key={socio.dni} className="hover:bg-gray-50/30 transition-colors">
                    {/* DNI */}
                    <td className="py-4 px-6 font-semibold text-gray-900">{socio.dni}</td>

                    {/* Nombre y Contacto */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-bold text-gray-950 text-sm">{socio.nombre}</div>
                      <div className="flex flex-col gap-1 text-gray-400 font-normal">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {socio.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {socio.domicilio}
                        </span>
                      </div>
                    </td>

                    {/* Fecha de Nacimiento */}
                    <td className="py-4 px-6 text-gray-500 font-normal">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {socio.fechaNacimiento.split('-').reverse().join('/')}
                      </span>
                    </td>

                    {/* Categoría & Vínculo */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            socio.categoria === 'Interno'
                              ? "bg-red-50 text-red-700 border-red-200"
                              : socio.categoria === 'Externo'
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          )}
                        >
                          {socio.categoria}
                        </span>
                        {socio.categoria === 'Interno' && socio.vinculo && (
                          <span className="text-[10px] text-gray-400 font-bold ml-1">
                            • {socio.vinculo}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Puntos */}
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Award className="h-4 w-4" />
                        {socio.puntos} pts
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <Badge
                        variant={socio.estado === 'Activo' ? 'success' : 'destructive'}
                        className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
                      >
                        {socio.estado}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(socio)}
                          className="h-8 w-8 p-0"
                          title="Modificar datos"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                        </Button>

                        {/* Status Toggle Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(socio)}
                          className={cn(
                            "h-8 w-8 p-0",
                            socio.estado === 'Activo' 
                              ? "hover:bg-red-50 hover:text-red-600" 
                              : "hover:bg-green-50 hover:text-green-600"
                          )}
                          title={socio.estado === 'Activo' ? "Dar de baja" : "Dar de alta"}
                        >
                          {socio.estado === 'Activo' ? (
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSocios.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 font-medium bg-gray-50/10">
                      No se encontraron socios que coincidan con la búsqueda o filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Partner Modal */}
      {editingSocio && (
        <Dialog open={!!editingSocio} onOpenChange={(open) => !open && setEditingSocio(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modificar Datos de Socio</DialogTitle>
              <DialogDescription>
                Modifique los campos correspondientes a {editingSocio.nombre} (DNI: {editingSocio.dni}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              {/* Domicilio */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Domicilio</label>
                <input
                  type="text"
                  value={editForm.domicilio}
                  onChange={(e) => setEditForm({ ...editForm, domicilio: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Categoría */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Categoría</label>
                  <select
                    value={editForm.categoria}
                    onChange={(e) => {
                      const cat = e.target.value as Socio['categoria'];
                      setEditForm({
                        ...editForm,
                        categoria: cat,
                        vinculo: cat === 'Interno' ? 'Alumno' : 'Ninguno'
                      });
                    }}
                    className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  >
                    <option value="No socio">No socio</option>
                    <option value="Interno">Socio Interno</option>
                    <option value="Externo">Socio Externo</option>
                  </select>
                </div>

                {/* Vínculo */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Vínculo (Socio Interno)</label>
                  <select
                    value={editForm.vinculo}
                    disabled={editForm.categoria !== 'Interno'}
                    onChange={(e) => setEditForm({ ...editForm, vinculo: e.target.value as Socio['vinculo'] })}
                    className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Alumno">Alumno</option>
                    <option value="Docente">Docente</option>
                    <option value="Nodocente">Nodocente</option>
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Estado de la cuenta</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as Socio['estado'] })}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                >
                  <option value="Activo">Activo</option>
                  <option value="De baja">De baja</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSocio(null)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
export default SociosPage;
