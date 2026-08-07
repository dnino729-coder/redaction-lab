// Blueprint §5.2 y §5.12.
import type { UnitStep } from "./enums";

export interface AttemptSummaryHttp {
  attemptId: string;
  unitId: string;
  currentStep: UnitStep;
  startedAt: string;
  isCurrent: boolean;
  // ACP-004: producido por el Mapper HTTP solo cuando el DTO de origen es de
  // lectura (Read Model) — ausente en respuestas de Commands. Ningún
  // consumidor debe asumir su presencia.
  versionCount?: number;
}

/** Blueprint §5.12/§3.1 — exclusivo de `verifyComprehensionAction`, sin
 * equivalente REST directo. A diferencia de EP-22 (que retorna 422), esta
 * Server Action siempre resuelve con éxito y comunica el resultado semántico
 * vía `satisfied`. */
export interface VerifyComprehensionActionResult {
  attempt: AttemptSummaryHttp;
  satisfied: boolean;
}
