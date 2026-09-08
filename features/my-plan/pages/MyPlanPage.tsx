// MyPlanPage — Server Component, superficie pública de la feature
// (features/my-plan/pages), la única que app/ puede importar (sección 5.4).
// Ya no depende de MY_PLAN_DEV_MODE (retirado, mismo patrón que
// LaboratoryPage): la página se renderiza directamente para cualquier
// usuario autenticado (middleware.ts ya exige sesión Clerk).
//
// Bloque 1 (Resumen general / PlanSummaryOverview) usa datos reales — ver
// GetActiveLearningPlanHandler vía useActiveLearningPlan(). Los bloques
// 2-5 (calendario, objetivos, fases, configuración) todavía no tienen
// backend propio (fuera de alcance de este sprint) y siguen alimentados
// por buildMockMyPlanReadModel() — no se elimina ese servicio, solo deja
// de estar condicionado a un flag de desarrollo.
import { buildMockMyPlanReadModel } from "../services";
import { MyPlanView } from "./MyPlanView";

export async function MyPlanPage() {
  const data = buildMockMyPlanReadModel();
  return <MyPlanView data={data} />;
}

export default MyPlanPage;
