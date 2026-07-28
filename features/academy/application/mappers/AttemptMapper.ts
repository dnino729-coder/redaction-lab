import type { Attempt } from "@/features/academy/domain/aggregates/Attempt";
import type { Version } from "@/features/academy/domain/entities/Version";
import type { Feedback } from "@/features/academy/domain/entities/Feedback";
import type {
  AttemptSummaryResponseDto,
  DraftResponseDto,
  VersionResponseDto,
  FeedbackStatus,
  FeedbackResponseDto,
  FeedbackObservationResponseDto,
} from "../dto";

// Domain → DTO. Nunca se expone `Attempt`/`Version`/`Feedback` (Entities
// de dominio) fuera de la Application Layer.
export class AttemptMapper {
  public static toSummaryDto(attempt: Attempt): AttemptSummaryResponseDto {
    return {
      id: attempt.id.value,
      unitId: attempt.unitId.value,
      studentId: attempt.studentId.value,
      currentStep: attempt.currentStep,
      comprehensionVerified: attempt.comprehensionVerified,
      attemptNumber: attempt.attemptNumber,
      isCurrent: attempt.isCurrent,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
    };
  }

  public static toDraftDto(attemptId: string, draft: NonNullable<Attempt["draft"]>): DraftResponseDto {
    return {
      attemptId,
      content: draft.content.text,
      wordCount: draft.content.wordCount,
      characterCount: draft.content.characterCount,
      lastSavedAt: draft.updatedAt.toISOString(),
    };
  }

  public static toVersionDto(
    attemptId: string,
    version: Version,
    feedbackStatus: FeedbackStatus,
  ): VersionResponseDto {
    return {
      id: version.id.value,
      attemptId,
      versionNumber: version.number.value,
      content: version.content.text,
      submittedAt: version.submittedAt.toISOString(),
      feedbackStatus,
    };
  }

  public static toFeedbackDto(feedback: Feedback): FeedbackResponseDto {
    const observations: FeedbackObservationResponseDto[] = feedback.observations.map((o) => ({
      category: o.category,
      strength: o.strength,
      explanation: o.explanation,
      suggestion: o.suggestion,
    }));
    return {
      id: feedback.id.value,
      versionId: feedback.versionId.value,
      observations,
      deliveredAt: feedback.deliveredAt.toISOString(),
    };
  }
}
