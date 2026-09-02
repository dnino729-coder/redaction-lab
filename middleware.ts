import { clerkMiddleware } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isPublicRoute } from "./middleware/auth";

const handleI18nRouting = createIntlMiddleware(routing);

// Bypass temporal de desarrollo (DASHBOARD_DEV_MODE) — permite visualizar
// /dashboard sin sesión de Clerk mientras se construye la interfaz.
// Alcance deliberadamente mínimo: solo /dashboard y /es/dashboard, nunca el
// resto de rutas privadas. Reversible por completo quitando la variable de
// entorno; auth().protect() no se toca, solo se condiciona su ejecución.
const isDashboardDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/)?dashboard(\/|$)/.test(pathname);

// Bypass temporal de desarrollo (MY_PLAN_DEV_MODE) — mismo mecanismo que
// DASHBOARD_DEV_MODE, pero exclusivo del módulo Mi Plan (nunca se reutiliza
// la variable de otro módulo, cada módulo tiene la suya). Alcance limitado a
// /my-plan, /es/my-plan y /fr/my-plan.
const isMyPlanDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/|fr\/)?my-plan(\/|$)/.test(pathname);

// Bypass temporal de desarrollo (LABORATORY_DEV_MODE) — exclusivo del
// módulo Laboratorio, mismo mecanismo. Alcance limitado a /laboratory,
// /es/laboratory y /fr/laboratory.
const isLaboratoryDevModeBypassRoute = (pathname: string) =>
  /^\/(es\/|fr\/)?laboratory(\/|$)/.test(pathname);

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

  const isMyPlanDevModeBypass =
    process.env.MY_PLAN_DEV_MODE === "true" &&
    isMyPlanDevModeBypassRoute(request.nextUrl.pathname);

  const isLaboratoryDevModeBypass =
    process.env.LABORATORY_DEV_MODE === "true" &&
    isLaboratoryDevModeBypassRoute(request.nextUrl.pathname);

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
    !isMyPlanDevModeBypass &&
    !isLaboratoryDevModeBypass &&
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
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
