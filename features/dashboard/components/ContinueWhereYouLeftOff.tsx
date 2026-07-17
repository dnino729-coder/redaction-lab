"use client";
// ContinueWhereYouLeftOff — bloque 4 (sección 2 y 4). Acceso obligatorio
// "mediante un único clic" (MUST). Usa el helper de navegación de next-intl
// (i18n/navigation.ts) para preservar el prefijo de idioma al navegar.
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@/components/ui";
import { useContinueWhereYouLeftOff } from "../hooks";
import type { ContinuationBlock } from "../types";

export interface ContinueWhereYouLeftOffProps {
  continuation: ContinuationBlock;
}

export function ContinueWhereYouLeftOff({ continuation }: ContinueWhereYouLeftOffProps) {
  const t = useTranslations("dashboard.continue");
  const { available, href, onNavigate } = useContinueWhereYouLeftOff(continuation);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!available || !href ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <>
            {continuation.lastDraftWordCount !== null ? (
              <p className="text-sm text-neutral-600">
                {t("wordsWritten", { count: continuation.lastDraftWordCount })}
              </p>
            ) : null}
            <Link href={href} onClick={onNavigate} className={buttonVariants({ variant: "primary" })}>
              {t("cta")}
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
