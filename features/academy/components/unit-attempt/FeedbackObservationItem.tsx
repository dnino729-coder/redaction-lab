// FeedbackObservationItem — Blueprint §11.2 (P-09). Presentacional puro:
// una observación ya resuelta (categoría, fortaleza/debilidad, explicación,
// sugerencia) — el orden macro→micro lo resuelve `VersionWithFeedbackPanel`,
// este componente solo renderiza una fila.
"use client";

import { useTranslations } from "next-intl";
import { mapFeedbackCategoryLabel } from "../../utils/mapFeedbackCategoryLabel";
import type { FeedbackObservationHttp } from "../../types";

export interface FeedbackObservationItemProps {
  observation: FeedbackObservationHttp;
}

export function FeedbackObservationItem({ observation }: FeedbackObservationItemProps) {
  const t = useTranslations("academy.feedback");

  return (
    <li className="flex flex-col gap-1 border-b border-neutral-200 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-neutral-900">
          {t(mapFeedbackCategoryLabel(observation.category))}
        </span>
        <span
          className={
            observation.strength === "STRENGTH"
              ? "text-xs font-medium text-success-700"
              : "text-xs font-medium text-danger-600"
          }
        >
          {t(observation.strength === "STRENGTH" ? "strengthLabel" : "weaknessLabel")}
        </span>
      </div>
      <p className="text-sm text-neutral-700">{observation.explanation}</p>
      <p className="text-sm text-neutral-600">{observation.suggestion}</p>
    </li>
  );
}
