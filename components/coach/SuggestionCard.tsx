// SuggestionCard — componente global reutilizable del Coach IA (sección
// 14.6: "tarjeta de sugerencia"), reusado por el Dashboard
// (CoachRecommendationCard, docs/modules/dashboard.md sección 4). Es
// puramente presentacional: no genera recomendaciones ni contiene lógica
// del Coach IA/AI Orchestrator (sección 9.4) — solo renderiza el contenido
// que el módulo que lo use ya haya obtenido.
import * as React from "react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface SuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Texto alternativo del avatar/ícono del Coach — nunca decorativo puro (14.9). */
  coachLabel: string;
  message: React.ReactNode;
  action?: React.ReactNode;
}

export const SuggestionCard = React.forwardRef<HTMLDivElement, SuggestionCardProps>(
  ({ coachLabel, message, action, className, ...props }, ref) => (
    <Card ref={ref} className={cn("border-primary-200 bg-primary-50", className)} {...props}>
      <CardContent className="flex flex-col gap-3 pt-4 sm:pt-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-neutral-0"
          >
            IA
          </span>
          <div className="flex flex-col gap-1">
            <span className="sr-only">{coachLabel}</span>
            <p className="text-sm text-neutral-800">{message}</p>
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  ),
);
SuggestionCard.displayName = "SuggestionCard";
