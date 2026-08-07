// ModelExampleCard — Blueprint §11.2 ("ModelExampleCard (P-06, P-11, P-14) —
// resolución de ambigüedad AFR4-03"), §4 (`components/model-library/`).
// Presentacional puro: cero hooks de datos, recibe todo por props.
//
// Alcance: el Blueprint congela una única decisión de componente con
// `onEdit`/`onRetire` opcionales, reutilizado sin cambios por P-11
// (estudiante, lectura) y P-14 (admin, CRUD). P-06/P-11 no pasan estas props
// (permanecen `undefined`, sin renderizar acciones); P-14 (Sprint P-14) las
// añade. Extensión aditiva pura de la interfaz ya prevista desde el
// comentario original — ningún uso existente de este componente cambia.
//
// Accesibilidad: contenido largo con expansión accesible vía `<details>`
// nativo (Blueprint §11.2) — foco/teclado ya cubiertos por la semántica HTML
// del elemento, sin necesidad de JS ni ARIA adicional. Memoizado
// (`React.memo`, Blueprint Sección 21: "UnitCard/ModelExampleCard/
// FeedbackObservationItem memoizados").
//
// Fix AFR028-02: el badge de rating "HAS_ERRORS" usa `warning-800` (no
// `warning-700`) sobre `warning-100` — `warning-700` daba 4.51:1 (AA por un
// margen de solo 0.01, WCAG 1.4.3); `warning-800` da 6.37:1, con margen
// cómodo. `success-700` sobre `success-100` (EXCELLENT) ya daba 4.84:1, sin
// cambios.
"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ModelExampleHttp } from "../../types";

export interface ModelExampleCardProps {
  example: ModelExampleHttp;
  onEdit?: (example: ModelExampleHttp) => void;
  onRetire?: (example: ModelExampleHttp) => void;
}

function ModelExampleCardComponent({ example, onEdit, onRetire }: ModelExampleCardProps) {
  const t = useTranslations("academy.modelExample");
  const isExcellent = example.rating === "EXCELLENT";

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
      <span
        className={cn(
          "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
          isExcellent ? "bg-success-100 text-success-700" : "bg-warning-100 text-warning-800",
        )}
      >
        {isExcellent ? t("ratingExcellent") : t("ratingHasErrors")}
      </span>

      <p className="text-sm text-neutral-600">{example.curatorialComment}</p>

      <details className="text-sm text-neutral-700">
        <summary className="cursor-pointer font-medium text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          {t("expandLabel")}
        </summary>
        <p className="mt-2 whitespace-pre-wrap">{example.content}</p>
      </details>

      {onEdit || onRetire ? (
        <div className="flex gap-2">
          {onEdit ? (
            <Button size="sm" variant="outline" onClick={() => onEdit(example)}>
              {t("editLabel")}
            </Button>
          ) : null}
          {onRetire && example.status !== "RETIRED" ? (
            <Button size="sm" variant="danger" onClick={() => onRetire(example)}>
              {t("retireLabel")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export const ModelExampleCard = memo(ModelExampleCardComponent);
ModelExampleCard.displayName = "ModelExampleCard";
