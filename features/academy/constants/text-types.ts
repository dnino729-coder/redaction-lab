// Blueprint §6.3 — lista completa de los 5 valores de `TextType` (mirror en
// tiempo de ejecución del union type de `types/enums.ts`, mismo patrón que
// `UNIT_STEP_ORDER` en `steps.ts`). Única fuente de verdad: antes definida
// de forma independiente en `UnitMapContainer.tsx` y `UnitMapPage.tsx`
// (duplicación real, AFR012-01 — auditoría AFR-012).
import type { TextType } from "../types/enums";

export const ALL_TEXT_TYPES: readonly TextType[] = ["LETTER", "ARTICLE", "ESSAY", "EMAIL", "REPORT"];
