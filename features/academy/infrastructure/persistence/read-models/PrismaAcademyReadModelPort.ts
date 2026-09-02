import type { AcademyTextType } from "@prisma/client";
import type { AcademyReadModelPort } from "@/features/academy/application/ports/AcademyReadModelPort";
import type {
  AcademyUnitListItemDto,
  AcademyUnitDetailResponseDto,
  ContinuationStateResponseDto,
  AttemptSummaryResponseDto,
  VersionFeedbackResponseDto,
  VersionResponseDto,
  FeedbackResponseDto,
  ModelExampleResponseDto,
  StudentProgressSummaryResponseDto,
  TeacherOverrideResponseDto,
  StudentUnitHistoryResponseDto,
  AttemptHistoryEntryDto,
} from "@/features/academy/application/dto";
import { UnitState } from "@/features/academy/domain/enums/UnitState";
import { EligibleForUnlockSpecification } from "@/features/academy/domain/specifications/EligibleForUnlockSpecification";
import { RepeatableSpecification } from "@/features/academy/domain/specifications/RepeatableSpecification";

import { withActiveClient } from "../PrismaClientContext";

// Implementa `AcademyReadModelPort` (Application Layer Spec v1.0, Sección
// 8/CQRS): "todo Query Handler utiliza EXCLUSIVAMENTE AcademyReadModelPort
// — ninguno carga Aggregates ni invoca Repositories de escritura". Ningún
// método de esta clase reconstituye un Aggregate — proyecta directamente
// filas Prisma a los DTO ya Frozen de Application Layer (Sprint 6.1).
//
// Reutiliza `EligibleForUnlockSpecification`/`RepeatableSpecification`
// (Domain Layer) para la elegibilidad mostrada en QRY-01/QRY-02: ambas son
// predicados puros sobre valores escalares (`UnitState`), no requieren
// reconstituir ningún Aggregate ni invocar un Repository de escritura — su
// reutilización aquí no viola CQRS (es la misma regla de negocio, no una
// segunda definición ad hoc que pudiera divergir con el tiempo).
const eligibleForUnlockSpec = new EligibleForUnlockSpecification();
const repeatableSpec = new RepeatableSpecification();

