import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { AcademyUnitId } from "@/features/academy/domain/value-objects/AcademyUnitId";
import { StudentId } from "@/features/academy/domain/value-objects/StudentId";
import { DraftId } from "@/features/academy/domain/value-objects/DraftId";
import { VersionId } from "@/features/academy/domain/value-objects/VersionId";
import { FeedbackId } from "@/features/academy/domain/value-objects/FeedbackId";
import { VersionNumber } from "@/features/academy/domain/value-objects/VersionNumber";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";
import { FeedbackObservation } from "@/features/academy/domain/value-objects/FeedbackObservation";
import { Draft } from "@/features/academy/domain/entities/Draft";
import { Version } from "@/features/academy/domain/entities/Version";
import { Feedback } from "@/features/academy/domain/entities/Feedback";
import type { UnitStep } from "@/features/academy/domain/enums/UnitStep";
import type { FeedbackCategory } from "@/features/academy/domain/enums/FeedbackCategory";
import type { FeedbackStrength } from "@/features/academy/domain/enums/FeedbackStrength";

// Persistence Mapper — Attempt <-> Prisma (Persistence Layer Specification
// v1.0, Sección 3.3). Cierre de H-06 (Domain Model v1.1): `findById`
// reconstituye con carga PARCIAL (solo la Version/Feedback vigente, `take:
// 1`); `findByIdWithFullHistory` reconstituye con el historial completo —
// usado exclusivamente por QRY-04/QRY-10 vía el Read Model, nunca por un
// Command Handler.
type FeedbackObservationRow = Prisma.FeedbackObservationGetPayload<Record<string, never>>;
type FeedbackRow = Prisma.FeedbackGetPayload<{ include: { observations: true } }>;
type VersionRow = Prisma.VersionGetPayload<{ include: { feedback: { include: { observations: true } } } }>;
type DraftRow = Prisma.DraftGetPayload<Record<string, never>>;

// `Attempt` (Prisma) no tiene columna `student_id` propia (Persistence
// Layer Specification v1.0, Sección 1: pertenece a `academy_unit`) — el
// Repository resuelve `studentId` con un `select` adicional sobre el
// `AcademyUnit` padre y lo inyecta en la fila antes de invocar este Mapper
// (nunca se reconstituye leyendo directamente `academy_unit` completo).
export type AttemptRow = Prisma.AttemptGetPayload<{
  include: {
    draft: true;
    versions: { include: { feedback: { include: { observations: true } } } };
  };
}> & { studentId: string; versions: readonly VersionRow[] };

export class AttemptPersistenceMapper {
  public static toDomain(row: AttemptRow): Attempt {
    return Attempt.reconstitute({
      id: AttemptId.create(row.id),
      unitId: AcademyUnitId.create(row.academyUnitId),
      // `Attempt` no persiste `studentId` como columna propia (Sección 1 de
      // este documento) — se deriva del `AcademyUnit` padre; el Repository
      // (Sección de repositorios) resuelve este valor antes de invocar el
      // Mapper, mediante un `select` adicional sobre `academy_unit.student_id`.
      studentId: StudentId.create(row.studentId),
      currentStep: row.currentStep as unknown as UnitStep,
      comprehensionVerified: row.comprehensionVerified,
      attemptNumber: row.attemptNumber,
      isCurrent: row.isCurrent,
      draft: row.draft ? this.draftToDomain(row.draft) : null,
      versions: row.versions.map((version: VersionRow) => this.versionToDomain(version)),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    });
  }

  private static draftToDomain(row: DraftRow): Draft {
    return Draft.reconstitute({
      id: DraftId.create(row.id),
      content: DraftContent.createAllowingEmpty(row.content),
      updatedAt: row.lastSavedAt,
    });
  }

  private static versionToDomain(row: VersionRow): Version {
    return Version.reconstitute({
      id: VersionId.create(row.id),
      number: VersionNumber.create(row.versionNumber),
      content: DraftContent.createAllowingEmpty(row.content),
      submittedAt: row.submittedAt,
      feedback: row.feedback ? this.feedbackToDomain(row.feedback) : null,
    });
  }

  private static feedbackToDomain(row: FeedbackRow): Feedback {
    return Feedback.reconstitute({
      id: FeedbackId.create(row.id),
      versionId: VersionId.create(row.versionId),
      observations: row.observations.map((observation: FeedbackObservationRow) => this.observationToDomain(observation)),
      deliveredAt: row.deliveredAt,
    });
  }

  private static observationToDomain(row: FeedbackObservationRow): FeedbackObservation {
    return FeedbackObservation.create({
      category: row.category as unknown as FeedbackCategory,
      strength: row.strength as unknown as FeedbackStrength,
      explanation: row.explanation,
      suggestion: row.suggestion,
    });
  }

  /** Descompone el Aggregate en las escrituras Prisma necesarias. Sin
   * seguimiento de "cambios" explícito en el Domain Layer (no expone
   * dirty-flags) — estrategia segura e idempotente: upsert por identidad
   * en cada nivel (Version es inmutable, Feedback se genera una única vez
   * por Version, por lo que reescribir una fila ya existente con el mismo
   * contenido es un no-op observable). */
  public static toPersistence(attempt: Attempt): {
    attemptRow: Prisma.AttemptUncheckedCreateInput | Prisma.AttemptUncheckedUpdateInput;
    draft: { attemptId: string; data: Prisma.DraftUncheckedCreateInput | Prisma.DraftUncheckedUpdateInput } | null;
    clearDraft: boolean;
    versions: readonly {
      data: Prisma.VersionUncheckedCreateInput | Prisma.VersionUncheckedUpdateInput;
      feedback: {
        data: Prisma.FeedbackUncheckedCreateInput | Prisma.FeedbackUncheckedUpdateInput;
        observations: readonly Prisma.FeedbackObservationUncheckedCreateInput[];
      } | null;
    }[];
  } {
    const draft = attempt.draft;
    return {
      attemptRow: {
        id: attempt.id.value,
        academyUnitId: attempt.unitId.value,
        currentStep: attempt.currentStep,
        comprehensionVerified: attempt.comprehensionVerified,
        attemptNumber: attempt.attemptNumber,
        isCurrent: attempt.isCurrent,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
      },
      draft: draft
        ? {
            attemptId: attempt.id.value,
            data: {
              id: draft.id.value,
              attemptId: attempt.id.value,
              content: draft.content.text,
              wordCount: draft.content.wordCount,
              characterCount: draft.content.characterCount,
              lastSavedAt: draft.updatedAt,
            },
          }
        : null,
      clearDraft: draft === null,
      versions: attempt.versions.map((version) => ({
        data: {
          id: version.id.value,
          attemptId: attempt.id.value,
          versionNumber: version.number.value,
          content: version.content.text,
          submittedAt: version.submittedAt,
        },
        feedback: version.feedback
          ? {
              data: {
                id: version.feedback.id.value,
                versionId: version.id.value,
                deliveredAt: version.feedback.deliveredAt,
              },
              observations: version.feedback.observations.map((observation) => ({
                id: randomUUID(),
                feedbackId: version.feedback!.id.value,
                category: observation.category,
                strength: observation.strength,
                explanation: observation.explanation,
                suggestion: observation.suggestion,
              })),
            }
          : null,
      })),
    };
  }
}
