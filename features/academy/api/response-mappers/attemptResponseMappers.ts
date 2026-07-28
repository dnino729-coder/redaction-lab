import type { AttemptSummaryResponseDto } from "@/features/academy/application/dto/AttemptDto";
import type { DraftResponseDto } from "@/features/academy/application/dto/DraftDto";
import type { VersionResponseDto } from "@/features/academy/application/dto/VersionDto";
import type {
  FeedbackResponseDto,
  FeedbackObservationResponseDto,
} from "@/features/academy/application/dto/FeedbackDto";
import type {
  ContinuationStateResponseDto,
  VersionFeedbackResponseDto,
} from "@/features/academy/application/dto/QueryDto";
import { toUnitDetailHttp } from "./unitResponseMappers";

// Response Mapper (Alcance #7) — `Attempt`/`Draft`/`Version`/`Feedback`.
//
// Nota de fidelidad (disclosed, no BLOCKER): el Contrato v1.3 documenta
// `AttemptSummaryDTO.versionCount`, que el DTO real de Application
// (`AttemptSummaryResponseDto`, Frozen desde Sprint 6.1.2) no expone — no
// se fabrica aquí (requeriría contar `Version`, un dato que el Mapper de
// Application deliberadamente no calcula, Sección 6 de ese documento: "el
// Mapper nunca los deriva por sí mismo").
export interface AttemptSummaryHttp {
  readonly attemptId: string;
  readonly unitId: string;
  readonly currentStep: string;
  readonly startedAt: string;
  readonly isCurrent: boolean;
}

export function toAttemptSummaryHttp(dto: AttemptSummaryResponseDto): AttemptSummaryHttp {
  return {
    attemptId: dto.id,
    unitId: dto.unitId,
    currentStep: dto.currentStep,
    startedAt: dto.startedAt,
    isCurrent: dto.isCurrent,
  };
}

export function toDraftHttp(dto: DraftResponseDto): DraftResponseDto {
  // Ya coincide 1:1 con `DraftDTO` (Contrato, Sección 5) — sin renombrado.
  return dto;
}

// `feedbackStatus` del DTO de Application usa el vocabulario
// `"DELIVERED" | "PROCESSING"` (`FeedbackStatus`, `application/dto/VersionDto.ts`,
// Frozen); el Contrato v1.3 (Sección 5/8) documenta el mismo concepto con
// el vocabulario `"READY" | "PROCESSING"` — traducción léxica pura, sin
// efecto de negocio, responsabilidad explícita de este Mapper.
export type ContractFeedbackStatus = "READY" | "PROCESSING";

export function toContractFeedbackStatus(status: "DELIVERED" | "PROCESSING"): ContractFeedbackStatus {
  return status === "DELIVERED" ? "READY" : "PROCESSING";
}

export interface VersionHttp {
  readonly versionId: string;
  readonly attemptId: string;
  readonly versionNumber: number;
  readonly content: string;
  readonly submittedAt: string;
  readonly feedbackStatus: ContractFeedbackStatus;
}

export function toVersionHttp(dto: VersionResponseDto): VersionHttp {
  return {
    versionId: dto.id,
    attemptId: dto.attemptId,
    versionNumber: dto.versionNumber,
    content: dto.content,
    submittedAt: dto.submittedAt,
    feedbackStatus: toContractFeedbackStatus(dto.feedbackStatus),
  };
}

export interface FeedbackObservationHttp extends FeedbackObservationResponseDto {}

export interface FeedbackHttp {
  readonly feedbackId: string | null;
  readonly versionId: string;
  readonly versionNumber: number;
  readonly status: ContractFeedbackStatus;
  readonly observations: readonly FeedbackObservationHttp[];
  readonly deliveredAt: string | null;
}

/**
 * Combina `VersionResponseDto` + `FeedbackResponseDto | null` (forma real
 * que produce QRY-05 `GetVersionFeedback`, `VersionFeedbackResponseDto`)
 * en el `FeedbackDTO` único que documenta el Contrato v1.3, Sección 5
 * (`feedbackId`, `versionId`, `versionNumber`, `status`, `observations`,
 * `deliveredAt`) — ninguno de los dos DTOs de Application, por separado,
 * tiene esta forma exacta; combinarlos es responsabilidad de Response
 * Mapping, no una redefinición del DTO de Application.
 *
 * Nota de fidelidad (disclosed): `FeedbackObservationDTO` del Contrato
 * incluye `priority` (entero); `FeedbackObservationResponseDto` de
 * Application no lo expone — no se fabrica.
 */
export function toVersionFeedbackHttp(dto: VersionFeedbackResponseDto): FeedbackHttp {
  const status: ContractFeedbackStatus = dto.feedback ? "READY" : "PROCESSING";
  return {
    feedbackId: dto.feedback?.id ?? null,
    versionId: dto.version.id,
    versionNumber: dto.version.versionNumber,
    status,
    observations: dto.feedback?.observations ?? [],
    deliveredAt: dto.feedback?.deliveredAt ?? null,
  };
}

/** Variante usada por EP-03 cuando `feedbackStatus === "READY"` — misma
 * forma que `toVersionFeedbackHttp`, construida a partir de un
 * `FeedbackResponseDto` ya resuelto (ver `handlers/attemptsHandlers.ts`). */
export function toFeedbackHttpFromDelivered(
  feedback: FeedbackResponseDto,
  versionNumber: number,
): FeedbackHttp {
  return {
    feedbackId: feedback.id,
    versionId: feedback.versionId,
    versionNumber,
    status: "READY",
    observations: feedback.observations,
    deliveredAt: feedback.deliveredAt,
  };
}

export interface ContinuationStateHttp {
  readonly unit: ReturnType<typeof toUnitDetailHttp>;
  readonly attempt: AttemptSummaryHttp;
  readonly draft: { readonly content: string; readonly lastSavedAt: string } | null;
}

export function toContinuationStateHttp(dto: ContinuationStateResponseDto): ContinuationStateHttp {
  return {
    unit: toUnitDetailHttp(dto.unit),
    attempt: toAttemptSummaryHttp(dto.attempt),
    draft: dto.draft,
  };
}
