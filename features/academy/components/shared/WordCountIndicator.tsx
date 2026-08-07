// WordCountIndicator — Blueprint §4/§11.2 ("Atómicos, sin estado propio —
// aria-live='polite'"). Presentacional puro: cero hooks de datos.
"use client";

import { useTranslations } from "next-intl";

export interface WordCountIndicatorProps {
  id?: string;
  wordCount: number;
}

export function WordCountIndicator({ id, wordCount }: WordCountIndicatorProps) {
  const t = useTranslations("academy.writingEditor");

  return (
    <span id={id} aria-live="polite" className="text-sm text-neutral-500">
      {t("wordCount", { count: wordCount })}
    </span>
  );
}
