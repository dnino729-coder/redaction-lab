// SimulatorPage — Server Component, superficie pública de la feature.
// Mismo patrón que DailyTrainingPage/LaboratoryPage: modo temporal de
// desarrollo (SIMULATOR_DEV_MODE=true) con datos simulados; sin esa
// variable, conserva el comportamiento original del placeholder.
//
// `searchParams.step` (opcional) permite previsualizar cada una de las 7
// pantallas durante el desarrollo a partir del mismo intento ya completado
// — es una lectura estática por petición (mismo patrón ya usado en
// UnitMapPage con `initialTextTypeFilter`), NUNCA una máquina de estados
// funcional: no hay transición, persistencia ni mutación de estado.
import { getTranslations } from "next-intl/server";
import { isSimulatorDevModeEnabled, buildMockSimulatorReadModel } from "../services";
import { SimulatorView } from "./SimulatorView";
import type { SimulatorStep } from "../types";

const VALID_STEPS: SimulatorStep[] = [
  "SUBJECT_SELECTION",
  "PROMPT",
  "PLANNING",
  "WRITING",
  "SUBMISSION",
  "EVALUATION",
  "ANALYSIS",
];

function resolveStep(value: string | string[] | undefined): SimulatorStep | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_STEPS.includes(candidate as SimulatorStep) ? (candidate as SimulatorStep) : undefined;
}

async function DevModeBanner() {
  const t = await getTranslations("simulator.devMode");

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

export interface SimulatorPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function SimulatorPage({ searchParams }: SimulatorPageProps) {
  if (isSimulatorDevModeEnabled()) {
    const step = resolveStep(searchParams?.step);
    const data = buildMockSimulatorReadModel(step);

    return (
      <>
        <DevModeBanner />
        <SimulatorView data={data} />
      </>
    );
  }

  return null;
}

export default SimulatorPage;
