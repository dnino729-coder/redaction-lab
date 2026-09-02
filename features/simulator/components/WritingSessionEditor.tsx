"use client";
// WritingSessionEditor — pantalla 3 "Rédaction". Producción del texto final
// bajo presión de tiempo real, con el cronómetro visible (ExamTimer).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ExamTimer } from "./ExamTimer";
import type { WritingBlock } from "../types";

export interface WritingSessionEditorProps {
  writing: WritingBlock;
}

export function WritingSessionEditor({ writing }: WritingSessionEditorProps) {
  const t = useTranslations("simulator.writing");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("title")}</CardTitle>
        <ExamTimer remainingMinutes={writing.remainingMinutes} totalMinutes={writing.totalMinutes} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500">{t("wordCount", { count: writing.wordCount })}</p>
        <div className="whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
          {writing.content}
        </div>
      </CardContent>
    </Card>
  );
}
