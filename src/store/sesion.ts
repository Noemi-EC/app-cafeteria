import type { Rol } from "@/api/auth";
import * as apiAuth from "@/api/auth";
import {
  borrarSesion,
  guardarSesion,
  obtenerSesion,
} from "@/auth/almacenamiento";
import { create } from "zustand";

interface EstadoSesion {
  token: string | null;
  rol: Rol | null;
  restaurando: boolean;
  iniciarSesion: (contacto: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  restaurarSesion: () => Promise<void>;
  registrar: (
    nombre: string,
    contacto: string,
    password: string,
  ) => Promise<void>;
}

export const useSesion = create<EstadoSesion>((set) => ({
  token: null,
  rol: null,
  restaurando: true,

  iniciarSesion: async (contacto, password) => {
    const { access_token, rol } = await apiAuth.login(contacto, password);
    await guardarSesion({ token: access_token, rol });
    set({ token: access_token, rol });
  },

  cerrarSesion: async () => {
    await borrarSesion();
    set({ token: null, rol: null });
  },

  restaurarSesion: async () => {
    const sesion = await obtenerSesion();
    set({
      token: sesion?.token ?? null,
      rol: sesion?.rol ?? null,
      restaurando: false,
    });
  },

  registrar: async (nombre, contacto, password) => {
    const { access_token, rol } = await apiAuth.registro(
      nombre,
      contacto,
      password,
    );
    await guardarSesion({ token: access_token, rol });
    set({ token: access_token, rol });
  },
}));
