import {
  desactivarCliente,
  obtenerClientes,
  restaurarCliente,
  type ClienteDelLocal,
} from "@/api/clientes";
import { registrarVisita } from "@/api/visitas";
import { useSesion } from "@/store/sesion";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Clientes() {
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  const [clientes, setClientes] = useState<ClienteDelLocal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null); // usuarioId en curso
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setClientes(await obtenerClientes());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar la lista de clientes",
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

  // useMemo evita recalcular el filtro en cada render; solo cuando
  // cambia la lista o lo que se escribió en el buscador.
  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.codigoQr.toLowerCase().includes(termino),
    );
  }, [clientes, busqueda]);

  // Reemplaza un cliente dentro de la lista sin volver a pedirla al servidor.
  const reemplazar = (actualizado: ClienteDelLocal) =>
    setClientes((previos) =>
      previos.map((c) =>
        c.usuarioId === actualizado.usuarioId ? actualizado : c,
      ),
    );

  const manejarRegistrar = async (item: ClienteDelLocal) => {
    setOcupado(item.usuarioId);
    setError(null);
    try {
      const resultado = await registrarVisita(item.codigoQr);
      reemplazar({
        ...item,
        totalVisitas: resultado.cliente.totalVisitas,
        nivel: resultado.cliente.nivel,
        siguienteNivel: resultado.cliente.siguienteNivel,
        visitasParaSiguiente: resultado.cliente.visitasParaSiguiente,
        progreso: resultado.cliente.progreso,
      });
      setAviso(
        resultado.subioDeNivel
          ? `¡${item.nombre} subió a ${resultado.cliente.nivel}!`
          : `Visita registrada para ${item.nombre}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la visita");
    } finally {
      setOcupado(null);
    }
  };

  const manejarDesactivar = (item: ClienteDelLocal) => {
    Alert.alert(
      "Desactivar cliente",
      `${item.nombre} no podrá iniciar sesión ni acumular visitas. Su historial se conserva y puedes restaurarlo después.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            setOcupado(item.usuarioId);
            setError(null);
            try {
              reemplazar(await desactivarCliente(item.usuarioId));
              setAviso(`${item.nombre} quedó desactivado`);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "No se pudo desactivar",
              );
            } finally {
              setOcupado(null);
            }
          },
        },
      ],
    );
  };

  const manejarRestaurar = async (item: ClienteDelLocal) => {
    setOcupado(item.usuarioId);
    setError(null);
    try {
      reemplazar(await restaurarCliente(item.usuarioId));
      setAviso(`${item.nombre} fue restaurado`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo restaurar");
    } finally {
      setOcupado(null);
    }
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/login");
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
        <View style={styles.flexible}>
          <Text style={styles.titulo}>Clientes</Text>
          <Text style={styles.suave}>
            {clientes.length} registrados en el local
          </Text>
        </View>
        <Pressable
          onPress={manejarCerrarSesion}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.enlace}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.bloqueBusqueda}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre o código"
          placeholderTextColor={colores.suave}
          autoCapitalize="none"
          autoCorrect={false}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {aviso && <Text style={styles.aviso}>{aviso}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={visibles}
        keyExtractor={(item) => item.usuarioId}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} />
        }
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {busqueda
              ? "Ningún cliente coincide con la búsqueda."
              : "Todavía no hay clientes registrados en este local."}
          </Text>
        }
        renderItem={({ item }) => {
          const enCurso = ocupado === item.usuarioId;

          return (
            <View style={[styles.tarjeta, !item.activo && styles.tarjetaGris]}>
              <View style={styles.filaEntre}>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <View
                  style={[
                    styles.insignia,
                    !item.activo && styles.insigniaInactiva,
                  ]}
                >
                  <Text
                    style={[
                      styles.textoInsignia,
                      !item.activo && styles.textoInsigniaInactiva,
                    ]}
                  >
                    {item.activo ? item.nivel.toUpperCase() : "INACTIVO"}
                  </Text>
                </View>
              </View>

              <Text style={styles.codigo}>{item.codigoQr}</Text>

              <Text style={styles.suave}>
                {item.totalVisitas}{" "}
                {item.totalVisitas === 1 ? "visita" : "visitas"}
                {item.productoFavorito ? ` · ${item.productoFavorito}` : ""}
              </Text>

              <View style={styles.acciones}>
                {item.activo ? (
                  <>
                    <Pressable
                      style={({ pressed }) => [
                        styles.boton,
                        styles.botonPrincipal,
                        pressed && styles.botonPresionado,
                        enCurso && styles.botonDeshabilitado,
                      ]}
                      onPress={() => manejarRegistrar(item)}
                      disabled={enCurso}
                    >
                      <Text style={styles.textoBotonPrincipal}>
                        {enCurso ? "..." : "Registrar visita"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.boton,
                        styles.botonBorde,
                        pressed && styles.botonPresionado,
                        enCurso && styles.botonDeshabilitado,
                      ]}
                      onPress={() => manejarDesactivar(item)}
                      disabled={enCurso}
                    >
                      <Text style={styles.textoBotonPeligro}>Desactivar</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.boton,
                      styles.botonBorde,
                      pressed && styles.botonPresionado,
                      enCurso && styles.botonDeshabilitado,
                    ]}
                    onPress={() => manejarRestaurar(item)}
                    disabled={enCurso}
                  >
                    <Text style={styles.textoBotonBorde}>
                      {enCurso ? "..." : "Restaurar"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
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
    flexDirection: "row",
    alignItems: "flex-end",
    gap: espacio.md,
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
  },
  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  enlace: {
    fontSize: texto.etiqueta,
    color: colores.ambar,
    fontWeight: "bold",
  },

  bloqueBusqueda: { paddingHorizontal: espacio.xl, paddingTop: espacio.md },
  input: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.blanco,
    paddingHorizontal: espacio.md,
    fontSize: texto.cuerpo,
    color: colores.espresso,
    height: alturaMinimaTactil,
  },

  lista: { padding: espacio.xl, gap: espacio.md },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.lg,
    gap: espacio.sm,
  },
  tarjetaGris: { backgroundColor: colores.crema },

  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espacio.sm,
  },
  nombre: {
    flex: 1,
    fontSize: texto.subtitulo,
    fontWeight: "bold",
    color: colores.espresso,
  },

  insignia: {
    borderWidth: 1.5,
    borderColor: colores.espresso,
    borderRadius: radio.completo,
    paddingVertical: espacio.xs,
    paddingHorizontal: espacio.md,
  },
  insigniaInactiva: { borderColor: colores.suave },
  textoInsignia: {
    fontSize: texto.pie,
    fontWeight: "bold",
    color: colores.espresso,
  },
  textoInsigniaInactiva: { color: colores.suave },

  codigo: {
    fontSize: texto.pie,
    color: colores.suave,
    letterSpacing: 0.5,
  },
  suave: { fontSize: texto.etiqueta, color: colores.suave },

  acciones: {
    flexDirection: "row",
    gap: espacio.sm,
    marginTop: espacio.xs,
  },
  boton: {
    flex: 1,
    minHeight: alturaMinimaTactil,
    borderRadius: radio.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espacio.sm,
  },
  botonPrincipal: { backgroundColor: colores.ambar },
  botonBorde: {
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
  },
  botonPresionado: { opacity: 0.7 },
  botonDeshabilitado: { opacity: 0.5 },
  textoBotonPrincipal: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.etiqueta,
  },
  textoBotonBorde: {
    color: colores.espresso,
    fontWeight: "bold",
    fontSize: texto.etiqueta,
  },
  textoBotonPeligro: {
    color: colores.error,
    fontWeight: "bold",
    fontSize: texto.etiqueta,
  },

  aviso: {
    marginHorizontal: espacio.xl,
    marginTop: espacio.md,
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.salvia,
    color: colores.blanco,
    textAlign: "center",
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
  vacio: {
    textAlign: "center",
    color: colores.suave,
    fontSize: texto.etiqueta,
    paddingVertical: espacio.xxl,
  },
});
