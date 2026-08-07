// ModelLibraryContainer — Blueprint §10.1/§12 (P-11). Único componente
// inteligente de esta pantalla: concentra el hook de datos y el estado de
// filtro. `ModelExampleCard` (variante lectura, reutilizada de P-06 sin
// cambios) es 100% presentacional.
//
// Filtro (Blueprint §12 P-11, criterio de aceptación 1): mismo patrón de
// `Select` + `ALL_TEXT_TYPES` ya usado en `UnitMapContainer` (P-01) — sin
// selección, `textType` es `undefined` y `useModelExamples(undefined)`
// devuelve los 5 tipos combinados (mismo comportamiento ya usado, sin
// modificar, por `AttemptStepContainer` cuando no hay `matchedAttempt`).
// A diferencia de P-01, esta pantalla no agrupa por `TextType` (el Blueprint
// no lo pide para P-11) — un único grid, igual que la sección de ejemplos
// modelo de P-06.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState, ErrorState, Select, Skeleton } from "@/components/ui";
import { useModelExamples } from "../../hooks";
import { ALL_TEXT_TYPES } from "../../constants";
import { ModelExampleCard } from "./ModelExampleCard";
import type { TextType } from "../../types";

export function ModelLibraryContainer() {
  const t = useTranslations("academy.modelLibrary");
  const tModelExample = useTranslations("academy.modelExample");
  const tTextType = useTranslations("academy.textType");

  const [textType, setTextType] = useState<TextType | undefined>(undefined);
  const modelExamplesQuery = useModelExamples(textType);

  if (modelExamplesQuery.isLoading) {
    return <ModelLibraryLoadingSkeleton />;
  }

  if (modelExamplesQuery.isError) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={modelExamplesQuery.error.message}
        retryLabel={t("retryLabel")}
        onRetry={() => modelExamplesQuery.refetch()}
      />
    );
  }

  const examples = modelExamplesQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          {t("filterLabel")}
          <Select
            value={textType ?? ""}
            onChange={(event) => setTextType((event.target.value || undefined) as TextType | undefined)}
          >
            <option value="">{t("filterAll")}</option>
            {ALL_TEXT_TYPES.map((candidate) => (
              <option key={candidate} value={candidate}>
                {tTextType(candidate)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {examples.length === 0 ? (
        <EmptyState title={tModelExample("emptyTitle")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <ModelExampleCard key={example.modelExampleId} example={example} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModelLibraryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );
}
