// LandingFooter — minimalista, sin enlaces inventados (términos legales,
// privacidad, redes sociales): solo la identidad de marca y las rutas de
// autenticación reales, ya usadas en el resto de la landing.
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{t("brand")}</p>
          <p className="text-sm text-neutral-500">{t("tagline")}</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
