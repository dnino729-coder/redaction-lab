// ProblemSection — explica por qué escribir en B2 excede la gramática,
// antes de presentar el proceso de entrenamiento (siguiente sección).
"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

const POINT_KEYS = ["comprehend", "organize", "argue", "coherence", "register", "revise"] as const;

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium uppercase tracking-wide text-primary-600">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-base text-neutral-600">{t("description")}</p>
          <p className="text-base text-neutral-600">{t("resolution")}</p>
        </div>

        <ul className="grid grid-cols-1 gap-3 self-start sm:grid-cols-2">
          {POINT_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-3 text-sm text-neutral-700"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
              {t(`points.${key}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
