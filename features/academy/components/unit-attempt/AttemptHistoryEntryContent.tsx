// AttemptHistoryEntryContent — fix de AFR018-01 (AFR-018): la traducción de
// `currentStep`, el badge condicional de "actual" y el formato de
// `startedAt` estaban duplicados de forma independiente entre
// `AttemptHistoryRow.tsx` (fila de tabla) y el bloque `<li>` de
// `AttemptHistoryList.tsx` (tarjeta mobile). Se extrae aquí una única vez;
// ambos call sites conservan exactamente su propio wrapper/className previo
// (se pasa `stepClassName` para no alterar el resultado visual de ninguno de
// los dos).
"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui";
import type { AttemptSummaryHttp } from "../../types";

export interface AttemptHistoryStepBadgeProps {
  attempt: AttemptSummaryHttp;
  stepClassName?: string;
}

export function AttemptHistoryStepBadge({ attempt, stepClassName }: AttemptHistoryStepBadgeProps) {
  const t = useTranslations("academy.unitHistory");
  const tStep = useTranslations("academy.unitStep");

  return (
    <>
      <span className={stepClassName}>{tStep(attempt.currentStep)}</span>
      {attempt.isCurrent ? <Badge variant="primary">{t("currentLabel")}</Badge> : null}
    </>
  );
}

export interface AttemptHistoryStartedAtProps {
  attempt: AttemptSummaryHttp;
}

export function AttemptHistoryStartedAt({ attempt }: AttemptHistoryStartedAtProps) {
  const format = useFormatter();
  return <>{format.dateTime(new Date(attempt.startedAt), { dateStyle: "long" })}</>;
}
