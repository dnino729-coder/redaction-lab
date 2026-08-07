// Blueprint §9 — P-13, `TeacherOverrideDialog`. `reason` obligatorio no
// vacío (regla explícita del Frontend Contract).
import { z } from "zod";

export const teacherOverrideSchema = z.object({
  action: z.enum(["FORCE_LOCK", "FORCE_RESTART"]),
  reason: z.string().min(1),
});
export type TeacherOverrideInput = z.infer<typeof teacherOverrideSchema>;
