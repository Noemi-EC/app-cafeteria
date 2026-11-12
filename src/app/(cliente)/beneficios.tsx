import { generarBeneficio, type BeneficioSugerido } from "@/api/beneficios";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Beneficios() {
  const [resultado, setResultado] = useState<BeneficioSugerido | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generar = async () => {
    setError(null);
    setCargando(true);
    try {
      setResultado(await generarBeneficio());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo generar tu beneficio",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View>
          <Text style={styles.titulo}>Tu beneficio</Text>
          <Text style={styles.suave}>
            Lo que te corresponde lo deciden tus visitas. Cómo te lo contamos,
            lo escribe el asistente.
          </Text>
        </View>

        {!resultado && !cargando && (
          <View style={styles.tarjetaVacia}>
            <Text style={styles.suave}>
              Toca el botón para ver qué tienes esperándote hoy.
            </Text>
          </View>
        )}

        {cargando && (
          <View style={styles.tarjetaVacia}>
            <ActivityIndicator color={colores.ambar} />
            <Text style={styles.suave}>Preparando tu mensaje...</Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {resultado && !cargando && (
          <>
            <View style={styles.tarjeta}>
              <Text style={styles.etiqueta}>
                {resultado.beneficio.codigo.replace(/_/g, " ")}
              </Text>
              <Text style={styles.destacado}>{resultado.beneficio.titulo}</Text>
              <Text style={styles.mensaje}>“{resultado.mensaje}”</Text>
            </View>

            {/* Este bloque es a propósito visible: deja claro qué parte
                decidió la regla de negocio y cuál redactó el modelo. */}
            <View style={styles.tarjetaTecnica}>
              <Text style={styles.etiqueta}>CÓMO SE ARMÓ ESTO</Text>

              <View style={styles.fila}>
                <Text style={styles.clave}>Regla aplicada</Text>
                <Text style={styles.valor}>{resultado.beneficio.motivo}</Text>
              </View>

              <View style={styles.fila}>
                <Text style={styles.clave}>Redacción</Text>
                <Text style={styles.valor}>
                  {resultado.generadoPor === "ia"
                    ? `Generada por IA (${resultado.modelo})`
                    : "Plantilla de respaldo"}
                </Text>
              </View>

              {resultado.generadoPor === "plantilla" && (
                <Text style={styles.suave}>
                  El proveedor de IA no respondió, así que se usó el texto de
                  respaldo. El beneficio es el mismo: la regla no depende del
                  modelo.
                </Text>
              )}
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.boton,
            pressed && styles.botonPresionado,
            cargando && styles.botonDeshabilitado,
          ]}
          onPress={generar}
          disabled={cargando}
        >
          <Text style={styles.textoBoton}>
            {resultado ? "Generar otra vez" : "Ver mi beneficio"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  contenido: { padding: espacio.xl, gap: espacio.lg },

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
    gap: espacio.sm,
  },
  tarjetaTecnica: {
    backgroundColor: colores.crema,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    borderStyle: "dashed",
    padding: espacio.lg,
    gap: espacio.sm,
  },
  tarjetaVacia: {
    backgroundColor: colores.blanco,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.xxl,
    alignItems: "center",
    gap: espacio.md,
  },

  etiqueta: {
    fontSize: texto.pie,
    color: colores.suave,
    letterSpacing: 0.5,
  },
  destacado: {
    fontSize: texto.subtitulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  mensaje: {
    fontSize: texto.cuerpo,
    color: colores.espresso,
    lineHeight: 24,
  },

  fila: { gap: 2 },
  clave: { fontSize: texto.pie, color: colores.suave },
  valor: { fontSize: texto.etiqueta, color: colores.espresso },

  suave: {
    fontSize: texto.etiqueta,
    color: colores.suave,
    textAlign: "center",
  },

  boton: {
    backgroundColor: colores.ambar,
    borderRadius: radio.sm,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  botonPresionado: { opacity: 0.8 },
  botonDeshabilitado: { opacity: 0.6 },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.cuerpo,
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
