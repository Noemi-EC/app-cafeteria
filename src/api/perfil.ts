import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

// Lo que devuelve GET /perfil. El nivel y el progreso los calcula el
// backend, así la app solo pinta: no duplica reglas de negocio.
export interface Perfil {
  id: string;
  nombre: string;
  contacto: string | null;
  codigoQr: string; // el código que el barista registra para sumar la visita
  productoFavorito: string | null;
  totalVisitas: number;
  fotoUrl: string | null;
  notificacionesActivas: boolean;
  nivel: string;
  siguienteNivel: string | null;
  visitasParaSiguiente: number;
  progreso: number; // 0 a 1
}

export interface CambiosPerfil {
  nombre?: string;
  productoFavorito?: string;
  notificacionesActivas?: boolean;
}

export async function obtenerPerfil(): Promise<Perfil> {
  const respuesta = await cliente.get<RespuestaApi<Perfil>>("/perfil");
  return respuesta.data.data;
}

export async function actualizarPerfil(
  cambios: CambiosPerfil,
): Promise<Perfil> {
  const respuesta = await cliente.patch<RespuestaApi<Perfil>>(
    "/perfil",
    cambios,
  );
  return respuesta.data.data;
}

export interface CambioPassword {
  passwordActual: string;
  passwordNueva: string;
}

export async function cambiarPassword(
  datos: CambioPassword,
): Promise<{ actualizada: boolean }> {
  const respuesta = await cliente.patch<RespuestaApi<{ actualizada: boolean }>>(
    "/perfil/password",
    datos,
  );
  return respuesta.data.data;
}
