import { colores, espacio, texto } from "@/theme/tokens";
import { StyleSheet, Text, View } from "react-native";

export default function Escaner() {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Escáner</Text>
      <Text style={styles.suave}>
        La cámara leerá el código del cliente y llamará al mismo endpoint que
        hoy usa el botón “Registrar visita” de la pestaña Clientes.
      </Text>
      <Text style={styles.proximamente}>Próxima iteración</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
    padding: espacio.xxl,
    gap: espacio.md,
  },
  titulo: {
    fontSize: texto.titulo,
    fontWeight: "bold",
    color: colores.espresso,
  },
  suave: {
    fontSize: texto.etiqueta,
    color: colores.suave,
    textAlign: "center",
  },
  proximamente: {
    fontSize: texto.pie,
    color: colores.ambar,
    fontWeight: "bold",
    marginTop: espacio.sm,
  },
});
