// DTOs de GenerateInitialPlanStructure — comando interno, servidor-a-servidor
// (nunca expuesto vía HTTP en este slice; ver GenerateInitialPlanStructureHandler.ts
// para la justificación completa). Deliberadamente sin `studentId`: no hay
// verificación de ownership contra una sesión de estudiante porque este
// comando nunca lo invoca directamente una petición autenticada de
// estudiante — solo la propia orquestación de aplicación, inmediatamente
// después de que CreateLearningPlanHandler confirma la creación del plan.
export interface GenerateInitialPlanStructureRequestDto {
  readonly learningPlanId: string;
}

// `created`: false cuando la operación fue un no-op idempotente (el plan
// ya tenía fases) — así el llamante puede distinguir "estructura creada
// ahora" de "estructura ya existía" sin inspeccionar ningún objeto de
// dominio (nunca se exponen LearningPhase/LearningTask directamente).
export interface GenerateInitialPlanStructureResultDto {
  readonly learningPlanId: string;
  readonly created: boolean;
  readonly phasesCreated: number;
  readonly tasksCreated: number;
}
