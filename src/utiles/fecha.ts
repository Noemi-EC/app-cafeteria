const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** "12 nov 2026 · 18:40" — sin depender de Intl, que no está en todos los motores. */
export function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const hora = d.getHours().toString().padStart(2, "0");
  const minuto = d.getMinutes().toString().padStart(2, "0");

  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${hora}:${minuto}`;
}
