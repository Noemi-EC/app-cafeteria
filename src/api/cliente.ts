import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const PUERTO_API = 3000;

function resolveBaseUrl(): string {
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
