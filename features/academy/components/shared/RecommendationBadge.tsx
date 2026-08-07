// RecommendationBadge — Blueprint §4/§12 (P-01), usado por `UnitCard` cuando
// `isRecommended === true`. Gap disclosed (Blueprint §5.1/§14): el backend
// nunca produce `isRecommended: true` hoy — el componente se implementa
// completo igualmente (no se omite código por un caso hoy inobservable) y
// no renderiza nada cuando es `false`.
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";

export interface RecommendationBadgeProps {
  isRecommended: boolean;
}

export function RecommendationBadge({ isRecommended }: RecommendationBadgeProps) {
  const t = useTranslations("academy.unitMap");

  if (!isRecommended) return null;

  return (
    <Badge variant="primary" className="gap-1">
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      {t("recommended")}
    </Badge>
  );
}
