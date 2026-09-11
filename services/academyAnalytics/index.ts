// Servicio compartido: Academy Analytics — proyección de eventos del
// Outbox de Academia a las tablas de analítica que Dashboard/Evolution ya
// leen. No es una feature ni un bounded context nuevo: vive en `services/`
// (misma capa que `services/analytics`, `services/gamification`), lee de
// `database/` (mismo patrón que Dashboard ya usa para leer tablas de otros
// contextos), y NO importa nada de `features/*`.
//
// Block 2D — primer pipeline real:
//   POST /reflection -> CompleteReflectionHandler -> ReflectionCompletedEvent
//   -> academy_outbox -> runReflectionCompletedProjection() -> learning_metric
//   -> findStudyFrequencySnapshot (sin cambios) -> Evolution (sin cambios).

export {
  runReflectionCompletedProjection,
  type ReflectionProjectionRunSummary,
  type RunReflectionCompletedProjectionDeps,
} from "./reflectionCompletedProjectionConsumer";

export {
  createPrismaAcademyOutboxProjectionGateway,
  type AcademyOutboxProjectionGateway,
  type ReflectionProjectionResult,
} from "./academyOutboxProjectionGateway";

export { REFLECTION_COMPLETED_EVENT_NAME } from "@/database/queries/academyOutboxProjection";
