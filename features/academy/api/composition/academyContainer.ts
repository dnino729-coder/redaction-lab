// Composition Root de Academia (Sprint 6.3 — API Layer Implementation).
//
// Único lugar del proyecto donde se conectan las implementaciones
// concretas de Infrastructure/Domain a las abstracciones que Application
// declara — mismo principio (Mark Seemann) ya aplicado por
// `features/my-plan/infrastructure/composition/myPlanContainer.ts`.
// Ningún otro archivo de `features/academy/api/` instancia una
// implementación concreta de un puerto: todos reciben el contenedor ya
// construido.
//
// Nota de reconciliación (no BLOCKER): el "Composition Root, DI & Bootstrap"
// Frozen (Sprint 5.3, `academia-composition-root-bootstrap-v1.0`) está
// escrito enteramente en términos de NestJS (`@Module()`, tokens de DI,
// ciclos de vida Scoped/Singleton del contenedor de Nest) — mismo criterio
// de reinterpretación Next.js ya aplicado en Sprint 6.0/6.2: este archivo
// es el único "Composition Root" real de Academia (no se crea un segundo
// contenedor); las clases, nombres y responsabilidades que ese documento
// exige quedan todas registradas aquí, con inyección manual por
// constructor en vez de un contenedor de Nest.
//
// Nota de hallazgo (no BLOCKER, disclosed en el informe de entrega): tres
// puertos de Domain (`CompetencyEvidencePort`, `AcademyUnitCatalogPort`,
// `MiPlanTaskLookupPort`) y un puerto de Application
// (`TeacherStudentRelationshipPort`) no tenían ninguna implementación real
// al cierre de Sprint 6.2 (Infrastructure Layer) — sin ellos, este
// Composition Root no podría siquiera compilar (son dependencias de
// constructor obligatorias de Handlers/Domain Services ya Frozen). Se
// implementan adaptadores mínimos y honestos en
// `features/academy/api/composition/adapters/` (ver cada archivo para el
// detalle de la resolución) — deliberadamente NO se colocan dentro de
// `features/academy/infrastructure/` para no modificar ese árbol, ya
// cerrado por Sprint 6.2.

import { prisma } from "@/lib/prisma";

// --- Infrastructure — Persistence ---------------------------------------
import { PrismaAcademyUnitRepository } from "@/features/academy/infrastructure/persistence/repositories/PrismaAcademyUnitRepository";
import { PrismaAttemptRepository } from "@/features/academy/infrastructure/persistence/repositories/PrismaAttemptRepository";
import { PrismaModelExampleRepository } from "@/features/academy/infrastructure/persistence/repositories/PrismaModelExampleRepository";
import { PrismaTeacherRecommendationRepository } from "@/features/academy/infrastructure/persistence/repositories/PrismaTeacherRecommendationRepository";
import { PrismaUnitOfWork } from "@/features/academy/infrastructure/persistence/unit-of-work/PrismaUnitOfWork";
import { PrismaAcademyOutboxPort } from "@/features/academy/infrastructure/persistence/outbox/PrismaAcademyOutboxPort";
import { PrismaAcademyReadModelPort } from "@/features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort";

// --- Infrastructure — Adapters / AI / Notifications / Config / Logging --
import { AcademyCryptoUuidGenerator } from "@/features/academy/infrastructure/adapters/AcademyCryptoUuidGenerator";
import { AcademySystemClock } from "@/features/academy/infrastructure/adapters/AcademySystemClock";
import { AcademyConsoleLogger } from "@/features/academy/infrastructure/logging/AcademyConsoleLogger";
import { AcademyNotificationAdapter } from "@/features/academy/infrastructure/notifications/AcademyNotificationAdapter";
import { loadAcademyInfrastructureConfig } from "@/features/academy/infrastructure/config/academyConfig";
import { AIProviderFactory } from "@/features/academy/infrastructure/ai/AIProviderFactory";
import { AcademyFeedbackGateway } from "@/features/academy/infrastructure/ai/AcademyFeedbackGateway";

// --- Domain — Factories / Services ---------------------------------------
import { AcademyUnitFactory } from "@/features/academy/domain/factories/AcademyUnitFactory";
import { AttemptFactory } from "@/features/academy/domain/factories/AttemptFactory";
import { MasteryEvaluationService } from "@/features/academy/domain/services/MasteryEvaluationService";
import { UnitSequenceService } from "@/features/academy/domain/services/UnitSequenceService";

