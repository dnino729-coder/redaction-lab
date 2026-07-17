// Configuración central de i18n (resolución 18.18: francés como idioma
// predeterminado/primario, español disponible vía selector de idioma, sin
// modificar el código de los componentes — arquitectura next-intl).
//
// localePrefix "as-needed": el idioma predeterminado (fr) no lleva prefijo
// en la URL (/dashboard), mientras que español sí lo lleva (/es/dashboard).
// Esto refleja literalmente la decisión "el francés es el idioma
// predeterminado y el idioma de diseño primario" sin penalizar la URL
// canónica del idioma principal del proyecto.

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "es"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});
