import { pedirCodigo, restablecerPassword } from "@/api/auth";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
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

type Paso = "contacto" | "codigo" | "listo";

export default function Recuperar() {
  const [paso, setPaso] = useState<Paso>("contacto");

  const [contacto, setContacto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nueva, setNueva] = useState("");
  const [ver, setVer] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const solicitar = async () => {
    setError(null);
    if (!contacto.trim()) {
      setError("Escribe tu correo o número");
      return;
    }

    setCargando(true);
    try {
      setAviso(await pedirCodigo(contacto.trim()));
      setPaso("codigo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el código");
    } finally {
      setCargando(false);
    }
  };

  const restablecer = async () => {
    setError(null);
    if (codigo.trim().length !== 6) {
      setError("El código tiene 6 dígitos");
      return;
    }
    if (nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);
    try {
      await restablecerPassword({
        contacto: contacto.trim(),
        codigo: codigo.trim(),
        passwordNueva: nueva,
      });
      setPaso("listo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo restablecer");
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexible}
      >
        <ScrollView contentContainerStyle={styles.contenido}>
          <View>
            <Text style={styles.titulo}>Recuperar contraseña</Text>
            <Text style={styles.suave}>
              {paso === "contacto"
                ? "Te enviamos un código al contacto con el que te registraste."
                : paso === "codigo"
                  ? "Revisa tu correo y escribe el código de 6 dígitos."
                  : "Listo."}
            </Text>
          </View>

          {paso === "contacto" && (
            <>
              <View>
                <Text style={styles.etiqueta}>CORREO O NÚMERO</Text>
                <TextInput
                  style={styles.campo}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={contacto}
                  onChangeText={setContacto}
                  placeholder="El que usas para entrar"
                  placeholderTextColor={colores.suave}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.boton,
                  pressed && styles.presionado,
                  cargando && styles.presionado,
                ]}
                onPress={solicitar}
                disabled={cargando}
              >
                <Text style={styles.textoBoton}>
                  {cargando ? "Enviando..." : "Enviarme el código"}
                </Text>
              </Pressable>
            </>
          )}

          {paso === "codigo" && (
            <>
              <View>
                <Text style={styles.etiqueta}>CÓDIGO</Text>
                <TextInput
                  style={[styles.campo, styles.campoCodigo]}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                  placeholder="000000"
                  placeholderTextColor={colores.borde}
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
                      ver ? "Ocultar contraseña" : "Mostrar contraseña"
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

              <Pressable
                style={({ pressed }) => [
                  styles.boton,
                  pressed && styles.presionado,
                  cargando && styles.presionado,
                ]}
                onPress={restablecer}
                disabled={cargando}
              >
                <Text style={styles.textoBoton}>
                  {cargando ? "Guardando..." : "Cambiar contraseña"}
                </Text>
              </Pressable>

              <Pressable onPress={() => setPaso("contacto")}>
                <Text style={styles.enlace}>No me llegó, pedir otro</Text>
              </Pressable>
            </>
          )}

          {paso === "listo" && (
            <>
              <Text style={styles.exito}>
                Tu contraseña fue cambiada. Ya puedes iniciar sesión con la
                nueva.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.boton,
                  pressed && styles.presionado,
                ]}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.textoBoton}>Ir a iniciar sesión</Text>
              </Pressable>
            </>
          )}

          {aviso && paso === "codigo" && (
            <Text style={styles.nota}>{aviso}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}

          {paso !== "listo" && (
            <Pressable onPress={() => router.back()}>
              <Text style={styles.enlace}>Volver</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  flexible: { flex: 1 },
  contenido: {
    padding: espacio.xl,
    gap: espacio.lg,
    flexGrow: 1,
    justifyContent: "center",
  },

  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
    marginBottom: espacio.xs,
  },
  suave: { fontSize: texto.etiqueta, color: colores.suave },
  nota: {
    fontSize: texto.pie,
    color: colores.suave,
    textAlign: "center",
  },

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
  campoCodigo: {
    fontSize: texto.titulo,
    letterSpacing: 8,
    textAlign: "center",
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
  campoInterno: { flex: 1, fontSize: texto.cuerpo, color: colores.espresso },
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
  presionado: { opacity: 0.8 },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: texto.cuerpo,
  },
  enlace: {
    color: colores.suave,
    fontSize: texto.etiqueta,
    fontWeight: "bold",
    textAlign: "center",
  },

  exito: {
    fontSize: texto.cuerpo,
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
});
