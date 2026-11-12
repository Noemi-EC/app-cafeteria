import {
  actualizarPerfil,
  obtenerPerfil,
  type Perfil as PerfilCliente,
} from "@/api/perfil";
import { PRODUCTOS } from "@/constantes/productos";
import { useSesion } from "@/store/sesion";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { Picker } from "@react-native-picker/picker";
import QRCode from "react-native-qrcode-svg";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Copias editables de los campos del formulario
  const [nombre, setNombre] = useState("");
  const [productoFavorito, setProductoFavorito] = useState("");
  const [notificaciones, setNotificaciones] = useState(true);

  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  useEffect(() => {
    (async () => {
      try {
        const datos = await obtenerPerfil();
        setPerfil(datos);
        setNombre(datos.nombre);
        setProductoFavorito(datos.productoFavorito ?? "");
        setNotificaciones(datos.notificacionesActivas);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar tu perfil");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const guardar = async () => {
    setError(null);
    setAviso(null);
    setGuardando(true);

    try {
      const actualizado = await actualizarPerfil({
        nombre,
        productoFavorito,
        notificacionesActivas: notificaciones,
      });
      setPerfil(actualizado);
      setAviso("Cambios guardados");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

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
          <View style={styles.avatar} />
          <View>
            <Text style={styles.nombre}>{perfil?.nombre}</Text>
            <View style={styles.insignia}>
              <Text style={styles.textoInsignia}>
                {perfil?.nivel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.etiqueta}>CONTACTO</Text>
          {/* Solo lectura: cambiar el contacto es cambiar la credencial
              de acceso, y eso necesita verificación aparte. */}
          <View style={[styles.campo, styles.campoBloqueado]}>
            <Text style={styles.textoCampo}>{perfil?.contacto}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.etiqueta}>MI CÓDIGO</Text>
          {/* Es lo que el barista registra para sumar la visita.
              Más adelante, lo mismo viajará dentro de un QR. */}
          <View style={styles.bloqueQr}>
            {perfil?.codigoQr ? (
              <QRCode
                value={perfil.codigoQr}
                size={150}
                color={colores.espresso}
                backgroundColor={colores.blanco}
              />
            ) : null}
            {/* El texto se queda debajo: mientras no exista el escáner,
                es lo que el barista escribe para registrar la visita. */}
            <Text style={styles.textoCodigo}>{perfil?.codigoQr}</Text>
          </View>
          <Text style={styles.suave}>
            Muéstralo en caja para que registren tu visita.
          </Text>
        </View>

        <View>
          <Text style={styles.etiqueta}>NOMBRE</Text>
          <TextInput
            style={styles.campo}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            placeholder="¿Cómo te llamamos?"
          />
        </View>

        <View>
          <Text style={styles.etiqueta}>MI PEDIDO DE SIEMPRE</Text>
          <View style={styles.selector}>
            <Picker
              selectedValue={productoFavorito}
              onValueChange={(v) => setProductoFavorito(String(v))}
            >
              <Picker.Item label="Elige uno" value="" />
              {PRODUCTOS.map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.filaEntre}>
            <View style={styles.flexible}>
              <Text style={styles.textoCampo}>Avisos de beneficios</Text>
              <Text style={styles.suave}>
                Te escribimos solo cuando tengas algo esperándote.
              </Text>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              trackColor={{ true: colores.ambar, false: colores.borde }}
            />
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {aviso && <Text style={styles.aviso}>{aviso}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.boton,
            pressed && styles.botonPresionado,
          ]}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={styles.textoBoton}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.botonSecundario}
          onPress={() => router.push("/password")}
        >
          <Text style={styles.textoBotonSecundario}>Cambiar contraseña</Text>
        </Pressable>

        <Pressable style={styles.botonSecundario} onPress={salir}>
          <Text style={styles.textoBotonSecundario}>Cerrar sesión</Text>
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
  bloqueQr: {
    alignItems: "center",
    gap: espacio.md,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.md,
    paddingVertical: espacio.lg,
    paddingHorizontal: espacio.md,
  },
  textoCodigo: {
    fontSize: texto.pie,
    color: colores.suave,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  flexible: { flex: 1 },

  encabezado: { flexDirection: "row", alignItems: "center", gap: espacio.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radio.completo,
    backgroundColor: colores.borde,
  },
  nombre: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  insignia: {
    alignSelf: "flex-start",
    marginTop: espacio.xs,
    borderWidth: 1.5,
    borderColor: colores.espresso,
    borderRadius: radio.completo,
    paddingVertical: 2,
    paddingHorizontal: espacio.sm,
  },
  textoInsignia: {
    fontSize: texto.pie,
    fontWeight: "bold",
    color: colores.espresso,
  },

  etiqueta: {
    fontSize: texto.etiqueta,
    color: colores.suave,
    marginBottom: espacio.xs,
  },
  campo: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.blanco,
    paddingVertical: espacio.sm,
    paddingHorizontal: espacio.md,
    fontSize: texto.cuerpo,
    minHeight: alturaMinimaTactil,
    justifyContent: "center",
    color: colores.espresso,
  },
  campoBloqueado: { backgroundColor: colores.borde },
  textoCampo: { fontSize: texto.cuerpo, color: colores.espresso },
  selector: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.blanco,
    justifyContent: "center",
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.lg,
  },
  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espacio.md,
  },
  suave: { fontSize: texto.pie, color: colores.suave },

  boton: {
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  botonPresionado: { backgroundColor: colores.mocha },
  textoBoton: {
    color: colores.blanco,
    fontSize: texto.cuerpo,
    fontWeight: "bold",
  },

  botonSecundario: {
    borderWidth: 1.5,
    borderColor: colores.suave,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonSecundario: { color: colores.espresso, fontSize: texto.cuerpo },

  error: {
    color: colores.blanco,
    backgroundColor: colores.error,
    padding: espacio.sm,
    borderRadius: radio.sm,
    textAlign: "center",
  },
  aviso: {
    color: colores.blanco,
    backgroundColor: colores.salvia,
    padding: espacio.sm,
    borderRadius: radio.sm,
    textAlign: "center",
  },
});
