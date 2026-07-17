"use client";
// DashboardErrorState — estado `error` (sección 6 y 14.7: "mensaje
// tranquilo, nunca alarmante" / "nunca deberá generar ansiedad", sección
// 14.6). Sin iconografía de alerta agresiva, sin rojo de "danger" — tono
// neutro, con una acción clara de reintentar.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";

export interface DashboardErrorStateProps {
  onRetry?: () => void;
}

export function DashboardErrorState({ onRetry }: DashboardErrorStateProps) {
  const t = useTranslations("dashboard.error");

  return (
    <Card role="alert" className="border-neutral-200 bg-neutral-50">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">{t("description")}</p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry} className="self-start">
            {t("retry")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
