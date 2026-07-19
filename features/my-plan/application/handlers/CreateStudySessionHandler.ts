import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { LearningTaskId } from "@/features/my-plan/domain/value-objects/LearningTaskId";
import { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import { StudySession } from "@/features/my-plan/domain/entities/StudySession";
import type { LearningTaskRepository } from "@/features/my-plan/domain/repositories/LearningTaskRepository";
import type { StudySessionRepository } from "@/features/my-plan/domain/repositories/StudySessionRepository";

import type { CreateStudySessionCommand } from "../commands/CreateStudySessionCommand";
import type { StudySessionResponseDto } from "../dto/StudySessionDto";
import { StudySessionMapper } from "../mappers/StudySessionMapper";
import { validateCreateStudySessionRequest } from "../validators/studyScheduleSessionValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";
import { OwnershipVerificationService } from "../services/OwnershipVerificationService";

// Caso de uso: CreateStudySession. `StudySession.start()` nace siempre
// abierta (`finishedAt = null`, `completed = false`, 13.4) — no existe un
// caso de uso "FinishStudySession" en el encargo de este sprint (los 15
// nombrados no lo incluyen), por lo que el cierre de la sesión queda
// fuera de alcance, igual que `UpdateLearningPlan` (ver informe de
// entrega). No emite Domain Event: `StudySession` extiende `Entity`, no
// `AggregateRoot` (ver domain/entities/StudySession.ts).
export class CreateStudySessionHandler {
  constructor(
    private readonly studySessionRepository: StudySessionRepository,
    private readonly learningTaskRepository: LearningTaskRepository,
    private readonly ownershipVerificationService: OwnershipVerificationService,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(command: CreateStudySessionCommand): Promise<StudySessionResponseDto> {
    const { request } = command;
    validateCreateStudySessionRequest(request);

    const studentId = StudentId.create(request.studentId);
    const learningTaskId = LearningTaskId.create(request.learningTaskId);
    const sessionId = StudySessionId.create(this.uuidGenerator.generate());

    await this.unitOfWork.execute(async () => {
      const task = await this.learningTaskRepository.findById(learningTaskId);
      if (!task) throw new ResourceNotFoundException("LearningTask", learningTaskId.value);
      await this.ownershipVerificationService.verifyTaskOwnership(task, studentId);

      const session = StudySession.start({
        id: sessionId,
        studentId,
        learningTaskId,
        startedAt: this.clock.now(),
      });
      await this.studySessionRepository.save(session);
    });

    const session = await this.studySessionRepository.findById(sessionId);
    if (!session) throw new ResourceNotFoundException("StudySession", sessionId.value);

    this.logger.info("StudySession iniciada", { studySessionId: sessionId.value, studentId: studentId.value });
    return StudySessionMapper.toResponseDto(session);
  }
}
