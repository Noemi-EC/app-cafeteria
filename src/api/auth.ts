import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

export type Rol = "CLIENTE" | "BARISTA" | "ADMIN";

export interface SesionIniciada {
  access_token: string;
  rol: Rol;
}

export async function login(
  contacto: string,
  password: string,
): Promise<SesionIniciada> {
  const respuesta = await cliente.post<RespuestaApi<SesionIniciada>>(
    "/auth/login",
    { contacto, password },
  );

  return respuesta.data.data;
}

export async function registro(
  nombre: string,
  contacto: string,
  password: string,
  productoFavorito: string | null,
): Promise<SesionIniciada> {
  const respuesta = await cliente.post<RespuestaApi<SesionIniciada>>(
    "/auth/registro",
    { nombre, contacto, password, productoFavorito },
  );

  return respuesta.data.data;
}
