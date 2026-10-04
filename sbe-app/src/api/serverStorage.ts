/**
 * Módulo para persistir y leer la IP/URL del servidor configurada por el usuario.
 *
 * Útil para demos y prototipos donde el backend corre en la misma red WiFi
 * y la IP puede cambiar según el entorno.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@sbe/server_url";

/** Puerto por defecto del backend Spring Boot */
const DEFAULT_PORT = "8080";

/** Prefijo de ruta de la API */
const API_PATH = "/api";

/**
 * URL por defecto que se usa si el usuario nunca configuró una personalizada.
 * Toma el valor de la variable de entorno o usa el hardcodeado.
 */
const DEFAULT_URL: string =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.10:8080/api";

/**
 * Construye la URL completa a partir de una IP.
 * Ejemplo: "192.168.1.5" → "http://192.168.1.5:8080/api"
 */
export function buildApiUrl(ip: string, port: string = DEFAULT_PORT): string {
  const cleanIp = ip.trim().replace(/\/+$/, "");
  // Si el usuario introdujo una URL completa, usarla tal cual
  if (cleanIp.startsWith("http://") || cleanIp.startsWith("https://")) {
    return cleanIp.endsWith(API_PATH) ? cleanIp : `${cleanIp}${API_PATH}`;
  }
  return `http://${cleanIp}:${port}${API_PATH}`;
}

/**
 * Guarda la URL del servidor configurada.
 */
export async function saveServerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, url);
}

/**
 * Lee la URL del servidor guardada; devuelve la por defecto si no hay ninguna.
 */
export async function getServerUrl(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

/**
 * Elimina la URL personalizada y vuelve a la por defecto.
 */
export async function clearServerUrl(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Devuelve la URL por defecto (sin leer de AsyncStorage).
 */
export function getDefaultUrl(): string {
  return DEFAULT_URL;
}
