// UnitStatusBadge — Blueprint §4 (`components/shared/`), usado por `UnitCard`
// (P-01, §12) y reutilizable en más pantallas futuras (§10, "componentes
// compartidos... usados por ≥2 Feature Modules"). Representa `UnitState`
// (8 valores, §6.1) siempre con color + ícono + texto — nunca solo color
// (Blueprint §12, P-01, criterio de aceptación 1; WCAG 2.1 AA 1.4.1).
import {
  Award,
  CheckCircle2,
  Clock,
  Lock,
  MessageCircle,
  PenLine,
  RotateCcw,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge, type BadgeProps } from "@/components/ui";
import type { UnitState } from "../../types";

const UNIT_STATE_VARIANT: Record<UnitState, BadgeProps["variant"]> = {
  LOCKED: "neutral",
  UNLOCKED: "primary",
  IN_PROGRESS: "warning",
  AWAITING_FEEDBACK: "primary",
  REVISION: "warning",
  REFLECTION: "primary",
  COMPLETED: "success",
  MASTERED: "success",
};

const UNIT_STATE_ICON: Record<UnitState, LucideIcon> = {
  LOCKED: Lock,
  UNLOCKED: Unlock,
  IN_PROGRESS: PenLine,
  AWAITING_FEEDBACK: Clock,
  REVISION: RotateCcw,
  REFLECTION: MessageCircle,
  COMPLETED: CheckCircle2,
  MASTERED: Award,
};

export interface UnitStatusBadgeProps {
  state: UnitState;
}

export function UnitStatusBadge({ state }: UnitStatusBadgeProps) {
  const t = useTranslations("academy.unitState");
  const Icon = UNIT_STATE_ICON[state];

  return (
    <Badge variant={UNIT_STATE_VARIANT[state]} className="gap-1">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(state)}
    </Badge>
  );
}
