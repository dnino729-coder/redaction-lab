// Prueba del store de Zustand (docs/modules/dashboard.md, sección 6: estado
// de UI de cliente para recomendaciones descartadas "en esta sesión").
import { beforeEach, describe, expect, it } from "vitest";
import { useDashboardStore } from "@/stores/dashboardStore";

const RECOMMENDATION_ID = "5f8d0d55-1b6e-4b1d-9c1a-7f1a5c8e2f10";

describe("useDashboardStore", () => {
  beforeEach(() => {
    useDashboardStore.setState({ dismissedRecommendationIds: [] });
  });

  it("una recomendación no está descartada por defecto", () => {
    expect(useDashboardStore.getState().isRecommendationDismissed(RECOMMENDATION_ID)).toBe(false);
  });

  it("marca una recomendación como descartada", () => {
    useDashboardStore.getState().dismissRecommendation(RECOMMENDATION_ID);
    expect(useDashboardStore.getState().isRecommendationDismissed(RECOMMENDATION_ID)).toBe(true);
  });

  it("es idempotente: descartar dos veces no duplica la entrada", () => {
    useDashboardStore.getState().dismissRecommendation(RECOMMENDATION_ID);
    useDashboardStore.getState().dismissRecommendation(RECOMMENDATION_ID);
    expect(useDashboardStore.getState().dismissedRecommendationIds).toHaveLength(1);
  });

  it("no afecta a otras recomendaciones", () => {
    useDashboardStore.getState().dismissRecommendation(RECOMMENDATION_ID);
    expect(useDashboardStore.getState().isRecommendationDismissed("otro-id")).toBe(false);
  });
});
