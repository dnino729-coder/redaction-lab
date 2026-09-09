import { StudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import { StudySessionId } from "@/features/my-plan/domain/value-objects/StudySessionId";
import { SessionDuration } from "@/features/my-plan/domain/value-objects/SessionDuration";
import { DomainInvariantViolationException } from "@/features/my-plan/domain/exceptions/DomainInvariantViolationException";
import type { StudySessionRepository } from "@/features/my-plan/domain/repositories/StudySessionRepository";

import type { FinishStudySessionCommand } from "../commands/FinishStudySessionCommand";
import type { StudySessionResponseDto } from "../dto/StudySessionDto";
import { StudySessionMapper } from "../mappers/StudySessionMapper";
import { validateFinishStudySessionRequest } from "../validators/studyScheduleSessionValidators";
import { ResourceNotFoundException } from "../exceptions/ResourceNotFoundException";
import { ConflictException } from "../exceptions/ConflictException";
import type { UnitOfWork } from "../ports/UnitOfWork";
import type { Clock } from "../ports/Clock";
import type { Logger } from "../ports/Logger";
import type { OwnershipVerificationService } from "../services/OwnershipVerificationService";

// Caso de uso: FinishStudySession — cierra una `StudySession` abierta
// (slice "create and finish study sessions", ver auditoría "Study Session
// Write Architecture Audit"). Mismo patrón exacto que
// CreateStudySessionHandler (repositorio único, sin cadena de ownership,
// `unitOfWork.execute(work, studentId)` → `withStudentContext`,
// `dashboard_app_role` ya tiene GRANT UPDATE sobre `study_session`,
// migración 202607171400 — sin cambios de RLS/GRANT).
//
// Duración — decisión ya aprobada, NO client-supplied: el servidor es la
// única autoridad temporal (mismo criterio ya usado por `startedAt` en
// CreateStudySessionHandler, vía el puerto `Clock`, nunca `new Date()`
// directo). El cliente solo identifica `sessionId`; nunca envía
// `finishedAt`/`durationMinutes`. `finishedAt = clock.now()`;
// `durationMinutes = round((finishedAt - session.startedAt) / 60000)` —
// 0 minutos es un resultado válido (SessionDuration ya lo permite, no se
// inventa un mínimo).
//
// `StudySession.finish()` ya reafirma sus propios invariantes (no se
// puede finalizar dos veces; `finishedAt` no puede ser anterior a
// `startedAt`) — este Handler solo traduce
// `DomainInvariantViolationException` a `ConflictException` de
// aplicación, mismo patrón ya usado por CompleteLearningTaskHandler para
// sus propias excepciones de dominio.
//
// LearningTask/LearningProgress: deliberadamente NO se tocan aquí — ver
// auditoría, secciones 13-14 (StudySession no completa tareas ni afecta
// el progreso). Sin EventBus: `StudySession` extiende `Entity`, no
// `AggregateRoot`.
export class FinishStudySessionHandler {
  constructor(
    private readonly studySessionRepository: StudySessionRepository,
    private readonly ownershipVerificationService: OwnershipVerificationService,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly logger: Logger,
  ) {}

  public async handle(command: FinishStudySessionCommand): Promise<StudySessionResponseDto> {
    const { request } = command;
    validateFinishStudySessionRequest(request);

    const studentId = StudentId.create(request.studentId);
    const sessionId = StudySessionId.create(request.sessionId);

    await this.unitOfWork.execute(async () => {
      const session = await this.studySessionRepository.findById(sessionId);
      if (!session) throw new ResourceNotFoundException("StudySession", sessionId.value);

      await this.ownershipVerificationService.verifySessionOwnership(session, studentId);

      const finishedAt = this.clock.now();
      const durationMinutes = Math.round(
        (finishedAt.getTime() - session.startedAt.getTime()) / 60_000,
      );

      try {
        const duration = SessionDuration.create(durationMinutes);
        session.finish(finishedAt, duration);
      } catch (error) {
        if (error instanceof DomainInvariantViolationException) {
          throw new ConflictException(error.message);
        }
        throw error;
      }

      await this.studySessionRepository.save(session);
    }, studentId.value);

    const session = await this.studySessionRepository.findById(sessionId);
    if (!session) throw new ResourceNotFoundException("StudySession", sessionId.value);

    this.logger.info("StudySession finalizada", {
      studySessionId: sessionId.value,
      studentId: studentId.value,
    });
    return StudySessionMapper.toResponseDto(session);
  }
}
