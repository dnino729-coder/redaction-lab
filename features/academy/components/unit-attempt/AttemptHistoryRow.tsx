// AttemptHistoryRow — Blueprint §4/§12 (P-03). Presentacional puro: cero
// hooks de datos, recibe todo por props. Fila de `<table>` (versión
// escritorio de `AttemptHistoryList`). El intento `isCurrent` se distingue
// visualmente Y por texto (`academy.unitHistory.currentLabel`) — nunca solo
// color (mismo criterio ya aplicado a `UnitStatusBadge`, Sprint 1.2).
// Deliberadamente sin `versionCount` — dato no disponible (gap Blueprint
// §5.2), nunca se simula.
//
// Fix AFR018-01 (AFR-018): la traducción del paso, el badge de "actual" y el
// formato de fecha se movieron a `AttemptHistoryEntryContent.tsx` (compartido
// con la tarjeta mobile de `AttemptHistoryList`) — mismo resultado visual,
// sin lógica duplicada.
"use client";

import { cn } from "@/lib/utils";
import { AttemptHistoryStartedAt, AttemptHistoryStepBadge } from "./AttemptHistoryEntryContent";
import type { AttemptSummaryHttp } from "../../types";

export interface AttemptHistoryRowProps {
  attempt: AttemptSummaryHttp;
}

export function AttemptHistoryRow({ attempt }: AttemptHistoryRowProps) {
  return (
    <tr className={cn(attempt.isCurrent && "bg-primary-50")}>
      <td className="px-4 py-3 text-sm text-neutral-900">
        <div className="flex items-center gap-2">
          <AttemptHistoryStepBadge attempt={attempt} />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        <AttemptHistoryStartedAt attempt={attempt} />
      </td>
    </tr>
  );
}
