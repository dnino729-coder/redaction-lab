import type { AttemptRepository } from "@/features/academy/domain/repositories/AttemptRepository";
import { DraftId } from "@/features/academy/domain/value-objects/DraftId";
import { DraftContent } from "@/features/academy/domain/value-objects/DraftContent";

import type { AutosaveDraftCommand } from "../commands/AutosaveDraftCommand";
import type { DraftResponseDto } from "../dto/DraftDto";
import { AttemptMapper } from "../mappers/AttemptMapper";
import { validateAutosaveDraftRequest } from "../validators/attemptValidators";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { AcademyAuthorizationGuard } from "../services/AcademyAuthorizationGuard";

// CMD-03 AutosaveDraft — sin Outbox, sin eventos (Application Layer
// Spec v1.0, mismo criterio de granularidad ya fijado).
export class AutosaveDraftHandler {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly authorizationGuard: AcademyAuthorizationGuard,
  ) {}

  public async handle(command: AutosaveDraftCommand): Promise<DraftResponseDto> {
    const { request } = command;
    validateAutosaveDraftRequest(request);

    return this.unitOfWork.execute(async () => {
      const attempt = await this.authorizationGuard.assertAttemptOwnership(
        request.attemptId,
        request.studentId,
      );
      const content = DraftContent.createAllowingEmpty(request.content);
      attempt.autosaveDraft(DraftId.create(this.uuidGenerator.generate()), content);
      await this.attemptRepository.save(attempt);
      return AttemptMapper.toDraftDto(attempt.id.value, attempt.draft!);
    }, request.studentId);
  }
}
