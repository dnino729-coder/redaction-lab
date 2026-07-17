// Protección de rutas privadas (sección 12.9) mediante Clerk (resolución 18.1).
// Este módulo define QUÉ rutas son públicas; la aplicación real de la
// protección ocurre en middleware.ts (raíz), que es el único punto de
// entrada que Next.js ejecuta.
//
// Corrige el hallazgo 3 de la auditoría de infraestructura: antes, este
// archivo estaba vacío y middleware.ts era un passthrough incondicional
// (NextResponse.next() para toda ruta) — es decir, ninguna ruta estaba
// realmente protegida pese a la separación de carpetas (public)/(auth)/(app).
//
// Resolución 18.18 (i18n): con localePrefix "as-needed", el idioma por
// defecto (fr) no lleva prefijo de URL, pero los demás locales sí
// (/es/sign-in). isPublicRoute debe reconocer ambas formas, o Clerk
// protegería por error las rutas públicas del locale español.

import { createRouteMatcher } from "@clerk/nextjs/server";
import { PUBLIC_ROUTES } from "@/config/routes";
import { routing } from "@/i18n/routing";

const nonDefaultLocales = routing.locales.filter(
  (locale) => locale !== routing.defaultLocale,
);

// Expande cada ruta pública sin prefijo ("/landing") a su variante
// prefijada por locale no-default ("/es/landing"), reutilizando
// PUBLIC_ROUTES como única fuente de verdad de qué rutas son públicas.
const localizedPublicRoutes = PUBLIC_ROUTES.flatMap((route) =>
  nonDefaultLocales.map((locale) =>
    route === "/" ? `/${locale}` : `/${locale}${route}`,
  ),
);

// createRouteMatcher acepta patrones de ruta (no rutas exactas); se añaden
// aquí los patrones de Clerk y de infraestructura (webhooks, health check)
// que deben quedar siempre fuera de la protección de autenticación.
export const isPublicRoute = createRouteMatcher([
  ...PUBLIC_ROUTES,
  ...localizedPublicRoutes,
  "/sign-in(.*)",
  "/sign-up(.*)",
  ...nonDefaultLocales.map((locale) => `/${locale}/sign-in(.*)`),
  ...nonDefaultLocales.map((locale) => `/${locale}/sign-up(.*)`),
  "/api/webhooks(.*)",
  "/api/health",
]);
