import type { Rol } from "@/api/auth";

export function rutaPorRol(rol: Rol | null): "/clientes" | "/inicio" {
  // ADMIN entra por el lado del barista: no tiene perfil de cliente, así
  // que la pantalla de inicio del cliente fallaría al cargarlo.
  return rol === "BARISTA" || rol === "ADMIN" ? "/clientes" : "/inicio";
}
