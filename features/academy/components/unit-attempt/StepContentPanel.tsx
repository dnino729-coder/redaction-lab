// StepContentPanel — Blueprint §4/§11.2 (P-04, reutilizable en P-06/P-07).
// Presentacional puro: cero hooks de datos. Incluye el heading propio de la
// pantalla (mismo criterio de jerarquía que P-02/P-03: un `<h1>` por
// pantalla, evita repetir el hallazgo AFR018-02).
//
// ⚠️ Gap disclosed (Blueprint §14, ítem 3): la fuente del contenido
// editorial/pedagógico de este paso no está definida en ningún contrato —
// este componente queda especificado estructuralmente (recibe `step`,
// renderiza contenido) pero sin fuente de datos real hasta que exista esa
// decisión de producto. No se inventa contenido.
"use client";

import { useTranslations } from "next-intl";
import type { UnitStep } from "../../types";

export interface StepContentPanelProps {
  step: UnitStep;
}

export function StepContentPanel({ step }: StepContentPanelProps) {
  const tStep = useTranslations("academy.unitStep");
  const t = useTranslations("academy.attemptStep");

  return (
    <article className="mx-auto flex w-full max-w-xl flex-col gap-2">
      <h1 className="text-xl font-semibold text-neutral-900">{tStep(step)}</h1>
      <p className="text-sm text-neutral-600">{t("contentPending")}</p>
    </article>
  );
}
