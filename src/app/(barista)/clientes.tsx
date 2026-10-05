import { useSesion } from "@/store/sesion";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Customer() {
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/login");
  };

  return (
    <View>
      <Pressable onPress={manejarCerrarSesion}>
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
