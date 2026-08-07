// VersionWithFeedbackPanel — Blueprint §11.2/§12 (P-09, "Recibir
// retroalimentación"), reutilizado por Frontend Contract v1.1 P-13 (Sección
// "Biblioteca de Modelos" del Profesor, sin componentes nuevos). 100%
// presentacional: cero hooks de datos, recibe todo resuelto de
// `AttemptStepContainer` (mismo patrón que `WritingEditor`/`ComprehensionGate`,
// resolución AFR2-01).
// ⚠️ Discrepancia documental (disclosed, no corregida — fuera de alcance):
// la Frontend Contract v1.1 (línea 168) nombra este componente `FeedbackPanel`;
// el Blueprint FROZEN (más reciente, mayor precedencia) lo nombra
// `VersionWithFeedbackPanel` — se implementa con el nombre del Blueprint,
// mismo criterio ya aplicado a la discrepancia `StepContentPanel`/
// `PracticeActivityPanel` de P-07.
//
// Orden macro→micro (criterio de aceptación 2, §6.5): se ordena aquí mismo
// con `FEEDBACK_CATEGORY_PRIORITY` — no se crea ninguna estrategia de
// ordenamiento nueva, ni se muta el arreglo recibido por props.
//
// "Continuar a reflexión" (criterio de aceptación 3, §12): el botón se
// mantiene siempre habilitado (salvo mientras la mutación está en curso,
// mismo patrón de `SubmitButton`) — la precondición de dominio
// (`RevisionPolicy.assertMinimumCycleComplete`) no tiene ninguna señal
// fiable derivable en el cliente sin inventar una heurística no
// especificada por el Blueprint; es el propio `useAdvancePhase()` (EP-04)
// quien la hace cumplir, rechazando con 409 cuando no se satisface — el
// criterio 3 describe exactamente ese flujo (presionar → falla → error
// inline), no un deshabilitado previo.
"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button, ErrorState } from "@/components/ui";
import { FeedbackObservationItem } from "./FeedbackObservationItem";
import { ProcessingIndicator } from "../shared";
import { FEEDBACK_CATEGORY_PRIORITY } from "../../types/enums";
import type { FeedbackObservationHttp, AcademyErrorHttp } from "../../types";

export interface VersionWithFeedbackPanelProps {
  status: "READY" | "PROCESSING";
  observations: readonly FeedbackObservationHttp[];
  timedOut: boolean;
  onRetryProcessing: () => void;
  onRewrite: () => void;
  onContinueToReflection: () => void;
  isAdvancingPhase: boolean;
  advancePhaseError: AcademyErrorHttp | null;
}

export function VersionWithFeedbackPanel({
  status,
  observations,
  timedOut,
  onRetryProcessing,
  onRewrite,
  onContinueToReflection,
  isAdvancingPhase,
  advancePhaseError,
}: VersionWithFeedbackPanelProps) {
  const t = useTranslations("academy.feedback");

  if (status === "PROCESSING") {
    return <ProcessingIndicator timedOut={timedOut} onRetry={onRetryProcessing} />;
  }

  const sortedObservations = [...observations].sort(
    (a, b) => FEEDBACK_CATEGORY_PRIORITY[a.category] - FEEDBACK_CATEGORY_PRIORITY[b.category],
  );

  return (
    <div className="flex flex-col gap-4">
      <ul aria-live="polite">
        {sortedObservations.map((observation, index) => (
          <FeedbackObservationItem key={`${observation.category}-${index}`} observation={observation} />
        ))}
      </ul>

      {advancePhaseError ? (
        <ErrorState title={t("advancePhaseErrorTitle")} description={advancePhaseError.message} />
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onRewrite} className="w-full sm:w-auto">
          {t("rewriteLabel")}
        </Button>
        <Button
          type="button"
          onClick={onContinueToReflection}
          disabled={isAdvancingPhase}
          aria-busy={isAdvancingPhase}
          className="w-full sm:w-auto"
        >
          {isAdvancingPhase ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {t("continueToReflectionLabel")}
        </Button>
      </div>
    </div>
  );
}
