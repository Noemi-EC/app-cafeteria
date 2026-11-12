import { registrarVisita, type ResultadoRegistro } from "@/api/visitas";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Escaner() {
  // El hook devuelve el permiso actual y la función para pedirlo.
  // El permiso lo da el sistema operativo, no la app: si el usuario dice
  // que no, no hay forma de insistir desde aquí.
  const [permiso, pedirPermiso] = useCameraPermissions();

  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoRegistro | null>(null);
  const [error, setError] = useState<string | null>(null);

  // La cámara dispara onBarcodeScanned muchas veces por segundo mientras
  // el código esté a la vista. Sin este candado se registrarían diez
  // visitas de un solo escaneo. Va en una ref y no en estado porque
  // tiene que cambiar al instante, sin esperar un redibujado.
  const bloqueado = useRef(false);

  const escanear = async (codigo: string) => {
    if (bloqueado.current) return;
    bloqueado.current = true;

    setProcesando(true);
    setError(null);
    setResultado(null);

    try {
      setResultado(await registrarVisita(codigo));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo registrar la visita",
      );
    } finally {
      setProcesando(false);
    }
  };

  const reiniciar = () => {
    setResultado(null);
    setError(null);
    bloqueado.current = false;
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Escáner</Text>
        <Text style={styles.suave}>
          El escáner necesita la cámara del dispositivo. Ábrelo desde el
          teléfono.
        </Text>
      </View>
    );
  }

  // Primera vez: todavía no se sabe el estado del permiso.
  if (!permiso) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colores.ambar} />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Escáner</Text>
        <Text style={styles.suave}>
          Para registrar visitas con el código del cliente necesitamos acceso a
          la cámara. No se guarda ninguna foto: solo se lee el código.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
          onPress={pedirPermiso}
        >
          <Text style={styles.textoBoton}>Permitir cámara</Text>
        </Pressable>
        {!permiso.canAskAgain && (
          <Text style={styles.suave}>
            Si ya lo rechazaste antes, actívalo desde los ajustes del sistema.
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <View style={styles.camara}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          // Solo QR: si se aceptaran todos los formatos, un código de barras
          // cualquiera dispararía una petición al servidor.
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => escanear(data)}
        />

        {/* Marco guía. No recorta nada: la cámara lee todo el cuadro. */}
        <View style={styles.marco} pointerEvents="none" />

        {!resultado && !error && !procesando && (
          <View style={styles.pie} pointerEvents="none">
            <Text style={styles.textoPie}>
              Apunta al código del cliente
            </Text>
          </View>
        )}
      </View>

      <View style={styles.panel}>
        {procesando && (
          <View style={styles.fila}>
            <ActivityIndicator color={colores.ambar} />
            <Text style={styles.suave}>Registrando visita...</Text>
          </View>
        )}

        {resultado && (
          <>
            <Text style={styles.exito}>
              {resultado.subioDeNivel
                ? `¡${resultado.cliente.nombre} subió a ${resultado.cliente.nivel}!`
                : `Visita registrada para ${resultado.cliente.nombre}`}
            </Text>
            <Text style={styles.suave}>
              {resultado.cliente.totalVisitas}{" "}
              {resultado.cliente.totalVisitas === 1 ? "visita" : "visitas"} ·{" "}
              {resultado.cliente.nivel}
            </Text>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {(resultado || error) && (
          <Pressable
            style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
            onPress={reiniciar}
          >
            <Text style={styles.textoBoton}>Escanear otro</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.espresso },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
    padding: espacio.xxl,
    gap: espacio.md,
  },

  camara: { flex: 1, overflow: "hidden" },
  marco: {
    position: "absolute",
    top: "22%",
    left: "15%",
    right: "15%",
    height: 220,
    borderWidth: 3,
    borderColor: colores.caramelo,
    borderRadius: radio.md,
  },
  pie: {
    position: "absolute",
    bottom: espacio.xl,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  textoPie: {
    color: colores.blanco,
    fontSize: texto.etiqueta,
    backgroundColor: "rgba(46,27,23,0.6)",
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.xs,
    borderRadius: radio.completo,
    overflow: "hidden",
  },

  panel: {
    backgroundColor: colores.crema,
    padding: espacio.xl,
    gap: espacio.md,
    minHeight: 150,
    justifyContent: "center",
  },
  fila: { flexDirection: "row", alignItems: "center", gap: espacio.md },

  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  suave: {
    fontSize: texto.etiqueta,
    color: colores.suave,
    textAlign: "center",
  },
  exito: {
    fontSize: texto.subtitulo,
    fontWeight: "bold",
    color: colores.espresso,
    textAlign: "center",
  },
  error: {
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.error,
    color: colores.blanco,
    textAlign: "center",
    fontSize: texto.etiqueta,
  },

  boton: {
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espacio.lg,
  },
  presionado: { opacity: 0.8 },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.cuerpo,
  },
});
