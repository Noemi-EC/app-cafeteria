import type { Rol } from "@/api/auth";

export function rutaPorRol(rol: Rol | null): "/clientes" | "/inicio" {
  return rol === "BARISTA" ? "/clientes" : "/inicio";
}
