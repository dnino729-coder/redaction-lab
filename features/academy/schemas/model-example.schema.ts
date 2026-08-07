// Blueprint §9 — P-14. Creación: los 4 campos obligatorios. Edición: mismo
// esquema con `content`/`curatorialComment` opcionales (`.partial()` solo en
// esos dos campos, `textType`/`rating` no se editan tras la creación según
// el Blueprint — ver `UpdateModelExampleRequestDto`, que solo acepta esos 2).
import { z } from "zod";

export const createModelExampleSchema = z.object({
  textType: z.enum(["LETTER", "ARTICLE", "ESSAY", "EMAIL", "REPORT"]),
  content: z.string().min(1),
  rating: z.enum(["EXCELLENT", "HAS_ERRORS"]),
  curatorialComment: z.string().min(1),
});
export type CreateModelExampleInput = z.infer<typeof createModelExampleSchema>;

export const updateModelExampleSchema = createModelExampleSchema
  .pick({ content: true, curatorialComment: true })
  .partial();
export type UpdateModelExampleInput = z.infer<typeof updateModelExampleSchema>;
