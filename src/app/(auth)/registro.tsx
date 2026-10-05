import { rutaPorRol } from "@/auth/rutas";
import { useSesion } from "@/store/sesion";
import {
  alturaMinimaTactil,
  colores,
  espacio,
  radio,
  texto,
} from "@/theme/tokens";
import { Picker } from "@react-native-picker/picker";
import { Link, router } from "expo-router";
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

const PRODUCTOS = [
  "Flat White",
  "Americano",
  "Cappuccino",
  "Latte",
  "Espresso",
];

export default function Register() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [password, setPassword] = useState("");
  const [productoFavorito, setProductoFavorito] = useState("");

  const registrar = useSesion((r) => r.registrar);

  const manejarRegistro = async () => {
    setError(null);
    setCargando(true);

    try {
      await registrar(nombre, contacto, password);
      router.replace(rutaPorRol(useSesion.getState().rol));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Ocurrió un error inesperado al registrar su perfil",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.viewContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.titulo}>Crear mi perfil</Text>

              <View style={styles.mensajeContainer}>
                <Text style={styles.mensaje}>
                  Regístrate y en tu próxima visita ya te conocemos.
                </Text>
              </View>

              <View>
                <Text style={styles.etiqueta}>¿CÓMO TE LLAMAMOS?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  autoCapitalize="words"
                  value={nombre}
                  onChangeText={setNombre}
                ></TextInput>
              </View>

              <View>
                <Text style={styles.etiqueta}>CONTACTO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Número de celular"
                  autoCapitalize="none"
                  value={contacto}
                  onChangeText={setContacto}
                ></TextInput>
              </View>

              <View>
                <Text style={styles.etiqueta}>CONTRASEÑA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                ></TextInput>
              </View>

              <View>
                <Text style={styles.etiqueta}>
                  ¿CUÁL ES TU PEDIDO DE SIEMPRE?
                </Text>
                <View style={styles.selector}>
                  <Picker
                    selectedValue={productoFavorito}
                    onValueChange={setProductoFavorito}
                  >
                    <Picker.Item
                      label="Elige uno · puedes cambiarlo después"
                      value=""
                    />
                    {PRODUCTOS.map((p) => (
                      <Picker.Item key={p} label={p} value={p} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.question}>
                Usamos tus datos solo para reconocerte en el local
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={manejarRegistro}
                disabled={cargando}
              >
                <Text style={styles.textButton}>
                  {!cargando ? "Crear mi perfil" : "Creando perfil..."}
                </Text>
              </Pressable>

              {error && <Text style={styles.textError}>{error}</Text>}

              <View style={styles.questionContainer}>
                <Text style={styles.question}>¿Ya tienes cuenta?</Text>
                <Link href="/login">
                  <Text style={styles.textProfile}>Inicia sesión</Text>
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, // ← la clave
    justifyContent: "space-between",
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.xl,
  },
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: colores.crema,
  },
  keyboardView: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.xl,
    justifyContent: "space-between", // eje vertical
  },
  titulo: {
    fontSize: texto.titulo,
    color: colores.espresso,
  },
  mensajeContainer: {
    backgroundColor: colores.blanco,
    padding: espacio.sm,
    borderRadius: radio.sm,
    borderLeftWidth: 3,
    borderLeftColor: colores.ambar,
  },
  mensaje: {
    fontSize: texto.pie,
  },
  etiqueta: {
    fontSize: texto.etiqueta,
    color: colores.suave,
    marginBottom: espacio.xs,
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
  selector: {
    borderWidth: 1,
    paddingVertical: espacio.sm,
    paddingHorizontal: espacio.md,
    fontSize: texto.cuerpo,
    borderColor: colores.borde,
    borderRadius: radio.sm,
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
