// SubmitButton — Blueprint §11.2 (P-08). Presentacional puro: cero hooks de
// datos, recibe `isSubmitting`/`disabled`/`onSubmit` ya resueltos de
// `WritingEditor` (que a su vez los recibe de `AttemptStepContainer`,
// resolución AFR2-01).
"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}

export function SubmitButton({ isSubmitting, disabled, onSubmit }: SubmitButtonProps) {
  const t = useTranslations("academy.writingEditor");

  return (
    <Button
      type="button"
      onClick={onSubmit}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
      className="w-full sm:w-auto"
    >
      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {t("submitLabel")}
    </Button>
  );
}
