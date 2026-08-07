// StepProgressTracker — Blueprint §4 (`components/shared/`), §11.2. Muestra
// los 11 pasos y cuál está activo, dentro de P-04 a P-10 — sustituye a
// `AcademyBreadcrumbs` en ese recorrido lineal (§19: "P-04 a P-10... usa
// StepProgressTracker en su lugar"). Presentacional puro: cero hooks de
// datos, recibe todo por props.
//
// La variante "COMPREHEND con sub-estado de verificación pendiente" (§11.2)
// no se implementa todavía — ningún paso construido hasta Sprint 1.5
// (P-04: `CONTEXTUALIZE`/`DEFINE_OBJECTIVES`) llega nunca a `COMPREHEND`;
// se añadirá cuando se implemente P-05, sin necesidad de romper las props
// ya congeladas aquí (`{ currentStep: UnitStep }`, tal como especifica el
// Blueprint).
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { UNIT_STEP_ORDER } from "../../constants";
import type { UnitStep } from "../../types";

export interface StepProgressTrackerProps {
  currentStep: UnitStep;
}

export function StepProgressTracker({ currentStep }: StepProgressTrackerProps) {
  const tStep = useTranslations("academy.unitStep");
  const visibleSteps = UNIT_STEP_ORDER.filter((step): step is Exclude<UnitStep, "UNLOCK"> => step !== "UNLOCK");
  const currentIndex = visibleSteps.indexOf(currentStep as Exclude<UnitStep, "UNLOCK">);

  return (
    <ol className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
      {visibleSteps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = currentIndex >= 0 && index < currentIndex;

        return (
          <li
            key={step}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "shrink-0 snap-start whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium",
              isActive && "bg-primary-600 text-neutral-0",
              isCompleted && !isActive && "bg-success-100 text-success-700",
              !isActive && !isCompleted && "bg-neutral-100 text-neutral-500",
            )}
          >
            {tStep(step)}
          </li>
        );
      })}
    </ol>
  );
}
