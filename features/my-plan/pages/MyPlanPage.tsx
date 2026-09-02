// MyPlanPage — Server Component, superficie pública de la feature
// (features/my-plan/pages), la única que app/ puede importar (sección 5.4).
// Mismo patrón que DashboardPage: modo temporal de desarrollo
// (MY_PLAN_DEV_MODE=true) que renderiza con datos simulados, sin llamar a
// domain/application/infrastructure (no hay Handler ni Prisma invocado
// desde aquí). Cuando MY_PLAN_DEV_MODE no está activo, se conserva el
// comportamiento original del placeholder (sin contenido) — todavía no
// existe un flujo real de datos con el que reemplazarlo.
import { getTranslations } from "next-intl/server";
import { isMyPlanDevModeEnabled, buildMockMyPlanReadModel } from "../services";
import { MyPlanEmptyState } from "../components";
import { MyPlanView } from "./MyPlanView";

async function DevModeBanner() {
  const t = await getTranslations("myPlan.devMode");

  return (
    <div
      role="status"
      className="mx-auto mb-0 mt-4 max-w-5xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-6 lg:mx-8"
    >
      <p className="font-semibold uppercase tracking-wide">{t("title")}</p>
      <p>{t("description")}</p>
    </div>
  );
}

export async function MyPlanPage() {
  if (isMyPlanDevModeEnabled()) {
    const data = buildMockMyPlanReadModel();

    return (
      <>
        <DevModeBanner />
        {data.hasActivePlan ? (
          <MyPlanView data={data} />
        ) : (
          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            <MyPlanEmptyState />
          </div>
        )}
      </>
    );
  }

  return null;
}

export default MyPlanPage;
