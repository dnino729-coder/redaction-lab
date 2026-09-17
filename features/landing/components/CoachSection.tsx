// CoachSection — diferencia Redaction Lab de un generador automático de
// textos. La interfaz conversacional es una Card estática (no un chat
// funcional): representa el rol pedagógico del Coach, sin estética
// futurista ni iconografía de IA (robots/circuitos).
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui";

const CAPABILITY_KEYS = ["guide", "ask", "feedback", "identify", "accompany"] as const;

export function CoachSection() {
  const t = useTranslations("landing.coach");

  return (
    <section id="coach" className="scroll-mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-wide text-primary-600">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-base text-neutral-600">{t("description")}</p>

          <ul className="mt-2 flex flex-col gap-2">
            {CAPABILITY_KEYS.map((key) => (
              <li key={key} className="text-sm text-neutral-700">
                — {t(`capabilities.${key}`)}
              </li>
            ))}
          </ul>

          <p className="mt-2 text-sm font-medium text-neutral-900">{t("disclaimer")}</p>
        </div>

        <Card className="self-start">
          <CardContent className="flex flex-col gap-3 pt-4 sm:pt-6">
            <div className="flex flex-col gap-1 rounded-lg bg-neutral-100 p-3">
              <span className="text-xs font-semibold text-neutral-500">
                {t("conversation.coachLabel")}
              </span>
              <p className="text-sm text-neutral-800">{t("conversation.coachMessage")}</p>
            </div>

            <div className="flex flex-col gap-1 self-end rounded-lg bg-primary-50 p-3 text-right">
              <span className="text-xs font-semibold text-primary-700">
                {t("conversation.studentLabel")}
              </span>
              <p className="text-sm text-neutral-800">{t("conversation.studentMessage")}</p>
            </div>

            <div className="flex flex-col gap-1 rounded-lg bg-neutral-100 p-3">
              <span className="text-xs font-semibold text-neutral-500">
                {t("conversation.coachLabel")}
              </span>
              <p className="text-sm text-neutral-800">{t("conversation.coachFollowUp")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
