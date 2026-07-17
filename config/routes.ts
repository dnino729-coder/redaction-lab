// Rutas públicas y privadas (sección 12.9).
//
// Resolución 18.18 (i18n): estos segmentos son canónicos para el idioma por
// defecto (fr, sin prefijo de URL — ver i18n/routing.ts, localePrefix
// "as-needed"). No incluyen el prefijo /es porque esa expansión se genera
// automáticamente en middleware/auth.ts a partir de esta misma lista — no
// dupliques rutas con prefijo de locale aquí.
//
// Segmentos en inglés (resolución 18.19, refactor arquitectónico de cierre
// de sprint) — mismo motivo que config/navigation.ts: son identificadores
// de código (carpetas reales bajo app/[locale]/(app)/), no texto de
// interfaz. El texto que el usuario ve sigue en francés/español vía
// messages/*.json, sin ningún cambio.
export const PUBLIC_ROUTES = ["/", "/landing", "/sign-in", "/sign-up"] as const;
export const PRIVATE_ROUTES = [
  "/dashboard",
  "/my-plan",
  "/about-delf",
  "/academy",
  "/laboratory",
  "/daily-training",
  "/simulator",
  "/analytics",
  "/profile",
  "/settings",
] as const;
