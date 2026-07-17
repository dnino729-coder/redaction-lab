"use client";
// EvolutionSummaryPanel — bloque 6 "Evolución (resumen visual)" (sección 2
// y 4). Calidad de escritura, organización textual, gramática, cohesión,
// vocabulario, frecuencia de estudio, autonomía. Reduce el número de
// indicadores visibles según el dispositivo (14.10: 5 escritorio / 3-4
// tablet / 2-3 móvil) — "ver más" no implementado en esta fase (fuera del
// alcance mínimo del criterio MUST de no perder funcionalidad: los
// indicadores restantes siguen presentes en el modelo de datos, solo no se
// listan todos a la vez en pantallas pequeñas).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import { useMediaQuery, BREAKPOINTS } from "@/hooks/useMediaQuery";
import { clampPercentage } from "../utils/dashboard.utils";
import type { EvolutionBlock } from "../types";

export interface EvolutionSummaryPanelProps {
  evolution: EvolutionBlock;
}

export function EvolutionSummaryPanel({ evolution }: EvolutionSummaryPanelProps) {
  const t = useTranslations("dashboard.evolution");
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);

  const visibleCount = isDesktop ? 5 : isTablet ? 4 : 3;
  const visibleCompetencies = evolution.competencies.slice(0, visibleCount);

  const hasAnyData =
    visibleCompetencies.length > 0 || evolution.studyFrequency || evolution.performance;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hasAnyData ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {visibleCompetencies.map((competency) => (
                <li key={competency.competencyId}>
                  <ProgressBar
                    label={competency.competencyName}
                    value={clampPercentage(competency.masteryPercentage)}
                    tone="success"
                  />
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
              {evolution.studyFrequency ? (
                <span>{t("activeDays", { count: evolution.studyFrequency.activeDays })}</span>
              ) : null}
              <span>{t("streak", { count: evolution.currentStreak })}</span>
              {evolution.performance ? (
                <span>
                  {t("performance")}: {evolution.performance.successRate.toFixed(0)}%
                </span>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
