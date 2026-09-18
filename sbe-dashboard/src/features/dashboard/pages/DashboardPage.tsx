import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  CreditCard,
  ArrowUpDown,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useData, type Servicio } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { socios, reservas, pagos, servicios, updateServicioEstado } = useData();

  // --- DYNAMIC METRICS ---
  // Base numbers from the screenshot, made dynamic based on state changes
  const activeSociosCount = 279 + socios.filter(s => s.estado === 'Activo' && s.categoria !== 'No socio').length;
  
  const totalReservasCount = 626 + reservas.filter(r => r.estado !== 'Cancelado').length;
  
  // Calculate total earnings. Base is $170,000 + dynamic payments in state
  const baseEarnings = 170000;
  const dynamicEarnings = pagos
    .filter(p => p.estado === 'Aprobado')
    .reduce((sum, p) => sum + p.monto, 0);
  const totalEarnings = baseEarnings + dynamicEarnings;

  // Entries today: base 45 + new reservations for "today"
  const entriesToday = 45 + reservas.filter(r => r.fecha === '2026-06-29').length;

  // --- CALENDAR OCCUPANCY DATA ---
  // Recreating the exact grid from page 65: days 26 to 15
  const occupancyDays = [
    { day: '26', level: 'alta', label: 'L' },
    { day: '27', level: 'alta', label: 'M' },
    { day: '28', level: 'alta', label: 'X' },
    { day: '29', level: 'alta', label: 'J' },
    { day: '30', level: 'alta', label: 'V' },
    { day: '31', level: 'alta', label: 'S' },
    { day: '1', level: 'baja', label: 'D' },
    
    { day: '2', level: 'media', label: 'L' },
    { day: '3', level: 'baja', label: 'M' },
    { day: '4', level: 'baja', label: 'X' },
    { day: '5', level: 'media', label: 'J' },
    { day: '6', level: 'media', label: 'V' },
    { day: '7', level: 'media', label: 'S' },
    { day: '8', level: 'baja', label: 'D' },
    
    { day: '9', level: 'media', label: 'L' },
    { day: '10', level: 'media', label: 'M' },
    { day: '11', level: 'alta', label: 'X' },
    { day: '12', level: 'alta', label: 'J' },
    { day: '13', level: 'alta', label: 'V' },
    { day: '14', level: 'alta', label: 'S' },
    { day: '15', level: 'baja', label: 'D' }
  ];

  const getHeatmapColor = (level: string) => {
    switch (level) {
      case 'alta':
        return 'bg-red-800 text-white hover:bg-red-900'; // Dark red
      case 'media':
        return 'bg-red-500 text-white hover:bg-red-600'; // Medium red
      case 'baja':
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-200'; // Light pink
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper to assign nice background colors to user avatars
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-indigo-100 text-indigo-700',
      'bg-purple-100 text-purple-700'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-8 select-none">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Socios activos */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Socios activos</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">{activeSociosCount}</h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>12 este mes</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Reservas */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Reservas (mes)</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">{totalReservasCount}</h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>8% vs anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Ingresos */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Ingresos (mes)</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">
                ${totalEarnings.toLocaleString('es-AR')}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>5% vs anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Ingresos hoy (Accesos) */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Ingresos hoy</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">{entriesToday}</h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>3 vs ayer</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowUpDown className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Bookings & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Reservations (2/3 width) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Reservas recientes</CardTitle>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/reservas')}
              className="text-xs font-bold text-brand-red hover:text-brand-red/80 flex items-center gap-1 cursor-pointer"
            >
              Ver todas
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                    <th className="py-3 px-6">USUARIO</th>
                    <th className="py-3 px-6">SERVICIO</th>
                    <th className="py-3 px-6">FECHA</th>
                    <th className="py-3 px-6 font-semibold">TIPO</th>
                    <th className="py-3 px-6">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {reservas.slice(0, 5).map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarBg(reserva.usuarioNombre)} shadow-xs`}>
                          {getInitials(reserva.usuarioNombre)}
                        </div>
                        <span className="font-semibold text-gray-950">{reserva.usuarioNombre}</span>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600">{reserva.servicioNombre}</td>
                      <td className="py-3.5 px-6 text-gray-500 font-normal">
                        {reserva.fecha.split('-').reverse().slice(0, 2).join('/')} {reserva.horario} hs
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            reserva.tipoUsuario === 'Interno'
                              ? "bg-red-50 text-red-700 border-red-200"
                              : reserva.tipoUsuario === 'Externo'
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          )}
                        >
                          {reserva.tipoUsuario}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge
                          variant={
                            reserva.estado === 'Pagado'
                              ? 'success'
                              : reserva.estado === 'Pendiente'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
                        >
                          {reserva.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Heatmap & Service Status (1/3 width) */}
        <div className="space-y-8">
          {/* Weekly Occupancy Heatmap */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-900">Ocupación semanal</CardTitle>
              <span className="text-xs font-semibold text-brand-red bg-red-50 px-2 py-0.5 rounded-md">
                Junio 2026
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Heatmap Grid */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {/* Column Headers */}
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <span key={i} className="text-[10px] font-bold text-gray-400">
                    {d}
                  </span>
                ))}

                {/* Day Squares */}
                {occupancyDays.map((d, i) => (
                  <div
                    key={i}
                    title={`Día ${d.day} - Ocupación ${d.level}`}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all shadow-3xs cursor-default select-none",
                      getHeatmapColor(d.level)
                    )}
                  >
                    {d.day}
                  </div>
                ))}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] font-semibold text-gray-400">
                <span>Baja</span>
                <div className="flex gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-xs bg-red-100" />
                  <div className="w-3.5 h-3.5 rounded-xs bg-red-500" />
                  <div className="w-3.5 h-3.5 rounded-xs bg-red-800" />
                </div>
                <span>Alta</span>
              </div>
            </CardContent>
          </Card>

          {/* Service Status List */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">Estado de servicios</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {servicios.slice(0, 4).map((servicio) => (
                  <li key={servicio.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                    <span className="text-gray-900 font-semibold">{servicio.nombre}</span>
                    <div className="flex items-center gap-3">
                      {/* Dropdown to change status directly (premium interactive touch) */}
                      <select
                        value={servicio.estado}
                        onChange={(e) => updateServicioEstado(servicio.id, e.target.value as Servicio['estado'])}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border bg-white focus:outline-none cursor-pointer shadow-3xs transition-all",
                          servicio.estado === 'Habilitada'
                            ? "text-green-700 border-green-200 bg-green-50/50"
                            : servicio.estado === 'Mantenimiento'
                            ? "text-amber-700 border-amber-200 bg-amber-50/50"
                            : "text-red-700 border-red-200 bg-red-50/50"
                        )}
                      >
                        <option value="Habilitada">Habilitada</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Deshabilitada">Deshabilitada</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;
