"use client";
// ContinueWhereYouLeftOff — bloque 4 (sección 2 y 4). Acceso obligatorio
// "mediante un único clic" (MUST). Usa el helper de navegación de next-intl
// (i18n/navigation.ts) para preservar el prefijo de idioma al navegar.
import { useTranslations, useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, buttonVariants, Badge } from "@/components/ui";
import { useContinueWhereYouLeftOff } from "../hooks";
import type { ContinuationBlock } from "../types";

export interface ContinueWhereYouLeftOffProps {
  continuation: ContinuationBlock;
}

export function ContinueWhereYouLeftOff({ continuation }: ContinueWhereYouLeftOffProps) {
  const t = useTranslations("dashboard.continue");
  const format = useFormatter();
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
            <div className="flex flex-wrap items-center gap-2">
              {continuation.status ? <Badge variant="neutral">{t(`status.${continuation.status}`)}</Badge> : null}
              {continuation.lastDraftWordCount !== null ? (
                <p className="text-sm text-neutral-600">
                  {t("wordsWritten", { count: continuation.lastDraftWordCount })}
                </p>
              ) : null}
            </div>
            {continuation.lastActivityAt ? (
              <p className="text-xs text-neutral-500">
                {t("lastActivity", { date: format.dateTime(new Date(continuation.lastActivityAt), { dateStyle: "long", timeStyle: "short" }) })}
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
