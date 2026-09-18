import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ClipboardList, Plus, BarChart2, Star, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';

interface Encuesta {
  id: string;
  titulo: string;
  descripcion: string;
  preguntasCount: number;
  respuestasCount: number;
  promedioSatisfaccion?: number;
  fechaLimite: string;
  estado: 'Vigente' | 'Finalizada';
}

const initialEncuestas: Encuesta[] = [
  { id: 'enc-1', titulo: 'Satisfacción del Servicio de Pileta', descripcion: 'Evaluación de las condiciones del agua y vestuarios de la pileta olímpica.', preguntasCount: 4, respuestasCount: 48, promedioSatisfaccion: 8.5, fechaLimite: '2026-07-15', estado: 'Vigente' },
  { id: 'enc-2', titulo: 'Calidad de las Canchas de Fútbol 5', descripcion: 'Encuesta sobre el estado del césped sintético y las redes de los arcos.', preguntasCount: 3, respuestasCount: 112, promedioSatisfaccion: 9.2, fechaLimite: '2026-06-30', estado: 'Vigente' },
  { id: 'enc-3', titulo: 'Uso del Gimnasio y Equipamiento', descripcion: 'Consulta sobre el mantenimiento de máquinas de musculación y pesas.', preguntasCount: 5, respuestasCount: 85, promedioSatisfaccion: 7.4, fechaLimite: '2026-05-31', estado: 'Finalizada' }
];

export function EncuestasPage() {
  const [encuestas, setEncuestas] = useState<Encuesta[]>(initialEncuestas);
  const [isNewEncuestaOpen, setIsNewEncuestaOpen] = useState(false);
  
  const [newForm, setNewForm] = useState({
    titulo: '',
    descripcion: '',
    fechaLimite: '',
    tipoRespuesta: 'escala'
  });

  const handleCreateEncuesta = (e: React.FormEvent) => {
    e.preventDefault();
    const newEncuesta: Encuesta = {
      id: `enc-${Date.now()}`,
      titulo: newForm.titulo,
      descripcion: newForm.descripcion,
      preguntasCount: 3,
      respuestasCount: 0,
      fechaLimite: newForm.fechaLimite,
      estado: 'Vigente'
    };

    setEncuestas(prev => [newEncuesta, ...prev]);
    setIsNewEncuestaOpen(false);
    setNewForm({ titulo: '', descripcion: '', fechaLimite: '', tipoRespuesta: 'escala' });
  };

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
        <span className="font-semibold text-gray-500">Gestión de encuestas de satisfacción para los servicios del polideportivo</span>
        <Button
          onClick={() => setIsNewEncuestaOpen(true)}
          variant="brand"
          size="sm"
          className="flex items-center gap-1.5 font-semibold text-xs rounded-lg shadow-xs h-8 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Encuesta
        </Button>
      </div>

      {/* Surveys Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-2.5 px-6">TÍTULO Y DESCRIPCIÓN</th>
                  <th className="py-2.5 px-6">PREGUNTAS</th>
                  <th className="py-2.5 px-6">RESPUESTAS RECIBIDAS</th>
                  <th className="py-2.5 px-6">VALORACIÓN PROM.</th>
                  <th className="py-2.5 px-6">FECHA LÍMITE</th>
                  <th className="py-2.5 px-6">ESTADO</th>
                  <th className="py-2.5 px-6 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {encuestas.map((enc) => (
                  <tr key={enc.id} className="hover:bg-gray-50/20">
                    <td className="py-4 px-6 space-y-1 max-w-sm">
                      <div className="font-bold text-gray-950 text-sm">{enc.titulo}</div>
                      <div className="text-[10px] text-gray-400 font-normal leading-relaxed">{enc.descripcion}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{enc.preguntasCount} preguntas</td>
                    <td className="py-4 px-6 text-gray-600 font-bold">{enc.respuestasCount} respuestas</td>
                    <td className="py-4 px-6">
                      {enc.promedioSatisfaccion ? (
                        <span className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                          <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                          {enc.promedioSatisfaccion.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">Sin respuestas</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-normal">
                      {enc.fechaLimite.split('-').reverse().join('/')}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={enc.estado === 'Vigente' ? 'success' : 'secondary'}
                        className="text-[9px] font-bold px-2 py-0.5"
                      >
                        {enc.estado}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                          Resultados
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Survey Modal */}
      <Dialog open={isNewEncuestaOpen} onOpenChange={setIsNewEncuestaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Encuesta</DialogTitle>
            <DialogDescription>
              Cree una encuesta de satisfacción para evaluar y mejorar la calidad de un servicio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEncuesta} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Título de la Encuesta</label>
              <input
                type="text"
                placeholder="Ej. Evaluación de Asadores"
                value={newForm.titulo}
                onChange={(e) => setNewForm({ ...newForm, titulo: e.target.value })}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Descripción / Objetivo</label>
              <textarea
                placeholder="Breve descripción para el alumno..."
                value={newForm.descripcion}
                onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })}
                className="h-16 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Fecha Límite</label>
                <input
                  type="date"
                  value={newForm.fechaLimite}
                  onChange={(e) => setNewForm({ ...newForm, fechaLimite: e.target.value })}
                  className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700">Tipo de Respuesta</label>
                <select
                  value={newForm.tipoRespuesta}
                  onChange={(e) => setNewForm({ ...newForm, tipoRespuesta: e.target.value })}
                  className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                >
                  <option value="escala">Escala de valoración (1 al 10)</option>
                  <option value="multiple">Múltiple Opción</option>
                  <option value="libre">Respuesta de texto libre</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewEncuestaOpen(false)}
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
                Crear Encuesta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default EncuestasPage;
