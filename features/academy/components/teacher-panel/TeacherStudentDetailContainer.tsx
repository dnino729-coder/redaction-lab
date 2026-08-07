// TeacherStudentDetailContainer — Panel del Profesor (P-13). Único
// componente inteligente de esta pantalla (mismo criterio que
// `UnitDetailContainer`).
//
// Navegación a historial de unidad: no existe (a diferencia del catálogo
// propio del Estudiante, `useUnits()`) ninguna Query que enumere las
// unidades de un estudiante arbitrario desde la sesión del Profesor — el
// campo `unitId` se solicita manualmente (mismo criterio de honestidad ya
// aplicado en `TeacherDashboardContainer` respecto a la selección de
// estudiantes) en vez de fabricar un listado que el backend no entrega hoy.
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, ErrorState, ForbiddenState, ProgressBar, Skeleton } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/apiClient";
import { useStudentProgressSummary } from "../../hooks";
import { academyRoutes } from "../../constants";
import { AcademyBreadcrumbs } from "../shared";

export interface TeacherStudentDetailContainerProps {
  studentId: string;
}

export function TeacherStudentDetailContainer({ studentId }: TeacherStudentDetailContainerProps) {
  const t = useTranslations("academy.teacherPanel");
  const tUnitState = useTranslations("academy.unitState");
  const router = useRouter();
  const [unitIdInput, setUnitIdInput] = useState("");

  const progressQuery = useStudentProgressSummary(studentId);

  function handleViewUnitHistory(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = unitIdInput.trim();
    if (!trimmed) return;
    router.push(academyRoutes.studentUnitHistory(studentId, trimmed));
  }

  if (progressQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (progressQuery.isError) {
    const error = progressQuery.error;
    if (error instanceof ApiError && error.status === 403) {
      return <ForbiddenState title={t("forbiddenTitle")} />;
    }
    return (
      <ErrorState
        title={t("studentErrorTitle")}
        description={error.message}
        retryLabel={t("retryLabel")}
        onRetry={() => progressQuery.refetch()}
      />
    );
  }

  const summary = progressQuery.data;
  const unitsByState = summary?.unitsByState ?? {};
  const totalUnits = Object.values(unitsByState).reduce((sum, count) => sum + (count ?? 0), 0);
  const completed = (unitsByState.COMPLETED ?? 0) + (unitsByState.MASTERED ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <AcademyBreadcrumbs
        items={[{ label: t("title"), href: academyRoutes.teacherPanel() }, { label: studentId }]}
      />

      <div>
        <h2 className="text-base font-semibold text-neutral-900">{studentId}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t("totalUnitsLabel", { count: totalUnits })}</p>
        {totalUnits > 0 && (
          <ProgressBar
            value={Math.round((completed / totalUnits) * 100)}
            label={t("progressLabel")}
            className="mt-2"
          />
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-900">{t("byStateTitle")}</h3>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-600">
          {Object.entries(unitsByState).map(([state, count]) => (
            <li key={state} className="rounded-full bg-neutral-100 px-2 py-1">
              {tUnitState(state as Parameters<typeof tUnitState>[0])}: {count}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleViewUnitHistory} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          {t("viewUnitHistoryLabel")}
          <input
            type="text"
            value={unitIdInput}
            onChange={(event) => setUnitIdInput(event.target.value)}
            placeholder={t("unitIdPlaceholder")}
            className="h-10 min-w-64 rounded-md border border-neutral-300 px-3 text-sm text-neutral-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          />
        </label>
        <Button type="submit" disabled={!unitIdInput.trim()}>
          {t("viewUnitHistoryButton")}
        </Button>
      </form>
    </div>
  );
}
