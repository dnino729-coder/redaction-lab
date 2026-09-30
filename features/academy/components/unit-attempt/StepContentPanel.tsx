// StepContentPanel — Blueprint §4/§11.2 (P-04, reutilizable en P-06/P-07).
// Presentacional puro: cero hooks de datos (mismo criterio documentado en
// AttemptStepContainer.tsx: "Los presentacionales... no invocan React
// Query ni Server Actions") — recibe el resultado ya resuelto de
// `useUnitStepContent` como props, invocado por el Container. Incluye el
// heading propio de la pantalla (mismo criterio de jerarquía que P-02/P-03:
// un `<h1>` por pantalla, evita repetir el hallazgo AFR018-02).
//
// Academy Content v1 (Bloque 3F) — cierra el gap disclosed originalmente en
// Blueprint §14, ítem 3: ya existe fuente de datos real
// (`AcademyUnitContent`/`UnitContentBlock`, Bloques 1-3D.5). `contentPending`
// deja de ser el mensaje universal por defecto y pasa a ser exactamente lo
// que siempre debió ser: el estado "sin contenido PUBLISHED todavía" para
// un slot específico — nunca contenido de fallback inventado.
"use client";

import { useTranslations } from "next-intl";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import type { ApiError } from "@/lib/apiClient";
import type { UnitContentBlockHttp, UnitStep } from "../../types";
import { UnitContentBlockRenderer } from "./UnitContentBlockRenderer";

export interface StepContentPanelProps {
  step: UnitStep;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | Error | null;
  blocks: readonly UnitContentBlockHttp[];
  onRetry: () => void;
}

export function StepContentPanel({
  step,
  isLoading,
  isError,
  error,
  blocks,
  onRetry,
}: StepContentPanelProps) {
  const tStep = useTranslations("academy.unitStep");
  const t = useTranslations("academy.attemptStep");
  const tUnitMap = useTranslations("academy.unitMap");

  return (
    <article className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-neutral-900">{tStep(step)}</h1>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : isError ? (
        <ErrorState
          title={t("errorTitle")}
          description={error instanceof Error ? error.message : undefined}
          retryLabel={tUnitMap("retryLabel")}
          onRetry={onRetry}
        />
      ) : blocks.length === 0 ? (
        <EmptyState title={t("contentPending")} />
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block) => (
            <UnitContentBlockRenderer key={block.order} block={block} />
          ))}
        </div>
      )}
    </article>
  );
}
