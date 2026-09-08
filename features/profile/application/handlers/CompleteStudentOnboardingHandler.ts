import { StudentId } from "@/features/profile/domain/value-objects/StudentId";
import { StudentProfileId } from "@/features/profile/domain/value-objects/StudentProfileId";
import { StudentProfile } from "@/features/profile/domain/entities/StudentProfile";
import type { StudentProfileRepository } from "@/features/profile/domain/repositories/StudentProfileRepository";
import type { CefrLevel } from "@/features/profile/domain/enums/CefrLevel";

// Único punto de acoplamiento deliberado entre Profile y My Plan — la
// orquestación del onboarding necesita, por diseño ya aprobado, reutilizar
// tal cual el caso de uso existente de creación de plan (no se modifica
// CreateLearningPlanHandler/CreateLearningPlanCommand: se les llama con
// los datos ya recogidos y validados en este mismo Request). Fuera de este
// archivo, ningún otro punto de Profile importa nada de My Plan.
import type { LearningPlanRepository } from "@/features/my-plan/domain/repositories/LearningPlanRepository";
import { StudentId as MyPlanStudentId } from "@/features/my-plan/domain/value-objects/StudentId";
import type { CreateLearningPlanHandler } from "@/features/my-plan/application/handlers/CreateLearningPlanHandler";
import { CreateLearningPlanCommand } from "@/features/my-plan/application/commands/CreateLearningPlanCommand";
// Segunda llamada al mismo módulo My Plan, mismo punto único de
// acoplamiento ya aprobado arriba — NO es una tercera excepción de
// .eslintrc.cjs (la zona profile↔my-plan ya permite cualquier import desde
// "./my-plan"). GenerateInitialPlanStructureHandler es un productor
// determinista (fases/tareas estructurales), deliberadamente NO llamado
// "LearningPlanner" — ver su propio archivo para la justificación
// completa. Se invoca aquí, en una TERCERA transacción independiente,
// después de que CreateLearningPlanHandler ya confirmó la suya — nunca se
// anida ninguna transacción.
import type { GenerateInitialPlanStructureHandler } from "@/features/my-plan/application/handlers/GenerateInitialPlanStructureHandler";
import { GenerateInitialPlanStructureCommand } from "@/features/my-plan/application/commands/GenerateInitialPlanStructureCommand";

import type { CompleteStudentOnboardingCommand } from "../commands/CompleteStudentOnboardingCommand";
import type { CompleteStudentOnboardingResponseDto } from "../dto/CompleteStudentOnboardingDto";
import { StudentProfileMapper } from "../mappers/StudentProfileMapper";
import { validateCompleteStudentOnboardingRequest } from "../validators/studentProfileValidators";
import { ConflictException } from "../exceptions/ConflictException";
import type { UuidGenerator } from "../ports/UuidGenerator";
import type { Logger } from "../ports/Logger";

// Caso de uso: CompleteStudentOnboarding — coordina la creación de
// StudentProfile (Profile, transacción propia) y de LearningPlan (My Plan,
// vía CreateLearningPlanHandler existente, su propia transacción) desde
// una única petición HTTP. NO es una única transacción Postgres (ver
// auditoría: CreateLearningPlanHandler abre su propia transacción interna
// y no acepta una externa) — es una única operación de negocio orquestada
// por este Handler, con un estado intermedio recuperable documentado
// explícitamente en los 3 casos de abajo.
export class CompleteStudentOnboardingHandler {
  constructor(
    private readonly studentProfileRepository: StudentProfileRepository,
    private readonly learningPlanRepository: LearningPlanRepository,
    private readonly createLearningPlanHandler: CreateLearningPlanHandler,
    private readonly generateInitialPlanStructureHandler: GenerateInitialPlanStructureHandler,
    private readonly uuidGenerator: UuidGenerator,
    private readonly logger: Logger,
  ) {}

