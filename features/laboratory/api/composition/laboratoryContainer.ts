import { PrismaWritingExerciseRepository } from "@/features/laboratory/infrastructure/persistence/repositories/PrismaWritingExerciseRepository";
import { PrismaExerciseAttemptRepository } from "@/features/laboratory/infrastructure/persistence/repositories/PrismaExerciseAttemptRepository";
import { PrismaLaboratoryExerciseReadModelPort } from "@/features/laboratory/infrastructure/persistence/read-models/PrismaLaboratoryExerciseReadModelPort";
import { PrismaLaboratoryUnitOfWork } from "@/features/laboratory/infrastructure/persistence/unit-of-work/PrismaLaboratoryUnitOfWork";
import { LaboratoryCryptoUuidGenerator } from "@/features/laboratory/infrastructure/adapters/LaboratoryCryptoUuidGenerator";
import { LaboratorySystemClock } from "@/features/laboratory/infrastructure/adapters/LaboratorySystemClock";

import type { Logger } from "@/features/laboratory/application/ports/Logger";
import { LaboratoryConsoleLogger } from "@/features/laboratory/infrastructure/logging/LaboratoryConsoleLogger";
import { WritingExerciseFactory } from "@/features/laboratory/domain/factories/WritingExerciseFactory";
import { ExerciseAttemptFactory } from "@/features/laboratory/domain/factories/ExerciseAttemptFactory";

import { CreateWritingExerciseHandler } from "@/features/laboratory/application/handlers/CreateWritingExerciseHandler";
import { StartExerciseAttemptHandler } from "@/features/laboratory/application/handlers/StartExerciseAttemptHandler";
import { AutosaveExerciseDraftHandler } from "@/features/laboratory/application/handlers/AutosaveExerciseDraftHandler";
import { CompleteExerciseAttemptHandler } from "@/features/laboratory/application/handlers/CompleteExerciseAttemptHandler";
import { RepeatWritingExerciseHandler } from "@/features/laboratory/application/handlers/RepeatWritingExerciseHandler";
import { ListWritingExercisesForStudentHandler } from "@/features/laboratory/application/handlers/ListWritingExercisesForStudentHandler";
import { GetWritingExerciseDetailHandler } from "@/features/laboratory/application/handlers/GetWritingExerciseDetailHandler";
import { GetExerciseAttemptHistoryHandler } from "@/features/laboratory/application/handlers/GetExerciseAttemptHistoryHandler";
import { GetExerciseAttemptDetailHandler } from "@/features/laboratory/application/handlers/GetExerciseAttemptDetailHandler";

export interface LaboratoryContainer {
  readonly repositories: {
    readonly writingExercise: PrismaWritingExerciseRepository;
    readonly exerciseAttempt: PrismaExerciseAttemptRepository;
  };
  readonly ports: {
    readonly readModel: PrismaLaboratoryExerciseReadModelPort;
    readonly unitOfWork: PrismaLaboratoryUnitOfWork;
    readonly clock: LaboratorySystemClock;
    readonly uuidGenerator: LaboratoryCryptoUuidGenerator;
    readonly logger: Logger;
  };
  readonly commandHandlers: {
    readonly createWritingExercise: CreateWritingExerciseHandler;
    readonly startExerciseAttempt: StartExerciseAttemptHandler;
    readonly autosaveExerciseDraft: AutosaveExerciseDraftHandler;
    readonly completeExerciseAttempt: CompleteExerciseAttemptHandler;
    readonly repeatWritingExercise: RepeatWritingExerciseHandler;
  };
  readonly queryHandlers: {
    readonly listWritingExercisesForStudent: ListWritingExercisesForStudentHandler;
    readonly getWritingExerciseDetail: GetWritingExerciseDetailHandler;
    readonly getExerciseAttemptHistory: GetExerciseAttemptHistoryHandler;
    readonly getExerciseAttemptDetail: GetExerciseAttemptDetailHandler;
  };
}

let cachedContainer: LaboratoryContainer | null = null;

export function createLaboratoryContainer(): LaboratoryContainer {
  if (cachedContainer) return cachedContainer;

  const repositories = {
    writingExercise: new PrismaWritingExerciseRepository(),
    exerciseAttempt: new PrismaExerciseAttemptRepository(),
  };

  const ports = {
    readModel: new PrismaLaboratoryExerciseReadModelPort(),
    unitOfWork: new PrismaLaboratoryUnitOfWork(),
    clock: new LaboratorySystemClock(),
    uuidGenerator: new LaboratoryCryptoUuidGenerator(),
    logger: new LaboratoryConsoleLogger(),
  };

  // Factories de dominio — instancias privadas de cableado, no expuestas
  // en la superficie pública del contenedor (no son un "servicio" propio).
  const writingExerciseFactory = new WritingExerciseFactory();
  const exerciseAttemptFactory = new ExerciseAttemptFactory();

  const commandHandlers = {
    createWritingExercise: new CreateWritingExerciseHandler(
      repositories.writingExercise,
      writingExerciseFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      ports.logger,
    ),
    startExerciseAttempt: new StartExerciseAttemptHandler(
      repositories.writingExercise,
      repositories.exerciseAttempt,
      exerciseAttemptFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      ports.logger,
    ),
    autosaveExerciseDraft: new AutosaveExerciseDraftHandler(
      repositories.exerciseAttempt,
      repositories.writingExercise,
      ports.unitOfWork,
      ports.logger,
    ),
    completeExerciseAttempt: new CompleteExerciseAttemptHandler(
      repositories.exerciseAttempt,
      repositories.writingExercise,
      ports.unitOfWork,
      ports.logger,
    ),
    repeatWritingExercise: new RepeatWritingExerciseHandler(
      repositories.writingExercise,
      repositories.exerciseAttempt,
      exerciseAttemptFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      ports.logger,
    ),
  };

  const queryHandlers = {
    listWritingExercisesForStudent: new ListWritingExercisesForStudentHandler(ports.readModel),
    getWritingExerciseDetail: new GetWritingExerciseDetailHandler(ports.readModel),
    getExerciseAttemptHistory: new GetExerciseAttemptHistoryHandler(ports.readModel),
    getExerciseAttemptDetail: new GetExerciseAttemptDetailHandler(ports.readModel),
  };

  cachedContainer = { repositories, ports, commandHandlers, queryHandlers };
  return cachedContainer;
}
