import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";

import type { VerifyComprehensionCommand } from "../commands/VerifyComprehensionCommand";
import type { AttemptSummaryResponseDto } from "../dto/AttemptDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateVerifyComprehensionRequest } from "../validators/attemptValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-17 VerifyComprehension — RN-2. Si la verificación no es
// satisfactoria, `Attempt.verifyComprehension()` retorna `false` sin
// lanzar excepción y permanece en COMPREHEND (caso válido, EP-22); este
// Handler no distingue ese caso como error.
export class VerifyComprehensionHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(command: VerifyComprehensionCommand): Promise<AttemptSummaryResponseDto> {
    const { request } = command;
    validateVerifyComprehensionRequest(request);

    const attempt = await this.unitOfWork.execute(async () => {
      const loaded = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      loaded.verifyComprehension(request.comprehensionResponse);
      await this.attemptRepository.save(loaded);
      return loaded;
    }, request.studentId);

    return AttemptMapper.toSummaryDto(attempt);
  }
}
