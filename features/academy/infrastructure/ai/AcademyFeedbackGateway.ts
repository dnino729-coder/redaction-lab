import type { FeedbackGatewayPort, FeedbackGatewayResult } from "@/features/academy/application/ports/FeedbackGatewayPort";
import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import type { AcademyUnitRepository } from "@/features/academy/domain/repositories/AcademyUnitRepository";
import type { RecordFeedbackDeliveredHandler } from "@/features/academy/application/handlers/RecordFeedbackDeliveredHandler";
import { RecordFeedbackDeliveredCommand } from "@/features/academy/application/commands/RecordFeedbackDeliveredCommand";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import type { Logger } from "@/features/academy/application/ports/Logger";

import type { AIProviderFactory } from "./AIProviderFactory";
import { FeedbackPromptBuilder } from "./FeedbackPromptBuilder";
import type { AcademyAIConfig } from "./AcademyAIConfig";

// Implementa `FeedbackGatewayPort` (Application Layer, Sprint 6.1) —
// CMD-02/CMD-05 lo invocan fuera de la transacción de escritura del
// Attempt. Si el proveedor de IA responde dentro de la ventana objetivo
// (`feedbackTimeoutTargetMs`), registra la retroalimentación de forma
// síncrona invocando `RecordFeedbackDeliveredHandler` (CMD-04, la única
// vía autorizada — Application Layer Spec v1.0) y retorna `DELIVERED`; si
// no, retorna `PROCESSING` (reintento/backoff/cola asíncrona: fuera del
// alcance explícito de los 16 puntos de Sprint 6.2 — no construidos aquí,
// ver informe de entrega).
export class AcademyFeedbackGateway implements FeedbackGatewayPort {
  private readonly promptBuilder = new FeedbackPromptBuilder();

  constructor(
    private readonly aiProviderFactory: AIProviderFactory,
    private readonly attemptRepository: AttemptRepository,
    private readonly academyUnitRepository: AcademyUnitRepository,
    private readonly recordFeedbackDeliveredHandler: RecordFeedbackDeliveredHandler,
    private readonly config: AcademyAIConfig,
    private readonly logger: Logger,
  ) {}

  public async requestFeedback(params: { attemptId: string; versionId: string }): Promise<FeedbackGatewayResult> {
    const attempt = await this.attemptRepository.findById(AttemptId.create(params.attemptId));
    const version = attempt?.versions.find((v) => v.id.value === params.versionId);
    if (!attempt || !version) {
      this.logger.warn("AcademyFeedbackGateway: Attempt/Version no encontrado", params);
      return { status: "PROCESSING" };
    }

    const unit = await this.academyUnitRepository.findById(attempt.unitId);
    const request = this.promptBuilder.build({
      content: version.content.text,
      textType: unit?.textType ?? "",
    });

    try {
      const response = await this.raceTimeout(
        this.aiProviderFactory.create().generateCompletion(request),
        this.config.feedbackTimeoutTargetMs,
      );
      const observations = this.promptBuilder.parse(response.content);
      if (observations.length === 0) {
        this.logger.warn("AcademyFeedbackGateway: respuesta de IA sin observaciones válidas", params);
        return { status: "PROCESSING" };
      }

      const feedbackDto = await this.recordFeedbackDeliveredHandler.handle(
        RecordFeedbackDeliveredCommand.fromRequest({
          attemptId: params.attemptId,
          versionNumber: version.number.value,
          observations,
        }),
      );
      return { status: "DELIVERED", feedbackId: feedbackDto.id };
    } catch (error) {
      this.logger.warn("AcademyFeedbackGateway: no se pudo generar retroalimentación dentro de la ventana objetivo", {
        ...params,
        error: String(error),
      });
      return { status: "PROCESSING" };
    }
  }

  private raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error("AcademyFeedbackGateway: timeout")), ms)),
    ]);
  }
}
