/**
 * Paleta de colores oficial institucional UNSE para gráficos y visualizaciones.
 * Secuencia estricta de gráficos oficial: --chart-1 a --chart-6 en orden.
 */
export const UNSE_CHART_COLORS = [
  '#8F0015', // chart-1: Bordó institucional UNSE principal
  '#D97706', // chart-2: Ámbar / Dorado UNSE
  '#1E3A8A', // chart-3: Azul institucional
  '#059669', // chart-4: Verde institucional
  '#7C3AED', // chart-5: Púrpura / Violeta
  '#0284C7', // chart-6: Celeste / Cyan
] as const;

export type UnseChartColor = (typeof UNSE_CHART_COLORS)[number];

export const CHART_VARIABLES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;