type UnitRowWithCount = {
  id: string;
  studentId: string;
  textType: string;
  position: number;
  state: string;
  activeAttemptId: string | null;
  completedAt: Date | null;
  masteredAt: Date | null;
  _count: { teacherOverrides: number };
};

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export class PrismaAcademyReadModelPort implements AcademyReadModelPort {
  public async listUnitsForStudent(studentId: string, textType?: string): Promise<AcademyUnitListItemDto[]> {
    const rows = await withActiveClient((client) =>
      client.academyUnit.findMany({
        where: { studentId, ...(textType ? { textType: textType as AcademyTextType } : {}) },
        include: { _count: { select: { teacherOverrides: true } } },
        orderBy: [{ textType: "asc" }, { position: "asc" }],
      }),
    );

    const byTextTypeAndPosition = new Map<string, UnitRowWithCount>();
    for (const row of rows) {
      byTextTypeAndPosition.set(`${row.textType}:${row.position}`, row as unknown as UnitRowWithCount);
    }

    return rows.map((row) => {
      const predecessor = byTextTypeAndPosition.get(`${row.textType}:${row.position - 1}`) ?? null;
      return this.toListItemDto(row as unknown as UnitRowWithCount, predecessor);
    });
  }

  // Sprint 6.3.2 (remediacion H-01): `studentId` obligatorio, aplicado en
  // el propio WHERE -- mismo patron ya usado por `getStudentUnitHistory`
  // en este archivo. Una fila que exista pero pertenezca a otro estudiante
  // se trata igual que "no existe" (null), consistente con la Seccion 11
  // del API Contract v1.3 ("404 nunca se distingue de 'no autorizado'").
  public async getUnitDetail(
    unitId: string,
    studentId: string,
  ): Promise<AcademyUnitDetailResponseDto | null> {
    const row = await withActiveClient((client) =>
      client.academyUnit.findFirst({
        where: { id: unitId, studentId },
        include: { _count: { select: { teacherOverrides: true } } },
      }),
    );
    if (!row) return null;
    const unitRow = row as unknown as UnitRowWithCount;
    const predecessor = await withActiveClient((client) =>
      client.academyUnit.findUnique({
        where: {
          studentId_textType_position: {
            studentId: unitRow.studentId,
            textType: unitRow.textType as AcademyTextType,
            position: unitRow.position - 1,
          },
        },
        include: { _count: { select: { teacherOverrides: true } } },
      }),
    );
    return this.toDetailDto(unitRow, (predecessor as unknown as UnitRowWithCount) ?? null);
  }

  public async getContinuationState(studentId: string): Promise<ContinuationStateResponseDto | null> {
    const attemptRow = await withActiveClient((client) =>
      client.attempt.findFirst({
        where: { isCurrent: true, academyUnit: { studentId } },
        include: {
          draft: true,
          academyUnit: { include: { _count: { select: { teacherOverrides: true } } } },
          _count: { select: { versions: true } },
        },
        orderBy: { startedAt: "desc" },
      }),
    );
    if (!attemptRow) return null;

    const { academyUnit, draft, _count, ...attempt } = attemptRow;
    const unitRow = academyUnit as unknown as UnitRowWithCount;
    const predecessor = await withActiveClient((client) =>
      client.academyUnit.findUnique({
        where: {
          studentId_textType_position: {
            studentId: unitRow.studentId,
            textType: unitRow.textType as AcademyTextType,
            position: unitRow.position - 1,
          },
        },
        include: { _count: { select: { teacherOverrides: true } } },
      }),
    );

    return {
      unit: this.toDetailDto(unitRow, (predecessor as unknown as UnitRowWithCount) ?? null),
      attempt: this.toAttemptSummaryDto({ ...attempt, studentId: unitRow.studentId, versionCount: _count.versions }),
      draft: draft ? { content: draft.content, lastSavedAt: draft.lastSavedAt.toISOString() } : null,
    };
  }

  // Sprint 6.3.2 (remediacion H-01): `studentId` obligatorio, aplicado via
  // filtro de relacion (`academyUnit: { studentId }`) -- mismo patron ya
  // usado por `getContinuationState` en este archivo.
  public async listAttemptsByUnit(
    unitId: string,
    studentId: string,
  ): Promise<AttemptSummaryResponseDto[]> {
    const rows = await withActiveClient((client) =>
      client.attempt.findMany({
        where: { academyUnitId: unitId, academyUnit: { studentId } },
        include: { academyUnit: { select: { studentId: true } }, _count: { select: { versions: true } } },
        orderBy: { attemptNumber: "asc" },
      }),
    );
    return rows.map((row) => {
      const { academyUnit, _count, ...attempt } = row;
      return this.toAttemptSummaryDto({ ...attempt, studentId: academyUnit!.studentId, versionCount: _count.versions });
    });
  }

  // Sprint 6.3.2 (remediacion H-01): `studentId` obligatorio. `findUnique`
  // no admite un filtro adicional por relacion junto a una clave compuesta,
  // por lo que se usa `findFirst` con el filtro anidado
  // `attempt: { academyUnit: { studentId } }` -- `attemptId_versionNumber`
  // sigue siendo unico en la practica, `findFirst` no cambia el resultado
  // esperado en el camino feliz.
  public async getVersionFeedback(
    attemptId: string,
    versionNumber: number,
    studentId: string,
  ): Promise<VersionFeedbackResponseDto | null> {
    const row = await withActiveClient((client) =>
      client.version.findFirst({
        where: {
          attemptId,
          versionNumber,
          attempt: { academyUnit: { studentId } },
        },
        include: { feedback: { include: { observations: true } } },
      }),
    );
    if (!row) return null;
    return {
      version: this.toVersionDto(row),
      feedback: row.feedback ? this.toFeedbackDto(row.feedback) : null,
    };
  }

  public async listModelExamplesByTextType(textType: string): Promise<ModelExampleResponseDto[]> {
    const rows = await withActiveClient((client) =>
      client.modelExample.findMany({
        where: { textType: textType as AcademyTextType, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
    );
    return rows.map((row) => ({
      id: row.id,
      textType: row.textType,
      content: row.content,
      rating: row.rating,
      curatorialComment: row.curatorialComment,
      status: row.status,
    }));
  }

  public async getStudentProgressSummary(studentId: string): Promise<StudentProgressSummaryResponseDto> {
    const byState = await withActiveClient((client) =>
      client.academyUnit.groupBy({ by: ["state"], where: { studentId }, _count: { _all: true } }),
    );
    const byTextType = await withActiveClient((client) =>
      client.academyUnit.groupBy({ by: ["textType"], where: { studentId }, _count: { _all: true } }),
    );

    const unitsByState: Record<string, number> = {};
    for (const state of Object.values(UnitState)) unitsByState[state] = 0;
    for (const row of byState) {
      if (row.state) unitsByState[row.state] = row._count._all;
    }

    const unitsByTextType: Record<string, number> = {};
    for (const row of byTextType) {
      if (row.textType) unitsByTextType[row.textType] = row._count._all;
    }

    return {
      studentId,
      unitsByState,
      unitsByTextType,
      masteredCount: unitsByState[UnitState.MASTERED] ?? 0,
      completedCount: unitsByState[UnitState.COMPLETED] ?? 0,
    };
  }

  public async listTeacherOverrides(unitId?: string, studentId?: string): Promise<TeacherOverrideResponseDto[]> {
    const rows = await withActiveClient((client) =>
      client.teacherOverride.findMany({
        where: {
          ...(unitId ? { academyUnitId: unitId } : {}),
          ...(studentId ? { academyUnit: { studentId } } : {}),
        },
        orderBy: { appliedAt: "desc" },
      }),
    );
    return rows.map((row) => ({
      id: row.id,
      unitId: row.academyUnitId,
      teacherId: row.teacherId,
      action: row.action,
      reason: row.reason,
      appliedAt: row.appliedAt.toISOString(),
    }));
  }

  public async getStudentUnitHistory(
    studentId: string,
    unitId: string,
  ): Promise<StudentUnitHistoryResponseDto | null> {
    const row = await withActiveClient((client) =>
      client.academyUnit.findFirst({
        where: { id: unitId, studentId },
        include: {
          _count: { select: { teacherOverrides: true } },
          attempts: {
            orderBy: { attemptNumber: "asc" },
            include: {
              versions: {
                orderBy: { versionNumber: "asc" },
                include: { feedback: { include: { observations: true } } },
              },
            },
          },
        },
      }),
    );
    if (!row) return null;

    const { attempts, ...unitRow } = row;
    const predecessor = await withActiveClient((client) =>
      client.academyUnit.findUnique({
        where: {
          studentId_textType_position: {
            studentId: unitRow.studentId,
            textType: unitRow.textType,
            position: unitRow.position - 1,
          },
        },
        include: { _count: { select: { teacherOverrides: true } } },
      }),
    );

    type HistoryVersionRow = {
      id: string;
      attemptId: string;
      versionNumber: number;
      content: string;
      submittedAt: Date;
      feedback: {
        id: string;
        versionId: string;
        deliveredAt: Date;
        observations: readonly { category: string; strength: string; explanation: string; suggestion: string }[];
      } | null;
    };
    type HistoryAttemptRow = {
      id: string;
      academyUnitId: string;
      currentStep: string;
      comprehensionVerified: boolean;
      attemptNumber: number;
      isCurrent: boolean;
      startedAt: Date;
      completedAt: Date | null;
      versions: readonly HistoryVersionRow[];
    };

    const attemptEntries: AttemptHistoryEntryDto[] = (attempts as readonly HistoryAttemptRow[]).map(
      (attempt) => {
        const { versions, ...attemptScalar } = attempt;
        return {
          ...this.toAttemptSummaryDto({
            ...attemptScalar,
            studentId: unitRow.studentId,
            versionCount: versions.length,
          }),
          versions: versions.map((version) => ({
            version: this.toVersionDto(version),
            feedback: version.feedback ? this.toFeedbackDto(version.feedback) : null,
          })),
        };
      },
    );

    return {
      unit: this.toDetailDto(unitRow as unknown as UnitRowWithCount, (predecessor as unknown as UnitRowWithCount) ?? null),
      attempts: attemptEntries,
    };
  }

  // --- Helpers de proyección ------------------------------------------

  private toDetailDto(row: UnitRowWithCount, predecessor: UnitRowWithCount | null): AcademyUnitDetailResponseDto {
    const isFirstInSequence = row.position === 1;
    const eligibleForUnlock = eligibleForUnlockSpec.isSatisfiedBy({
      currentState: row.state as UnitState,
      isFirstInSequence,
      predecessorState: (predecessor?.state as UnitState) ?? null,
    });
    const repeatable = repeatableSpec.isSatisfiedBy({ currentState: row.state as UnitState });

    return {
      id: row.id,
      studentId: row.studentId,
      textType: row.textType,
      position: row.position,
      state: row.state,
      activeAttemptId: row.activeAttemptId,
      completedAt: toIso(row.completedAt),
      masteredAt: toIso(row.masteredAt),
      eligibleForUnlock,
      repeatable,
      teacherOverrideCount: row._count.teacherOverrides,
    };
  }

  private toListItemDto(row: UnitRowWithCount, predecessor: UnitRowWithCount | null): AcademyUnitListItemDto {
    const detail = this.toDetailDto(row, predecessor);
    return {
      ...detail,
      isEligibleForUnlock: detail.eligibleForUnlock,
      isRepeatable: detail.repeatable,
    };
  }

  // ACP-004: `versionCount` se deriva del conteo de la relación `versions`
  // ya existente en el esquema (`Attempt.versions`, Domain Model v1.1,
  // Sección 3) -- cada llamador resuelve ese conteo según los datos que ya
  // tiene disponibles (ver `getContinuationState`/`listAttemptsByUnit`/
  // `getStudentUnitHistory`).
  private toAttemptSummaryDto(row: {
    id: string;
    academyUnitId: string;
    studentId: string;
    currentStep: string;
    comprehensionVerified: boolean;
    attemptNumber: number;
    isCurrent: boolean;
    startedAt: Date;
    completedAt: Date | null;
    versionCount: number;
  }): AttemptSummaryResponseDto {
    return {
      id: row.id,
      unitId: row.academyUnitId,
      studentId: row.studentId,
      currentStep: row.currentStep,
      comprehensionVerified: row.comprehensionVerified,
      attemptNumber: row.attemptNumber,
      isCurrent: row.isCurrent,
      startedAt: row.startedAt.toISOString(),
      completedAt: toIso(row.completedAt),
      versionCount: row.versionCount,
    };
  }

  private toVersionDto(row: {
    id: string;
    attemptId: string;
    versionNumber: number;
    content: string;
    submittedAt: Date;
    feedback?: unknown;
  }): VersionResponseDto {
    return {
      id: row.id,
      attemptId: row.attemptId,
      versionNumber: row.versionNumber,
      content: row.content,
      submittedAt: row.submittedAt.toISOString(),
      feedbackStatus: row.feedback ? "DELIVERED" : "PROCESSING",
    };
  }

  private toFeedbackDto(row: {
    id: string;
    versionId: string;
    deliveredAt: Date;
    observations: readonly { category: string; strength: string; explanation: string; suggestion: string }[];
  }): FeedbackResponseDto {
    return {
      id: row.id,
      versionId: row.versionId,
      deliveredAt: row.deliveredAt.toISOString(),
      observations: row.observations.map((observation) => ({
        category: observation.category,
        strength: observation.strength as "STRENGTH" | "WEAKNESS",
        explanation: observation.explanation,
        suggestion: observation.suggestion,
      })),
    };
  }
}
