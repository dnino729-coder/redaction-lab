// HeroSection — sección de mayor peso visual de la landing. La columna
// derecha es una composición conceptual del producto (Cards + ProgressBar
// ya existentes), nunca una captura de pantalla simulada.
"use client";

import { useTranslations } from "next-intl";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProgressBar,
  buttonVariants,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-28">
      <div className="flex flex-col gap-6">
        <Badge variant="primary" className="w-fit">
          DELF B2
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </h1>
        <p className="max-w-md text-base text-neutral-600 sm:text-lg">{t("subtitle")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "lg" })}>
            {t("ctaPrimary")}
          </Link>
          <a href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="gap-2">
            <Badge variant="neutral" className="w-fit">
              {t("mockup.exerciseBadge")}
            </Badge>
            <CardTitle>{t("mockup.exerciseTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-neutral-600">{t("mockup.exercisePrompt")}</p>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {t("mockup.criteriaLabel")}
              </span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{t("mockup.criteriaCoherence")}</Badge>
                <Badge variant="primary">{t("mockup.criteriaRegister")}</Badge>
                <Badge variant="primary">{t("mockup.criteriaArgumentation")}</Badge>
              </div>
            </div>

            <ProgressBar value={70} label={t("mockup.progressLabel")} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 pt-4 sm:pt-6">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {t("mockup.feedbackLabel")}
            </span>
            <p className="text-sm text-neutral-700">{t("mockup.feedbackSample")}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
