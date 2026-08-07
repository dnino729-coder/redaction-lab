// TeacherStudentSummaryCard — Panel del Profesor (P-12). Presentacional
// puro: cero hooks de datos, recibe todo por props (mismo criterio que
// `UnitStatusBadge`/`AttemptHistoryRow`). Muestra el resumen de progreso de
// un estudiante ya cargado por `TeacherDashboardContainer` (uno de los N
// resultados de `useQueries`, Blueprint §8.4).
"use client";

import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  ErrorState,
  ForbiddenState,
  Skeleton,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/apiClient";
import { academyRoutes } from "../../constants";
import type { StudentProgressSummaryHttp } from "../../types";

export interface TeacherStudentSummaryCardProps {
  studentId: string;
  summary: StudentProgressSummaryHttp | undefined;
  isLoading: boolean;
  error: unknown;
  onRemove: () => void;
}

export function TeacherStudentSummaryCard({
  studentId,
  summary,
  isLoading,
  error,
  onRemove,
}: TeacherStudentSummaryCardProps) {
  const t = useTranslations("academy.teacherPanel");
  const tUnitState = useTranslations("academy.unitState");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{studentId}</CardTitle>
        </CardHeader>
        <CardContent>
          {error instanceof ApiError && error.status === 403 ? (
            <ForbiddenState title={t("forbiddenTitle")} />
          ) : (
            <ErrorState title={t("studentErrorTitle")} description={String(error)} />
          )}
        </CardContent>
        <CardFooter>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            {t("removeStudentLabel")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const unitsByState = summary?.unitsByState ?? {};
  const totalUnits = Object.values(unitsByState).reduce((sum, count) => sum + (count ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{studentId}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-neutral-600">{t("totalUnitsLabel", { count: totalUnits })}</p>
        <ul className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {Object.entries(unitsByState).map(([state, count]) => (
            <li key={state} className="rounded-full bg-neutral-100 px-2 py-1">
              {tUnitState(state as Parameters<typeof tUnitState>[0])}: {count}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="justify-between">
        <Link
          href={academyRoutes.studentDetail(studentId)}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          {t("viewDetailLink")}
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          {t("removeStudentLabel")}
        </Button>
      </CardFooter>
    </Card>
  );
}
