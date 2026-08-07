// Blueprint §9 — P-13, `RecommendUnitDialog`. Selector cerrado de unidades
// elegibles del propio estudiante (no input libre).
import { z } from "zod";

export const recommendUnitSchema = z.object({
  unitId: z.string().uuid(),
});
export type RecommendUnitInput = z.infer<typeof recommendUnitSchema>;
