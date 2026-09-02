"use client";
// SubjectSelectionGrid — pantalla 0 "Choix du sujet". Lista de sujets DELF
// B2 disponibles para iniciar una nueva simulación.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SubjectSelectionBlock } from "../types";

export interface SubjectSelectionGridProps {
  subjectSelection: SubjectSelectionBlock;
}

export function SubjectSelectionGrid({ subjectSelection }: SubjectSelectionGridProps) {
  const t = useTranslations("simulator.subjectSelection");
  const tTextType = useTranslations("simulator.textType");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {subjectSelection.subjects.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {subjectSelection.subjects.map((subject) => (
              <li key={subject.id} className="rounded-md border border-neutral-200 p-3">
                <p className="text-sm font-medium text-neutral-800">{subject.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{tTextType(subject.textType)}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {t("duration", { minutes: subject.durationMinutes })} ·{" "}
                  {t("wordRange", { min: subject.minWords, max: subject.maxWords })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
