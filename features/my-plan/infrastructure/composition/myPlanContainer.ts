// Composición de dependencias (Dependency Injection) de Mi Plan —
// punto 8 del encargo: "Registrar todas las implementaciones. Preparar
// composición para: NextJS, Server Actions, Route Handlers." Esta
// función NO implementa ninguna Server Action ni Route Handler (fuera
// de alcance de este sprint, igual que en 3.3.3 quedó fuera de alcance
// la API/React) — únicamente construye y devuelve el grafo de objetos
// ya listo para que una Server Action o Route Handler futura lo invoque
// directamente (`const { createLearningPlanHandler } =
// createMyPlanContainer(); await createLearningPlanHandler.handle(...)`).
//
// `createMyPlanContainer()` se puede llamar una vez por proceso (los
// adaptadores no tienen estado por-request, salvo `PrismaUnitOfWork`,
// que abre su propia transacción por cada `execute()`) o una vez por
// solicitud, según decida la capa de composición real de Next.js — esa
// decisión de ciclo de vida es responsabilidad del sprint que integre
// Server Actions/Route Handlers, fuera de alcance aquí.
//
// Resolución 18.24 (Sprint 3.3.4.1): los 5 Handlers de consulta
// (`getActiveLearningPlan`/`getDailyPlan`/`getWeeklyPlan`/
// `getLearningProgress`/`getStudySchedule`) ahora reciben también
// `ports.unitOfWork` — antes ejecutaban su lectura directamente contra
// el Repository/ReadPort, sin pasar por RLS de estudiante; ahora la
// envuelven en `UnitOfWork.execute(..., studentId)` para leer bajo
// `withStudentContext`. Ver 18.24 para la matriz completa de qué
// Handlers pasan `studentId` a `UnitOfWork.execute()` y cuáles no.

import { PrismaLearningPlanRepository } from "../persistence/repositories/PrismaLearningPlanRepository";
import { PrismaLearningGoalRepository } from "../persistence/repositories/PrismaLearningGoalRepository";
import { PrismaLearningObjectiveRepository } from "../persistence/repositories/PrismaLearningObjectiveRepository";
import { PrismaLearningPhaseRepository } from "../persistence/repositories/PrismaLearningPhaseRepository";
import { PrismaLearningTaskRepository } from "../persistence/repositories/PrismaLearningTaskRepository";
import { PrismaStudyScheduleRepository } from "../persistence/repositories/PrismaStudyScheduleRepository";
import { PrismaStudySessionRepository } from "../persistence/repositories/PrismaStudySessionRepository";
import { PrismaUnitOfWork } from "../persistence/unit-of-work/PrismaUnitOfWork";
import { PrismaTransactionManager } from "../persistence/unit-of-work/PrismaTransactionManager";
import { PrismaDailyPlanReadPort } from "../query-services/PrismaDailyPlanReadPort";
import { PrismaWeeklyPlanReadPort } from "../query-services/PrismaWeeklyPlanReadPort";
import { PrismaLearningProgressReadPort } from "../query-services/PrismaLearningProgressReadPort";
import { InProcessEventBus } from "../events/InProcessEventBus";
import { SystemClock } from "../adapters/SystemClock";
import { CryptoUuidGenerator } from "../adapters/CryptoUuidGenerator";
import { ConsoleLogger } from "../adapters/ConsoleLogger";

import { OwnershipVerificationService } from "@/features/my-plan/application/services/OwnershipVerificationService";
import { DomainEventPublisher } from "@/features/my-plan/application/services/DomainEventPublisher";

import { CreateLearningPlanHandler } from "@/features/my-plan/application/handlers/CreateLearningPlanHandler";
import { PauseLearningPlanHandler } from "@/features/my-plan/application/handlers/PauseLearningPlanHandler";
import { ResumeLearningPlanHandler } from "@/features/my-plan/application/handlers/ResumeLearningPlanHandler";
import { CancelLearningPlanHandler } from "@/features/my-plan/application/handlers/CancelLearningPlanHandler";
import { CompleteLearningTaskHandler } from "@/features/my-plan/application/handlers/CompleteLearningTaskHandler";
import { UpdateLearningObjectiveHandler } from "@/features/my-plan/application/handlers/UpdateLearningObjectiveHandler";
import { CreateStudySessionHandler } from "@/features/my-plan/application/handlers/CreateStudySessionHandler";
import { UpdateStudyScheduleHandler } from "@/features/my-plan/application/handlers/UpdateStudyScheduleHandler";
import { RequestPlanReorganizationHandler } from "@/features/my-plan/application/handlers/RequestPlanReorganizationHandler";
import { GetActiveLearningPlanHandler } from "@/features/my-plan/application/handlers/GetActiveLearningPlanHandler";
import { GetDailyPlanHandler } from "@/features/my-plan/application/handlers/GetDailyPlanHandler";
import { GetWeeklyPlanHandler } from "@/features/my-plan/application/handlers/GetWeeklyPlanHandler";
import { GetLearningProgressHandler } from "@/features/my-plan/application/handlers/GetLearningProgressHandler";
import { GetStudyScheduleHandler } from "@/features/my-plan/application/handlers/GetStudyScheduleHandler";

