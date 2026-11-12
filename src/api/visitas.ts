import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

// Una visita tal como la devuelve el backend.
export interface Visita {
  id: string;
  nota: string | null;
  registradaEn: string;
  anulada: boolean;
  cliente: string | null;
}

// Resumen del cliente después de registrar o anular una visita:
// el nivel y el progreso ya vienen calculados del servidor.
export interface ResumenCliente {
  id: string;
  nombre: string;
  totalVisitas: number;
  nivel: string;
  siguienteNivel: string | null;
  visitasParaSiguiente: number;
  progreso: number;
}

export interface ResultadoRegistro {
  visita: Visita;
  cliente: ResumenCliente;
  subioDeNivel: boolean;
}

/** Registrar datos — solo barista o admin. */
export async function registrarVisita(
  codigoQr: string,
  nota?: string,
): Promise<ResultadoRegistro> {
  const respuesta = await cliente.post<RespuestaApi<ResultadoRegistro>>(
    "/visitas",
    { codigoQr, ...(nota ? { nota } : {}) },
  );
  return respuesta.data.data;
}

/** Consultar información — el historial del cliente que tiene la sesión. */
export async function obtenerMisVisitas(): Promise<Visita[]> {
  const respuesta = await cliente.get<RespuestaApi<Visita[]>>("/visitas/mias");
  return respuesta.data.data;
}

/** Consultar información — las últimas visitas del local, para el barista. */
export async function obtenerVisitasDelLocal(): Promise<Visita[]> {
  const respuesta = await cliente.get<RespuestaApi<Visita[]>>("/visitas");
  return respuesta.data.data;
}

/** Actualizar registros — corregir la nota de una visita. */
export async function actualizarVisita(
  id: string,
  nota: string,
): Promise<Visita> {
  const respuesta = await cliente.patch<RespuestaApi<Visita>>(
    `/visitas/${id}`,
    { nota },
  );
  return respuesta.data.data;
}

/** Eliminar registros — anula la visita (borrado lógico). */
export async function anularVisita(
  id: string,
): Promise<{ visita: Visita; cliente: ResumenCliente }> {
  const respuesta = await cliente.delete<
    RespuestaApi<{ visita: Visita; cliente: ResumenCliente }>
  >(`/visitas/${id}`);
  return respuesta.data.data;
}
