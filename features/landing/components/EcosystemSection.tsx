// EcosystemSection — presenta los módulos reales del producto (config/routes.ts,
// PRIVATE_ROUTES) como un ecosistema. "coach" no tiene ruta propia (vive dentro
// de Academia/Dashboard) y por eso su Card no enlaza a ninguna parte.
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Link } from "@/i18n/navigation";

const ECOSYSTEM_ITEMS = [
  { key: "laboratory" as const, href: "/laboratory" },
  { key: "dailyTraining" as const, href: "/daily-training" },
  { key: "coach" as const, href: null },
  { key: "simulator" as const, href: "/simulator" },
  { key: "analytics" as const, href: "/analytics" },
  { key: "myPlan" as const, href: "/my-plan" },
];

export function EcosystemSection() {
  const t = useTranslations("landing.ecosystem");

  return (
    <section id="ecosystem" className="scroll-mt-16 border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-neutral-600">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM_ITEMS.map((item) => {
            const cardContent = (
              <Card
                className={
                  item.href
                    ? "h-full transition-colors duration-150 ease-delf-ease hover:border-primary-300"
                    : "h-full"
                }
              >
                <CardHeader>
                  <CardTitle>{t(`items.${item.key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">{t(`items.${item.key}.description`)}</p>
                </CardContent>
              </Card>
            );

            if (!item.href) {
              return <div key={item.key}>{cardContent}</div>;
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
