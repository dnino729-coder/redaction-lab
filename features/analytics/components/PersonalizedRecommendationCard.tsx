"use client";
// PersonalizedRecommendationCard — bloque 6 "Recommandations
// personnalisées". Debilidad principal, prioridad, próxima acción — el
// enlace sugerido apunta únicamente a Laboratoire o Entraînement, nunca a
// otro módulo (regla explícita del encargo).
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, buttonVariants } from "@/components/ui";
import type { PersonalizedRecommendationBlock, RecommendationDestination } from "../types";

export interface PersonalizedRecommendationCardProps {
  recommendations: PersonalizedRecommendationBlock;
}

const DESTINATION_HREF: Record<RecommendationDestination, string> = {
  LABORATORY: "/laboratory",
  DAILY_TRAINING: "/daily-training",
};

function priorityVariant(priority: PersonalizedRecommendationBlock["priority"]): "danger" | "warning" | "neutral" {
  if (priority === "HIGH") return "danger";
  if (priority === "MEDIUM") return "warning";
  return "neutral";
}

export function PersonalizedRecommendationCard({ recommendations }: PersonalizedRecommendationCardProps) {
  const t = useTranslations("analytics.recommendations");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={priorityVariant(recommendations.priority)}>
            {t(`priority.${recommendations.priority}`)}
          </Badge>
        </div>

        <p className="text-sm text-neutral-700">{t("mainWeakness", { weakness: recommendations.mainWeakness })}</p>
        <p className="text-sm text-neutral-600">{recommendations.nextAction}</p>

        <Link
          href={DESTINATION_HREF[recommendations.destination]}
          className={buttonVariants({ variant: "primary" })}
        >
          {t(`destination.${recommendations.destination}`)}
        </Link>
      </CardContent>
    </Card>
  );
}
