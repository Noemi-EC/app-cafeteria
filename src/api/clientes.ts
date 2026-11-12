import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

// Un cliente visto por el barista. El nivel y el progreso vienen
// calculados del backend, igual que en el perfil.
export interface ClienteDelLocal {
  usuarioId: string;
  nombre: string;
  contacto: string | null;
  codigoQr: string;
  totalVisitas: number;
  productoFavorito: string | null;
  activo: boolean;
  nivel: string;
  siguienteNivel: string | null;
  visitasParaSiguiente: number;
  progreso: number;
}

/** Gestión de usuarios: la lista del local, activos e inactivos. */
export async function obtenerClientes(): Promise<ClienteDelLocal[]> {
  const respuesta =
    await cliente.get<RespuestaApi<ClienteDelLocal[]>>("/clientes");
  return respuesta.data.data;
}

/** Eliminar (lógico): desactiva la cuenta del cliente. */
export async function desactivarCliente(
  usuarioId: string,
): Promise<ClienteDelLocal> {
  const respuesta = await cliente.delete<RespuestaApi<ClienteDelLocal>>(
    `/clientes/${usuarioId}`,
  );
  return respuesta.data.data;
}

/** Restauración de usuarios: vuelve a activar la cuenta. */
export async function restaurarCliente(
  usuarioId: string,
): Promise<ClienteDelLocal> {
  const respuesta = await cliente.patch<RespuestaApi<ClienteDelLocal>>(
    `/clientes/${usuarioId}/restaurar`,
    {},
  );
  return respuesta.data.data;
}
