"use client";
// CoachRecommendationCard — bloque 5 "Recomendación del Coach IA" (sección 2
// y 4). Una única recomendación con breve justificación + PrimaryTrainingCTA
// + acción de descarte. Respeta la regla de contención del Coach (9.2,
// criterio de aceptación, sección 16): como máximo se muestra una vez por
// visita, y el descarte la oculta para el resto de la sesión.
import { useTranslations } from "next-intl";
import { SuggestionCard } from "@/components/coach/SuggestionCard";
import { Button } from "@/components/ui";
import { useCoachRecommendation } from "../hooks";
import { PrimaryTrainingCTA } from "./PrimaryTrainingCTA";
import type { RecommendationBlock } from "../types";

export interface CoachRecommendationCardProps {
  recommendation: RecommendationBlock;
}

export function CoachRecommendationCard({ recommendation }: CoachRecommendationCardProps) {
  const t = useTranslations("dashboard.recommendation");
  const { visible, dismiss, isPending } = useCoachRecommendation(recommendation);

  if (!visible) {
    return (
      <section aria-labelledby="dashboard-recommendation-heading">
        <h2 id="dashboard-recommendation-heading" className="sr-only">
          {t("title")}
        </h2>
        <p className="text-sm text-neutral-400">{t("empty")}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="dashboard-recommendation-heading">
      <h2 id="dashboard-recommendation-heading" className="mb-2 text-base font-semibold text-neutral-900">
        {t("title")}
      </h2>
      <SuggestionCard
        coachLabel={t("coachLabel")}
        message={recommendation.text}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryTrainingCTA recommendationId={recommendation.recommendationId} />
            <Button variant="ghost" size="sm" onClick={dismiss} disabled={isPending}>
              {t("dismiss")}
            </Button>
          </div>
        }
      />
    </section>
  );
}
