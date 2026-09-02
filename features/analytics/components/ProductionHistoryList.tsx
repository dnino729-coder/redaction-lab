"use client";
// ProductionHistoryList — bloque 3 "Historique des productions". Fecha,
// tipo de texto, puntuación y estado de cada texto producido.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { ProductionHistoryBlock } from "../types";

export interface ProductionHistoryListProps {
  productions: ProductionHistoryBlock;
}

export function ProductionHistoryList({ productions }: ProductionHistoryListProps) {
  const t = useTranslations("analytics.productions");
  const tTextType = useTranslations("analytics.textType");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {productions.productions.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {productions.productions.map((production) => (
              <li key={production.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-700">
                  {tTextType(production.textType)} ·{" "}
                  {format.dateTime(new Date(production.date), { dateStyle: "long" })}
                </span>
                <span className="flex items-center gap-2">
                  {production.status === "EVALUATED" ? (
                    <span className="text-xs text-neutral-500">
                      {t("score", { score: production.score, max: production.maxScore })}
                    </span>
                  ) : null}
                  <Badge variant={production.status === "EVALUATED" ? "success" : "neutral"}>
                    {t(`status.${production.status}`)}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
