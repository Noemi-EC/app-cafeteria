import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

export interface ResumenLocal {
  generadoEn: string;
  visitas: {
    hoy: number;
    ultimos7Dias: number;
    ultimos30Dias: number;
    promedioDiario: number;
  };
  clientes: {
    total: number;
    activos: number;
    inactivos: number;
    nuevosEstaSemana: number;
    sinVisitas: number;
  };
  porNivel: { nivel: string; desde: number; cantidad: number }[];
  porDia: { fecha: string; cantidad: number }[];
  topClientes: { nombre: string; totalVisitas: number; nivel: string }[];
  productosFavoritos: { producto: string; cantidad: number }[];
}

export async function obtenerResumen(): Promise<ResumenLocal> {
  const respuesta =
    await cliente.get<RespuestaApi<ResumenLocal>>("/reportes/resumen");
  return respuesta.data.data;
}

/**
 * Descarga el reporte en Excel y lo abre con el selector del sistema.
 *
 * Se pide como arraybuffer porque no es JSON: son los bytes del archivo.
 * El token lo adjunta el interceptor de Axios, igual que en cualquier otra
 * petición, así que acá no hay que acordarse de nada.
 */
export async function descargarReporteExcel(): Promise<string> {
  const respuesta = await cliente.get<ArrayBuffer>("/reportes/visitas.xlsx", {
    responseType: "arraybuffer",
  });

  const nombre = `raiz-contigo-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const archivo = new File(Paths.cache, nombre);

  // Si ya se descargó antes en esta sesión, se reemplaza.
  try {
    if (archivo.exists) archivo.delete();
  } catch {}
  try {
    archivo.create();
  } catch {}

  archivo.write(new Uint8Array(respuesta.data));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivo.uri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      UTI: "org.openxmlformats.spreadsheetml.sheet",
      dialogTitle: "Reporte de Raíz Contigo",
    });
  }

  return archivo.uri;
}
