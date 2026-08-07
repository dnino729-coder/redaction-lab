// Blueprint §9 — P-05. Solo valida "no vacío"; el criterio de "suficiente"
// lo decide el backend (Server Action `verifyComprehensionAction`), nunca se
// preadivina aquí (Blueprint §3.1).
import { z } from "zod";

export const comprehensionSchema = z.object({
  comprehensionResponse: z.string().min(1),
});
export type ComprehensionInput = z.infer<typeof comprehensionSchema>;
