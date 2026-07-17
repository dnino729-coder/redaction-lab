"use client";
// EcosystemAccessGrid — bloque 7 "Acceso a los ecosistemas" (sección 2, 4 y
// 15). Los 8 espacios restantes (el Dashboard mismo no se lista — sección
// 15: "Desde el Dashboard se accede a los 8 espacios restantes"). Grid 4×2
// en escritorio, 3 columnas en tablet, carrusel/2 columnas en móvil (14.10).
// Sin color de acento propio del Dashboard (sección 14) — pero cada tarjeta
// de ecosistema SÍ puede llevar su propio color oficial (14.3) cuando ese
// módulo lo defina; aquí se usan tokens neutros por no tener aún esa
// definición de color en este documento de diseño (fuera de alcance añadir
// un color de ecosistema no especificado).
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui";
import type { EcosystemLink } from "../types";

export interface EcosystemAccessGridProps {
  ecosystems: EcosystemLink[];
}

export function EcosystemAccessGrid({ ecosystems }: EcosystemAccessGridProps) {
  const t = useTranslations("dashboard.ecosystems");
  const nav = useTranslations("nav");

  return (
    <section aria-labelledby="dashboard-ecosystems-heading">
      <h2 id="dashboard-ecosystems-heading" className="mb-3 text-base font-semibold text-neutral-900">
        {t("title")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ecosystems.map((ecosystem) => (
          <li key={ecosystem.key}>
            <Link href={ecosystem.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
              <Card className="h-full transition-colors duration-150 hover:border-primary-300">
                <CardContent className="flex items-center justify-center p-4 text-center text-sm font-medium text-neutral-700">
                  {nav(ecosystem.key)}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
