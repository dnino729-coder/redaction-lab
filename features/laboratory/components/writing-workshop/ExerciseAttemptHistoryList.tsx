"use client";
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton, ErrorState } from "@/components/ui";
import { useExerciseAttemptHistory } from "../../hooks/useExerciseAttemptHistory";

export interface ExerciseAttemptHistoryListProps {
  exerciseId: string;
}

function statusVariant(status: string): "success" | "primary" | "neutral" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "neutral";
}

export function ExerciseAttemptHistoryList({ exerciseId }: ExerciseAttemptHistoryListProps) {
  const t = useTranslations("laboratory.writingWorkshop");
  const format = useFormatter();
  const { data, isLoading, isError, refetch } = useExerciseAttemptHistory(exerciseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("history.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : isError ? (
          <ErrorState title={t("history.error")} onRetry={() => refetch()} />
        ) : !data || data.attempts.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("history.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.attempts.map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-neutral-700">{t("history.attemptNumber", { number: attempt.attemptNumber })}</span>
                <span className="text-xs text-neutral-500">
                  {format.dateTime(new Date(attempt.startedAt), { dateStyle: "medium" })}
                </span>
                <span className="text-xs text-neutral-500">{t("wordCount", { count: attempt.wordCount })}</span>
                <Badge variant={statusVariant(attempt.status)}>{t(`status.${attempt.status}`)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
