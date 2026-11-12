import { colores } from "@/theme/tokens";
import { Tabs } from "expo-router";

export default function BaristaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.ambar,
        tabBarInactiveTintColor: colores.suave,
        tabBarStyle: { backgroundColor: colores.blanco },
      }}
    >
      <Tabs.Screen name="clientes" options={{ title: "Clientes" }} />
      <Tabs.Screen name="escaner" options={{ title: "Escáner" }} />
    </Tabs>
  );
}
