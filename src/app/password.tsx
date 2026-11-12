import { cambiarPassword } from "@/api/perfil";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [ver, setVer] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const guardar = async () => {
    setError(null);

    // Validaciones de la app: las baratas se resuelven aquí para no
    // gastar un viaje al servidor. Las de seguridad igual se repiten allá.
    if (nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nueva !== repetida) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setGuardando(true);
    try {
      await cambiarPassword({ passwordActual: actual, passwordNueva: nueva });
      setListo(true);
      setActual("");
      setNueva("");
      setRepetida("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cambiar la contraseña",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Cambiar contraseña" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexible}
      >
        <ScrollView contentContainerStyle={styles.contenido}>
          <Text style={styles.suave}>
            Para cambiarla necesitamos la contraseña actual, aunque ya hayas
            iniciado sesión.
          </Text>

          <View>
            <Text style={styles.etiqueta}>CONTRASEÑA ACTUAL</Text>
            <TextInput
              style={styles.campo}
              secureTextEntry={!ver}
              autoCapitalize="none"
              autoCorrect={false}
              value={actual}
              onChangeText={setActual}
              placeholder="La que usas hoy"
              placeholderTextColor={colores.suave}
            />
          </View>

          <View>
            <Text style={styles.etiqueta}>NUEVA CONTRASEÑA</Text>
            <View style={styles.campoConBoton}>
              <TextInput
                style={styles.campoInterno}
                secureTextEntry={!ver}
                autoCapitalize="none"
                autoCorrect={false}
                value={nueva}
                onChangeText={setNueva}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colores.suave}
              />
              <Pressable
                onPress={() => setVer((v) => !v)}
                hitSlop={8}
                style={styles.botonVer}
                accessibilityRole="button"
                accessibilityLabel={
                  ver ? "Ocultar contraseñas" : "Mostrar contraseñas"
                }
              >
                <Ionicons
                  name={ver ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colores.suave}
                />
              </Pressable>
            </View>
          </View>

          <View>
            <Text style={styles.etiqueta}>REPITE LA NUEVA</Text>
            <TextInput
              style={styles.campo}
              secureTextEntry={!ver}
              autoCapitalize="none"
              autoCorrect={false}
              value={repetida}
              onChangeText={setRepetida}
              placeholder="Otra vez, para confirmar"
              placeholderTextColor={colores.suave}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
          {listo && (
            <Text style={styles.aviso}>
              Contraseña actualizada. La usarás la próxima vez que inicies
              sesión.
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.botonPresionado,
              guardando && styles.botonDeshabilitado,
            ]}
            onPress={guardar}
            disabled={guardando}
          >
            <Text style={styles.textoBoton}>
              {guardando ? "Guardando..." : "Cambiar contraseña"}
            </Text>
          </Pressable>

          <Pressable style={styles.botonSecundario} onPress={() => router.back()}>
            <Text style={styles.textoBotonSecundario}>Volver</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  flexible: { flex: 1 },
  contenido: { padding: espacio.xl, gap: espacio.lg },

  etiqueta: {
    fontSize: texto.pie,
    color: colores.suave,
    marginBottom: espacio.xs,
    letterSpacing: 0.5,
  },
  campo: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.blanco,
    paddingHorizontal: espacio.md,
    fontSize: texto.cuerpo,
    color: colores.espresso,
    height: alturaMinimaTactil + 4,
  },
  campoConBoton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.blanco,
    paddingHorizontal: espacio.md,
    height: alturaMinimaTactil + 4,
  },
  campoInterno: {
    flex: 1,
    fontSize: texto.cuerpo,
    color: colores.espresso,
  },
  botonVer: {
    paddingLeft: espacio.md,
    alignItems: "center",
    justifyContent: "center",
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
  botonSecundario: {
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonSecundario: {
    color: colores.suave,
    fontSize: texto.etiqueta,
    fontWeight: "bold",
  },

  suave: { fontSize: texto.etiqueta, color: colores.suave },
  error: {
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.error,
    color: colores.blanco,
    textAlign: "center",
    fontSize: texto.etiqueta,
  },
  aviso: {
    padding: espacio.sm,
    borderRadius: radio.sm,
    backgroundColor: colores.salvia,
    color: colores.blanco,
    textAlign: "center",
    fontSize: texto.etiqueta,
  },
});