// --- Application — Services -----------------------------------------------
import { AcademyAuthorizationGuard } from "@/features/academy/application/services/AcademyAuthorizationGuard";
import { DomainEventPublisher } from "@/features/academy/application/services/DomainEventPublisher";

// --- Application — Command Handlers ---------------------------------------
import { StartUnitHandler } from "@/features/academy/application/handlers/StartUnitHandler";
import { AutosaveDraftHandler } from "@/features/academy/application/handlers/AutosaveDraftHandler";
import { SubmitProductionHandler } from "@/features/academy/application/handlers/SubmitProductionHandler";
import { RecordFeedbackDeliveredHandler } from "@/features/academy/application/handlers/RecordFeedbackDeliveredHandler";
import { SubmitRevisionHandler } from "@/features/academy/application/handlers/SubmitRevisionHandler";
import { AdvanceToReflectionHandler } from "@/features/academy/application/handlers/AdvanceToReflectionHandler";
import { CompleteReflectionHandler } from "@/features/academy/application/handlers/CompleteReflectionHandler";
import { EvaluateMasteryHandler } from "@/features/academy/application/handlers/EvaluateMasteryHandler";
import { RepeatUnitHandler } from "@/features/academy/application/handlers/RepeatUnitHandler";
import { ApplyTeacherOverrideHandler } from "@/features/academy/application/handlers/ApplyTeacherOverrideHandler";
import { AssignUnitToStudentHandler } from "@/features/academy/application/handlers/AssignUnitToStudentHandler";
import { CreateModelExampleHandler } from "@/features/academy/application/handlers/CreateModelExampleHandler";
import { UpdateModelExampleHandler } from "@/features/academy/application/handlers/UpdateModelExampleHandler";
import { RetireModelExampleHandler } from "@/features/academy/application/handlers/RetireModelExampleHandler";
import { ProvisionAcademyUnitsForStudentHandler } from "@/features/academy/application/handlers/ProvisionAcademyUnitsForStudentHandler";
import { AdvanceStepHandler } from "@/features/academy/application/handlers/AdvanceStepHandler";
import { VerifyComprehensionHandler } from "@/features/academy/application/handlers/VerifyComprehensionHandler";
import { CompleteUnitOnReflectionCompletedHandler } from "@/features/academy/application/handlers/CompleteUnitOnReflectionCompletedHandler";
import { SyncUnitStartedHandler } from "@/features/academy/application/handlers/SyncUnitStartedHandler";
import { SyncUnitStateOnFeedbackDeliveredHandler } from "@/features/academy/application/handlers/SyncUnitStateOnFeedbackDeliveredHandler";
import { SyncUnitStateOnProductionSubmittedHandler } from "@/features/academy/application/handlers/SyncUnitStateOnProductionSubmittedHandler";
import { SyncUnitStateOnReflectionStartedHandler } from "@/features/academy/application/handlers/SyncUnitStateOnReflectionStartedHandler";

// --- Application — Query Handlers ------------------------------------------
import { ListAcademyUnitsForStudentHandler } from "@/features/academy/application/handlers/ListAcademyUnitsForStudentHandler";
import { GetAcademyUnitDetailHandler } from "@/features/academy/application/handlers/GetAcademyUnitDetailHandler";
import { GetContinuationStateHandler } from "@/features/academy/application/handlers/GetContinuationStateHandler";
import { GetAttemptHistoryHandler } from "@/features/academy/application/handlers/GetAttemptHistoryHandler";
import { GetVersionFeedbackHandler } from "@/features/academy/application/handlers/GetVersionFeedbackHandler";
import { ListModelExamplesByTextTypeHandler } from "@/features/academy/application/handlers/ListModelExamplesByTextTypeHandler";
import { GetStudentProgressSummaryHandler } from "@/features/academy/application/handlers/GetStudentProgressSummaryHandler";
import { GetTeacherOverrideHistoryHandler } from "@/features/academy/application/handlers/GetTeacherOverrideHistoryHandler";
import { GetStudentUnitHistoryHandler } from "@/features/academy/application/handlers/GetStudentUnitHistoryHandler";

// --- Gap-fill adapters (ver nota de hallazgo arriba) -----------------------
import {
  TeacherStudentRelationshipAdapter,
  AcademyUnitCatalogAdapter,
  CompetencyEvidenceAdapter,
  MiPlanTaskLookupAdapter,
} from "./adapters";

