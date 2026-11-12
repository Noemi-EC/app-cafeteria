import { colores } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function ClienteLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.ambar,
        tabBarInactiveTintColor: colores.suave,
        tabBarStyle: { backgroundColor: colores.blanco },
        headerStyle: { backgroundColor: colores.crema },
        headerTintColor: colores.espresso,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          // El ícono recibe el color y el tamaño que le pasa la barra:
          // así el activo y el inactivo se pintan solos.
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="beneficios"
        options={{
          title: "Beneficios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
