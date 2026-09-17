// LandingNavbar — navegación pública de la landing (features/landing/pages
// es la única superficie que app/ puede importar; este componente es
// interno a la feature). Mismo patrón que el resto del proyecto: Link de
// next-intl para rutas reales (/sign-in, /sign-up), anclas nativas para
// desplazamiento dentro de la misma página.
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const SECTION_LINKS = [
  { href: "#how-it-works", key: "howItWorks" as const },
  { href: "#ecosystem", key: "ecosystem" as const },
  { href: "#coach", key: "coach" as const },
  { href: "#evolution", key: "evolution" as const },
];

export function LandingNavbar() {
  const t = useTranslations("landing.nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-0">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/landing" className="text-lg font-semibold text-neutral-900">
          {t("brand")}
        </Link>

        <nav aria-label={t("brand")} className="hidden items-center gap-6 md:flex">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors duration-150 ease-delf-ease hover:text-neutral-900"
            >
              {t(`links.${link.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("signIn")}
          </Link>
          <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "sm" })}>
            {t("start")}
          </Link>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="landing-mobile-menu"
          aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div
        id="landing-mobile-menu"
        className={cn(
          "flex-col gap-1 border-t border-neutral-200 bg-neutral-0 px-4 py-4 sm:px-6 md:hidden",
          isMenuOpen ? "flex" : "hidden",
        )}
      >
        {SECTION_LINKS.map((link) => (
          <a
            key={link.key}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {t(`links.${link.key}`)}
          </a>
        ))}
        <div className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-3">
          <Link
            href="/sign-in"
            onClick={() => setIsMenuOpen(false)}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("signIn")}
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setIsMenuOpen(false)}
            className={buttonVariants({ variant: "primary" })}
          >
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}
