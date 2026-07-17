// Capa de repositorios (patrón Repository sobre Prisma Client). Envuelve
// database/queries con una interfaz orientada a entidad; no contiene reglas
// de negocio (eso vive en services/database) ni acceso SQL directo fuera de
// database/queries — ver ARCHITECTURE.md, sección 2.1 (hallazgo 9 de la
// auditoría de infraestructura).

export { withStudentContext, withServiceContext, type StudentScopedClient } from "./withStudentContext";
export {
  findStudentIdentity,
  findStudentIdByClerkId,
  saveUserFromClerk,
  deactivateUserFromClerk,
  type StudentIdentitySummary,
  type ClerkUserSyncInput,
} from "./userRepository";
export { findActiveLearningPlanSummary, type LearningPlanSummary } from "./learningPlanRepository";
export { findContinuationTarget, type ContinuationTarget } from "./writingRepository";
export {
  findActiveRecommendation,
  findCoachContext,
  type ActiveRecommendation,
  type CoachContextSummary,
} from "./coachRepository";
export {
  findCompetencySnapshot,
  findLearningAnalytics,
  type CompetencySnapshotItem,
  type LearningAnalyticsSnapshot,
} from "./competencyRepository";
export {
  findStudyFrequencySnapshot,
  findPerformanceSnapshot,
  type StudyFrequencySnapshot,
  type PerformanceSnapshot,
} from "./metricsRepository";
export { findEstimatedPerformance, type EstimatedPerformance } from "./examRepository";
export { findGamificationSnapshot, type GamificationSnapshot } from "./gamificationRepository";
export {
  findStudentDashboard,
  saveStudentDashboard,
  type StudentDashboardRecord,
  type StudentDashboardUpsertInput,
} from "./studentDashboardRepository";