// Re-exportado (no solo importado) porque este es el único punto bajo
// features/academy/api/ — la fachada que app/api/ tiene permitido importar
// (import/no-restricted-paths) — desde el que el webhook de Clerk puede
// construir el comando CMD-15 sin alcanzar application/commands
// directamente.
export { ProvisionAcademyUnitsForStudentCommand } from "@/features/academy/application/commands/ProvisionAcademyUnitsForStudentCommand";

export interface AcademyContainer {
  readonly repositories: {
    readonly academyUnit: PrismaAcademyUnitRepository;
    readonly attempt: PrismaAttemptRepository;
    readonly modelExample: PrismaModelExampleRepository;
    readonly teacherRecommendation: PrismaTeacherRecommendationRepository;
  };
  readonly ports: {
    readonly unitOfWork: PrismaUnitOfWork;
    readonly outbox: PrismaAcademyOutboxPort;
    readonly readModel: PrismaAcademyReadModelPort;
    readonly uuidGenerator: AcademyCryptoUuidGenerator;
    readonly clock: AcademySystemClock;
    readonly logger: AcademyConsoleLogger;
  };
  readonly domain: {
    readonly academyUnitFactory: AcademyUnitFactory;
    readonly attemptFactory: AttemptFactory;
    readonly masteryEvaluationService: MasteryEvaluationService;
    readonly unitSequenceService: UnitSequenceService;
  };
  readonly services: {
    readonly authorizationGuard: AcademyAuthorizationGuard;
    readonly domainEventPublisher: DomainEventPublisher;
    readonly notificationAdapter: AcademyNotificationAdapter;
  };
  readonly ai: {
    readonly providerFactory: AIProviderFactory;
    readonly feedbackGateway: AcademyFeedbackGateway;
  };
  readonly commandHandlers: {
    readonly startUnit: StartUnitHandler;
    readonly autosaveDraft: AutosaveDraftHandler;
    readonly submitProduction: SubmitProductionHandler;
    readonly recordFeedbackDelivered: RecordFeedbackDeliveredHandler;
    readonly submitRevision: SubmitRevisionHandler;
    readonly advanceToReflection: AdvanceToReflectionHandler;
    readonly completeReflection: CompleteReflectionHandler;
    readonly evaluateMastery: EvaluateMasteryHandler;
    readonly repeatUnit: RepeatUnitHandler;
    readonly applyTeacherOverride: ApplyTeacherOverrideHandler;
    readonly assignUnitToStudent: AssignUnitToStudentHandler;
    readonly createModelExample: CreateModelExampleHandler;
    readonly updateModelExample: UpdateModelExampleHandler;
    readonly retireModelExample: RetireModelExampleHandler;
    readonly provisionAcademyUnitsForStudent: ProvisionAcademyUnitsForStudentHandler;
    readonly advanceStep: AdvanceStepHandler;
    readonly verifyComprehension: VerifyComprehensionHandler;
    readonly completeUnitOnReflectionCompleted: CompleteUnitOnReflectionCompletedHandler;
    readonly syncUnitStarted: SyncUnitStartedHandler;
    readonly syncUnitStateOnFeedbackDelivered: SyncUnitStateOnFeedbackDeliveredHandler;
    readonly syncUnitStateOnProductionSubmitted: SyncUnitStateOnProductionSubmittedHandler;
    readonly syncUnitStateOnReflectionStarted: SyncUnitStateOnReflectionStartedHandler;
  };
  readonly queryHandlers: {
    readonly listAcademyUnitsForStudent: ListAcademyUnitsForStudentHandler;
    readonly getAcademyUnitDetail: GetAcademyUnitDetailHandler;
    readonly getContinuationState: GetContinuationStateHandler;
    readonly getAttemptHistory: GetAttemptHistoryHandler;
    readonly getVersionFeedback: GetVersionFeedbackHandler;
    readonly listModelExamplesByTextType: ListModelExamplesByTextTypeHandler;
    readonly getStudentProgressSummary: GetStudentProgressSummaryHandler;
    readonly getTeacherOverrideHistory: GetTeacherOverrideHistoryHandler;
    readonly getStudentUnitHistory: GetStudentUnitHistoryHandler;
  };
}

let cachedContainer: AcademyContainer | null = null;

