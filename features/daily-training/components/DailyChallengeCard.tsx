"use client";
// DailyChallengeCard — bloque 2 "Défi du jour". Una única actividad breve
// de producción escrita, con acción primaria única (mismo principio de
// contención ya aplicado al Coach IA del Dashboard).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import type { DailyChallengeBlock } from "../types";

export interface DailyChallengeCardProps {
  dailyChallenge: DailyChallengeBlock;
}

export function DailyChallengeCard({ dailyChallenge }: DailyChallengeCardProps) {
  const t = useTranslations("dailyTraining.dailyChallenge");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-800">{dailyChallenge.title}</span>
          <Badge variant={dailyChallenge.status === "COMPLETED" ? "success" : "neutral"}>
            {t(dailyChallenge.status === "COMPLETED" ? "completed" : "pending")}
          </Badge>
        </div>

        <p className="text-sm text-neutral-600">{dailyChallenge.prompt}</p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-500">
            {t(`type.${dailyChallenge.type}`)} · {t("minutes", { count: dailyChallenge.estimatedMinutes })}
          </span>
          <Button variant="primary" disabled={dailyChallenge.status === "COMPLETED"}>
            {t("cta")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
