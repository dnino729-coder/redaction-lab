// StudentAcademyLayout — Blueprint §4; Frontend Contract v1.1 §2: "contenedor
// de navegación del recorrido de Academia (mapa de unidades, recorrido de una
// unidad, Biblioteca de Modelos, historial)". El único requisito de
// navegación concreto que el Blueprint le asigna explícitamente es el link
// permanente a Biblioteca de Modelos (§12, P-11: "accesible desde P-01 (link
// permanente en el layout de Estudiante)").
//
// Presentacional puro — sin hooks de datos (§10, separación Container/
// Presentational). La continuidad ("Continúa donde te quedaste") es
// responsabilidad de `UnitMapContainer` (P-01, §10.1: `useContinuation()`
// vive ahí, no en el layout) — Frontend Contract v1.1 §2 la describe a nivel
// conceptual del recorrido, pero el Blueprint (documento congelado más
// específico) la asigna al Container, no al Layout.
//
// AFR-010 (fix de AFR009-01): el título "Academia" es un `<h1>` real —antes
// era solo un `<Link>` estilizado, sin heading, un hallazgo de accesibilidad
// real (WCAG 2.1 AA 2.4.6) que se habría propagado a las 11 pantallas de
// Estudiante. El `<header>` se relaciona con el `<h1>` vía `aria-labelledby`,
// mismo patrón que `features/dashboard/components/WelcomeHeader.tsx`
// (`aria-labelledby` + `id` en el heading).
//
// Sprint 2 ("cerrar el recorrido Login → Dashboard → Academia"): se añade
// un link de regreso al Dashboard — `app/[locale]/(app)/layout.tsx` (grupo
// de rutas privadas) es un passthrough sin ninguna navegación persistente
// propia, por lo que, sin este link, un Estudiante que entra a Academia
// desde el Dashboard no tenía ninguna forma de volver salvo el botón "atrás"
// del navegador. No contradice el único requisito de navegación que el
// Blueprint asigna a este Layout (link permanente a Biblioteca de Modelos,
// §12, P-11) — solo lo complementa, reutilizando la traducción `nav.dashboard`
// ya existente (misma usada por `EcosystemAccessGrid`), sin duplicarla.
"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { academyRoutes } from "../../constants";

export interface StudentAcademyLayoutProps {
  children: ReactNode;
}

export function StudentAcademyLayout({ children }: StudentAcademyLayoutProps) {
  const t = useTranslations("academy.layout");
  const nav = useTranslations("nav");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header aria-labelledby="academy-layout-heading" className="flex items-center justify-between gap-4">
        <h1 id="academy-layout-heading" className="text-lg font-semibold text-neutral-900">
          <Link href={academyRoutes.unitMap()}>{t("title")}</Link>
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:underline">
            {nav("dashboard")}
          </Link>
          <Link
            href={academyRoutes.modelLibrary()}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            {t("modelLibraryLink")}
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
