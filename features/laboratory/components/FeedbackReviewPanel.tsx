"use client";
// FeedbackReviewPanel — bloque 4 "Correction et rétroaction". Comentarios
// de corrección categorizados, con estado revisado/pendiente.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { FeedbackCategory } from "../types";
import type { FeedbackBlock } from "../types";

export interface FeedbackReviewPanelProps {
  feedback: FeedbackBlock;
}

function categoryVariant(category: FeedbackCategory): "primary" | "warning" | "neutral" {
  if (category === "GRAMMAR") return "primary";
  if (category === "LEXICAL") return "warning";
  return "neutral";
}

export function FeedbackReviewPanel({ feedback }: FeedbackReviewPanelProps) {
  const t = useTranslations("laboratory.feedback");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {feedback.items.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {feedback.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 rounded-md border border-neutral-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-800">{item.exerciseTitle}</span>
                  <span className="flex items-center gap-2">
                    <Badge variant={categoryVariant(item.category)}>{t(`category.${item.category}`)}</Badge>
                    <Badge variant={item.reviewed ? "success" : "neutral"}>
                      {t(item.reviewed ? "reviewed" : "pending")}
                    </Badge>
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{item.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
