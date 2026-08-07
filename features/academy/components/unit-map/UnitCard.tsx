// UnitCard — Blueprint §4/§12 (P-01), §10.1 (`UnitMapContainer` la renderiza
// con `onSelect` → navega a P-02). Presentacional puro: cero hooks de datos,
// recibe todo por props. Área de toque ≥44×44px (WCAG 2.5.5, criterio de
// aceptación de accesibilidad ya fijado en Fase 0/Sprint 1.1). Deshabilitada
// cuando `state === "LOCKED"` — el Objetivo de P-01 permite navegar
// "hacia cualquier unidad no bloqueada", nunca a una bloqueada.
//
// Sin título de unidad en el DTO (`AcademyUnitSummaryHttp` no tiene
// `title`/`name`, solo `unitId/studentId/textType/position/state/
// activeAttemptId`, Blueprint §5.1) — se usa `position` como único dato
// disponible para identificar la unidad ante el usuario, sin inventar
// contenido editorial.
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { UnitStatusBadge, RecommendationBadge } from "../shared";
import type { AcademyUnitSummaryHttp } from "../../types";

export interface UnitCardProps {
  unit: AcademyUnitSummaryHttp;
  isRecommended: boolean;
  onSelect: (unitId: string) => void;
}

export function UnitCard({ unit, isRecommended, onSelect }: UnitCardProps) {
  const t = useTranslations("academy.unitMap");
  const isLocked = unit.state === "LOCKED";

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => onSelect(unit.unitId)}
      className={cn(
        "flex min-h-[44px] flex-col items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-left shadow-sm",
        "transition-colors duration-150 ease-delf-ease hover:bg-neutral-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <span className="text-sm font-medium text-neutral-900">{t("unitLabel", { position: unit.position })}</span>
      <div className="flex flex-wrap items-center gap-2">
        <UnitStatusBadge state={unit.state} />
        <RecommendationBadge isRecommended={isRecommended} />
      </div>
    </button>
  );
}
