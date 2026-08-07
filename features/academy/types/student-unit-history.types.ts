// Blueprint §5.10. Respuesta de EP-23 (P-15).
import type { UnitState } from "./enums";
import type { AttemptSummaryHttp } from "./attempt.types";
import type { VersionHttp } from "./version.types";
import type { FeedbackHttp } from "./feedback.types";

export interface VersionWithFeedbackHttp {
  version: VersionHttp;
  feedback: FeedbackHttp | null;
}

export interface StudentUnitHistoryHttp {
  studentId: string;
  unitId: string;
  unitState: UnitState;
  attemptsCount: number;
  attempts: Array<AttemptSummaryHttp & { versions: VersionWithFeedbackHttp[] }>;
}
