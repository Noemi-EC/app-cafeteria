import { obtenerPerfil, type Perfil } from "@/api/perfil";
import { DESCRIPCION_NIVEL } from "@/constantes/productos";
import { useEvento } from "@/hooks/useEvento";
import { colores, espacio, radio, texto } from "@/theme/tokens";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Lo que manda el servidor cuando el barista registra o anula una visita.
interface EstadoCliente {
  totalVisitas: number;
  nivel: string;
  siguienteNivel: string | null;
  visitasParaSiguiente: number;
  progreso: number;
}

export default function Inicio() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useCallback para que la función no se recree en cada render y
  // pueda usarse tanto en el useEffect como en el "deslizar para refrescar".
  const cargar = useCallback(async () => {
    try {
      setError(null);
      setPerfil(await obtenerPerfil());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar tu perfil");
    }
  }, []);

  // Se ejecuta una sola vez, al montar la pantalla.
  useEffect(() => {
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  // TIEMPO REAL: la pantalla no pregunta cada cierto rato si hubo cambios.
  // El servidor avisa, y recién ahí se actualiza. Esa es la diferencia
  // entre HTTP (yo pregunto) y WebSocket (el servidor me cuenta).
  const aplicarCambio = useCallback((datos: { cliente: EstadoCliente }) => {
    setPerfil((previo) =>
      previo
        ? {
            ...previo,
            totalVisitas: datos.cliente.totalVisitas,
            nivel: datos.cliente.nivel,
            siguienteNivel: datos.cliente.siguienteNivel,
            visitasParaSiguiente: datos.cliente.visitasParaSiguiente,
            progreso: datos.cliente.progreso,
          }
        : previo,
    );
  }, []);

  const enVivo = useEvento<{ cliente: EstadoCliente }>(
    "mi.visita.registrada",
    aplicarCambio,
  );
  useEvento<{ cliente: EstadoCliente }>("mi.visita.anulada", aplicarCambio);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.ambar} />
      </View>
    );
  }

  if (error || !perfil) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error ?? "No hay perfil disponible"}</Text>
      </View>
    );
  }

  // El progreso llega como 0-1; la barra lo necesita en porcentaje.
  const anchoBarra = `${Math.round(perfil.progreso * 100)}%` as const;

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
        }
      >
        <View style={styles.encabezado}>
          <View style={styles.avatar} />
          <View style={styles.flexible}>
            <Text style={styles.saludo}>Hola, {perfil.nombre}</Text>
            <Text style={styles.suave}>
              {perfil.totalVisitas === 0
                ? "Tu primera visita te está esperando"
                : `${perfil.totalVisitas} ${
                    perfil.totalVisitas === 1 ? "visita" : "visitas"
                  } con nosotros`}
            </Text>
            {enVivo && (
              <View style={styles.enVivo}>
                <View style={styles.puntoVivo} />
                <Text style={styles.textoVivo}>En vivo</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tarjeta de nivel: el corazón de la propuesta */}
        <View style={styles.tarjeta}>
          <View style={styles.filaEntre}>
            <View style={styles.insignia}>
              <Text style={styles.textoInsignia}>
                {perfil.nivel.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.suave}>{perfil.totalVisitas} visitas</Text>
          </View>

          <Text style={styles.suave}>
            {DESCRIPCION_NIVEL[perfil.nivel] ?? ""}
          </Text>

          <View style={styles.barra}>
            <View style={[styles.barraLlena, { width: anchoBarra }]} />
          </View>

          <Text style={styles.suave}>
            {perfil.siguienteNivel
              ? `${perfil.visitasParaSiguiente} ${
                  perfil.visitasParaSiguiente === 1 ? "visita" : "visitas"
                } para ser ${perfil.siguienteNivel}`
              : "Llegaste al nivel máximo"}
          </Text>
        </View>

        {/* Pedido de siempre */}
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>TU PEDIDO DE SIEMPRE</Text>
          <Text style={styles.destacado}>
            {perfil.productoFavorito ?? "Aún no lo has elegido"}
          </Text>
          {!perfil.productoFavorito && (
            <Text style={styles.suave}>
              Puedes elegirlo desde la pestaña Perfil.
            </Text>
          )}
        </View>

        <Text style={styles.pie}>
          Desliza hacia abajo para actualizar.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  enVivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacio.xs,
    marginTop: espacio.xs,
  },
  puntoVivo: {
    width: 7,
    height: 7,
    borderRadius: radio.completo,
    backgroundColor: colores.salvia,
  },
  textoVivo: { fontSize: texto.pie, color: colores.salvia },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
    padding: espacio.xl,
  },
  contenido: { padding: espacio.xl, gap: espacio.lg },
  flexible: { flex: 1 },

  encabezado: { flexDirection: "row", alignItems: "center", gap: espacio.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radio.completo,
    backgroundColor: colores.borde,
  },
  saludo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.lg,
    gap: espacio.sm,
  },
  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  insignia: {
    borderWidth: 1.5,
    borderColor: colores.espresso,
    borderRadius: radio.completo,
    paddingVertical: espacio.xs,
    paddingHorizontal: espacio.md,
  },
  textoInsignia: {
    fontSize: texto.pie,
    fontWeight: "bold",
    color: colores.espresso,
  },

  barra: {
    height: 10,
    borderRadius: radio.completo,
    backgroundColor: colores.borde,
    overflow: "hidden",
  },
  barraLlena: { height: "100%", backgroundColor: colores.ambar },

  etiqueta: { fontSize: texto.etiqueta, color: colores.suave },
  destacado: {
    fontSize: texto.subtitulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  suave: { fontSize: texto.etiqueta, color: colores.suave },
  pie: { fontSize: texto.pie, color: colores.suave, textAlign: "center" },
  error: { color: colores.error, textAlign: "center", fontSize: texto.cuerpo },
});
