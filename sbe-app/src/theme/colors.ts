/**
 * Paleta de colores del Sistema de Bienestar Estudiantil (SBE) - UNSE.
 * Centralizar aquí todos los colores evita hardcodear valores en los componentes.
 */
export const Colors = {
  // ── Colores Primarios ──────────────────────────────────────────────────────
  primary: "#8B0000",        // Rojo institucional UNSE
  primaryDark: "#6B0000",    // Rojo oscuro (pressed state)
  primaryLight: "#B22222",   // Rojo claro (hover / variante)

  // ── Colores de Acento ──────────────────────────────────────────────────────
  accent: "#C8A217",         // Dorado / Ocre (puntos, badges)
  accentLight: "#F0C842",    // Dorado claro

  // ── Colores de Fondo ──────────────────────────────────────────────────────
  background: "#F7F7F9",     // Fondo general
  surface: "#FFFFFF",        // Fondo de tarjetas
  surfaceElevated: "#F0F0F5",// Fondo elevado / secciones

  // ── Colores de Texto ──────────────────────────────────────────────────────
  textPrimary: "#1A1A2E",    // Texto principal
  textSecondary: "#6B7280",  // Texto secundario
  textDisabled: "#9CA3AF",   // Texto deshabilitado
  textOnPrimary: "#FFFFFF",  // Texto sobre fondo primario (blanco)
  textOnAccent: "#1A1A2E",   // Texto sobre acento (oscuro)

  // ── Colores de Estado ──────────────────────────────────────────────────────
  success: "#16A34A",        // Verde éxito
  successLight: "#DCFCE7",   // Fondo verde suave
  warning: "#D97706",        // Naranja advertencia
  warningLight: "#FEF3C7",   // Fondo naranja suave
  error: "#DC2626",          // Rojo error
  errorLight: "#FEE2E2",     // Fondo rojo suave
  info: "#2563EB",           // Azul informativo

  // ── Colores de Borde y Separadores ────────────────────────────────────────
  border: "#E5E7EB",         // Borde genérico
  borderFocus: "#8B0000",    // Borde activo (primario)
  separator: "#F3F4F6",      // Línea separadora

  // ── Colores de Navegación ──────────────────────────────────────────────────
  tabBar: "#FFFFFF",         // Fondo de la barra de tabs
  tabBarActive: "#8B0000",   // Color tab activo
  tabBarInactive: "#9CA3AF", // Color tab inactivo

  // ── Colores de Horarios ────────────────────────────────────────────────────
  slotAvailable: "#FFFFFF",       // Horario disponible (fondo)
  slotAvailableBorder: "#E5E7EB", // Horario disponible (borde)
  slotSelected: "#8B0000",        // Horario seleccionado (fondo)
  slotSelectedText: "#FFFFFF",    // Horario seleccionado (texto)
  slotDisabled: "#F3F4F6",        // Horario no disponible (fondo)
  slotDisabledText: "#9CA3AF",    // Horario no disponible (texto)

  // ── Transparencias ────────────────────────────────────────────────────────
  overlay: "rgba(0, 0, 0, 0.5)",
  primaryTransparent: "rgba(139, 0, 0, 0.08)",
} as const;

export type ColorKey = keyof typeof Colors;
