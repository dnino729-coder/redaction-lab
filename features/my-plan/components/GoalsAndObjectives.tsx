"use client";
// GoalsAndObjectives — bloque 3 "Objetivos y metas" (docs/modules/mi-plan.md,
// Vacío 1). LearningGoal (con prioridad) — activos y completados.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { GoalsBlock, LearningGoalItem } from "../types";

export interface GoalsAndObjectivesProps {
  goals: GoalsBlock;
}

function priorityVariant(priority: LearningGoalItem["priority"]): "danger" | "warning" | "neutral" {
  if (priority === "HIGH") return "danger";
  if (priority === "MEDIUM") return "warning";
  return "neutral";
}

export function GoalsAndObjectives({ goals }: GoalsAndObjectivesProps) {
  const t = useTranslations("myPlan.goals");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-700">
            {t("activeTitle", { count: goals.active.length })}
          </h3>
          {goals.active.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("activeEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {goals.active.map((goal) => (
                <li key={goal.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{goal.title}</span>
                  <Badge variant={priorityVariant(goal.priority)}>{t(`priority.${goal.priority}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-700">
            {t("completedTitle", { count: goals.completed.length })}
          </h3>
          {goals.completed.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("completedEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {goals.completed.map((goal) => (
                <li key={goal.id} className="flex items-center gap-2 text-sm text-neutral-400 line-through">
                  {goal.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
