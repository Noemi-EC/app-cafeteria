// Catálogo interno de referencia
export const PRODUCTOS = [
  "Flat White",
  "Americano",
  "Cappuccino",
  "Latte",
  "Espresso",
  "Mocha",
  "Cold Brew",
] as const;

export const DESCRIPCION_NIVEL: Record<string, string> = {
  Visitante: "Nos acabamos de conocer.",
  Conocido: "Ya sabemos tu nombre y tu pedido de siempre.",
  Habitué: "Eres de la casa. Te esperamos cada semana.",
  Raíz: "Eres parte de Café Link. Gracias por estar.",
};
