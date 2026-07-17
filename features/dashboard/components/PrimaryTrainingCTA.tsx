"use client";
// PrimaryTrainingCTA — bloque 5, botón "Comenzar entrenamiento" (acción
// primaria única, sección 2: "el ejemplo textual de 6.3... se interpreta
// como una única recomendación/plan del día, un solo CTA"). Componente
// separado del CoachRecommendationCard para que exista un único punto de
// verdad de esta acción, reusable si otro bloque necesitara el mismo CTA.
//
// El destino exacto de "comenzar entrenamiento" (qué actividad específica
// abre) es responsabilidad del módulo Entrenamiento/Coach IA (fuera de
// alcance de esta fase) — aquí se enlaza al espacio "daily-training"
// (renombrado de "entrenamiento" en la resolución 18.19), listo para que ese
// módulo lea el parámetro de recomendación al implementarse.
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui";

export interface PrimaryTrainingCTAProps {
  recommendationId: string | null;
  onClick?: () => void;
}

export function PrimaryTrainingCTA({ recommendationId, onClick }: PrimaryTrainingCTAProps) {
  const t = useTranslations("dashboard.recommendation");

  const href = recommendationId ? `/daily-training?recommendation=${recommendationId}` : "/daily-training";

  return (
    <Link href={href} onClick={onClick} className={buttonVariants({ variant: "primary" })}>
      {t("cta")}
    </Link>
  );
}
