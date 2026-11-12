import { obtenerSesion } from "@/auth/almacenamiento";
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const PUERTO_API = 3000;

// Se exporta porque el WebSocket necesita apuntar al mismo servidor.
export function resolveBaseUrl(): string {
  const ip = Constants.expoConfig?.hostUri?.split(":")[0];
  if (ip) return `http://${ip}:${PUERTO_API}`;

  return Platform.OS === "android"
    ? `http://10.0.2.2:${PUERTO_API}`
    : `http://localhost:${PUERTO_API}`;
}

export const cliente = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR DE PETICIÓN: antes de que salga cualquier llamada, busca el
// token guardado y lo adjunta como "Authorization: Bearer ...".
// Gracias a esto ninguna pantalla tiene que acordarse de mandar el token.
cliente.interceptors.request.use(async (config) => {
  const sesion = await obtenerSesion();
  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }
  return config;
});

// INTERCEPTOR DE RESPUESTA: convierte cualquier fallo en un Error con un
// mensaje legible, para que la pantalla solo haga catch (e) { ...e.message }.
cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje =
      error.response?.data?.message ??
      (error.code === "ECONNABORTED"
        ? "El servidor tardó demasiado en responder"
        : "No se pudo conectar con el servidor");

    return Promise.reject(new Error(mensaje));
  },
);
