"use client";
// GrammarLexicalRevision — bloque 5 "Révision grammaticale et lexicale".
// Temas de revisión sugeridos según los errores detectados en Correction.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import type { RevisionBlock } from "../types";

export interface GrammarLexicalRevisionProps {
  revision: RevisionBlock;
}

export function GrammarLexicalRevision({ revision }: GrammarLexicalRevisionProps) {
  const t = useTranslations("laboratory.revision");

  const grammar = revision.topics.filter((topic) => topic.type === "GRAMMAR");
  const lexical = revision.topics.filter((topic) => topic.type === "LEXICAL");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("grammarTitle")}</h3>
          {grammar.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {grammar.map((topic) => (
                <li key={topic.id}>
                  <ProgressBar label={topic.title} value={topic.masteryPercentage} tone="primary" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("lexicalTitle")}</h3>
          {lexical.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lexical.map((topic) => (
                <li key={topic.id}>
                  <ProgressBar label={topic.title} value={topic.masteryPercentage} tone="success" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
