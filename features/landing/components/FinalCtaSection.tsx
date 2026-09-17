// FinalCtaSection — sección de conversión al cierre de la landing.
"use client";

import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function FinalCtaSection() {
  const t = useTranslations("landing.finalCta");

  return (
    <section className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-base text-neutral-600">{t("description")}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "lg" })}>
            {t("ctaPrimary")}
          </Link>
          <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
