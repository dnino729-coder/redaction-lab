// LaboratoryPage — Server Component, superficie pública de la feature.
// Mismo patrón que MyPlanPage/DashboardPage: modo temporal de desarrollo
// (LABORATORY_DEV_MODE=true) con datos simulados; sin esa variable,
// conserva el comportamiento original del placeholder (sin contenido).
import { getTranslations } from "next-intl/server";
import { isLaboratoryDevModeEnabled, buildMockLaboratoryReadModel } from "../services";
import { LaboratoryView } from "./LaboratoryView";

async function DevModeBanner() {
  const t = await getTranslations("laboratory.devMode");

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

export async function LaboratoryPage() {
  if (isLaboratoryDevModeEnabled()) {
    const data = buildMockLaboratoryReadModel();

    return (
      <>
        <DevModeBanner />
        <LaboratoryView data={data} />
      </>
    );
  }

  return null;
}

export default LaboratoryPage;
