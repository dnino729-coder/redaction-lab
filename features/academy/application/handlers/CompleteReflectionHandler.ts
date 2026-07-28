import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { UnitStep } from "@/features/academy/domain/enums/UnitStep";

import type { CompleteReflectionCommand } from "../commands/CompleteReflectionCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateCompleteReflectionRequest } from "../validators/attemptValidators";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Logger } from "../ports/Logger";
import { DomainEventPublisher } from "../services/DomainEventPublisher";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-07 CompleteReflection — **transacción 1** del patrón de dos
// transacciones (Application Layer Spec v1.0): cierra el `Attempt`
// (paso `UNLOCK`), emite `ReflectionCompleted`. La transacción 2 —
// transición de `AcademyUnit` a `COMPLETED`, evaluación de RN-10 y
// desbloqueo condicional de la unidad siguiente — la ejecuta
// `CompleteUnitOnReflectionCompletedHandler` (Sección 7.18), reaccionando
// a `ReflectionCompleted` vía Event Bus (Infrastructure, Sprint 6.2).
// Este Handler retorna el `AttemptSummaryResponseDto` de la transacción 1
// únicamente — el detalle de la Unidad (`AcademyUnitDetailDTO`, reflejando
// `COMPLETED`) se obtiene después mediante QRY-02, consistente con la
// naturaleza eventual de la sincronización (Sección 8.1 del Domain Model).
export class CompleteReflectionHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CompleteReflectionCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateCompleteReflectionRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const loaded = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      if (loaded.currentStep !== UnitStep.REFLECT) {
        throw new ConflictException(
          "ACADEMY_RULE_INVALID_STEP_FOR_COMMAND",
          `El intento "${request.attemptId}" no está en el paso REFLECT.`,
        );
      }
      loaded.completeReflection(request.reflectionAnswers);
      await this.attemptRepository.save(loaded);
      await this.domainEventPublisher.appendFrom("Attempt", loaded);
      return loaded;
    }, request.studentId);

    this.logger.info("CompleteReflection (transacción 1) completado", {
      attemptId: attempt.id.value,
    });
    return AttemptMapper.toSummaryDto(attempt);
  }
}
