// Validación Zod (sección 5.2) de los inputs de las Server Actions del
// Dashboard (docs/modules/dashboard.md, sección 11).
import { z } from "zod";

export const dismissRecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
});
export type DismissRecommendationInput = z.infer<typeof dismissRecommendationSchema>;

export const markContinueClickedSchema = z.object({
  submissionId: z.string().uuid(),
});
export type MarkContinueClickedInput = z.infer<typeof markContinueClickedSchema>;
