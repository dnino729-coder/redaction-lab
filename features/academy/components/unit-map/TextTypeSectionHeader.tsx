// TextTypeSectionHeader — Blueprint §4/§12 (P-01): "<h2> por sección" de
// `textType` (accesibilidad, criterio de aceptación 1), sticky en mobile
// (§18, responsive).
"use client";

import { useTranslations } from "next-intl";
import type { TextType } from "../../types";

export interface TextTypeSectionHeaderProps {
  textType: TextType;
}

export function TextTypeSectionHeader({ textType }: TextTypeSectionHeaderProps) {
  const t = useTranslations("academy.textType");

  return (
    <h2 className="sticky top-0 z-10 -mx-4 bg-neutral-0/95 px-4 py-2 text-base font-semibold text-neutral-900 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      {t(textType)}
    </h2>
  );
}
