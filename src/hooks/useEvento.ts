import { conectarSocket } from "@/api/socket";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

/**
 * Suscribe la pantalla a un evento del servidor y devuelve si está conectada.
 *
 *   const enVivo = useEvento<Datos>("mi.visita.registrada", (d) => { ... });
 *
 * El callback se guarda en una ref a propósito: si se usara directamente en
 * las dependencias del efecto, la suscripción se cancelaría y se volvería a
 * crear en cada redibujado, porque la función es nueva cada vez.
 */
export function useEvento<T>(
  evento: string,
  alRecibir: (datos: T) => void,
): boolean {
  const [conectado, setConectado] = useState(false);
  const callback = useRef(alRecibir);

  useEffect(() => {
    callback.current = alRecibir;
  }, [alRecibir]);

  useEffect(() => {
    let activo = true;
    let socket: Socket | null = null;

    const alDato = (datos: T) => callback.current(datos);
    const alConectar = () => setConectado(true);
    const alDesconectar = () => setConectado(false);

    conectarSocket().then((s) => {
      // La pantalla pudo desmontarse mientras se leía el token.
      if (!activo || !s) return;

      socket = s;
      setConectado(s.connected);
      s.on("connect", alConectar);
      s.on("disconnect", alDesconectar);
      s.on(evento, alDato);
    });

    // Sin esto, cada vez que vuelves a la pantalla se agrega un listener
    // más y el mismo evento se procesaría dos, tres, cuatro veces.
    return () => {
      activo = false;
      socket?.off("connect", alConectar);
      socket?.off("disconnect", alDesconectar);
      socket?.off(evento, alDato);
    };
  }, [evento]);

  return conectado;
}
