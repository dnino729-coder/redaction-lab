// DailyTrainingPage — Server Component, superficie pública de la feature.
// Mismo patrón que LaboratoryPage/MyPlanPage: modo temporal de desarrollo
// (DAILY_TRAINING_DEV_MODE=true) con datos simulados; sin esa variable,
// conserva el comportamiento original del placeholder (sin contenido).
import { getTranslations } from "next-intl/server";
import { isDailyTrainingDevModeEnabled, buildMockDailyTrainingReadModel } from "../services";
import { DailyTrainingView } from "./DailyTrainingView";

async function DevModeBanner() {
  const t = await getTranslations("dailyTraining.devMode");

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

export async function DailyTrainingPage() {
  if (isDailyTrainingDevModeEnabled()) {
    const data = buildMockDailyTrainingReadModel();

    return (
      <>
        <DevModeBanner />
        <DailyTrainingView data={data} />
      </>
    );
  }

  return null;
}

export default DailyTrainingPage;
