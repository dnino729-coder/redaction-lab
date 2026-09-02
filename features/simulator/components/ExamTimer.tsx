"use client";
// ExamTimer — componente transversal (no es una pantalla propia), visible
// de forma continua durante Planification y Rédaction, igual que el
// cronómetro de un examen real nunca desaparece de la vista.
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";

export interface ExamTimerProps {
  remainingMinutes: number;
  totalMinutes: number;
}

export function ExamTimer({ remainingMinutes, totalMinutes }: ExamTimerProps) {
  const t = useTranslations("simulator.timer");

  return (
    <Badge variant={remainingMinutes <= 5 ? "danger" : "neutral"}>
      {t("remaining", { minutes: remainingMinutes, total: totalMinutes })}
    </Badge>
  );
}
