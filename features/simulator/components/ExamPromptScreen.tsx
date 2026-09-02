"use client";
// ExamPromptScreen — pantalla 1 "Consigne". Enunciado oficial del examen,
// leído antes de poder planificar — sin distracciones.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { ExamPromptBlock } from "../types";

export interface ExamPromptScreenProps {
  prompt: ExamPromptBlock;
}

export function ExamPromptScreen({ prompt }: ExamPromptScreenProps) {
  const t = useTranslations("simulator.prompt");
  const tTextType = useTranslations("simulator.textType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{tTextType(prompt.textType)}</Badge>
          <Badge variant="neutral">{t("duration", { minutes: prompt.totalMinutes })}</Badge>
          <Badge variant="neutral">{t("wordRange", { min: prompt.minWords, max: prompt.maxWords })}</Badge>
        </div>

        <h3 className="text-sm font-medium text-neutral-800">{prompt.title}</h3>
        <p className="text-sm text-neutral-700">{prompt.instructions}</p>
      </CardContent>
    </Card>
  );
}
