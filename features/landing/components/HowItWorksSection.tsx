// HowItWorksSection — proceso de 4 etapas (Comprende/Planifica/Escribe/Revisa),
// representación visual simple: número + título + descripción, sin iconografía.
"use client";

import { useTranslations } from "next-intl";

const STEP_KEYS = ["understand", "plan", "write", "revise"] as const;

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-neutral-600">{t("subtitle")}</p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEP_KEYS.map((key) => (
            <li
              key={key}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-5"
            >
              <span className="text-sm font-semibold text-primary-600">
                {t(`steps.${key}.number`)}
              </span>
              <h3 className="text-base font-semibold text-neutral-900">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-sm text-neutral-600">{t(`steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
