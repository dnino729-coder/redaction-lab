// ReflectionSummaryPanel — Blueprint §11.2/§12 (P-10, "resumen de cierre
// reutilizando UnitStatusBadge"). 100% presentacional. No se fabrican
// "evidencias de progreso"/"mensaje del Coach IA" (Frontend Contract v1.1,
// más elaborado) — `AcademyUnitDetailHttp` no expone esos campos; mostrar
// algo no respaldado por datos reales violaría el mismo criterio ya
// aplicado en toda la Fase 1 ("nunca simular una respuesta que el backend
// no entrega"). El resumen se limita a lo que el propio Blueprint exige
// literalmente: `UnitStatusBadge` + las 2 acciones de navegación.
"use client";

import { useTranslations } from "next-intl";
import { AttemptActionButton } from "./AttemptActionButton";
import { UnitStatusBadge } from "../shared";
import type { AcademyUnitDetailHttp } from "../../types";

export interface ReflectionSummaryPanelProps {
  unit: AcademyUnitDetailHttp;
  onBackToMap: () => void;
  onRepeat: () => void;
  isRepeating: boolean;
}

export function ReflectionSummaryPanel({ unit, onBackToMap, onRepeat, isRepeating }: ReflectionSummaryPanelProps) {
  const t = useTranslations("academy.reflection");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-neutral-900">{t("summaryTitle")}</p>
        <UnitStatusBadge state={unit.state} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <AttemptActionButton label={t("backToMapLabel")} onClick={onBackToMap} variant="outline" />
        {unit.repeatable ? (
          <AttemptActionButton label={t("repeatLabel")} onClick={onRepeat} isLoading={isRepeating} />
        ) : null}
      </div>
    </div>
  );
}
