import { obtenerMisVisitas, type Visita } from "@/api/visitas";
import { colores, espacio, radio, texto } from "@/theme/tokens";
import { formatearFechaHora } from "@/utiles/fecha";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Historial() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setVisitas(await obtenerMisVisitas());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar tu historial",
      );
    }
  }, []);

  useEffect(() => {
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.ambar} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Historial</Text>
        <Text style={styles.suave}>
          {visitas.length === 0
            ? "Aún no tienes visitas registradas"
            : `${visitas.length} ${
                visitas.length === 1 ? "visita" : "visitas"
              } en total`}
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={visitas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
        }
        ListEmptyComponent={
          <View style={styles.bloqueVacio}>
            <Text style={styles.vacio}>
              Cuando el barista registre tu primera visita, la verás aquí.
            </Text>
          </View>
        }
        // La numeración se calcula sobre la lista, que viene de la más
        // reciente a la más antigua: la última visita es la número total.
        renderItem={({ item, index }) => (
          <View style={styles.tarjeta}>
            <View style={styles.marcador}>
              <Text style={styles.numero}>{visitas.length - index}</Text>
            </View>
            <View style={styles.flexible}>
              <Text style={styles.fecha}>
                {formatearFechaHora(item.registradaEn)}
              </Text>
              {item.nota ? (
                <Text style={styles.nota}>{item.nota}</Text>
              ) : (
                <Text style={styles.suave}>Visita registrada en el local</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
  },
  flexible: { flex: 1 },

  encabezado: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
    gap: espacio.xs,
  },
  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },

  lista: { padding: espacio.xl, gap: espacio.md },

  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacio.md,
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.lg,
  },
  marcador: {
    width: 38,
    height: 38,
    borderRadius: radio.completo,
    backgroundColor: colores.crema,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: "center",
    justifyContent: "center",
  },
  numero: {
    fontSize: texto.etiqueta,
    fontWeight: "bold",
    color: colores.espresso,
  },

  fecha: {
    fontSize: texto.cuerpo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  nota: { fontSize: texto.etiqueta, color: colores.suave },
  suave: { fontSize: texto.etiqueta, color: colores.suave },

  bloqueVacio: { paddingVertical: espacio.xxl, paddingHorizontal: espacio.lg },
  vacio: {
    textAlign: "center",
    color: colores.suave,
    fontSize: texto.etiqueta,
  },
  error: {
    marginHorizontal: espacio.xl,
    marginTop: espacio.md,
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.error,
    color: colores.blanco,
    textAlign: "center",
    fontSize: texto.etiqueta,
  },
});
