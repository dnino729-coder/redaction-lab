// ProcessingIndicator — Blueprint §11.2/§12 (P-09). Presentacional puro:
// recibe `timedOut` ya calculado por `useFeedback()` (Sección 8.3, techo de
// 3 minutos) — no gestiona ningún temporizador propio.
"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export interface ProcessingIndicatorProps {
  timedOut: boolean;
  onRetry: () => void;
}

export function ProcessingIndicator({ timedOut, onRetry }: ProcessingIndicatorProps) {
  const t = useTranslations("academy.feedback");

  if (timedOut) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 rounded-md bg-warning-100 px-4 py-3">
        <p className="text-sm text-warning-800">{t("timeoutTitle")}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retryLabel")}
        </Button>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-neutral-600">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {t("processingTitle")}
    </div>
  );
}
