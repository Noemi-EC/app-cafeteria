import { obtenerSesion } from "@/auth/almacenamiento";
import { io, type Socket } from "socket.io-client";
import { resolveBaseUrl } from "./cliente";

/**
 * Un solo socket para toda la app.
 *
 * A diferencia de las llamadas HTTP, que nacen y mueren en cada petición,
 * la conexión en tiempo real es una sola y se mantiene abierta. Por eso se
 * guarda aquí fuera del componente: si cada pantalla abriera la suya,
 * tendríamos cuatro conexiones contra el mismo servidor.
 */
let socket: Socket | null = null;

export async function conectarSocket(): Promise<Socket | null> {
  const sesion = await obtenerSesion();
  if (!sesion?.token) return null;

  if (socket?.connected) return socket;

  // El token viaja en el handshake; el gateway lo verifica antes de
  // dejar entrar al socket a ninguna sala.
  socket = io(resolveBaseUrl(), {
    transports: ["websocket"],
    auth: { token: sesion.token },
    reconnection: true,
  });

  return socket;
}

/** Se llama al cerrar sesión: el token viejo ya no debe seguir conectado. */
export function desconectarSocket(): void {
  socket?.disconnect();
  socket = null;
}
