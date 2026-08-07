// Blueprint §9 (fila "Producir/Reescribir"). Solo valida "no vacío" — el
// rango numérico exacto de `WordCountRange` no está documentado en ningún
// contrato (gap disclosed, §14 ítem 2), no se inventa un límite. El autosave
// (`autosaveDraftAction`) no usa este schema (guardado continuo, no
// "envío"); solo el envío final (`submitVersionAction`) valida contra él.
import { z } from "zod";

export const productionSchema = z.object({
  content: z.string().min(1),
});
export type ProductionInput = z.infer<typeof productionSchema>;
