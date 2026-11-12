import { colores } from "@/theme/tokens";
import { Stack } from "expo-router";

/**
 * Los grupos de rutas ya traen su propia barra de pestañas con cabecera,
 * así que aquí se oculta la del Stack. Si no, se ven dos cabeceras
 * apiladas y la de arriba muestra el nombre del grupo: "(cliente)".
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.crema },
        headerTintColor: colores.espresso,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(cliente)" options={{ headerShown: false }} />
      <Stack.Screen name="(barista)" options={{ headerShown: false }} />
      <Stack.Screen name="password" options={{ title: "Cambiar contraseña" }} />
    </Stack>
  );
}
