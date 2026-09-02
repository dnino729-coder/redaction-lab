"use client";
// PlanningNotepad — pantalla 2 "Planification". Espacio libre de notas
// antes de redactar, con el cronómetro visible (ExamTimer).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ExamTimer } from "./ExamTimer";
import type { PlanningBlock } from "../types";

export interface PlanningNotepadProps {
  planning: PlanningBlock;
}

export function PlanningNotepad({ planning }: PlanningNotepadProps) {
  const t = useTranslations("simulator.planning");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("title")}</CardTitle>
        <ExamTimer remainingMinutes={planning.recommendedMinutes} totalMinutes={planning.recommendedMinutes} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500">{t("hint", { minutes: planning.recommendedMinutes })}</p>
        <pre className="whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          {planning.notes}
        </pre>
      </CardContent>
    </Card>
  );
}
