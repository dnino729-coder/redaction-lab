"use client";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton, ErrorState } from "@/components/ui";
import { useWritingExercises } from "../../hooks/useWritingExercises";
import type { WritingExerciseHttp } from "../../services/writingExercisesApi";

export interface WritingExerciseListProps {
  onStart: (exerciseId: string) => void;
  onContinue: (exerciseId: string) => void;
  onRepeat: (exerciseId: string) => void;
  pendingExerciseId?: string | null;
}

function statusVariant(status: string): "success" | "primary" | "neutral" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "neutral";
}

function actionFor(status: string): "START" | "CONTINUE" | "REPEAT" {
  if (status === "IN_PROGRESS") return "CONTINUE";
  if (status === "COMPLETED") return "REPEAT";
  return "START";
}

export function WritingExerciseList({ onStart, onContinue, onRepeat, pendingExerciseId }: WritingExerciseListProps) {
  const t = useTranslations("laboratory.writingWorkshop");
  const tTextType = useTranslations("laboratory.textType");
  const { data, isLoading, isError, refetch } = useWritingExercises();

  const exercises = data?.data ?? [];
  const guided = exercises.filter((exercise) => exercise.mode === "GUIDED");
  const autonomous = exercises.filter((exercise) => exercise.mode === "AUTONOMOUS");

  function handleAction(exercise: WritingExerciseHttp) {
    const action = actionFor(exercise.status);
    if (action === "START") onStart(exercise.id);
    else if (action === "CONTINUE") onContinue(exercise.id);
    else onRepeat(exercise.id);
  }

  function renderList(items: WritingExerciseHttp[], emptyKey: string) {
    if (items.length === 0) {
      return <p className="text-sm text-neutral-500">{t(emptyKey)}</p>;
    }
    return (
      <ul className="flex flex-col gap-2">
        {items.map((exercise) => (
          <li key={exercise.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-neutral-700">{tTextType(exercise.textType)}</span>
              <Badge variant={statusVariant(exercise.status)}>{t(`status.${exercise.status}`)}</Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={pendingExerciseId === exercise.id}
              onClick={() => handleAction(exercise)}
            >
              {t(`action.${actionFor(exercise.status)}`)}
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError ? (
          <ErrorState title={t("error")} onRetry={() => refetch()} />
        ) : (
          <>
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("guidedTitle")}</h3>
              {renderList(guided, "guidedEmpty")}
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("autonomousTitle")}</h3>
              {renderList(autonomous, "autonomousEmpty")}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
