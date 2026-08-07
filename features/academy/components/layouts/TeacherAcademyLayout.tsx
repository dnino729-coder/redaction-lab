// TeacherAcademyLayout — Blueprint §4/§12 (P-14; compartido a futuro con
// P-12/P-13/P-15 — Frontend Contract v1.1 §2: "Layout Profesor/Administrador"
// único, no existe un `AdminAcademyLayout` separado). Presentacional puro,
// sin hooks de datos, mismo criterio que `StudentAcademyLayout`.
//
// Alcance de este Sprint (P-14, Administrador): este Layout no implementa
// ninguna navegación ni funcionalidad propia de Profesor (P-12/P-13/P-15
// permanecen fuera de alcance) — únicamente el encabezado mínimo ya exigido
// por accesibilidad (un `<h1>` real, mismo patrón AFR-010 ya aplicado en
// `StudentAcademyLayout`).
"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export interface TeacherAcademyLayoutProps {
  children: ReactNode;
}

export function TeacherAcademyLayout({ children }: TeacherAcademyLayoutProps) {
  const t = useTranslations("academy.layout");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header aria-labelledby="academy-teacher-layout-heading">
        <h1 id="academy-teacher-layout-heading" className="text-lg font-semibold text-neutral-900">
          {t("title")}
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
