import { useSesion } from "@/store/sesion";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { rutaPorRol } from "../../auth/rutas";

export default function Login() {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false); // Alterna el ocultado
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Siempre se llaman en el nivel superior del componente. Nunca dentro de una función
  const iniciarSesion = useSesion((s) => s.iniciarSesion);

  const manejarLogin = async () => {
    setError(null);
    setCargando(true);

    try {
      await iniciarSesion(contact, password);
      const rol = useSesion.getState().rol;
      router.replace(rutaPorRol(rol)); // No deja rastro en pila, lo que sí hace push, dejando una pantalla sobre otra
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.viewContainer}>
          <View style={styles.textContainer}>
            <Image
              source={require("../../../assets/images/granos_cafe.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Café Link</Text>
            <Text style={styles.subtitle}>Raíz Contigo</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="Número o correo"
              value={contact}
              onChangeText={setContact}
            />

            {/* El borde lo lleva el contenedor; el campo y el botón van dentro */}
            <View style={styles.campoPassword}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Contraseña"
                secureTextEntry={!verPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setVerPassword((v) => !v)}
                style={styles.botonVer}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <Ionicons
                  name={verPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colores.suave}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={manejarLogin}
            disabled={cargando}
          >
            <Text style={styles.textButton}>
              {!cargando ? "Iniciar Sesión" : "Cargando..."}
            </Text>
          </Pressable>

          {/* Renderizado condicional */}
          {error && <Text style={styles.textError}>{error}</Text>}

          <View style={styles.questionContainer}>
            <Text style={styles.question}>¿Primera vez?</Text>
            <Link href="/registro">
              <Text style={styles.textProfile}>Crea tu perfil</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: colores.crema,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },
  viewContainer: {
    paddingHorizontal: espacio.xl,
    justifyContent: "center",
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  textContainer: {
    gap: espacio.xs,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacio.sm,
  },
  title: {
    fontSize: texto.titulo,
    color: colores.espresso,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: texto.subtitulo,
    color: colores.mocha,
  },
  inputContainer: {
    marginTop: espacio.md,
    gap: espacio.sm,
  },
  input: {
    borderWidth: 1,
    paddingVertical: espacio.sm,
    paddingHorizontal: espacio.md,
    fontSize: texto.cuerpo,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    height: 55,
  },
  // Contenedor en fila: campo a la izquierda, botón "Mostrar" a la derecha
  campoPassword: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    paddingHorizontal: espacio.md,
    height: 55,
  },
  inputPassword: {
    flex: 1, // ocupa todo el espacio que deje el botón
    fontSize: texto.cuerpo,
    paddingVertical: espacio.sm,
    color: colores.espresso,
  },
  botonVer: {
    paddingLeft: espacio.md,
    minHeight: alturaMinimaTactil,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 1,
    padding: espacio.sm,
    borderColor: colores.borde,
    borderRadius: radio.sm,
    backgroundColor: colores.ambar,
    marginTop: espacio.xl,
    marginBottom: espacio.md,
    minHeight: alturaMinimaTactil,
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: colores.mocha,
  },
  textButton: {
    fontSize: texto.cuerpo,
    textAlign: "center",
    color: colores.blanco,
  },
  questionContainer: {
    flexDirection: "row",
    gap: espacio.sm,
    justifyContent: "center",
  },
  question: {
    color: colores.espresso,
  },
  textProfile: {
    fontWeight: "bold",
    color: colores.suave,
  },
  textError: {
    color: colores.blanco,
    backgroundColor: colores.error,
    padding: espacio.sm,
    borderRadius: radio.sm,
    marginBottom: espacio.md,
    textAlign: "center",
  },
});
