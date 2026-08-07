// StepAdvanceButton — Blueprint §4/§11.2 (P-04, reutilizable en P-06/P-07).
// Presentacional puro: cero hooks de datos ni Server Actions — recibe
// `onAdvance`/`isSubmitting` ya resueltos de `AttemptStepContainer`, que es
// quien invoca `useAdvanceStep()` (mismo criterio de pureza que
// `AttemptActionButton`/`ComprehensionGate`/`WritingEditor`, resolución
// AFR2-01 del Blueprint).
//
// Nota (disclosed): el Blueprint (§11.2) describe este componente con props
// `{ attemptId: string; onAdvanced: (nextStep: UnitStep) => void }`, lo que
// leído literalmente sugeriría que el propio botón invoca `useAdvanceStep()`
// — se interpreta como una imprecisión de la especificación abreviada, ya
// que contradice la regla de esta fase ("ningún componente presentacional
// consume React Query ni Server Actions directamente") y el propio criterio
// ya aplicado a `SubmitButton`/`ComprehensionGate`. Se implementa aquí con
// `onAdvance: () => void` (sin `attemptId`), reutilizando el mismo patrón ya
// congelado de `AttemptActionButton` (Sprint 1.3).
"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export interface StepAdvanceButtonProps {
  onAdvance: () => void;
  isSubmitting?: boolean;
}

export function StepAdvanceButton({ onAdvance, isSubmitting = false }: StepAdvanceButtonProps) {
  const t = useTranslations("academy.unitDetail");

  return (
    <Button
      type="button"
      onClick={onAdvance}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="w-full sm:w-auto"
    >
      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {t("continueLabel")}
    </Button>
  );
}
