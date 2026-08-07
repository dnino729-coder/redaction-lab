// TeacherStudentUnitHistoryContainer — Panel del Profesor (P-15, EP-23).
// Único componente inteligente de esta pantalla. Reutiliza, sin modificar,
// `AttemptHistoryStepBadge`/`AttemptHistoryStartedAt` (ya usados por P-03,
// `AttemptHistoryEntryContent.tsx`) y `FeedbackObservationItem` (ya usado
// por P-09, `VersionWithFeedbackPanel.tsx`) — no se crea ningún componente
// de renderizado de retroalimentación nuevo. A diferencia de
// `VersionWithFeedbackPanel`, esta vista es de solo lectura: no expone
// "Reescribir" ni "Continuar a reflexión" (acciones que no le corresponden
// al Profesor), por eso no reutiliza ese componente completo, solo sus
// piezas presentacionales sin acciones.
"use client";

import { useTranslations } from "next-intl";
import { EmptyState, ErrorState, ForbiddenState, Skeleton } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useStudentUnitHistory } from "../../hooks";
import { academyRoutes } from "../../constants";
import { FEEDBACK_CATEGORY_PRIORITY } from "../../types/enums";
import { AcademyBreadcrumbs } from "../shared";
import { FeedbackObservationItem } from "../unit-attempt/FeedbackObservationItem";
import { AttemptHistoryStartedAt, AttemptHistoryStepBadge } from "../unit-attempt/AttemptHistoryEntryContent";

export interface TeacherStudentUnitHistoryContainerProps {
  studentId: string;
  unitId: string;
}

export function TeacherStudentUnitHistoryContainer({
  studentId,
  unitId,
}: TeacherStudentUnitHistoryContainerProps) {
  const t = useTranslations("academy.teacherPanel");
  const tUnitState = useTranslations("academy.unitState");

  const historyQuery = useStudentUnitHistory(studentId, unitId);

  if (historyQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (historyQuery.isError) {
    const error = historyQuery.error;
    if (error instanceof ApiError && error.status === 403) {
      return <ForbiddenState title={t("forbiddenTitle")} />;
    }
    return (
      <ErrorState
        title={t("studentErrorTitle")}
        description={error.message}
        retryLabel={t("retryLabel")}
        onRetry={() => historyQuery.refetch()}
      />
    );
  }

  const breadcrumbs = (
    <AcademyBreadcrumbs
      items={[
        { label: t("title"), href: academyRoutes.teacherPanel() },
        { label: studentId, href: academyRoutes.studentDetail(studentId) },
        { label: t("unitHistoryTitle", { unitId }) },
      ]}
    />
  );

  const history = historyQuery.data;
  if (!history || history.attempts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {breadcrumbs}
        <EmptyState title={t("noAttemptsTitle")} description={t("noAttemptsDescription")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {breadcrumbs}

      <div>
        <h2 className="text-base font-semibold text-neutral-900">
          {t("unitHistoryTitle", { unitId })}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{tUnitState(history.unitState)}</p>
      </div>

      {history.attempts.map((attempt) => (
        <div key={attempt.attemptId} className="rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <AttemptHistoryStepBadge attempt={attempt} />
            <AttemptHistoryStartedAt attempt={attempt} />
          </div>

          {attempt.versions.map(({ version, feedback }) => {
            const observations = [...(feedback?.observations ?? [])].sort(
              (a, b) => FEEDBACK_CATEGORY_PRIORITY[a.category] - FEEDBACK_CATEGORY_PRIORITY[b.category],
            );

            return (
              <div key={version.versionId} className="mt-4 border-t border-neutral-100 pt-4">
                <p className="text-sm font-medium text-neutral-700">
                  {t("versionLabel", { number: version.versionNumber })}
                </p>
                {observations.length > 0 ? (
                  <ul aria-live="polite">
                    {observations.map((observation, index) => (
                      <FeedbackObservationItem key={index} observation={observation} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">{t("noFeedbackYet")}</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
