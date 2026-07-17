"use server";
// Server Actions del Dashboard (docs/modules/dashboard.md, sección 11:
// "mutaciones ligeras de interacción"). Ninguna de las dos escribe en las
// tablas de solo lectura del módulo (sección 10, MUST) — ambas registran
// únicamente el evento de interacción/analítica correspondiente (sección 8:
// "El Dashboard sí emite eventos propios de interacción/analítica").
// La descarte real de la tarjeta de recomendación es estado de UI de
// cliente (Zustand, `useDashboardStore`, "descartada en esta sesión" —
// sección 6) — esta acción no persiste esa decisión más allá de la sesión,
// tal como especifica el documento.

import { trackEvent } from "@/lib/analytics";
import { requireAuthenticatedStudentId } from "@/services/auth";
import {
  dismissRecommendationSchema,
  markContinueClickedSchema,
  type DismissRecommendationInput,
  type MarkContinueClickedInput,
} from "../schemas/dashboard.schemas";

export async function dismissRecommendation(input: DismissRecommendationInput): Promise<{ success: true }> {
  const { recommendationId } = dismissRecommendationSchema.parse(input);
  const studentId = await requireAuthenticatedStudentId();

  await trackEvent(studentId, "dashboard_recommendation_dismissed", { recommendationId });

  return { success: true };
}

export async function markContinueClicked(input: MarkContinueClickedInput): Promise<{ success: true }> {
  const { submissionId } = markContinueClickedSchema.parse(input);
  const studentId = await requireAuthenticatedStudentId();

  await trackEvent(studentId, "dashboard_continue_clicked", { submissionId });

  return { success: true };
}
