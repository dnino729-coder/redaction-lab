// Constantes globales (UPPER_SNAKE_CASE — sección 13.13). Sin valores de
// producto todavía; se completa por módulo.
//
// DEFAULT_LANGUAGE / SUPPORTED_LOCALES se mantienen aquí como espejo de
// solo-lectura de i18n/routing.ts (fuente de verdad real de next-intl) para
// que módulos que no necesiten importar next-intl directamente puedan leer
// el idioma por defecto sin acoplarse a la librería de i18n (resolución 18.18).
export const DEFAULT_LANGUAGE = "fr";
export const SUPPORTED_LOCALES = ["fr", "es"] as const;
export const DEFAULT_TIMEZONE = "UTC";

// Examen activo del MVP (sección 4.1). Se declara aquí, separado de la
// navegación (config/navigation.ts) y del slug genérico "simulator"
// (renombrado de "simulador" en la resolución 18.19), para
// que añadir DALF C1 u otros niveles DELF (roadmap, sección 4.6; resolución
// 18.17) no requiera renombrar rutas ni claves de navegación — corrige el
// hallazgo 10 de la auditoría de infraestructura.
export const CURRENT_EXAM_LEVEL = "DELF_B2" as const;
