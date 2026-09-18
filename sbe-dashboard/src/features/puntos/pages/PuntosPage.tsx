import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Gift, Plus, Award, Info, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';

interface Promocion {
  id: string;
  descripcion: string;
  puntosRequeridos: number;
  descuentoPorcentaje: number;
  estado: 'Activo' | 'Inactivo';
}

const initialPromociones: Promocion[] = [
  { id: 'promo-1', descripcion: 'Descuento del 50% en alquiler de Cancha de Fútbol 5', puntosRequeridos: 200, descuentoPorcentaje: 50, estado: 'Activo' },
  { id: 'promo-2', descripcion: 'Pase libre a Pileta por un día', puntosRequeridos: 150, descuentoPorcentaje: 100, estado: 'Activo' },
  { id: 'promo-3', descripcion: 'Descuento del 25% en alquiler de Cancha de Tenis', puntosRequeridos: 100, descuentoPorcentaje: 25, estado: 'Activo' }
];

export function PuntosPage() {
  const [promociones, setPromociones] = useState<Promocion[]>(initialPromociones);
  const [isNewPromoOpen, setIsNewPromoOpen] = useState(false);

  const [newForm, setNewForm] = useState({
    id: '',
    descripcion: '',
    puntosRequeridos: 50,
    descuentoPorcentaje: 10
  });

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: Promocion = {
      id: newForm.id || `promo-${Date.now()}`,
      descripcion: newForm.descripcion,
      puntosRequeridos: newForm.puntosRequeridos,
      descuentoPorcentaje: newForm.descuentoPorcentaje,
      estado: 'Activo'
    };

    setPromociones(prev => [...prev, newPromo]);
    setIsNewPromoOpen(false);
    setNewForm({ id: '', descripcion: '', puntosRequeridos: 50, descuentoPorcentaje: 10 });
  };

  const handleDeletePromo = (id: string) => {
    setPromociones(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Informative Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-xs bg-red-50/20 border-red-200/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
            <div className="space-y-1 text-gray-700 font-medium">
              <h4 className="font-bold text-gray-900">¿Cómo funciona el Sistema de Puntos SBE?</h4>
              <p className="leading-relaxed">
                Los socios acumulan puntos automáticamente al realizar reservas de servicios (10% del valor en puntos) 
                y al pagar su cuota de membresía mensual (50 puntos). Los puntos pueden canjearse por descuentos en 
                nuevas reservas de servicios disponibles.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs bg-amber-50/20 border-amber-200/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-500 uppercase text-[9px]">Equivalencia actual</span>
              <h3 className="text-xl font-black text-amber-700 leading-none">10 ARS = 1 Punto</h3>
              <p className="text-[10px] text-gray-400 font-normal">Configurado por el Administrador</p>
            </div>
            <Award className="h-10 w-10 text-amber-500 shrink-0" />
          </CardContent>
        </Card>
      </div>

      {/* Promotions List Actions */}
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">Gestión de promociones y beneficios canjeables</span>
        <Button
          onClick={() => setIsNewPromoOpen(true)}
          variant="brand"
          size="sm"
          className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      {/* Promotions Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-2.5 px-6">ID PROMO</th>
                  <th className="py-2.5 px-6">DESCRIPCIÓN DEL BENEFICIO</th>
                  <th className="py-2.5 px-6">PUNTOS REQUERIDOS</th>
                  <th className="py-2.5 px-6">DESCUENTO</th>
                  <th className="py-2.5 px-6">ESTADO</th>
                  <th className="py-2.5 px-6 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {promociones.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/20">
                    <td className="py-4 px-6 font-bold text-gray-400">{promo.id}</td>
                    <td className="py-4 px-6 font-bold text-gray-950 text-sm">{promo.descripcion}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Award className="h-4 w-4" />
                        {promo.puntosRequeridos} pts
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-bold text-sm">
                      {promo.descuentoPorcentaje}% OFF
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="success" className="text-[9px] font-bold px-2 py-0.5">
                        {promo.estado}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePromo(promo.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Eliminar promoción"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Promotion Modal */}
      <Dialog open={isNewPromoOpen} onOpenChange={setIsNewPromoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Promoción al Sistema</DialogTitle>
            <DialogDescription>
              Añada un beneficio que los socios puedan adquirir canjeando sus puntos acumulados.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePromo} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">ID de la Promoción</label>
              <input
                type="text"
                placeholder="Ej. promo-asado"
                value={newForm.id}
                onChange={(e) => setNewForm({ ...newForm, id: e.target.value })}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Descripción del Beneficio</label>
              <input
                type="text"
                placeholder="Ej. 100% de descuento en alquiler de asador"
                value={newForm.descripcion}
                onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Puntos Requeridos</label>
                <input
                  type="number"
                  value={newForm.puntosRequeridos}
                  onChange={(e) => setNewForm({ ...newForm, puntosRequeridos: Number(e.target.value) })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Porcentaje de Descuento</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newForm.descuentoPorcentaje}
                  onChange={(e) => setNewForm({ ...newForm, descuentoPorcentaje: Number(e.target.value) })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewPromoOpen(false)}
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
                Agregar Promoción
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default PuntosPage;
