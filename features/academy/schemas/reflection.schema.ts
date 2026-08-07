// Blueprint §9 — P-10. Al menos 1 respuesta no vacía por pregunta (regla
// explícita del Frontend Contract). El número de preguntas es contenido,
// no estructura (Blueprint §14, ítem 8) — no se fija aquí.
import { z } from "zod";

export const reflectionSchema = z.object({
  responses: z.array(z.string().min(1)).min(1),
});
export type ReflectionInput = z.infer<typeof reflectionSchema>;
