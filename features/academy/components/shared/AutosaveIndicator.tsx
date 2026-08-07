// AutosaveIndicator — Blueprint §4/§11.2 ("Atómicos, sin estado propio —
// aria-live='polite'"). Presentacional puro: cero hooks de datos, recibe
// `state`/`lastSavedAt` ya resueltos de `WritingEditor` (que a su vez los
// recibe de `AttemptStepContainer`, resolución AFR2-01).
"use client";

import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface AutosaveIndicatorProps {
  id?: string;
  state: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
}

export function AutosaveIndicator({ id, state, lastSavedAt }: AutosaveIndicatorProps) {
  const t = useTranslations("academy.writingEditor");
  const format = useFormatter();

  if (state === "idle") {
    return <span id={id} aria-live="polite" className="text-sm text-neutral-500" />;
  }

  return (
    <span
      id={id}
      aria-live="polite"
      className={cn(
        "text-sm",
        state === "error" ? "text-danger-600" : "text-neutral-500",
      )}
    >
      {state === "saving"
        ? t("autosaveSaving")
        : state === "error"
          ? t("autosaveError")
          : t("autosaveSaved", { time: lastSavedAt ? format.relativeTime(new Date(lastSavedAt)) : "" })}
    </span>
  );
}
