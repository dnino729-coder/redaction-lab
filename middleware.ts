// Punto de entrada obligatorio de Next.js para middleware (requisito técnico
// del framework). Compone dos responsabilidades, en este orden:
//   1. Autenticación (Clerk) — protección de rutas privadas (sección 12.9),
//      definida en middleware/auth.ts.
//   2. Enrutamiento de idioma (next-intl) — resolución de locale y reescritura
//      de la URL entrante (resolución 18.18), definida en i18n/routing.ts.
//
// Se ejecuta primero la protección de Clerk (si la ruta no es pública, exige
// sesión antes de continuar) y luego se delega en el middleware de next-intl
// para completar la negociación de idioma — este es el orden de composición
// recomendado oficialmente para Clerk + next-intl en App Router.
//
// Corrige el hallazgo 3 de la auditoría de infraestructura: antes era un
// passthrough incondicional; ahora toda ruta que no coincida con
// isPublicRoute exige sesión válida antes de renderizarse.

import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isPublicRoute } from "./middleware/auth";

const handleI18nRouting = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: [
    // Excluye archivos estáticos e internos de Next.js; incluye siempre
    // las rutas de API para que también pasen por la protección de Clerk
    // (las rutas de API no pasan por el enrutamiento de idioma: next-intl
    // solo reescribe rutas de páginas, nunca /api/*).
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