  public async handle(
    command: CompleteStudentOnboardingCommand,
  ): Promise<CompleteStudentOnboardingResponseDto> {
    const { request } = command;
    validateCompleteStudentOnboardingRequest(request);

    const studentId = StudentId.create(request.studentId);
    const myPlanStudentId = MyPlanStudentId.create(request.studentId);

    const existingProfile = await this.studentProfileRepository.findByStudentId(studentId);
    const existingActivePlan =
      await this.learningPlanRepository.findActiveByStudentId(myPlanStudentId);

    // Estado C: onboarding ya completado — nunca crear un segundo plan ni
    // un segundo perfil.
    if (existingProfile && existingActivePlan) {
      throw new ConflictException(
        `El estudiante ${studentId.value} ya completó el onboarding (StudentProfile y LearningPlan activo ya existen).`,
      );
    }

    // Estado A (sin perfil) crea uno nuevo; Estado B (perfil existente,
    // sin plan activo — recuperación de un intento anterior fallido en el
    // segundo paso) lo reutiliza tal cual, sin modificarlo.
    let profile = existingProfile;
    if (!profile) {
      profile = StudentProfile.create({
        id: StudentProfileId.create(this.uuidGenerator.generate()),
        studentId,
        currentLevel: request.currentLevel as CefrLevel,
        targetLevel: request.targetLevel as CefrLevel,
        nativeLanguage: request.nativeLanguage,
        learningGoal: request.learningGoal,
        targetExamDate: request.targetExamDate ? new Date(request.targetExamDate) : null,
      });
      await this.studentProfileRepository.create(profile);
      this.logger.info("StudentProfile creado", { studentId: studentId.value });
    }

    // Reutiliza CreateLearningPlanHandler sin modificarlo — la meta y la
    // disponibilidad recogidas en el onboarding se pasan tal cual, sin
    // inventar contenido pedagógico adicional. `name` es una etiqueta
    // puramente técnica derivada del propio targetLevel real del
    // estudiante, no una decisión pedagógica.
    const planDto = await this.createLearningPlanHandler.handle(
      CreateLearningPlanCommand.fromRequest({
        studentId: request.studentId,
        name: `Plan ${request.targetLevel}`,
        targetLevel: request.targetLevel,
        startDate: new Date().toISOString(),
        initialGoals: [{ title: request.learningGoal }],
        studySchedule: {
          daysPerWeek: request.daysPerWeek,
          sessionsPerDay: request.sessionsPerDay,
          minutesPerSession: request.minutesPerSession,
          reminderHour: request.reminderHour ?? undefined,
          reminderMinute: request.reminderMinute ?? undefined,
        },
      }),
    );

    // Tercera transacción independiente, tras confirmar la del plan.
    // GenerateInitialPlanStructureHandler es idempotente por diseño (ver
    // su propio archivo) — no genera duplicados si esta llamada se
    // reintenta con el mismo learningPlanId.
    //
    // Riesgo conocido, documentado deliberadamente en vez de resuelto aquí
    // (fuera de alcance de este slice, ver auditoría "Learning Planner
    // Architecture Audit", sección 26): si esta llamada falla, la petición
    // completa falla (el error se propaga, nunca se silencia) dejando
    // StudentProfile + LearningPlan ya confirmados pero sin
    // LearningPhase/LearningTask. Un reintento del onboarding completo NO
    // repara este caso por sí solo: el Estado C de arriba (perfil + plan
    // activo ya existen) seguiría respondiendo ConflictException antes de
    // llegar a esta línea — extender esa comprobación para permitir
    // reintentar solo la generación de estructura es una decisión
    // deliberadamente fuera de alcance de este slice.
    await this.generateInitialPlanStructureHandler.handle(
      GenerateInitialPlanStructureCommand.fromRequest({ learningPlanId: planDto.id }),
    );

    this.logger.info("Onboarding completado", {
      studentId: studentId.value,
      learningPlanId: planDto.id,
    });

    return {
      studentProfile: StudentProfileMapper.toResponseDto(profile),
      learningPlanId: planDto.id,
    };
  }
}
