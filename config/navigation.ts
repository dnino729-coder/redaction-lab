// Estructura de navegación oficial — 9 espacios (resolución 18.6 / sección 8.3:
// "Dashboard, Mi Plan, Introducción al DELF B2, Academia, Laboratorio de
// Lectura y Escritura, Desafíos, Simulador DELF B2, Evolución, Perfil").
// Los `href` se completan al implementar cada módulo; por ahora solo se fija
// el orden y las claves oficiales (regla de posicionamiento estable —
// sección 8.3). Las claves coinciden con los segmentos de ruta reales en
// app/[locale]/(app)/ para evitar una segunda fuente de verdad para los slugs.
//
// Corrige el hallazgo 10 de la auditoría de infraestructura: antes la clave
// del Simulador incluía el examen ("simulador-delf-b2"), acoplando la
// navegación a un examen específico y anticipando fricción para el roadmap
// de extensión a DALF/otros niveles DELF (sección 4.6). El examen actual se
// declara ahora por separado en CURRENT_EXAM_LEVEL (config/constants.ts). Se
// mantienen exactamente los 9 espacios de la sección 8.3 — esta corrección
// solo afecta al nombre de la clave, no a la estructura de navegación.
//
// Claves en inglés (resolución 18.19, refactor arquitectónico de cierre de
// sprint): el código fuente — identificadores, archivos, carpetas, rutas —
// permanece en inglés (18.2); el texto visible en francés/español vive
// exclusivamente en messages/fr.json y messages/es.json (namespace "nav"),
// nunca en estas claves. Cambiar una clave aquí es un cambio de código, no
// de idioma de interfaz — la interfaz sigue en francés sin ningún cambio.
export const NAVIGATION_ITEMS = [
  "dashboard",
  "my-plan",
  "about-delf", // Introducción al DELF B2 (teoría del examen) — sección 8.3
  "academy", // Academia de Escritura (tipos de texto) — sección 6.4
  "laboratory", // Laboratorio de Lectura y Escritura — sección 6.6
  "daily-training", // Centro de Entrenamiento / Desafíos — sección 6.8
  "simulator", // genérico: hoy resuelve al examen de CURRENT_EXAM_LEVEL (sección 4.6)
  "analytics", // Evolución (14.6) — reutiliza el mismo nombre que services/analytics, no es una feature nueva
  "profile",
] as const;
