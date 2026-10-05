import { useSesion } from "@/store/sesion";
import { colores } from "@/theme/tokens";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { rutaPorRol } from "../auth/rutas";

// La raíz. Es lo primero que ve el usuario al abrir la app
export default function Index() {
  const restaurando = useSesion((s) => s.restaurando);
  const token = useSesion((s) => s.token);
  const rol = useSesion((s) => s.rol);
  const restaurarSesion = useSesion((s) => s.restaurarSesion);

  useEffect(() => {
    restaurarSesion();
  }, []); // El [] significa: ejecútalo UNA sola vez, al montar esta pantalla

  if (restaurando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.ambar} />
      </View>
    );
  }

  if (!token) return <Redirect href="/login" />;

  return <Redirect href={rutaPorRol(rol)} />;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
  },
});