/**
 * Construye (o reutiliza, ver nota de ciclo de vida abajo) el grafo de
 * dependencias completo de Academia. Mismo criterio de ciclo de vida que
 * `createMyPlanContainer()`: los adaptadores no tienen estado mutable
 * por-request (el aislamiento de transacción real ocurre dentro de
 * `PrismaUnitOfWork.execute()`, vía `AsyncLocalStorage` — Sprint 6.2), por
 * lo que un único contenedor por proceso (`globalThis`-cacheado, patrón ya
 * usado por `lib/prisma.ts` para el propio `PrismaClient` en desarrollo con
 * hot-reload) es seguro y evita reconstruir 40+ instancias en cada request.
 */
export function createAcademyContainer(): AcademyContainer {
  if (cachedContainer) return cachedContainer;

  const repositories = {
    academyUnit: new PrismaAcademyUnitRepository(),
    attempt: new PrismaAttemptRepository(),
    modelExample: new PrismaModelExampleRepository(),
    teacherRecommendation: new PrismaTeacherRecommendationRepository(),
  };

  const uuidGenerator = new AcademyCryptoUuidGenerator();
  const clock = new AcademySystemClock();
  const logger = new AcademyConsoleLogger();

  const ports = {
    unitOfWork: new PrismaUnitOfWork(),
    outbox: new PrismaAcademyOutboxPort(uuidGenerator),
    readModel: new PrismaAcademyReadModelPort(),
    uuidGenerator,
    clock,
    logger,
  };

  const teacherStudentRelationshipPort = new TeacherStudentRelationshipAdapter();
  const academyUnitCatalogPort = new AcademyUnitCatalogAdapter();
  const competencyEvidencePort = new CompetencyEvidenceAdapter();
  const miPlanTaskLookupPort = new MiPlanTaskLookupAdapter();

  const domain = {
    academyUnitFactory: new AcademyUnitFactory(),
    attemptFactory: new AttemptFactory(),
    masteryEvaluationService: new MasteryEvaluationService(competencyEvidencePort),
    unitSequenceService: new UnitSequenceService(academyUnitCatalogPort),
  };

  const services = {
    authorizationGuard: new AcademyAuthorizationGuard(
      repositories.academyUnit,
      repositories.attempt,
      teacherStudentRelationshipPort,
    ),
    domainEventPublisher: new DomainEventPublisher(ports.outbox),
    notificationAdapter: new AcademyNotificationAdapter(logger),
  };

  const infrastructureConfig = loadAcademyInfrastructureConfig();
  const aiConfig = infrastructureConfig.ai;
  const providerFactory = new AIProviderFactory(aiConfig);

  // `RecordFeedbackDeliveredHandler` (CMD-04) se construye antes que el
  // Gateway porque el propio Gateway lo invoca internamente tras una
  // respuesta síncrona de IA (Infrastructure Model v1.1 §6) — nunca al
  // revés, ningún Handler de Command depende del Gateway salvo
  // Submit(Production|Revision).
  const recordFeedbackDelivered = new RecordFeedbackDeliveredHandler(
    repositories.attempt,
    ports.unitOfWork,
    ports.uuidGenerator,
    services.domainEventPublisher,
    ports.logger,
  );

  const feedbackGateway = new AcademyFeedbackGateway(
    providerFactory,
    repositories.attempt,
    repositories.academyUnit,
    recordFeedbackDelivered,
    aiConfig,
    ports.logger,
  );

  const ai = { providerFactory, feedbackGateway };

  const commandHandlers = {
    startUnit: new StartUnitHandler(
      repositories.academyUnit,
      repositories.attempt,
      domain.attemptFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    autosaveDraft: new AutosaveDraftHandler(
      repositories.attempt,
      ports.unitOfWork,
      ports.uuidGenerator,
      services.authorizationGuard,
    ),
    submitProduction: new SubmitProductionHandler(
      repositories.attempt,
      ports.unitOfWork,
      ports.uuidGenerator,
      ai.feedbackGateway,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    recordFeedbackDelivered,
    submitRevision: new SubmitRevisionHandler(
      repositories.attempt,
      ports.unitOfWork,
      ports.uuidGenerator,
      ai.feedbackGateway,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    advanceToReflection: new AdvanceToReflectionHandler(
      repositories.attempt,
      ports.unitOfWork,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    completeReflection: new CompleteReflectionHandler(
      repositories.attempt,
      ports.unitOfWork,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    evaluateMastery: new EvaluateMasteryHandler(
      repositories.academyUnit,
      domain.masteryEvaluationService,
      ports.unitOfWork,
      services.domainEventPublisher,
      ports.logger,
    ),
    repeatUnit: new RepeatUnitHandler(
      repositories.academyUnit,
      repositories.attempt,
      domain.attemptFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    applyTeacherOverride: new ApplyTeacherOverrideHandler(
      repositories.academyUnit,
      repositories.attempt,
      domain.attemptFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      services.domainEventPublisher,
      services.authorizationGuard,
      ports.logger,
    ),
    assignUnitToStudent: new AssignUnitToStudentHandler(
      repositories.academyUnit,
      repositories.teacherRecommendation,
      ports.uuidGenerator,
      services.authorizationGuard,
    ),
    createModelExample: new CreateModelExampleHandler(
      repositories.modelExample,
      ports.unitOfWork,
      ports.uuidGenerator,
    ),
    updateModelExample: new UpdateModelExampleHandler(repositories.modelExample, ports.unitOfWork),
    retireModelExample: new RetireModelExampleHandler(repositories.modelExample, ports.unitOfWork),
    provisionAcademyUnitsForStudent: new ProvisionAcademyUnitsForStudentHandler(
      repositories.academyUnit,
      domain.unitSequenceService,
      domain.academyUnitFactory,
      ports.unitOfWork,
      ports.uuidGenerator,
      ports.logger,
    ),
    advanceStep: new AdvanceStepHandler(repositories.attempt, ports.unitOfWork, services.authorizationGuard),
    verifyComprehension: new VerifyComprehensionHandler(
      repositories.attempt,
      ports.unitOfWork,
      services.authorizationGuard,
    ),
    // Handlers de sincronización por evento (Sprint 6.1.2, Application
    // Layer) — registrados aquí para completar el grafo de DI, listos para
    // ser invocados por un futuro suscriptor de Outbox (el poller/publisher
    // de eventos queda explícitamente fuera de alcance desde Sprint 6.2;
    // ningún endpoint de los 23 del API Contract los invoca directamente).
    completeUnitOnReflectionCompleted: new CompleteUnitOnReflectionCompletedHandler(
      repositories.academyUnit,
      miPlanTaskLookupPort,
      ports.unitOfWork,
      services.domainEventPublisher,
      ports.logger,
    ),
    syncUnitStarted: new SyncUnitStartedHandler(
      repositories.academyUnit,
      ports.unitOfWork,
      services.domainEventPublisher,
    ),
    syncUnitStateOnFeedbackDelivered: new SyncUnitStateOnFeedbackDeliveredHandler(
      repositories.academyUnit,
      repositories.attempt,
      ports.unitOfWork,
    ),
    syncUnitStateOnProductionSubmitted: new SyncUnitStateOnProductionSubmittedHandler(
      repositories.academyUnit,
      ports.unitOfWork,
    ),
    syncUnitStateOnReflectionStarted: new SyncUnitStateOnReflectionStartedHandler(
      repositories.academyUnit,
      repositories.attempt,
      ports.unitOfWork,
    ),
  };

  const queryHandlers = {
    listAcademyUnitsForStudent: new ListAcademyUnitsForStudentHandler(ports.readModel),
    getAcademyUnitDetail: new GetAcademyUnitDetailHandler(ports.readModel),
    getContinuationState: new GetContinuationStateHandler(ports.readModel),
    getAttemptHistory: new GetAttemptHistoryHandler(ports.readModel),
    getVersionFeedback: new GetVersionFeedbackHandler(ports.readModel),
    listModelExamplesByTextType: new ListModelExamplesByTextTypeHandler(ports.readModel),
    getStudentProgressSummary: new GetStudentProgressSummaryHandler(ports.readModel, services.authorizationGuard),
    getTeacherOverrideHistory: new GetTeacherOverrideHistoryHandler(ports.readModel, services.authorizationGuard),
    getStudentUnitHistory: new GetStudentUnitHistoryHandler(ports.readModel, services.authorizationGuard),
  };

  cachedContainer = {
    repositories,
    ports,
    domain,
    services,
    ai,
    commandHandlers,
    queryHandlers,
  };
  return cachedContainer;
}

/** Verificación temprana de conectividad (fail-fast), mismo criterio que
 * `main.ts` en la especificación Frozen de Sprint 5.3 — sin `NestFactory`,
 * invocado desde el primer Route Handler que arranca en un proceso dado
 * (`lib/prisma.ts` ya gestiona el singleton real de `PrismaClient`, este
 * Composition Root no abre una segunda conexión). */
export async function ensureAcademyDatabaseConnection(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
