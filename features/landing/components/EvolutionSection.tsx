// EvolutionSection — refuerza la idea de progreso mediante entrenamiento
// continuo. Deliberadamente sin porcentajes ni estadísticas inventadas:
// solo el ciclo conceptual Práctica → Retroalimentación → Revisión → Progreso.
"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const CYCLE_KEYS = ["practice", "feedback", "revision", "progress"] as const;

export function EvolutionSection() {
  const t = useTranslations("landing.evolution");

  return (
    <section id="evolution" className="scroll-mt-16 border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <span className="text-sm font-medium uppercase tracking-wide text-primary-600">
          {t("eyebrow")}
        </span>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600">{t("description")}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {CYCLE_KEYS.map((key, index) => (
            <div key={key} className="flex items-center gap-3">
              <span className="rounded-full border border-neutral-200 bg-neutral-0 px-4 py-2 text-sm font-medium text-neutral-800">
                {t(`cycle.${key}`)}
              </span>
              {index < CYCLE_KEYS.length - 1 ? (
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
