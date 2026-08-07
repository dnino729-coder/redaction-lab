// AttemptHistoryList — Blueprint §4/§12 (P-03). Presentacional puro: cero
// hooks de datos, recibe todo por props. `<table>` real con `<th scope="col">`
// (accesibilidad, §12) que colapsa a tarjetas apiladas en mobile (§18,
// responsive) — misma lista de datos, dos marcados distintos vía utilidades
// responsive de Tailwind (`hidden sm:table` / `sm:hidden`).
//
// Fix AFR018-01 (AFR-018): la tarjeta mobile reutiliza los mismos
// componentes de contenido que `AttemptHistoryRow` (`AttemptHistoryEntryContent.tsx`)
// en vez de reimplementar la traducción del paso/badge/fecha de forma
// independiente — mismo resultado visual, sin lógica duplicada.
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AttemptHistoryRow } from "./AttemptHistoryRow";
import { AttemptHistoryStartedAt, AttemptHistoryStepBadge } from "./AttemptHistoryEntryContent";
import type { AttemptSummaryHttp } from "../../types";

export interface AttemptHistoryListProps {
  attempts: readonly AttemptSummaryHttp[];
}

export function AttemptHistoryList({ attempts }: AttemptHistoryListProps) {
  const t = useTranslations("academy.unitHistory");

  return (
    <>
      <table className="hidden w-full border-collapse sm:table">
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase text-neutral-500">
              {t("columnStep")}
            </th>
            <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase text-neutral-500">
              {t("columnStartedAt")}
            </th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => (
            <AttemptHistoryRow key={attempt.attemptId} attempt={attempt} />
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 sm:hidden">
        {attempts.map((attempt) => (
          <li
            key={attempt.attemptId}
            className={cn(
              "flex flex-col gap-1 rounded-lg border border-neutral-200 p-4",
              attempt.isCurrent && "bg-primary-50",
            )}
          >
            <div className="flex items-center gap-2">
              <AttemptHistoryStepBadge attempt={attempt} stepClassName="text-sm font-medium text-neutral-900" />
            </div>
            <span className="text-sm text-neutral-600">
              <AttemptHistoryStartedAt attempt={attempt} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
