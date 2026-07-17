"use client";
// WelcomeHeader — bloque 1 (docs/modules/dashboard.md, sección 2 y 4).
// Saludo personalizado + avatar del Coach IA + mensaje motivador contextual
// según la variante de tono (2.3) + fecha/hora de la última sesión.
import { useTranslations, useFormatter } from "next-intl";
import { Avatar } from "@/components/ui";
import type { WelcomeBlock } from "../types";

export interface WelcomeHeaderProps {
  welcome: WelcomeBlock;
}

export function WelcomeHeader({ welcome }: WelcomeHeaderProps) {
  const t = useTranslations("dashboard.welcome");
  const format = useFormatter();

  const initials = welcome.firstName ? welcome.firstName.slice(0, 2).toUpperCase() : "??";
  const variantMessage = t(`variants.${camelCase(welcome.variant)}`);

  return (
    <section aria-labelledby="dashboard-welcome-heading" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <Avatar
        src={welcome.avatarUrl}
        alt={t("avatarAlt")}
        fallback={initials}
        size="lg"
      />
      <div className="flex flex-col gap-1">
        <h1 id="dashboard-welcome-heading" className="text-xl font-semibold text-neutral-900 sm:text-2xl">
          {t("greeting", { name: welcome.firstName || t("defaultName") })}
        </h1>
        <p className="text-sm text-neutral-600">{variantMessage}</p>
        {welcome.lastLoginAt ? (
          <p className="text-xs text-neutral-400">
            {t("lastSession", { date: format.dateTime(new Date(welcome.lastLoginAt), { dateStyle: "long" }) })}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function camelCase(variant: WelcomeBlock["variant"]): string {
  return variant.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
