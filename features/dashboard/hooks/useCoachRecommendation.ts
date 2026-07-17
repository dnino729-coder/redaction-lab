"use client";
// useCoachRecommendation — obtiene y permite descartar la recomendación del
// día (docs/modules/dashboard.md, sección 9). El descarte es estado de
// cliente (useDashboardStore, sección 6) + un evento de analítica (Server
// Action `dismissRecommendation`, sección 8) — nunca una escritura sobre
// `CoachRecommendation` (sección 10, MUST: solo lectura).
import { useCallback, useTransition } from "react";
import { dismissRecommendation } from "../actions";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { RecommendationBlock } from "../types";

export function useCoachRecommendation(recommendation: RecommendationBlock) {
  const [isPending, startTransition] = useTransition();
  const isDismissed = useDashboardStore((state) =>
    recommendation.recommendationId
      ? state.isRecommendationDismissed(recommendation.recommendationId)
      : false,
  );
  const dismissLocally = useDashboardStore((state) => state.dismissRecommendation);

  const dismiss = useCallback(() => {
    if (!recommendation.recommendationId) return;
    const recommendationId = recommendation.recommendationId;

    dismissLocally(recommendationId);
    startTransition(() => {
      void dismissRecommendation({ recommendationId });
    });
  }, [dismissLocally, recommendation.recommendationId]);

  return {
    recommendation,
    visible: recommendation.available && !isDismissed,
    isPending,
    dismiss,
  };
}
