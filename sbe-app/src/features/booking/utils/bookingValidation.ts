/**
 * Utilidades y validaciones de negocio para reservas e instalaciones (SYSBE).
 * 
 * Reglas de negocio:
 * 1. Anticipación mínima de 48 horas corridas (ahora + 48 hs).
 * 2. Anticipación máxima de 2 meses corridos (ahora + 2 meses, contemplando fecha y hora exacta).
 * 3. Disponibilidad otorgada por el backend (bloque.disponible == true).
 */

/**
 * Devuelve la fecha y hora exacta de corte para la anticipación mínima (ahora + 48 horas).
 */
export function calcMin48h(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 48);
  return d;
}

/**
 * Devuelve la fecha y hora máxima permitida (ahora + 2 meses, respetando hora actual).
 */
export function calcMax2Months(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d;
}

/**
 * Convierte un Date a string formato "YYYY-MM-DD" en tiempo local.
 */
export function dateToLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Devuelve la fecha más temprana sugerida para reservar (hoy + 2 días).
 */
export function getDefaultBookingDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return dateToLocalISO(d);
}

/**
 * Determina si un bloque horario específico infringe la regla de las 48h de anticipación.
 */
export function isBloqueWithin48h(
  fechaISO: string,
  horaInicio: string,
  min48h: Date = calcMin48h()
): boolean {
  if (!fechaISO || !horaInicio) return true;
  const [y, mo, d] = fechaISO.split("-").map(Number);
  const [h, m] = horaInicio.split(":").map(Number);
  const bloqueDate = new Date(y, mo - 1, d, h || 0, m || 0, 0);
  return bloqueDate.getTime() < min48h.getTime();
}

/**
 * Determina si un bloque horario específico excede el límite máximo de 2 meses,
 * CONTEMPLANDO FECHA Y HORA EXACTA.
 */
export function isBloqueBeyond2Months(
  fechaISO: string,
  horaInicio: string,
  max2Months: Date = calcMax2Months()
): boolean {
  if (!fechaISO || !horaInicio) return false;
  const [y, mo, d] = fechaISO.split("-").map(Number);
  const [h, m] = horaInicio.split(":").map(Number);
  const bloqueDate = new Date(y, mo - 1, d, h || 0, m || 0, 0);
  return bloqueDate.getTime() > max2Months.getTime();
}

/**
 * Determina si una fecha está completamente fuera del límite máximo de 2 meses.
 */
export function isDateBeyond2Months(
  fechaISO: string,
  max2Months: Date = calcMax2Months()
): boolean {
  if (!fechaISO) return true;
  const [y, mo, d] = fechaISO.split("-").map(Number);
  // Si las 00:00:00 de ese día ya superan el límite de 2 meses
  const dateObj = new Date(y, mo - 1, d, 0, 0, 0);
  return dateObj.getTime() > max2Months.getTime();
}

/**
 * Formatea una hora tipo "08:00:00" o "08:00" a "08:00".
 */
export function formatHora(hora: string | undefined): string {
  if (!hora) return "";
  const parts = hora.split(":");
  return `${parts[0].padStart(2, "0")}:${(parts[1] || "00").padStart(2, "0")}`;
}

/**
 * Estructura de un día para el selector de fechas.
 */
export interface SelectableDay {
  iso: string;
  dayName: string;
  dayNum: string;
  monthName: string;
  isFullyPastOrUnder48h: boolean;
  isBeyondMax: boolean;
}

/**
 * Genera la lista de días seleccionables a partir de hoy (hasta 65 días para cubrir 2 meses completos).
 */
export function generateSelectableDays(count: number = 65): SelectableDay[] {
  const days: SelectableDay[] = [];
  const min48h = calcMin48h();
  const max2m = calcMax2Months();

  const dayNamesShort = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const monthNamesShort = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  const current = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(current);
    d.setDate(current.getDate() + i);

    const iso = dateToLocalISO(d);

    // Ver si el final de este día (23:59:59) todavía está antes de las 48h
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    const isFullyPastOrUnder48h = endOfDay.getTime() < min48h.getTime();

    // Ver si el inicio de este día (00:00:00) ya supera los 2 meses
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const isBeyondMax = startOfDay.getTime() > max2m.getTime();

    days.push({
      iso,
      dayName: dayNamesShort[d.getDay()],
      dayNum: String(d.getDate()),
      monthName: monthNamesShort[d.getMonth()],
      isFullyPastOrUnder48h,
      isBeyondMax,
    });
  }

  return days;
}
