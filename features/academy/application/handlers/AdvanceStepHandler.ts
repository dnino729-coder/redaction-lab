import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";

import type { AdvanceStepCommand } from "../commands/AdvanceStepCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateAdvanceStepRequest } from "../validators/attemptValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-16 AdvanceStep — sin Outbox, sin eventos (mismo criterio que
// CMD-03).
export class AdvanceStepHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(command: AdvanceStepCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateAdvanceStepRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const loaded = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      loaded.advanceStep();
      await this.attemptRepository.save(loaded);
      return loaded;
    }, request.studentId);

    return AttemptMapper.toSummaryDto(attempt);
  }
}
