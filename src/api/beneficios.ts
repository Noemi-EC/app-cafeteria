import { cliente } from "./cliente";
import type { RespuestaApi } from "./tipos";

export interface BeneficioSugerido {
  beneficio: {
    codigo: string;
    titulo: string;
    producto: string | null;
    motivo: string;
  };
  mensaje: string;
  /** "ia" si lo redactó el modelo; "plantilla" si se usó el texto de respaldo. */
  generadoPor: "ia" | "plantilla";
  modelo: string | null;
}

export async function generarBeneficio(): Promise<BeneficioSugerido> {
  const respuesta = await cliente.post<RespuestaApi<BeneficioSugerido>>(
    "/beneficios/generar",
    {},
  );
  return respuesta.data.data;
}
