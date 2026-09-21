import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Dumbbell,
  CalendarDays,
  ArrowUpRight,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { getSocios, type SocioResponseDto } from '../../socios/services/sociosApi';
import { getUsuarios, type UsuarioResponseDto } from '../../usuarios/services/usuariosApi';
import { getInstalaciones, type InstalacionResponseDto } from '../../instalaciones/services/instalacionesApi';
import { getAllReservas, type ReservaResponseDto } from '../../reservas/services/reservasApi';

export function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [socios, setSocios] = useState<SocioResponseDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponseDto[]>([]);
  const [instalaciones, setInstalaciones] = useState<InstalacionResponseDto[]>([]);
  const [reservas, setReservas] = useState<ReservaResponseDto[]>([]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getSocios().catch(() => [] as SocioResponseDto[]),
      getUsuarios().catch(() => [] as UsuarioResponseDto[]),
      getInstalaciones().catch(() => [] as InstalacionResponseDto[]),
    ])
      .then(async ([sociosData, usuariosData, instalacionesData]) => {
        if (isCancelled) return;
        setSocios(sociosData);
        setUsuarios(usuariosData);
        setInstalaciones(instalacionesData);

        // Cargar reservas iterando por usuario
        const userIds = usuariosData.map((u) => u.id);
        const reservasData = await getAllReservas(userIds);
        if (!isCancelled) setReservas(reservasData);
      })
      .catch((err) => {
        if (!isCancelled) setError((err as Error).message);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
    for (let i = 0; i < (name || '').length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-8 select-none">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>No se pudieron sincronizar todos los datos del backend: {error}</span>
        </div>
      )}

      {/* Metrics Grid con Datos Reales del Backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Socios Activos */}
        <Card
          onClick={() => navigate('/socios')}
          className="hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Socios activos</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-brand-red" /> : socios.length}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                <span>Registrados en el sistema</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-brand-red group-hover:scale-105 transition-transform">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Usuarios Registrados */}
        <Card
          onClick={() => navigate('/usuarios')}
          className="hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Usuarios del sistema</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-brand-red" /> : usuarios.length}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                <span>Cuentas con credenciales</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Instalaciones Deportivas */}
        <Card
          onClick={() => navigate('/instalaciones')}
          className="hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Instalaciones activas</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-brand-red" /> : instalaciones.length}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                <span>Canchas y espacios habilitados</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Dumbbell className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Reservas */}
        <Card
          onClick={() => navigate('/reservas')}
          className="hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400">Reservas</span>
              <h3 className="text-2xl font-bold text-gray-900 leading-none">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-brand-red" /> : reservas.length}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                <span>Turnos registrados</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <CalendarDays className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Instalaciones Reales & Panel de Socios/Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Instalaciones reales del backend (2/3 width) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                Instalaciones Deportivas
              </CardTitle>
              <p className="text-xs text-gray-400 font-normal mt-0.5">
                Espacios deportivos gestionados en el Polideportivo UNSE
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/instalaciones')}
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
                    <th className="py-3 px-6">ESPACIO</th>
                    <th className="py-3 px-6">DURACIÓN</th>
                    <th className="py-3 px-6">PRECIO BASE</th>
                    <th className="py-3 px-6 text-right">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-red mb-1" />
                        Cargando instalaciones...
                      </td>
                    </tr>
                  )}
                  {!loading && instalaciones.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No hay instalaciones registradas en el backend.
                      </td>
                    </tr>
                  )}
                  {instalaciones.slice(0, 5).map((inst) => (
                    <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-gray-950">{inst.nombre}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">{inst.descripcion || 'Sin descripción'}</div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600 font-semibold">
                        {inst.duracionMinutos} min
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-900">
                        ${Number(inst.precioBase).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Badge
                          variant={inst.estado === 'Habilitada' ? 'success' : inst.estado === 'Mantenimiento' ? 'warning' : 'destructive'}
                          className="text-[10px] font-bold px-2 py-0.5 shadow-2xs"
                        >
                          {inst.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Socios Recientes & Estado de Módulos (1/3 width) */}
        <div className="space-y-6">
          {/* Socios Activos del Backend */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">
                Socios Recientes
              </CardTitle>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/socios')}
                className="text-xs font-bold text-brand-red p-0 h-auto cursor-pointer"
              >
                Ver socios
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100 text-xs">
                {loading && (
                  <li className="p-4 text-center text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-brand-red mb-1" />
                    Cargando...
                  </li>
                )}
                {!loading && socios.length === 0 && (
                  <li className="p-4 text-center text-gray-400">
                    No hay socios registrados en el backend.
                  </li>
                )}
                {socios.slice(0, 4).map((socio) => (
                  <li key={socio.dni} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarBg(socio.nombreCompleto)} shadow-2xs`}>
                        {getInitials(socio.nombreCompleto)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-950 text-xs">{socio.nombreCompleto}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span>{socio.email}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-brand-red border border-red-100">
                      {socio.tipoSocio || 'Socio'}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Estado de Módulos del Sistema */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">
                Estado de Módulos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Gestión de Usuarios</span>
                <Badge variant="success" className="text-[10px]">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Gestión de Socios</span>
                <Badge variant="success" className="text-[10px]">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Gestión de Instalaciones</span>
                <Badge variant="success" className="text-[10px]">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Reservas y Turnos</span>
                <Badge variant="warning" className="text-[10px]">En progreso</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Finanzas y Reportes</span>
                <Badge variant="warning" className="text-[10px]">En progreso</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Encuestas y Empleados</span>
                <Badge variant="warning" className="text-[10px]">En progreso</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
