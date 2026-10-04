import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import { UNSE_CHART_COLORS } from '../../../lib/chartColors';

interface ChartItem {
  id: string;
  label: string;
  value: number;
  porcentaje: number;
  colorVar: string;
  hex: string;
}

export function DashboardCharts() {
  // Secuencia estricta de gráficos oficial: --chart-1 a --chart-6 en orden
  const data: ChartItem[] = [
    {
      id: 'chart-1',
      label: 'Canchas Fútbol 11 / 7',
      value: 142,
      porcentaje: 32,
      colorVar: 'var(--chart-1)',
      hex: UNSE_CHART_COLORS[0], // #8F0015
    },
    {
      id: 'chart-2',
      label: 'Gimnasio & Musculación',
      value: 108,
      porcentaje: 24,
      colorVar: 'var(--chart-2)',
      hex: UNSE_CHART_COLORS[1], // #2B6CB0
    },
    {
      id: 'chart-3',
      label: 'Básquet & Vóley (Polideportivo)',
      value: 78,
      porcentaje: 18,
      colorVar: 'var(--chart-3)',
      hex: UNSE_CHART_COLORS[2], // #E0A100
    },
    {
      id: 'chart-4',
      label: 'Pista de Atletismo',
      value: 54,
      porcentaje: 12,
      colorVar: 'var(--chart-4)',
      hex: UNSE_CHART_COLORS[3], // #2E7D5B
    },
    {
      id: 'chart-5',
      label: 'Salón de Usos Múltiples (SUM)',
      value: 36,
      porcentaje: 8,
      colorVar: 'var(--chart-5)',
      hex: UNSE_CHART_COLORS[4], // #6B7280
    },
    {
      id: 'chart-6',
      label: 'Pádel & Espacios Recreativos',
      value: 27,
      porcentaje: 6,
      colorVar: 'var(--chart-6)',
      hex: UNSE_CHART_COLORS[5], // #D9480F
    },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="shadow-xs border-gray-200 bg-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-unse-700" />
            <CardTitle className="text-sm font-bold text-ink">
              Distribución de Demanda por Espacio Deportivo
            </CardTitle>
          </div>
          <p className="text-xs text-gray-700 mt-0.5">
            Turnos y ocupación de instalaciones (Paleta oficial UNSE --chart-1 a --chart-6)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 bg-bg px-2.5 py-1 rounded-full border border-gray-200">
          <TrendingUp className="h-3 w-3 text-unse-700" />
          <span>{total} turnos este mes</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Barra de Distribución Proporcional Continua */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700">Ocupación Relativa (%)</span>
            <span className="text-[11px] text-gray-500">100% capacidad programada</span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden flex bg-gray-200 shadow-inner">
            {data.map((item) => (
              <div
                key={item.id}
                style={{
                  width: `${item.porcentaje}%`,
                  backgroundColor: item.colorVar,
                }}
                className="h-full transition-all duration-300 hover:opacity-90 relative group cursor-pointer"
                title={`${item.label}: ${item.porcentaje}% (${item.value} reservas)`}
              />
            ))}
          </div>
        </div>

        {/* Grilla con la leyenda de colores oficiales en orden 1 a 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {data.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-bg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Indicador de Color de la Serie */}
                <div
                  className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs ring-1 ring-black/5"
                  style={{ backgroundColor: item.colorVar }}
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-ink truncate leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    Serie --chart-{index + 1} ({item.hex})
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className="text-xs font-bold text-ink">{item.porcentaje}%</span>
                <span className="text-[10px] text-gray-500 block">{item.value} turnos</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardCharts;
