"use client";
// SubmissionConfirmation — pantalla 4 "Soumission". Cierre formal del
// intento — resumen antes/después del envío, irreversible como en el
// examen real.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { SubmissionBlock } from "../types";

export interface SubmissionConfirmationProps {
  submission: SubmissionBlock;
}

export function SubmissionConfirmation({ submission }: SubmissionConfirmationProps) {
  const t = useTranslations("simulator.submission");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{t("wordCount", { count: submission.wordCount })}</span>
          <span>{t("timeUsed", { minutes: submission.minutesUsed, total: submission.totalMinutes })}</span>
        </div>

        {submission.submittedAt ? (
          <Badge variant="success">
            {t("submittedAt", {
              date: format.dateTime(new Date(submission.submittedAt), { dateStyle: "long", timeStyle: "short" }),
            })}
          </Badge>
        ) : (
          <Badge variant="neutral">{t("notSubmitted")}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
