import React, { useState } from 'react';
import { useData, type Socio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { QrCode, LogIn, LogOut, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AccesoLog {
  id: string;
  dni: string;
  nombre: string;
  categoria: string;
  tipo: 'Ingreso' | 'Egreso';
  fechaHora: string;
  resultado: 'Permitido' | 'Denegado';
  motivo?: string;
}

const initialLogs: AccesoLog[] = [
  { id: 'log-1', dni: '38123456', nombre: 'Juan Pérez', categoria: 'Interno', tipo: 'Ingreso', fechaHora: '2026-06-29 08:15', resultado: 'Permitido' },
  { id: 'log-2', dni: '40987654', nombre: 'Martina González', categoria: 'Interno', tipo: 'Ingreso', fechaHora: '2026-06-29 08:30', resultado: 'Permitido' },
  { id: 'log-3', dni: '33888999', nombre: 'Gisela Díaz', categoria: 'No socio', tipo: 'Ingreso', fechaHora: '2026-06-29 08:45', resultado: 'Denegado', motivo: 'No posee membresía de socio activa.' }
];

export function AccesosPage() {
  const { socios } = useData();
  const [logs, setLogs] = useState<AccesoLog[]>(initialLogs);
  const [selectedDni, setSelectedDni] = useState('');
  const [accessResult, setAccessResult] = useState<{
    success: boolean;
    socio?: Socio;
    message: string;
    tipo?: 'Ingreso' | 'Egreso';
  } | null>(null);

  // Register Entry or Exit (RU-12 / RS-12.3)
  const handleRegisterAccess = (tipo: 'Ingreso' | 'Egreso') => {
    if (!selectedDni) return;

    const socio = socios.find(s => s.dni === selectedDni);
    const nowStr = new Date().toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');

    if (!socio) {
      const newLog: AccesoLog = {
        id: `log-${Date.now()}`,
        dni: selectedDni,
        nombre: 'DNI No Registrado',
        categoria: 'N/A',
        tipo,
        fechaHora: nowStr,
        resultado: 'Denegado',
        motivo: 'El DNI no corresponde a ningún usuario del sistema.'
      };
      setLogs(prev => [newLog, ...prev]);
      setAccessResult({
        success: false,
        message: 'Acceso Denegado. El DNI no está registrado en el sistema.',
        tipo
      });
      return;
    }

    // RS-12.3: Validate status of the partner before allowing entry
    const isAllowed = socio.estado === 'Activo' && socio.categoria !== 'No socio';
    let motivo = '';
    if (socio.estado !== 'Activo') {
      motivo = 'El usuario se encuentra dado de baja.';
    } else if (socio.categoria === 'No socio') {
      motivo = 'El usuario no tiene una membresía de socio activa.';
    }

    const newLog: AccesoLog = {
      id: `log-${Date.now()}`,
      dni: socio.dni,
      nombre: socio.nombre,
      categoria: socio.categoria,
      tipo,
      fechaHora: nowStr,
      resultado: isAllowed ? 'Permitido' : 'Denegado',
      ...(motivo ? { motivo } : {})
    };

    setLogs(prev => [newLog, ...prev]);
    setAccessResult({
      success: isAllowed,
      socio,
      message: isAllowed
        ? `Acceso permitido. Bienvenido/a, ${socio.nombre}.`
        : `Acceso denegado. ${motivo}`,
      tipo
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none text-xs">
      {/* Left Column: QR Simulator (1/3 width) */}
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="h-4.5 w-4.5 text-brand-red" />
              Simulador de Acceso (QR)
            </CardTitle>
            <CardDescription className="text-[10px]">Simule el escaneo del carnet QR de un alumno para ingresar o egresar.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Seleccione un Socio/Usuario</label>
              <select
                value={selectedDni}
                onChange={(e) => {
                  setSelectedDni(e.target.value);
                  setAccessResult(null);
                }}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
              >
                <option value="">Seleccione para simular...</option>
                {socios.map((s) => (
                  <option key={s.dni} value={s.dni}>
                    {s.nombre} ({s.categoria} - {s.estado})
                  </option>
                ))}
                <option value="99999999">DNI Inválido / No Registrado</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                onClick={() => handleRegisterAccess('Ingreso')}
                disabled={!selectedDni}
                variant="brand"
                size="sm"
                className="flex items-center justify-center gap-1.5 font-bold text-xs h-9 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Registrar Ingreso
              </Button>

              <Button
                onClick={() => handleRegisterAccess('Egreso')}
                disabled={!selectedDni}
                variant="secondary"
                size="sm"
                className="flex items-center justify-center gap-1.5 font-bold text-xs h-9 border border-gray-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Registrar Egreso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Access Result Screen */}
        {accessResult && (
          <Card className={cn(
            "border-2 shadow-md transition-all duration-300",
            accessResult.success ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
          )}>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              {accessResult.success ? (
                <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 animate-pulse" />
              )}
              
              <div className="space-y-1">
                <h3 className={cn(
                  "text-base font-black",
                  accessResult.success ? "text-green-850" : "text-red-850"
                )}>
                  {accessResult.success ? "ACCESO PERMITIDO" : "ACCESO DENEGADO"}
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {accessResult.tipo} registrado
                </span>
              </div>

              <p className={cn(
                "font-bold text-xs px-2",
                accessResult.success ? "text-green-750" : "text-red-750"
              )}>
                {accessResult.message}
              </p>

              {accessResult.success && accessResult.socio && (
                <div className="pt-2 border-t border-green-200 w-full text-left space-y-1 text-[10px] text-green-800">
                  <div><span className="font-bold">Socio:</span> {accessResult.socio.nombre}</div>
                  <div><span className="font-bold">Categoría:</span> {accessResult.socio.categoria}</div>
                  {accessResult.socio.vinculo && <div><span className="font-bold">Vínculo:</span> {accessResult.socio.vinculo}</div>}
                  <div><span className="font-bold">Puntos:</span> {accessResult.socio.puntos} pts</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Access Log (2/3 width) */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-gray-400" />
            Registro de Accesos en Tiempo Real
          </CardTitle>
          <CardDescription className="text-[10px]">Listado de ingresos y egresos recientes al Polideportivo.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                  <th className="py-2.5 px-6">DNI</th>
                  <th className="py-2.5 px-6">NOMBRE Y CATEGORÍA</th>
                  <th className="py-2.5 px-6">TIPO</th>
                  <th className="py-2.5 px-6">FECHA / HORA</th>
                  <th className="py-2.5 px-6">RESULTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/20">
                    <td className="py-3 px-6 text-gray-900 font-bold">{log.dni}</td>
                    <td className="py-3 px-6 space-y-0.5">
                      <div className="font-bold text-gray-950">{log.nombre}</div>
                      <div className="text-[10px] text-gray-400 font-normal">Membresía: {log.categoria}</div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={cn(
                        "font-bold",
                        log.tipo === 'Ingreso' ? "text-blue-600" : "text-purple-600"
                      )}>
                        {log.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-500 font-normal">{log.fechaHora}</td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <Badge
                          variant={log.resultado === 'Permitido' ? 'success' : 'destructive'}
                          className="text-[9px] font-bold px-2 py-0.5"
                        >
                          {log.resultado}
                        </Badge>
                        {log.motivo && (
                          <span className="text-[9px] text-red-500 font-normal max-w-xs leading-tight">
                            {log.motivo}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AccesosPage;
