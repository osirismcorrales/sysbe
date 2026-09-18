import React, { useState } from 'react';
import { useData, type Pago, type Reserva } from '../../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { CreditCard, Wrench, FileText, Download, Printer, Search, Calendar, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface GastoMantenimiento {
  id: string;
  servicioNombre: string;
  monto: number;
  fecha: string;
  responsable: string;
  observaciones: string;
}

const initialGastos: GastoMantenimiento[] = [
  { id: 'gas-1', servicioNombre: 'Pileta', monto: 18500, fecha: '2026-05-10', responsable: 'Luis Gómez', observaciones: 'Cloro, clarificador y alguicida' },
  { id: 'gas-2', servicioNombre: 'Fútbol 5', monto: 12000, fecha: '2026-05-15', responsable: 'Fabián Ruiz', observaciones: 'Reparación de red del arco norte' },
  { id: 'gas-3', servicioNombre: 'Gimnasio', monto: 25000, fecha: '2026-05-20', responsable: 'MecanoFit', observaciones: 'Mantenimiento preventivo de cintas de correr' },
  { id: 'gas-4', servicioNombre: 'Tenis', monto: 8000, fecha: '2026-05-25', responsable: 'Luis Gómez', observaciones: 'Compra de flejes para la red' }
];

export function FinanzasPage() {
  const { pagos, reservas, socios, servicios } = useData();
  const [activeTab, setActiveTab] = useState<'pagos' | 'mantenimiento' | 'reportes'>('pagos');
  const [gastos, setGastos] = useState<GastoMantenimiento[]>(initialGastos);

  // --- REPORT BUILDER STATES ---
  const [reportType, setReportType] = useState<'pagos' | 'reservas_servicio' | 'reservas_fecha' | 'socios' | 'gastos'>('pagos');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterUserType, setFilterUserType] = useState('all');
  const [generatedReport, setGeneratedReport] = useState<any[] | null>(null);
  const [reportMetadata, setReportMetadata] = useState<{ title: string; columns: string[] } | null>(null);

  // Generate Report Logic (RU-10)
  const handleGenerateReport = () => {
    let data: any[] = [];
    let title = '';
    let columns: string[] = [];

    const dateFilter = (itemDate: string) => {
      if (filterDateFrom && itemDate < filterDateFrom) return false;
      if (filterDateTo && itemDate > filterDateTo) return false;
      return true;
    };

    switch (reportType) {
      case 'pagos':
        title = 'Reporte de Historial de Pagos';
        columns = ['ID Pago', 'Usuario', 'Fecha', 'Monto', 'Método', 'Estado'];
        data = pagos
          .filter(p => dateFilter(p.fecha))
          .map(p => ({
            id: p.id,
            col1: p.usuarioNombre,
            col2: p.fecha.split('-').reverse().join('/'),
            col3: `$${p.monto.toLocaleString('es-AR')}`,
            col4: p.metodo,
            col5: p.estado
          }));
        break;

      case 'reservas_servicio':
        title = 'Reporte de Reservas por Servicio';
        columns = ['Socio', 'Servicio', 'Fecha', 'Horario', 'Tipo', 'Estado'];
        data = reservas
          .filter(r => dateFilter(r.fecha))
          .map(r => ({
            id: r.id,
            col1: r.usuarioNombre,
            col2: r.servicioNombre,
            col3: r.fecha.split('-').reverse().join('/'),
            col4: `${r.horario} hs`,
            col5: r.tipoUsuario,
            col6: r.estado
          }));
        break;

      case 'reservas_fecha':
        title = 'Reporte de Reservas por Fecha';
        columns = ['Fecha', 'Socio', 'Servicio', 'Horario', 'Monto', 'Estado'];
        data = [...reservas]
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
          .filter(r => dateFilter(r.fecha))
          .map(r => ({
            id: r.id,
            col1: r.fecha.split('-').reverse().join('/'),
            col2: r.usuarioNombre,
            col3: r.servicioNombre,
            col4: `${r.horario} hs`,
            col5: `$${r.monto.toLocaleString('es-AR')}`,
            col6: r.estado
          }));
        break;

      case 'socios':
        title = 'Reporte de Socios Activos';
        columns = ['DNI', 'Nombre', 'Email', 'Categoría', 'Vínculo', 'Puntos'];
        data = socios
          .filter(s => s.estado === 'Activo')
          .map(s => ({
            id: s.dni,
            col1: s.nombre,
            col2: s.email,
            col3: s.categoria,
            col4: s.vinculo || 'Ninguno',
            col5: `${s.puntos} pts`
          }));
        break;

      case 'gastos':
        title = 'Reporte de Gastos de Mantenimiento';
        columns = ['ID', 'Servicio', 'Fecha', 'Responsable', 'Detalle', 'Monto'];
        data = gastos
          .filter(g => dateFilter(g.fecha))
          .map(g => ({
            id: g.id,
            col1: g.servicioNombre,
            col2: g.fecha.split('-').reverse().join('/'),
            col3: g.responsable,
            col4: g.observaciones,
            col5: `$${g.monto.toLocaleString('es-AR')}`
          }));
        break;
    }

    setGeneratedReport(data);
    setReportMetadata({ title, columns });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 select-none text-xs">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white p-2 rounded-xl border shadow-2xs gap-2">
        <button
          onClick={() => setActiveTab('pagos')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer",
            activeTab === 'pagos'
              ? "bg-brand-red text-white shadow-xs"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <CreditCard className="h-4.5 w-4.5" />
          Historial de Pagos
        </button>
        
        <button
          onClick={() => setActiveTab('mantenimiento')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer",
            activeTab === 'mantenimiento'
              ? "bg-brand-red text-white shadow-xs"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Wrench className="h-4.5 w-4.5" />
          Gastos de Mantenimiento
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer",
            activeTab === 'reportes'
              ? "bg-brand-red text-white shadow-xs"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <FileText className="h-4.5 w-4.5" />
          Generar Reportes (PDF)
        </button>
      </div>

      {/* Tab 1: Payments List */}
      {activeTab === 'pagos' && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100 bg-white">
            <CardTitle className="text-sm font-bold text-gray-900">Transacciones Recibidas</CardTitle>
            <CardDescription className="text-[10px]">Todos los pagos procesados a través de Mercado Pago.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                    <th className="py-3 px-6">ID PAGO</th>
                    <th className="py-3 px-6">USUARIO / DNI</th>
                    <th className="py-3 px-6">FECHA DE PAGO</th>
                    <th className="py-3 px-6">MONTO</th>
                    <th className="py-3 px-6">FORMA DE PAGO</th>
                    <th className="py-3 px-6">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-400">{pago.id}</td>
                      <td className="py-3.5 px-6 space-y-0.5">
                        <div className="font-bold text-gray-950">{pago.usuarioNombre}</div>
                        <div className="text-[10px] text-gray-400 font-normal">DNI: {pago.usuarioDni}</div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-500 font-normal">
                        {pago.fecha.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-900">${pago.monto.toLocaleString('es-AR')}</td>
                      <td className="py-3.5 px-6 text-gray-500 font-normal">{pago.metodo}</td>
                      <td className="py-3.5 px-6">
                        <Badge
                          variant={pago.estado === 'Aprobado' ? 'success' : 'destructive'}
                          className="text-[10px] font-bold px-2 py-0.5 shadow-3xs"
                        >
                          {pago.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Maintenance Expenses */}
      {activeTab === 'mantenimiento' && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100 bg-white">
            <CardTitle className="text-sm font-bold text-gray-900">Gastos Operativos del Polideportivo</CardTitle>
            <CardDescription className="text-[10px]">Registro de compras, reparaciones y mantenimiento de las instalaciones.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/50">
                    <th className="py-3 px-6">ID GASTO</th>
                    <th className="py-3 px-6">SERVICIO/SECTOR</th>
                    <th className="py-3 px-6">FECHA</th>
                    <th className="py-3 px-6">RESPONSABLE</th>
                    <th className="py-3 px-6">DETALLES / OBSERVACIONES</th>
                    <th className="py-3 px-6">MONTO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {gastos.map((gasto) => (
                    <tr key={gasto.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-400">{gasto.id}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-950">{gasto.servicioNombre}</td>
                      <td className="py-3.5 px-6 text-gray-500 font-normal">
                        {gasto.fecha.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3.5 px-6 text-gray-600 font-semibold">{gasto.responsable}</td>
                      <td className="py-3.5 px-6 text-gray-500 font-normal max-w-xs truncate" title={gasto.observaciones}>
                        {gasto.observaciones}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-red-600">${gasto.monto.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: PDF Report Builder (RU-10) */}
      {activeTab === 'reportes' && (
        <div className="space-y-6 print:m-0 print:p-0">
          {/* Configurator Card (Hide on Print) */}
          <Card className="shadow-xs print:hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-gray-900">Configuración de Reportes Administrativos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Tipo de Reporte</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                  >
                    <option value="pagos">Historial de Pagos (RU-10.1)</option>
                    <option value="reservas_servicio">Reservas por Servicio (RU-10.2)</option>
                    <option value="reservas_fecha">Reservas por Fecha (RU-10.3)</option>
                    <option value="socios">Socios Activos (RU-10.4)</option>
                    <option value="gastos">Gastos de Mantenimiento (RU-10.5)</option>
                  </select>
                </div>

                {/* Date From */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Desde la Fecha</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  />
                </div>

                {/* Date To */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700">Hasta la Fecha</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleGenerateReport}
                  variant="brand"
                  size="sm"
                  className="font-semibold text-xs rounded-lg shadow-xs h-9 cursor-pointer"
                >
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Report Preview */}
          {generatedReport && reportMetadata && (
            <Card className="shadow-md overflow-hidden bg-white border-2 border-gray-100 print:border-0 print:shadow-none">
              {/* Report Header */}
              <CardHeader className="pb-4 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-yellow w-8 h-8 rounded-lg flex flex-col items-center justify-center text-[11px] font-black text-white">
                      SBE
                    </div>
                    <div>
                      <h2 className="text-md font-black text-gray-900 leading-tight">
                        Sistema de Bienestar Estudiantil (SBE) - UNSE
                      </h2>
                      <p className="text-[9px] text-gray-400 font-semibold">
                        Universidad Nacional de Santiago del Estero
                      </p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-brand-red pt-3">
                    {reportMetadata.title}
                  </h3>
                  <p className="text-[9px] text-gray-400 font-semibold">
                    Generado el: {new Date().toLocaleDateString('es-AR')} | Rango:{' '}
                    {filterDateFrom ? filterDateFrom.split('-').reverse().join('/') : 'Inicio'} a{' '}
                    {filterDateTo ? filterDateTo.split('-').reverse().join('/') : 'Fin'}
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 font-bold text-xs h-8 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    Exportar PDF / Imprimir
                  </Button>
                </div>
              </CardHeader>

              {/* Report Table */}
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-gray-800 font-bold bg-gray-100/50 text-[10px]">
                      <th className="py-2.5 px-6 w-28">{reportMetadata.columns[0]}</th>
                      <th className="py-2.5 px-6">{reportMetadata.columns[1]}</th>
                      <th className="py-2.5 px-6">{reportMetadata.columns[2]}</th>
                      <th className="py-2.5 px-6">{reportMetadata.columns[3]}</th>
                      <th className="py-2.5 px-6">{reportMetadata.columns[4]}</th>
                      <th className="py-2.5 px-6">{reportMetadata.columns[5]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-[10px]">
                    {generatedReport.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50/20">
                        <td className="py-2 px-6 text-gray-400 font-bold">{row.id}</td>
                        <td className="py-2 px-6 text-gray-900 font-bold">{row.col1}</td>
                        <td className="py-2 px-6 text-gray-600">{row.col2}</td>
                        <td className="py-2 px-6 text-gray-500 font-medium">{row.col3}</td>
                        <td className="py-2 px-6 text-gray-500 font-medium">{row.col4}</td>
                        <td className="py-2 px-6">
                          {row.col5 === 'Aprobado' || row.col5 === 'Pagado' || row.col5 === 'Habilitada' ? (
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold border border-green-100">
                              {row.col5}
                            </span>
                          ) : row.col5 === 'Pendiente' || row.col5 === 'Mantenimiento' ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-100">
                              {row.col5}
                            </span>
                          ) : (
                            <span className="text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full font-bold border border-gray-100">
                              {row.col5}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {generatedReport.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-400 font-medium">
                          No hay datos en el rango seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
export default FinanzasPage;
