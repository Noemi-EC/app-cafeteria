import {
  descargarReporteExcel,
  obtenerResumen,
  type ResumenLocal,
} from "@/api/reportes";
import { useEvento } from "@/hooks/useEvento";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** "2026-11-13" -> "jue 13". Se parte el texto para no depender de zonas horarias. */
function etiquetaDia(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return `${DIAS[d.getDay()]} ${dia}`;
}

export default function Resumen() {
  const [datos, setDatos] = useState<ResumenLocal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);
  const [avisoDescarga, setAvisoDescarga] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setDatos(await obtenerResumen());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el resumen");
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

  const descargar = async () => {
    setAvisoDescarga(null);
    setDescargando(true);
    try {
      await descargarReporteExcel();
      setAvisoDescarga("Reporte generado");
    } catch (e) {
      setAvisoDescarga(
        e instanceof Error ? e.message : "No se pudo generar el reporte",
      );
    } finally {
      setDescargando(false);
    }
  };

  // El tablero también escucha: una visita registrada cambia los números.
  const enVivo = useEvento("visita.registrada", () => {
    void cargar();
  });
  useEvento("visita.anulada", () => {
    void cargar();
  });

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.ambar} />
      </View>
    );
  }

  if (error || !datos) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error ?? "Sin datos"}</Text>
      </View>
    );
  }

  // La barra más alta define la escala; con todo en cero no se divide entre 0.
  const maximo = Math.max(1, ...datos.porDia.map((d) => d.cantidad));
  const maxNivel = Math.max(1, ...datos.porNivel.map((n) => n.cantidad));

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
        }
      >
        <View style={styles.encabezado}>
          <View style={styles.flexible}>
            <Text style={styles.titulo}>Resumen</Text>
            <Text style={styles.suave}>Actividad del local</Text>
          </View>
          {enVivo && (
            <View style={styles.enVivo}>
              <View style={styles.puntoVivo} />
              <Text style={styles.textoVivo}>En vivo</Text>
            </View>
          )}
        </View>

        {/* Cifras principales */}
        <View style={styles.fila}>
          <View style={styles.cifra}>
            <Text style={styles.numero}>{datos.visitas.hoy}</Text>
            <Text style={styles.etiqueta}>VISITAS HOY</Text>
          </View>
          <View style={styles.cifra}>
            <Text style={styles.numero}>{datos.visitas.ultimos7Dias}</Text>
            <Text style={styles.etiqueta}>ÚLTIMOS 7 DÍAS</Text>
          </View>
          <View style={styles.cifra}>
            <Text style={styles.numero}>{datos.visitas.promedioDiario}</Text>
            <Text style={styles.etiqueta}>PROMEDIO DIARIO</Text>
          </View>
        </View>

        {/* Visitas por día */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>Visitas por día</Text>
          <View style={styles.grafico}>
            {datos.porDia.map((d) => (
              <View key={d.fecha} style={styles.columna}>
                <Text style={styles.valorBarra}>
                  {d.cantidad > 0 ? d.cantidad : ""}
                </Text>
                <View
                  style={[
                    styles.barra,
                    { height: Math.max(3, (d.cantidad / maximo) * 90) },
                    d.cantidad === 0 && styles.barraVacia,
                  ]}
                />
                <Text style={styles.diaBarra}>{etiquetaDia(d.fecha)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Clientes */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>Clientes</Text>
          <View style={styles.filaDatos}>
            <Text style={styles.clave}>Activos</Text>
            <Text style={styles.valor}>{datos.clientes.activos}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.clave}>Desactivados</Text>
            <Text style={styles.valor}>{datos.clientes.inactivos}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.clave}>Nuevos esta semana</Text>
            <Text style={styles.valor}>{datos.clientes.nuevosEstaSemana}</Text>
          </View>
          <View style={styles.filaDatos}>
            <Text style={styles.clave}>Sin visitas todavía</Text>
            <Text style={styles.valor}>{datos.clientes.sinVisitas}</Text>
          </View>
        </View>

        {/* Distribución por nivel */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>Clientes por nivel</Text>
          {datos.porNivel.map((n) => (
            <View key={n.nivel} style={styles.filaNivel}>
              <Text style={styles.nombreNivel}>{n.nivel}</Text>
              <View style={styles.pistaNivel}>
                <View
                  style={[
                    styles.rellenoNivel,
                    { width: `${(n.cantidad / maxNivel) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.cantidadNivel}>{n.cantidad}</Text>
            </View>
          ))}
        </View>

        {/* Top clientes */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>Clientes más frecuentes</Text>
          {datos.topClientes.length === 0 ? (
            <Text style={styles.suave}>Todavía no hay visitas registradas.</Text>
          ) : (
            datos.topClientes.map((c, i) => (
              <View key={c.nombre + i} style={styles.filaDatos}>
                <Text style={styles.clave}>
                  {i + 1}. {c.nombre}{" "}
                  <Text style={styles.suave}>· {c.nivel}</Text>
                </Text>
                <Text style={styles.valor}>{c.totalVisitas}</Text>
              </View>
            ))
          )}
        </View>

        {/* Productos */}
        {datos.productosFavoritos.length > 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.tituloTarjeta}>Pedido de siempre</Text>
            {datos.productosFavoritos.map((p) => (
              <View key={p.producto} style={styles.filaDatos}>
                <Text style={styles.clave}>{p.producto}</Text>
                <Text style={styles.valor}>{p.cantidad}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.botonExcel,
            pressed && styles.presionado,
            descargando && styles.presionado,
          ]}
          onPress={descargar}
          disabled={descargando}
        >
          <Text style={styles.textoBotonExcel}>
            {descargando ? "Generando..." : "Descargar reporte en Excel"}
          </Text>
        </Pressable>

        {avisoDescarga && (
          <Text style={styles.suave}>{avisoDescarga}</Text>
        )}

        <Text style={styles.pie}>Desliza hacia abajo para actualizar.</Text>
      </ScrollView>
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
    padding: espacio.xl,
  },
  contenido: { padding: espacio.xl, gap: espacio.md },
  flexible: { flex: 1 },

  encabezado: { flexDirection: "row", alignItems: "flex-end", gap: espacio.md },
  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  enVivo: { flexDirection: "row", alignItems: "center", gap: espacio.xs },
  puntoVivo: {
    width: 7,
    height: 7,
    borderRadius: radio.completo,
    backgroundColor: colores.salvia,
  },
  textoVivo: { fontSize: texto.pie, color: colores.salvia },

  fila: { flexDirection: "row", gap: espacio.sm },
  cifra: {
    flex: 1,
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: espacio.md,
    paddingHorizontal: espacio.sm,
    alignItems: "center",
    gap: 2,
  },
  numero: {
    fontSize: texto.display,
    fontWeight: "bold",
    color: colores.espresso,
  },
  etiqueta: {
    fontSize: 9,
    color: colores.suave,
    textAlign: "center",
    letterSpacing: 0.4,
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.lg,
    gap: espacio.sm,
  },
  tituloTarjeta: {
    fontSize: texto.etiqueta,
    fontWeight: "bold",
    color: colores.espresso,
    marginBottom: espacio.xs,
  },

  grafico: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: espacio.xs,
    paddingTop: espacio.sm,
  },
  columna: { flex: 1, alignItems: "center", gap: 3 },
  valorBarra: { fontSize: texto.pie, color: colores.suave, height: 14 },
  barra: {
    width: "70%",
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
  },
  barraVacia: { backgroundColor: colores.borde },
  diaBarra: { fontSize: 9, color: colores.suave },

  filaDatos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: espacio.md,
  },
  clave: { flex: 1, fontSize: texto.etiqueta, color: colores.espresso },
  valor: {
    fontSize: texto.cuerpo,
    fontWeight: "bold",
    color: colores.espresso,
  },

  filaNivel: { flexDirection: "row", alignItems: "center", gap: espacio.sm },
  nombreNivel: { width: 72, fontSize: texto.pie, color: colores.espresso },
  pistaNivel: {
    flex: 1,
    height: 12,
    borderRadius: radio.completo,
    backgroundColor: colores.crema,
    overflow: "hidden",
  },
  rellenoNivel: { height: "100%", backgroundColor: colores.mocha },
  cantidadNivel: {
    width: 24,
    textAlign: "right",
    fontSize: texto.etiqueta,
    fontWeight: "bold",
    color: colores.espresso,
  },

  botonExcel: {
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
    marginTop: espacio.xs,
  },
  presionado: { opacity: 0.7 },
  textoBotonExcel: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.cuerpo,
  },

  suave: { fontSize: texto.etiqueta, color: colores.suave, textAlign: "center" },
  pie: { fontSize: texto.pie, color: colores.suave, textAlign: "center" },
  error: { color: colores.error, textAlign: "center", fontSize: texto.cuerpo },
});
