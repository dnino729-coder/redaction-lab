// EvolutionPage — Server Component, superficie pública de la feature.
// Mismo patrón que LaboratoryPage/DailyTrainingPage: modo temporal de
// desarrollo (ANALYTICS_DEV_MODE=true) con datos simulados; sin esa
// variable, conserva el comportamiento original del placeholder.
import { getTranslations } from "next-intl/server";
import { isAnalyticsDevModeEnabled, buildMockEvolutionReadModel } from "../services";
import { EvolutionView } from "./EvolutionView";

async function DevModeBanner() {
  const t = await getTranslations("analytics.devMode");

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

export async function EvolutionPage() {
  if (isAnalyticsDevModeEnabled()) {
    const data = buildMockEvolutionReadModel();

    return (
      <>
        <DevModeBanner />
        <EvolutionView data={data} />
      </>
    );
  }

  return null;
}

export default EvolutionPage;
