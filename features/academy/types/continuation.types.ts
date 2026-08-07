// Blueprint §5.9. EP-15 puede responder `204 No Content` → `null`.
import type { AcademyUnitDetailHttp } from "./unit.types";
import type { AttemptSummaryHttp } from "./attempt.types";

export type ContinuationStateHttp = {
  unit: AcademyUnitDetailHttp;
  attempt: AttemptSummaryHttp;
  draft: { content: string; lastSavedAt: string } | null;
} | null;
