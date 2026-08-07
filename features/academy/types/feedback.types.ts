// Blueprint §5.5. Respuesta de EP-18, también embebida en EP-03/
// `submitVersionAction` cuando ya hay feedback disponible.
import type { FeedbackCategory, FeedbackStrength } from "./enums";

export interface FeedbackObservationHttp {
  category: FeedbackCategory;
  strength: FeedbackStrength;
  explanation: string;
  suggestion: string;
  // priority: NO presente — ver FEEDBACK_CATEGORY_PRIORITY en enums.ts
}

export interface FeedbackHttp {
  feedbackId: string | null;
  versionId: string;
  versionNumber: number;
  status: "READY" | "PROCESSING";
  observations: FeedbackObservationHttp[];
  deliveredAt: string | null;
}

/**
 * ⚠️ Gap disclosed (Blueprint §5.5): falta `priority` por observación. La
 * mitigación (ordenar client-side con `FEEDBACK_CATEGORY_PRIORITY`) vive en
 * `utils/mapFeedbackCategoryLabel.ts` y en el componente `FeedbackObservationItem`,
 * nunca aquí — este archivo solo declara la forma real de datos.
 */
