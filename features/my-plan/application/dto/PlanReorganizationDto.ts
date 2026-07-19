// `reason` reutiliza literalmente los 2 valores de `ReprogrammingReason`
// del dominio (Vacío 2 / docs/modules/mi-plan.md, 2.9) — no se añade
// ningún tercer motivo no documentado.
export type PlanReorganizationReasonDto = "EXAM_DATE_CHANGED" | "AVAILABILITY_CHANGED";

export interface RequestPlanReorganizationRequestDto {
  readonly planId: string;
  readonly studentId: string;
  readonly reason: PlanReorganizationReasonDto;
}

// Esta operación no persiste ningún cambio de dominio por sí misma (ver
// handlers/RequestPlanReorganizationHandler.ts) — únicamente valida y
// publica PLAN_REORGANIZATION_REQUESTED. El Response confirma que el
// evento fue aceptado y encolado para el Learning Planner (Vacío 8),
// consumidor fuera de alcance de este sprint.
export interface RequestPlanReorganizationResponseDto {
  readonly accepted: true;
  readonly learningPlanId: string;
  readonly reason: PlanReorganizationReasonDto;
  readonly requestedAt: string;
}