export interface MyPlanContainer {
  readonly repositories: {
    readonly learningPlan: PrismaLearningPlanRepository;
    readonly learningGoal: PrismaLearningGoalRepository;
    readonly learningObjective: PrismaLearningObjectiveRepository;
    readonly learningPhase: PrismaLearningPhaseRepository;
    readonly learningTask: PrismaLearningTaskRepository;
    readonly studySchedule: PrismaStudyScheduleRepository;
    readonly studySession: PrismaStudySessionRepository;
  };
  readonly queryServices: {
    readonly dailyPlan: PrismaDailyPlanReadPort;
    readonly weeklyPlan: PrismaWeeklyPlanReadPort;
    readonly learningProgress: PrismaLearningProgressReadPort;
  };
  readonly ports: {
    readonly unitOfWork: PrismaUnitOfWork;
    readonly transactionManager: PrismaTransactionManager;
    readonly eventBus: InProcessEventBus;
    readonly clock: SystemClock;
    readonly uuidGenerator: CryptoUuidGenerator;
    readonly logger: ConsoleLogger;
  };
  readonly handlers: {
    readonly createLearningPlan: CreateLearningPlanHandler;
    readonly pauseLearningPlan: PauseLearningPlanHandler;
    readonly resumeLearningPlan: ResumeLearningPlanHandler;
    readonly cancelLearningPlan: CancelLearningPlanHandler;
    readonly completeLearningTask: CompleteLearningTaskHandler;
    readonly updateLearningObjective: UpdateLearningObjectiveHandler;
    readonly createStudySession: CreateStudySessionHandler;
    readonly updateStudySchedule: UpdateStudyScheduleHandler;
    readonly requestPlanReorganization: RequestPlanReorganizationHandler;
    readonly getActiveLearningPlan: GetActiveLearningPlanHandler;
    readonly getDailyPlan: GetDailyPlanHandler;
    readonly getWeeklyPlan: GetWeeklyPlanHandler;
    readonly getLearningProgress: GetLearningProgressHandler;
    readonly getStudySchedule: GetStudyScheduleHandler;
  };
}

export function createMyPlanContainer(): MyPlanContainer {
  const repositories = {
    learningPlan: new PrismaLearningPlanRepository(),
    learningGoal: new PrismaLearningGoalRepository(),
    learningObjective: new PrismaLearningObjectiveRepository(),
    learningPhase: new PrismaLearningPhaseRepository(),
    learningTask: new PrismaLearningTaskRepository(),
    studySchedule: new PrismaStudyScheduleRepository(),
    studySession: new PrismaStudySessionRepository(),
  };

  const queryServices = {
    dailyPlan: new PrismaDailyPlanReadPort(),
    weeklyPlan: new PrismaWeeklyPlanReadPort(),
    learningProgress: new PrismaLearningProgressReadPort(),
  };

  const ports = {
    unitOfWork: new PrismaUnitOfWork(),
    transactionManager: new PrismaTransactionManager(),
    eventBus: new InProcessEventBus(),
    clock: new SystemClock(),
    uuidGenerator: new CryptoUuidGenerator(),
    logger: new ConsoleLogger(),
  };

  const ownershipVerificationService = new OwnershipVerificationService(
    repositories.learningPlan,
    repositories.learningPhase,
    repositories.learningGoal,
  );
  const domainEventPublisher = new DomainEventPublisher(ports.eventBus);

  const handlers = {
    createLearningPlan: new CreateLearningPlanHandler(
      repositories.learningPlan,
      repositories.learningGoal,
      repositories.studySchedule,
      ports.unitOfWork,
      ports.uuidGenerator,
      domainEventPublisher,
      ports.logger,
    ),
    pauseLearningPlan: new PauseLearningPlanHandler(repositories.learningPlan, ports.unitOfWork, ports.logger),
    resumeLearningPlan: new ResumeLearningPlanHandler(repositories.learningPlan, ports.unitOfWork, ports.logger),
    cancelLearningPlan: new CancelLearningPlanHandler(
      repositories.learningPlan,
      ports.unitOfWork,
      ports.clock,
      ports.logger,
    ),
    completeLearningTask: new CompleteLearningTaskHandler(
      repositories.learningTask,
      repositories.learningPhase,
      ownershipVerificationService,
      ports.unitOfWork,
      ports.clock,
      domainEventPublisher,
      ports.logger,
    ),
    updateLearningObjective: new UpdateLearningObjectiveHandler(
      repositories.learningObjective,
      repositories.learningGoal,
      ownershipVerificationService,
      ports.unitOfWork,
      ports.clock,
      ports.logger,
    ),
    createStudySession: new CreateStudySessionHandler(
      repositories.studySession,
      repositories.learningTask,
      ownershipVerificationService,
      ports.unitOfWork,
      ports.clock,
      ports.uuidGenerator,
      ports.logger,
    ),
    updateStudySchedule: new UpdateStudyScheduleHandler(
      repositories.studySchedule,
      repositories.learningPlan,
      ports.unitOfWork,
      ports.logger,
    ),
    requestPlanReorganization: new RequestPlanReorganizationHandler(
      repositories.learningPlan,
      ports.eventBus,
      ports.unitOfWork,
      ports.clock,
      ports.logger,
    ),
    getActiveLearningPlan: new GetActiveLearningPlanHandler(
      repositories.learningPlan,
      ports.unitOfWork,
      ports.logger,
    ),
    getDailyPlan: new GetDailyPlanHandler(
      repositories.learningPlan,
      queryServices.dailyPlan,
      ports.unitOfWork,
      ports.logger,
    ),
    getWeeklyPlan: new GetWeeklyPlanHandler(
      repositories.learningPlan,
      queryServices.weeklyPlan,
      ports.unitOfWork,
      ports.logger,
    ),
    getLearningProgress: new GetLearningProgressHandler(
      repositories.learningPlan,
      queryServices.learningProgress,
      ports.unitOfWork,
      ports.logger,
    ),
    getStudySchedule: new GetStudyScheduleHandler(
      repositories.learningPlan,
      repositories.studySchedule,
      ports.unitOfWork,
      ports.logger,
    ),
  };

  return { repositories, queryServices, ports, handlers };
}
