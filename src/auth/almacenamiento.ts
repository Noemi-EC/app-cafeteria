import type { Rol } from "@/api/auth";
import * as SecureStore from "expo-secure-store"; // Guarda la sesión - para ios usa Keychain y para android usa Keystore
import { Platform } from "react-native";

const CLAVE = "raiz_sesion";
const esNativo = Platform.OS !== "web";

export interface SesionGuardada {
  token: string;
  rol: Rol;
}

export async function guardarSesion(sesion: SesionGuardada): Promise<void> {
  const valor = JSON.stringify(sesion);

  try {
    if (esNativo) await SecureStore.setItemAsync(CLAVE, valor);
    else localStorage.setItem(CLAVE, valor);
  } catch (e) {
    console.warn("No se pudo guardar la sesión", e);
  }
}

export async function obtenerSesion(): Promise<SesionGuardada | null> {
  try {
    const valor = esNativo
      ? await SecureStore.getItemAsync(CLAVE)
      : localStorage.getItem(CLAVE);
    return valor ? (JSON.parse(valor) as SesionGuardada) : null;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  try {
    if (esNativo) await SecureStore.deleteItemAsync(CLAVE);
    else localStorage.removeItem(CLAVE);
  } catch {}
}
