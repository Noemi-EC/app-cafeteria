import { obtenerCuenta, type CuentaActual } from "@/api/auth";
import { useSesion } from "@/store/sesion";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { formatearFechaHora } from "@/utiles/fecha";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cuenta() {
  const [cuenta, setCuenta] = useState<CuentaActual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  useEffect(() => {
    (async () => {
      try {
        setCuenta(await obtenerCuenta());
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la cuenta");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const salir = async () => {
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
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <View style={styles.avatar}>
            <Text style={styles.inicial}>
              {cuenta?.contacto?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={styles.flexible}>
            <Text style={styles.titulo}>Mi cuenta</Text>
            <Text style={styles.suave}>{cuenta?.local?.nombre ?? "Local"}</Text>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.clave}>CONTACTO</Text>
            <Text style={styles.valor}>{cuenta?.contacto}</Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.clave}>ROL</Text>
            <Text style={styles.valor}>{cuenta?.rol}</Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.clave}>ESTADO</Text>
            <Text style={styles.valor}>
              {cuenta?.activo ? "Activa" : "Desactivada"}
            </Text>
          </View>

          {cuenta?.creadoEn && (
            <View style={styles.fila}>
              <Text style={styles.clave}>EN EL LOCAL DESDE</Text>
              <Text style={styles.valor}>
                {formatearFechaHora(cuenta.creadoEn)}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.botonSecundario}
          onPress={() => router.push("/password")}
        >
          <Text style={styles.textoBotonSecundario}>Cambiar contraseña</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
          onPress={salir}
        >
          <Text style={styles.textoBoton}>Cerrar sesión</Text>
        </Pressable>
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
  },
  contenido: { padding: espacio.xl, gap: espacio.lg },
  flexible: { flex: 1 },

  encabezado: { flexDirection: "row", alignItems: "center", gap: espacio.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radio.completo,
    backgroundColor: colores.mocha,
    alignItems: "center",
    justifyContent: "center",
  },
  inicial: {
    color: colores.blanco,
    fontSize: texto.titulo,
    fontWeight: "bold",
  },
  titulo: {
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
    gap: espacio.md,
  },
  fila: { gap: 2 },
  clave: { fontSize: texto.pie, color: colores.suave, letterSpacing: 0.5 },
  valor: { fontSize: texto.cuerpo, color: colores.espresso },
  suave: { fontSize: texto.etiqueta, color: colores.suave },

  boton: {
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  presionado: { opacity: 0.8 },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.cuerpo,
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonSecundario: {
    color: colores.espresso,
    fontWeight: "bold",
    fontSize: texto.etiqueta,
  },
  error: {
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.error,
    color: colores.blanco,
    textAlign: "center",
    fontSize: texto.etiqueta,
  },
});
