import type {
  AcademyUnitListItemDto,
  AcademyUnitDetailResponseDto,
  ContinuationStateResponseDto,
  AttemptSummaryResponseDto,
  VersionFeedbackResponseDto,
  ModelExampleResponseDto,
  UnitStepContentResponseDto,
  StudentProgressSummaryResponseDto,
  TeacherOverrideResponseDto,
  StudentUnitHistoryResponseDto,
} from "../dto";

// Puerto — Read Model dedicado de CQRS (Application Layer Spec v1.0,
// Sección 8: "todo Query Handler utiliza EXCLUSIVAMENTE
// AcademyReadModelPort — ninguno carga Aggregates ni invoca Repositories
// de escritura"). Implementado por infraestructura (Sprint 6.2,
// `PrismaAcademyReadModelPort`, `read-models/academy-query.service.ts`).
export interface AcademyReadModelPort {
  listUnitsForStudent(studentId: string, textType?: string): Promise<AcademyUnitListItemDto[]>;
  // Sprint 6.3.2 (remediacion H-01, ACP-002 / Blueprint Sprint 6.3.1):
  // `studentId` anadido como filtro de ownership obligatorio en las 3
  // lecturas afectadas -- cierra el BOLA (OWASP API1:2023) sin cargar
  // Aggregates ni invocar Repositories (CQRS intacto).
  getUnitDetail(unitId: string, studentId: string): Promise<AcademyUnitDetailResponseDto | null>;
  getContinuationState(studentId: string): Promise<ContinuationStateResponseDto | null>;
  listAttemptsByUnit(unitId: string, studentId: string): Promise<AttemptSummaryResponseDto[]>;
  getVersionFeedback(
    attemptId: string,
    versionNumber: number,
    studentId: string,
  ): Promise<VersionFeedbackResponseDto | null>;
  listModelExamplesByTextType(textType: string): Promise<ModelExampleResponseDto[]>;
  // Academy Content v1 (Bloque 3A) — `unitId`/`studentId` resuelven
  // ownership (mismo criterio H-01 que `getUnitDetail`); `null` significa
  // "unitId no existe o no pertenece a studentId" (404 en el Handler) —
  // distinto de "unidad existe pero sin contenido PUBLISHED todavía", que
  // devuelve `{ step, blocks: [] }`, nunca null ni error.
  getUnitStepContent(
    unitId: string,
    studentId: string,
    step: string,
    locale: string,
  ): Promise<UnitStepContentResponseDto | null>;
  getStudentProgressSummary(studentId: string): Promise<StudentProgressSummaryResponseDto>;
  listTeacherOverrides(unitId?: string, studentId?: string): Promise<TeacherOverrideResponseDto[]>;
  getStudentUnitHistory(
    studentId: string,
    unitId: string,
  ): Promise<StudentUnitHistoryResponseDto | null>;
}
