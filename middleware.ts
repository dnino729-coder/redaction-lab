import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isPublicRoute } from "./middleware/auth";

const handleI18nRouting = createIntlMiddleware(routing);

// Corrige el fallback cross-origin de Clerk (auth().protect() -> Account
// Portal en accounts.redactionlab.online) que Safari bloquea como CORS en
// navegaciones RSC (?_rsc=...): sin signInUrl/signUpUrl explícitos, Clerk
// cae a environment.displayConfig.signInUrl (Account Portal, otro origen).
// Se calculan por request (no estático) para conservar el locale actual.
//
// nonDefaultLocales replica, sin importarlo, el mismo criterio que
// middleware/auth.ts usa para isPublicRoute (ese binding no está exportado
// ahí, por lo que importarlo requeriría modificar ese archivo). La fuente
// única de verdad (routing.locales/routing.defaultLocale) no se duplica:
// se deriva localmente el mismo criterio a partir del mismo `routing` ya
// importado más arriba.
const nonDefaultLocales = routing.locales.filter((locale) => locale !== routing.defaultLocale);

const getClerkMiddlewareOptions = (request: Request) => {
  const { pathname } = new URL(request.url);
  const isNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  const locale = isNonDefaultLocale ? pathname.split("/")[1] : routing.defaultLocale;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  return {
    signInUrl: `${prefix}/sign-in`,
    signUpUrl: `${prefix}/sign-up`,
  };
};

// Bypass temporal de desarrollo (DASHBOARD_DEV_MODE) — permite visualizar
// /dashboard sin sesión de Clerk mientras se construye la interfaz.
// Alcance deliberadamente mínimo: solo /dashboard y /es/dashboard, nunca el
// resto de rutas privadas. Reversible por completo quitando la variable de
// entorno; auth().protect() no se toca, solo se condiciona su ejecución.
const isDashboardDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/)?dashboard(\/|$)/.test(pathname);

// Bypass temporal de desarrollo (DAILY_TRAINING_DEV_MODE) — exclusivo del
// módulo Entrenamiento, mismo mecanismo. Alcance limitado a
// /daily-training, /es/daily-training y /fr/daily-training.
const isDailyTrainingDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/|fr\/)?daily-training(\/|$)/.test(pathname);

// Bypass temporal de desarrollo (SIMULATOR_DEV_MODE) — exclusivo del
// módulo Simulador, mismo mecanismo. Alcance limitado a /simulator,
// /es/simulator y /fr/simulator.
const isSimulatorDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/|fr\/)?simulator(\/|$)/.test(pathname);

// Bypass temporal de desarrollo (ANALYTICS_DEV_MODE) — exclusivo del
// módulo Évolution (ruta real /analytics), mismo mecanismo. Alcance
// limitado a /analytics, /es/analytics y /fr/analytics.
const isAnalyticsDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/|fr\/)?analytics(\/|$)/.test(pathname);

export default clerkMiddleware(async (auth, request) => {
  console.log("🟢 MIDDLEWARE:", request.nextUrl.pathname);

  const isDashboardDevModeBypass =
    process.env.DASHBOARD_DEV_MODE === "true" &&
    isDashboardDevModeBypassRoute(request.nextUrl.pathname);

  const isDailyTrainingDevModeBypass =
    process.env.DAILY_TRAINING_DEV_MODE === "true" &&
    isDailyTrainingDevModeBypassRoute(request.nextUrl.pathname);

  const isSimulatorDevModeBypass =
    process.env.SIMULATOR_DEV_MODE === "true" &&
    isSimulatorDevModeBypassRoute(request.nextUrl.pathname);

  const isAnalyticsDevModeBypass =
    process.env.ANALYTICS_DEV_MODE === "true" &&
    isAnalyticsDevModeBypassRoute(request.nextUrl.pathname);

  if (
    !isPublicRoute(request) &&
    !isDashboardDevModeBypass &&
    !isDailyTrainingDevModeBypass &&
    !isSimulatorDevModeBypass &&
    !isAnalyticsDevModeBypass
  ) {
    await auth().protect();
  }

  // No aplicar next-intl a las rutas API
  if (request.nextUrl.pathname.startsWith("/api")) {
    return;
  }

  return handleI18nRouting(request);
}, getClerkMiddlewareOptions);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
