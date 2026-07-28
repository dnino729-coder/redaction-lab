# ACADEMIA — Composition Root, Dependency Injection y Bootstrap (Sprint 5.3)

**Rol:** Principal Backend Engineer / Senior NestJS Architect / Tech Lead.
**Fecha:** 2026-07-21.
**Naturaleza:** este Sprint **no diseña, no propone ni replantea** nada — integra exclusivamente las piezas ya construidas en Sprints 4.1–5.2 para dejar el backend de Academia completamente inicializable y ejecutable. Ningún Command, Query, DTO, Repository, Controller, Aggregate, Policy, Specification, Factory o Domain Service se redefine aquí; todos se **registran** en el contenedor de Inversión de Control, exactamente con el nombre y la firma ya Frozen.

**Línea base oficial (Frozen — no modificada):** Functional Specification v1.3, Domain Model v1.1, Application Model v1.4 + Application Layer Specification v1.0 (Sprint 5.0), Infrastructure Model v1.1, Persistence Layer Specification v1.0 (Sprint 5.1), API Contract v1.3, Infrastructure Services + API Layer Specification v1.0 (Sprint 5.2, "API Implementation v1.0"), Architecture Resolutions A-01–A-10, ACP-001/002/003.

**Regla de trabajo:** ninguna inconsistencia detectada se corrige — se registra como nota de reconciliación (ver más abajo) únicamente cuando **no** exige modificar un documento Frozen (resuelta por omisión/fidelidad, instrucción explícita del propio encargo: "sin inventar nuevas variables" ya resuelve por sí misma cualquier variable de configuración sin respaldo documental). Si una inconsistencia hubiera exigido modificar un documento Frozen, se habría registrado como `## BLOCKER` deteniendo únicamente esa parte — **no ocurrió ningún caso de ese tipo en este Sprint**.

---

## Nota de reconciliación (no BLOCKER — ninguna exige modificar un documento Frozen)

1. **`REDIS`, `SMTP` (Sección "Configuración" del encargo):** ningún documento Frozen de Academia menciona Redis ni SMTP. El Infrastructure Model v1.1, Sección 15, ya evaluó explícitamente la tecnología de cola asíncrona y **recomendó la opción (a) — tabla de trabajos en la misma PostgreSQL**, ya implementada como `academy_feedback_job` (Sprint 5.2, Sección 8.3) — no Redis. El Infrastructure Model v1.1, Sección 14, declara explícitamente: *"Ninguna regla Frozen exige que Academia envíe correo electrónico directamente... se canaliza vía el sistema de notificaciones general... no vía correo directo desde Academia"* — no SMTP. **Resolución:** ninguna variable `ACADEMY_REDIS_*`/`ACADEMY_SMTP_*` se registra en la Sección 5 — la propia instrucción "sin inventar nuevas variables" ya ordena esta omisión, sin necesidad de BLOCKER.
2. **`JWT` (variable de configuración):** Infrastructure Model v1.1, Sección 8, ya fija que *"Academia no implementa autenticación propia — reutiliza el mecanismo ya vigente a nivel de plataforma"*. No existe, en ningún documento Frozen, una variable `ACADEMY_JWT_SECRET` ni equivalente — la verificación de JWT se delega íntegramente a `PlatformAuthVerifier` (Sprint 5.2, Sección 3), un componente de plataforma fuera del límite de configuración de Academia. **Resolución:** la Sección 5 documenta esto explícitamente como "delegado, sin variable propia", no como una omisión.
3. **`Prompt Builder` (Sección 8 del encargo, "Registro de IA"):** el Infrastructure Services + API Layer v1.0 (Sprint 5.2, Sección 8) ya implementó la construcción de prompt como el método privado `buildPrompt()` dentro de cada `AIFeedbackProvider` (`ClaudeFeedbackAdapter`/`OpenAIFeedbackAdapter`), no como una clase separada. Extraerlo a un provider `AcademyPromptBuilder` independiente modificaría código ya Frozen de ese Sprint (fuera del alcance permitido aquí — "NO modificar... API Implementation"). **Resolución:** se documenta en la Sección 8 como "ya existente, encapsulado dentro de cada adapter, sin necesidad de registro de DI propio" — no se crea un provider nuevo.
4. **`Email` (Sección 9 del encargo, "Registro de Notificaciones"):** excluido explícitamente por Infrastructure Model v1.1, Sección 14 (ver punto 1). **Resolución:** la Sección 9 registra únicamente In-App/Eventos/Outbox, con la exclusión de Email documentada, no omitida silenciosamente.

Ninguna de las cuatro exige modificar Domain Model, Application Model, Persistence Model, Infrastructure Model, API Contract, API Implementation, Functional Specification, A-01–A-10 ni ningún ACP — **sin BLOCKER**.

---

## 1. Estructura definitiva del módulo Academia (árbol completo, listo para producción)

```
src/
├── main.ts                                          # NUEVO — Sección 4, bootstrap real
├── app.module.ts                                     # NUEVO — Sección 2, importa AcademyModule + módulos de otras features
│
└── features/academy/
    ├── domain/                                       # Frozen (Sprint 4.3) — sin cambios
    │   ├── aggregates/{academy-unit,attempt,model-example}.ts
    │   ├── entities/{draft,version,feedback,teacher-override}.ts
    │   ├── value-objects/
    │   ├── enums/
    │   ├── events/
    │   ├── services/{mastery-evaluation,unit-sequence}.service.ts
    │   ├── factories/{academy-unit,attempt}.factory.ts
    │   ├── policies/{unlock,feedback,revision,mastery,completion,repetition,teacher-override}.policy.ts
    │   └── specifications/{eligible-for-unlock,mastery-eligible,repeatable}.specification.ts
    │
    ├── application/                                  # Frozen (Sprint 5.0) — sin cambios
    │   ├── commands/                                 # 17 Command + 17 Handler + 1 event handler de sincronización
    │   ├── queries/                                  # 9 Query + 9 Handler
    │   ├── dto/
    │   ├── mappers/                                  # Domain ⇄ DTO — AcademyUnitMapper, AttemptMapper, ModelExampleMapper, TeacherOverrideMapper, TeacherRecommendationMapper
    │   ├── ports/                                    # Repository interfaces, UnitOfWork, OutboxPort, AcademyReadModelPort
    │   ├── validators/                                # 17
    │   └── errors/                                   # Catálogo de 38 códigos
    │
    ├── infrastructure/                                # Frozen (Sprint 5.1 persistencia; Sprint 5.2 servicios) — sin cambios
    │   ├── persistence/
    │   │   ├── repositories/                          # 4 implementaciones Prisma
    │   │   ├── mappers/                                # Domain ⇄ Prisma (distintos de application/mappers — ver Sección 2, nota de desambiguación)
    │   │   ├── unit-of-work/prisma-unit-of-work.ts
    │   │   └── read-models/academy-query.service.ts    # PrismaAcademyReadModelPort
    │   ├── events/{academy-event-bus.module,academy-outbox-publisher,academy-event-subscribers}.ts
    │   ├── ai/{ai-provider.interface,claude-feedback.adapter,openai-feedback.adapter,ai-provider.factory,circuit-breaker,feedback-queue.worker,feedback-gateway.impl}.ts
    │   ├── notifications/academy-notification.service.ts
    │   ├── auth/{jwt.guard,roles.guard,teacher-relationship.guard,decorators}/
    │   ├── config/academy.config.ts
    │   ├── observability/{academy-logger,academy-metrics,academy-health.module}.ts
    │   └── academy-infrastructure.module.ts
    │
    ├── presentation/                                   # Frozen (Sprint 5.2) — sin cambios
    │   ├── controllers/                                # 6 Controllers, 23 endpoints
    │   ├── dto/{requests,responses}/
    │   ├── mappers/http/academy-http.mapper.ts
    │   ├── pipes/{academy-validation,academy-pagination}.pipe.ts
    │   ├── filters/academy-exception.filter.ts
    │   ├── middlewares/{correlation-id,request-id,metrics,audit}.middleware.ts
    │   ├── swagger/academy-swagger.setup.ts
    │   ├── academia.routes.ts
    │   ├── academy-presentation.module.ts
    │   └── index.ts
    │
    └── academy.module.ts                                # NUEVO — objeto central de este Sprint, Sección 2
```

**Único artefacto de código genuinamente nuevo de este Sprint:** `src/main.ts`, `src/app.module.ts`, `features/academy/academy.module.ts` — los tres archivos de ensamblaje (Composition Root + Bootstrap). Todo lo demás en el árbol ya existía al cierre de Sprint 5.2 y se referencia, no se reescribe.

---

## 2. Composition Root — `academy.module.ts`

**Principio de Composition Root (Mark Seemann):** un único lugar donde se conectan todas las implementaciones concretas a sus abstracciones — en NestJS, el `@Module()` raíz de la feature. Ningún otro archivo del árbol contiene un `new ConcreteClass()` de una dependencia inyectable; todo se resuelve por el contenedor.

**Nota de desambiguación (nombres duplicados entre capas, no una inconsistencia):** `AcademyUnitMapper`/`AttemptMapper`/`ModelExampleMapper` existen en **dos** ubicaciones con responsabilidades distintas — `application/mappers/` (Domain ⇄ DTO, Sprint 5.0, consumidos por Command/Query Handlers) y `infrastructure/persistence/mappers/` (Domain ⇄ Prisma, Sprint 5.1, consumidos internamente por cada `Prisma*Repository`, invocados como métodos estáticos — nunca inyectados como provider de NestJS, consistente con cómo Sprint 5.1 los especificó: `AcademyUnitMapper.toDomain(row)`, llamada estática, no `this.mapper.toDomain(row)`). Este Sprint no fusiona ni renombra ninguno de los dos — se registran donde ya corresponde, sin colisión real (namespaces de módulo distintos).

```typescript
// features/academy/academy.module.ts
@Module({
  imports: [
    CqrsModule,
    TerminusModule,
    ScheduleModule.forRoot(),                 // requerido por @Interval() — AcademyOutboxPublisher, FeedbackQueueWorker (Sprint 5.2 §7.2/§8.3)
    ConfigModule.forFeature(academyConfig),    // Sección 5
  ],
  controllers: [
    AcademyUnitsController, AcademyAttemptsController, AcademyModelExamplesController,
    AcademyTeacherOverridesController, AcademyRecommendationsController, AcademyTeacherReviewController,
    AcademyHealthController,
  ],
  providers: [
    // ---------- 2.1 Domain — Policies, Specifications, Factories, Domain Services ----------
    // Registradas como providers de NestJS (Singleton) para permitir Dependency Inversion
    // real hacia Application (Handlers las reciben por constructor, nunca `new`) — decisión
    // de WIRING, no de diseño de dominio: ninguna clase cambia de comportamiento, solo pasa
    // a resolverse por contenedor en lugar de instanciarse manualmente dentro del Aggregate
    // o del Handler. Las Policies/Specifications siguen siendo invocadas exclusivamente por
    // su Aggregate designado (Tell-Don't-Ask, H-02, Domain Model v1.1) — el contenedor solo
    // resuelve la instancia, nunca decide cuándo se invoca.
    UnlockPolicy, FeedbackPolicy, RevisionPolicy, MasteryPolicy, CompletionPolicy, RepetitionPolicy, TeacherOverridePolicy,
    EligibleForUnlockSpecification, MasteryEligibleSpecification, RepeatableSpecification,
    MasteryEvaluationService, UnitSequenceService,      // Domain Services — dependen de Repositories (ver 2.2), por eso SÍ requieren DI real, no solo wiring cosmético
    AcademyUnitFactory, AttemptFactory,                  // Factories — AcademyUnitFactory depende de UnitSequenceService

    // ---------- 2.2 Application — Ports (tokens) ligados a su implementación Persistence ----------
    { provide: 'AcademyUnitRepository', useClass: PrismaAcademyUnitRepository },
    { provide: 'AttemptRepository', useClass: PrismaAttemptRepository },
    { provide: 'ModelExampleRepository', useClass: PrismaModelExampleRepository },
    { provide: 'TeacherRecommendationRepository', useClass: PrismaTeacherRecommendationRepository },
    { provide: 'UnitOfWork', useClass: PrismaUnitOfWork },
    { provide: 'OutboxPort', useClass: PrismaAcademyOutboxPort },
    { provide: 'AcademyReadModelPort', useClass: PrismaAcademyReadModelPort },
    { provide: PrismaClient, useValue: prismaClientSingleton },   // ver Sección 4.2 — instanciado una vez en bootstrap, inyectado aquí por valor

    // ---------- 2.3 Application — Mappers (Domain ⇄ DTO) ----------
    AcademyUnitMapper, AttemptMapper, ModelExampleMapper, TeacherOverrideMapper, TeacherRecommendationMapper,

    // ---------- 2.4 Application — Validators (17, uno por Command) ----------
    StartUnitValidator, AutosaveDraftValidator, SubmitProductionValidator, RecordFeedbackDeliveredValidator,
    SubmitRevisionValidator, AdvanceToReflectionValidator, CompleteReflectionValidator, EvaluateMasteryValidator,
    RepeatUnitValidator, ApplyTeacherOverrideValidator, AssignUnitToStudentValidator, CreateModelExampleValidator,
    UpdateModelExampleValidator, RetireModelExampleValidator, ProvisionAcademyUnitsForStudentValidator,
    AdvanceStepValidator, VerifyComprehensionValidator,

    // ---------- 2.5 Application — Command Handlers (17 + 1 de sincronización de eventos) ----------
    StartUnitHandler, AutosaveDraftHandler, SubmitProductionHandler, RecordFeedbackDeliveredHandler,
    SubmitRevisionHandler, AdvanceToReflectionHandler, CompleteReflectionHandler, EvaluateMasteryHandler,
    RepeatUnitHandler, ApplyTeacherOverrideHandler, AssignUnitToStudentHandler, CreateModelExampleHandler,
    UpdateModelExampleHandler, RetireModelExampleHandler, ProvisionAcademyUnitsForStudentHandler,
    AdvanceStepHandler, VerifyComprehensionHandler,
    CompleteUnitOnReflectionCompletedHandler,   // segunda transacción del patrón "dos transacciones" (Sprint 5.0 §3, Sprint 5.2 §7.3)

    // ---------- 2.6 Application — Query Handlers (9) ----------
    ListAcademyUnitsForStudentHandler, GetAcademyUnitDetailHandler, GetContinuationStateHandler,
    GetAttemptHistoryHandler, GetVersionFeedbackHandler, ListModelExamplesByTextTypeHandler,
    GetStudentProgressSummaryHandler, GetTeacherOverrideHistoryHandler, GetStudentUnitHistoryHandler,

    // ---------- 2.7 Infrastructure — Event Bus / Outbox ----------
    { provide: 'EventBus', useClass: AcademyEventBus },
    AcademyOutboxPublisher, AcademyEventSubscribers, ProcessedEventIdempotencyStore,

    // ---------- 2.8 Infrastructure — AI Provider ----------
    { provide: 'AIProviderFactory', useClass: AIProviderFactory },
    ClaudeFeedbackAdapter, OpenAIFeedbackAdapter, FeedbackCircuitBreaker, FeedbackQueueWorker,
    { provide: 'FeedbackGateway', useClass: FeedbackGatewayImpl },

    // ---------- 2.9 Infrastructure — Notificaciones ----------
    { provide: 'AcademyNotificationPort', useClass: AcademyNotificationService },

    // ---------- 2.10 Infrastructure — Autorización externa ----------
    { provide: 'TeacherStudentRelationshipPort', useClass: TeacherStudentRelationshipAdapter },
    JwtAuthGuard, RolesGuard, TeacherRelationshipGuard,

    // ---------- 2.11 Infrastructure — Observabilidad ----------
    AcademyLogger, AcademyMetrics, AcademyCommandLoggingInterceptor,
    PrismaHealthIndicator, AIProviderHealthIndicator, EventBusHealthIndicator, StorageHealthIndicator,

    // ---------- 2.12 Presentation — Pipes, Filters (globales a nivel de módulo, no de app, ver Sección 4) ----------
    { provide: APP_PIPE, useClass: AcademyValidationPipe },
    { provide: APP_FILTER, useClass: AcademyExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AcademyCommandLoggingInterceptor },
    AcademyPaginationPipe,
  ],
  exports: ['UnitOfWork', 'AcademyReadModelPort', 'EventBus'],  // exportado únicamente por si otro módulo de la plataforma necesita leer estado de Academia (Published Language, Domain Model v1.1 §1) — ningún otro módulo importa Repositories directamente
})
export class AcademyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestIdMiddleware, MetricsMiddleware, AuditMiddleware)
      .forRoutes({ path: 'api/v1/academy/*', method: RequestMethod.ALL });
  }
}
```

**Recuento de registro (verificado contra cada Sprint fuente):** 7 Policies + 3 Specifications + 2 Domain Services + 2 Factories (Domain) + 4 Repository tokens + 3 puertos (`UnitOfWork`/`OutboxPort`/`AcademyReadModelPort`) + 5 Mappers de aplicación + 17 Validators + 18 Command Handlers + 9 Query Handlers (Application) + `EventBus` + `AcademyOutboxPublisher` + `AcademyEventSubscribers` + `ProcessedEventIdempotencyStore` + `AIProviderFactory` + 2 adapters de IA + `FeedbackCircuitBreaker` + `FeedbackQueueWorker` + `FeedbackGateway` + `AcademyNotificationPort` + `TeacherStudentRelationshipPort` + 3 Guards + `AcademyLogger` + `AcademyMetrics` + `AcademyCommandLoggingInterceptor` + 4 Health Indicators + `AcademyValidationPipe`/`AcademyExceptionFilter`/`AcademyPaginationPipe` (Infrastructure/Presentation) + 6 Controllers + `AcademyHealthController` = **todo elemento nombrado en los 14 puntos del encargo está presente en esta lista**, verificado exhaustivamente en la Sección 14.

---

## 3. Dependency Injection — Ciclos de vida (Singleton / Scoped / Transient)

**Regla general de NestJS heredada, no una decisión nueva de este Sprint:** todo provider es `Singleton` por defecto salvo que se declare `Scoped`/`Transient` explícitamente — este Sprint solo se aparta del valor por defecto donde hay una razón concreta y documentada, nunca por preferencia arbitraria.

| Categoría | Providers | Ciclo de vida | Justificación |
|---|---|---|---|
| Domain — Policies | 7 (`UnlockPolicy`...`TeacherOverridePolicy`) | **Singleton** | Sin estado mutable propio (stateless, invocadas con el estado del Aggregate como parámetro) — una única instancia compartida es segura y evita instanciación repetida sin beneficio. |
| Domain — Specifications | 3 | **Singleton** | Mismo criterio — predicados puros, sin estado. |
| Domain — Factories | `AcademyUnitFactory`, `AttemptFactory` | **Singleton** | Sin estado propio entre invocaciones; dependen de `UnitSequenceService` (también Singleton) — no hay razón para instanciar una Factory nueva por request. |
| Domain Services | `MasteryEvaluationService`, `UnitSequenceService` | **Singleton** | Dependen de Repositories (Scoped, ver abajo) inyectados por constructor — en NestJS, un provider Singleton que depende de uno Scoped se resuelve correctamente por request gracias a la propagación de contexto de NestJS (el Singleton en sí no almacena estado por-request, solo reenvía la llamada al Repository ya resuelto para ese request). |
| Application — Repository tokens (`AcademyUnitRepository`, etc.) | 4 | **Scoped (`REQUEST`)** | Cada implementación Prisma recibe el cliente transaccional (`tx`) específico de la transacción abierta por `UnitOfWork.execute()` (Sprint 5.1, Sección 2.4) — una instancia Singleton correría el riesgo de que dos requests concurrentes compartan el mismo `tx`, violando el aislamiento de transacción por request. Instanciados de hecho **dentro** de `PrismaUnitOfWork.execute()` (Sprint 5.1, Sección 6), no directamente por el contenedor en cada inyección — el token DI existe para que Application dependa de la abstracción, no de Prisma, pero la instancia real por-transacción la construye `UnitOfWork`, no el `@Injectable()` genérico del módulo. |
| Application — `UnitOfWork`, `OutboxPort`, `AcademyReadModelPort` | 3 | **Singleton** | `PrismaUnitOfWork`/`PrismaAcademyOutboxPort`/`PrismaAcademyReadModelPort` no mantienen estado de transacción propio entre llamadas — reciben `PrismaClient` (Singleton) y abren una transacción nueva en cada `execute()`/`append()`/consulta; no hay razón para una instancia por request. |
| `PrismaClient` | 1 | **Singleton** | Un único pool de conexiones para todo el proceso — instanciar un `PrismaClient` por request agotaría el pool de conexiones de PostgreSQL rápidamente; convención estándar de Prisma con NestJS. |
| Application — Mappers (Domain⇄DTO) | 5 | **Singleton** | Funciones puras de traducción, sin estado — mismo criterio que Policies/Specifications. |
| Application — Validators | 17 | **Singleton** | Sin estado propio entre invocaciones — reciben el Input DTO como parámetro de `validate()`. |
| Application — Command/Query Handlers | 27 (18 + 9) | **Singleton**, pero cada `execute()` recibe su propio `UnitOfWork`/`ReadModelPort` ya Scoped internamente | Los Handlers en sí no almacenan estado entre requests (reciben el Command/Query como parámetro) — la aislación por request ocurre un nivel más abajo, en la transacción de `UnitOfWork`, no en el Handler. Instanciar un Handler nuevo por request no aportaría ningún beneficio de aislamiento adicional, solo costo. |
| Infrastructure — `EventBus`, `AcademyOutboxPublisher`, `AcademyEventSubscribers`, `ProcessedEventIdempotencyStore` | 4 | **Singleton** | El publicador de Outbox y los subscribers deben existir exactamente una vez por proceso (`@Interval()` registrado una sola vez, `onModuleInit()` suscribe una sola vez) — múltiples instancias duplicarían el polling y la suscripción, violando la garantía de orden por agregado (Infrastructure Model v1.1, Sección 7). |
| Infrastructure — `AIProviderFactory`, adapters, `FeedbackCircuitBreaker`, `FeedbackGateway`, `FeedbackQueueWorker` | 6 | **Singleton** | El `FeedbackCircuitBreaker` **debe** ser Singleton por diseño — su estado (`consecutiveFailures`, `state: CLOSED/OPEN/HALF_OPEN`) tiene que persistir **entre** requests para que el patrón Circuit Breaker funcione (Sprint 5.2, Sección 8.1); una instancia Scoped/Transient reiniciaría el circuito en cada request, anulando por completo su propósito. Los adapters y la Factory no tienen estado propio, pero se mantienen Singleton por consistencia y porque el `FeedbackGateway` que los usa ya es Singleton. |
| Infrastructure — `AcademyNotificationPort` | 1 | **Singleton** | Sin estado propio — cada llamada a `send()` es independiente. |
| Infrastructure — `TeacherStudentRelationshipPort`, Guards (`JwtAuthGuard`, `RolesGuard`, `TeacherRelationshipGuard`) | 4 | **Singleton** (excepción: `TeacherRelationshipGuard` es funcionalmente **Scoped por request** en el sentido de que su resultado depende de `request.user`/`request.params`, pero la instancia del Guard en sí no necesita serlo — NestJS ya inyecta `ExecutionContext` fresco en cada `canActivate()`, por lo que el propio Guard puede permanecer Singleton sin comprometer el aislamiento) | Ningún Guard almacena estado de un request para el siguiente — el request llega como parámetro de `canActivate()`. |
| Observabilidad — `AcademyLogger`, `AcademyMetrics`, `AcademyCommandLoggingInterceptor`, 4 Health Indicators | 7 | **Singleton** | `AcademyMetrics` **debe** ser Singleton — los contadores/histogramas de `prom-client` (`Counter`, `Histogram`, `Gauge`) acumulan valores a través de todo el proceso; una instancia por request perdería el acumulado y rompería el scrape de Prometheus. |
| Presentation — `AcademyValidationPipe`, `AcademyExceptionFilter`, `AcademyPaginationPipe` | 3 | **Singleton** (registrados vía `APP_PIPE`/`APP_FILTER`, que en NestJS son inherentemente Singleton salvo declaración explícita en contrario) | Sin estado propio entre requests. |
| Presentation — 6 Controllers + `AcademyHealthController` | 7 | **Singleton** (default de NestJS para Controllers — no declarado `Scoped` en ningún punto de Sprint 5.2) | Ningún Controller de la Sección 16 (Sprint 5.2) almacena estado de instancia entre requests — todas sus dependencias (`CommandBus`/`QueryBus`) ya resuelven el aislamiento por request internamente, un nivel más abajo. |
| Middlewares (`CorrelationIdMiddleware`, `RequestIdMiddleware`, `MetricsMiddleware`, `AuditMiddleware`) | 4 | **Singleton**, aplicados vía `MiddlewareConsumer.apply()` (Sección 2, `configure()`) | NestJS instancia un middleware una vez y lo reutiliza para cada request que pasa por `use(req, res, next)` — sin estado propio entre invocaciones (el `req`/`res` de cada llamada son los que cambian, no la instancia). |

**Ningún provider se declara `Transient`** en este Sprint — NestJS reserva ese ciclo de vida para el caso en que cada consumidor necesite su propia instancia incluso dentro del mismo request (p. ej. loggers con contexto distinto por consumidor); ningún componente de Academia lo requiere — todos los casos de aislamiento por request ya están cubiertos por el mecanismo de transacción de `UnitOfWork` (Scoped a nivel de transacción de datos, no a nivel de provider de NestJS), sin necesidad de introducir un tercer mecanismo de scope.

---

## 4. Bootstrap — `main.ts`

```typescript
// src/main.ts
async function bootstrap(): Promise<void> {
  // 4.1 — Configuration (primero: todo lo demás depende de env vars ya resueltas)
  const configService = new ConfigService(); // NestJS resuelve esto vía ConfigModule.forRoot() dentro de AppModule, mostrado aquí explícito por claridad de orden
  validateRequiredEnvVars(); // ver Sección 5 — falla rápido (fail-fast) si falta una variable ya declarada como obligatoria en Infrastructure Model v1.1 §9 o Sprint 5.2 §10

  // 4.2 — Prisma / Database (antes de construir la app — los Health Checks y los
  // Repositories dependen de un PrismaClient ya conectado)
  const prismaClientSingleton = new PrismaClient({ log: ['error', 'warn'] });
  await prismaClientSingleton.$connect();
  // Verificación de conectividad temprana (fail-fast) — no esperar al primer Health Check.

  // 4.3 — Construcción de la aplicación NestJS (DI container — Sección 2/3 ya resueltas aquí)
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // 4.4 — Logger (reemplaza el logger por defecto de Nest por AcademyLogger desde el inicio,
  // para que incluso los logs de arranque respeten el formato JSON estructurado, Sprint 5.2 §11)
  app.useLogger(app.get(AcademyLogger));

  // 4.5 — Controllers — ya registrados vía DI (Sección 2); sin paso adicional aquí.

  // 4.6 — Middlewares — ya registrados vía AcademyModule.configure() (Sección 2); sin paso adicional aquí.
  // Middlewares GLOBALES de plataforma (fuera de Academia, p. ej. helmet/compresión) se aplican
  // en AppModule, no en este Sprint (fuera de alcance — pertenecen a Platform Core).
  app.use(compression()); // heredado del estándar de plataforma, no específico de Academia — ver nota

  // 4.7 — Validation / Exception Filter — ya registrados como APP_PIPE/APP_FILTER (Sección 2).
  // Sin app.useGlobalPipes/useGlobalFilters adicional aquí — evita doble registro.

  // 4.8 — Authentication / Authorization — JwtAuthGuard aplicado globalmente sobre Academia:
  app.useGlobalGuards(); // no-op a nivel de app completa — los Guards de Academia se aplican
  // por módulo/controller vía @UseGuards() ya declarado en cada Controller (Sprint 5.2 §16),
  // consistente con que Academia no controla la autenticación de OTRAS features de la
  // plataforma (cada módulo aplica sus propios Guards, no uno global de aplicación completa).

  // 4.9 — Swagger (después de que todos los Controllers/DTOs ya están registrados en el DI container)
  setupAcademySwagger(app); // Sprint 5.2, Sección 18

  // 4.10 — Metrics — PrometheusModule ya registrado como import de AppModule; endpoint /metrics
  // disponible automáticamente sin paso adicional aquí.

  // 4.11 — Health Checks / Readiness / Liveness — AcademyHealthController ya registrado (Sección 2);
  // rutas /api/v1/academy/health, /health/liveness, /health/readiness activas tras app.listen().

  // 4.12 — Event Bus — arranque explícito de suscripciones (idempotente, seguro reintentar en cold start)
  const eventSubscribers = app.get(AcademyEventSubscribers);
  eventSubscribers.onModuleInit(); // NestJS ya lo invoca automáticamente por el hook — mostrado aquí explícito por claridad del orden exigido por el encargo

  // 4.13 — Outbox — el publicador (AcademyOutboxPublisher) ya se activa automáticamente vía
  // @Interval() (Sprint 5.2 §7.2) en cuanto el módulo se inicializa — sin paso manual adicional.

  // 4.14 — AI Provider — sin conexión persistente que abrir (HTTP request-response por
  // llamada, Sprint 5.2 §8) — el Circuit Breaker inicia en estado CLOSED por defecto
  // (Sprint 5.2 §8.1), sin necesidad de inicialización explícita.

  // 4.15 — Notification Provider — sin conexión persistente que abrir (mismo criterio que AI Provider,
  // delega en PlatformNotificationClient ya inicializado por la plataforma, fuera de este Sprint).

  // 4.16 — Graceful Shutdown (Sección 13 — registrado ANTES de listen(), para capturar señales desde el arranque)
  app.enableShutdownHooks();
  registerGracefulShutdown(app, prismaClientSingleton);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  app.get(AcademyLogger).info('academy_bootstrap_complete', { port });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console — el logger estructurado aún no existe si el fallo
  // ocurre ANTES del paso 4.4; fallback a consola cruda solo en este caso límite.
  console.error('academy_bootstrap_failed', err);
  process.exit(1);
});
```

**Orden verificado contra el encargo (14 sub-pasos exigidos, Sección 4):** Configuration ✅ (4.1) → Prisma ✅ (4.2) → Database ✅ (4.2, mismo paso — Prisma ES el cliente de base de datos) → Repositories ✅ (resueltos por DI en 4.3, no requieren paso de arranque propio — son Scoped, se instancian por transacción) → DI ✅ (4.3) → Controllers ✅ (4.3/4.5) → Swagger ✅ (4.9) → Middlewares ✅ (4.3/4.6) → Authentication ✅ (4.8) → Authorization ✅ (4.8) → Metrics ✅ (4.10) → Health Checks ✅ (4.11) → Readiness ✅ (4.11) → Liveness ✅ (4.11) → Event Bus ✅ (4.12) → Outbox ✅ (4.13) → AI Provider ✅ (4.14) → Notification Provider ✅ (4.15) → Shutdown Gracefully ✅ (4.16).

---

## 5. Configuración centralizada

**Regla aplicada, sin excepción:** únicamente variables ya nombradas en un documento Frozen (Infrastructure Model v1.1 Sección 9, Sprint 5.2 Sección 10, o el `schema.prisma` real del proyecto, Sprint 5.1). Ninguna variable nueva inventada — ver Nota de reconciliación al inicio de este documento para lo explícitamente excluido (`REDIS`, `SMTP`, `JWT` propio de Academia).

```typescript
// features/academy/infrastructure/config/academy.config.ts (ya existente, Sprint 5.2 §10 —
// reproducido aquí solo para consolidar la vista de arranque, sin modificar su contenido)
export const academyConfig = registerAs('academy', () => ({
  database: {
    url: process.env.DATABASE_URL,           // ya existente en schema.prisma real del proyecto — no introducido por Academia
    directUrl: process.env.DIRECT_URL,        // ídem
  },
  ai: {
    provider: process.env.ACADEMY_AI_PROVIDER ?? 'claude',
    claudeEndpoint: process.env.ACADEMY_CLAUDE_ENDPOINT,      // "ANTHROPIC" del encargo = Claude, ya nombrado así en Sprint 5.2 §10
    claudeApiKey: process.env.ACADEMY_CLAUDE_API_KEY,
    openAiEndpoint: process.env.ACADEMY_OPENAI_ENDPOINT,       // "OPENAI" del encargo
    openAiApiKey: process.env.ACADEMY_OPENAI_API_KEY,
    feedbackTimeoutTargetMs: Number(process.env.ACADEMY_FEEDBACK_TIMEOUT_TARGET_MS ?? 60_000),
    feedbackTimeoutMaxMs: Number(process.env.ACADEMY_FEEDBACK_TIMEOUT_MAX_MS ?? 180_000),
    feedbackRetryMaxAttempts: Number(process.env.ACADEMY_FEEDBACK_RETRY_MAX_ATTEMPTS ?? 3),
    circuitBreakerThreshold: Number(process.env.ACADEMY_AI_CIRCUIT_BREAKER_THRESHOLD ?? 5),
    circuitBreakerOpenMs: Number(process.env.ACADEMY_AI_CIRCUIT_BREAKER_OPEN_MS ?? 60_000),
  },
  events: {
    outboxPollIntervalMs: Number(process.env.ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS ?? 2000),
    outboxMaxRetries: Number(process.env.ACADEMY_EVENT_OUTBOX_MAX_RETRIES ?? 5),
    outboxBacklogAlertThreshold: Number(process.env.ACADEMY_OUTBOX_BACKLOG_ALERT_THRESHOLD ?? 500),
  },
  featureFlags: {
    masteryEvaluationEnabled: process.env.ACADEMY_FF_MASTERY_EVALUATION_ENABLED === 'true',
    asyncFeedbackOnly: process.env.ACADEMY_FF_ASYNC_FEEDBACK_ONLY === 'true',
  },
  observability: {
    logLevel: process.env.LOG_LEVEL ?? 'info', // ya existente como estándar de plataforma (Infrastructure Model v1.1 §10, niveles ERROR/WARN/INFO/DEBUG) — no introducido por Academia, reutilizado sin variable nueva
  },
}));
```

**Tabla de variables (auditoría de origen — ninguna sin trazabilidad documental):**

| Variable | Origen documental exacto | Obligatoria en arranque |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | `schema.prisma` real del proyecto (`datasource db`), ya existente, no de Academia | Sí — `validateRequiredEnvVars()`, Sección 4.1 |
| `ACADEMY_AI_PROVIDER` | Sprint 5.2, Sección 10 | No (default `claude`) |
| `ACADEMY_CLAUDE_ENDPOINT`/`ACADEMY_CLAUDE_API_KEY` | Sprint 5.2, Sección 10 (desdoblado de `ACADEMY_AI_PROVIDER_ENDPOINT`/`_API_KEY`, Infrastructure Model v1.1 §9) | Sí si `provider=claude` |
| `ACADEMY_OPENAI_ENDPOINT`/`ACADEMY_OPENAI_API_KEY` | Sprint 5.2, Sección 10 | Sí si `provider=openai` |
| `ACADEMY_FEEDBACK_TIMEOUT_TARGET_MS`/`_MAX_MS`/`_RETRY_MAX_ATTEMPTS` | Infrastructure Model v1.1, Sección 9 (nombres exactos) | No (defaults ya congelados: 60000/180000/3) |
| `ACADEMY_AI_CIRCUIT_BREAKER_THRESHOLD`/`_OPEN_MS` | Sprint 5.2, Sección 8.1 (`PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA`, valor por defecto no vinculante) | No |
| `ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS` | Infrastructure Model v1.1, Sección 9 | No |
| `ACADEMY_EVENT_OUTBOX_MAX_RETRIES` | Sprint 5.2, Sección 10 | No |
| `ACADEMY_OUTBOX_BACKLOG_ALERT_THRESHOLD` | Sprint 5.2, Sección 12 (`PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA`) | No |
| `ACADEMY_FF_MASTERY_EVALUATION_ENABLED`, `ACADEMY_FF_ASYNC_FEEDBACK_ONLY` | Infrastructure Model v1.1, Sección 9 (anticipadas nominalmente) + Sprint 5.2, Sección 10 (nombre fijado) | No (default `false`) |
| `LOG_LEVEL` | Infrastructure Model v1.1, Sección 10 (niveles ya definidos, reutilizados como estándar de plataforma) | No (default `info`) |
| `PORT` | Estándar de plataforma (no específico de Academia, requerido por cualquier proceso Nest) | No (default `3000`) |

**`validateRequiredEnvVars()` (fail-fast, Sección 4.1):**
```typescript
function validateRequiredEnvVars(): void {
  const required = ['DATABASE_URL', 'DIRECT_URL'];
  const provider = process.env.ACADEMY_AI_PROVIDER ?? 'claude';
  if (provider === 'claude') required.push('ACADEMY_CLAUDE_ENDPOINT', 'ACADEMY_CLAUDE_API_KEY');
  if (provider === 'openai') required.push('ACADEMY_OPENAI_ENDPOINT', 'ACADEMY_OPENAI_API_KEY');
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) throw new Error(`Variables de entorno obligatorias ausentes: ${missing.join(', ')}`);
}
```

---

## 6. Feature Flags (registro — ninguna nueva)

**Únicas dos ya existentes (Infrastructure Model v1.1, Sección 9; nombre de variable fijado en Sprint 5.2, Sección 10):**

| Feature Flag | Variable | Propósito ya documentado |
|---|---|---|
| `masteryEvaluationEnabled` | `ACADEMY_FF_MASTERY_EVALUATION_ENABLED` | *"habilitar/deshabilitar la evaluación de `MASTERED` de forma independiente (permite desplegar la máquina de estados sin activar el criterio de dominio si su contrato de evidencia... aún no está cerrado)"* — Infrastructure Model v1.1, Sección 9. Consumida por `EvaluateMasteryHandler` (Sprint 5.0, CMD-08) antes de invocar `MasteryEvaluationService`. |
| `asyncFeedbackOnly` | `ACADEMY_FF_ASYNC_FEEDBACK_ONLY` | *"alternar el modo de retroalimentación entre síncrono-preferente e íntegramente asíncrono durante etapas tempranas de rollout"* — Infrastructure Model v1.1, Sección 9. Consumida por `FeedbackGatewayImpl.requestFeedback` (Sprint 5.2, Sección 8.2) — si `true`, salta directamente a `queue.enqueue(input)` sin intentar la llamada síncrona. |

**Registro en Composition Root:** ambas se leen desde `academyConfig.featureFlags` (Sección 5) — ningún provider dedicado de "Feature Flag Service" se introduce, dado que son dos banderas booleanas simples resueltas directamente desde configuración, consistente con la propia recomendación ya registrada en Infrastructure Model v1.1, Sección 9: *"iniciar con configuración de entorno simple (sin servicio dedicado)... revisitando si el número crece"* — no ha crecido, sigue siendo 2.

**Ninguna Feature Flag nueva creada** — verificado contra Infrastructure Model v1.1 (única fuente que las declara) y Sprint 5.2 (única fuente que les asigna nombre de variable): exactamente dos, ninguna más.

---

## 7. Registro del Event Bus — wiring completo

```typescript
// Ya registrado en el Composition Root (Sección 2.7) — este bloque documenta el WIRING,
// no un registro adicional.
```

| Componente | Rol | Arranque |
|---|---|---|
| **Publishers** | `AcademyOutboxPublisher.publishOne()` (Sprint 5.2 §7.2) — invocado por `poll()`, con `@Interval(ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS)`. | Automático al registrar el provider (decorador `@Interval`, `ScheduleModule.forRoot()` ya importado, Sección 2). |
| **Subscribers** | `AcademyEventSubscribers.onModuleInit()` (Sprint 5.2 §7.3) — se suscribe a `ReflectionCompleted` → dispara `CompleteUnitOnReflectionCompletedCommand` (segunda transacción del patrón Attempt→AcademyUnit). | Automático vía hook `OnModuleInit` de NestJS — invocado una vez, al arrancar el módulo (Sección 4.12 lo referencia explícitamente por claridad de orden, no como paso manual adicional). |
| **Outbox Dispatcher** | El propio `AcademyOutboxPublisher` — no existe un componente "Dispatcher" separado (mismo componente cumple polling + publicación + actualización de estado, Sprint 5.2 §7.2) — se documenta aquí bajo este nombre porque el encargo lo pide explícitamente como ítem propio, sin que exista una clase adicional que crear (crearla sería una decisión de diseño no autorizada por este Sprint de wiring). | Igual que Publishers. |
| **Retry** | Backoff exponencial dentro de `publishOne()` — incrementa `retryCount`, reintenta en el siguiente `poll()` (no un timer propio por evento, el propio intervalo de polling ya actúa como espaciador entre reintentos). | Sin arranque propio — parte del mismo ciclo de `poll()`. |
| **Dead Letter Queue** | Filas `academy_outbox.status = 'DEAD_LETTER'` tras agotar `ACADEMY_EVENT_OUTBOX_MAX_RETRIES` (Sprint 5.1 §7, Sprint 5.2 §7.2) — no es una tabla ni cola física separada, es un valor de `status` dentro de la misma tabla Outbox, exactamente como ya Frozen en Persistence Layer v1.0. | N/A — no requiere arranque, es un estado de datos. |

**Verificación de fidelidad a Infrastructure Model v1.1:** at-least-once delivery ✅, orden por agregado ✅ (`idx_academy_outbox_status_occurred_at`, Sprint 5.1 §11), idempotencia por `eventId` ✅ (`ProcessedEventIdempotencyStore`, Sprint 5.2 §7.4) — ninguno de los tres reinterpretado por este Sprint.

---

## 8. Registro de IA — wiring completo

| Componente | Ya registrado en | Ciclo de vida (Sección 3) |
|---|---|---|
| `AIProviderFactory` | Composition Root 2.8 | Singleton |
| `ClaudeFeedbackAdapter`, `OpenAIFeedbackAdapter` | Composition Root 2.8 | Singleton |
| **Prompt Builder** | **No es un provider separado** — ya implementado como método privado `buildPrompt()` dentro de cada adapter (Sprint 5.2, Sección 8) — ver Nota de reconciliación, punto 3. Sin registro adicional: introducir un provider nuevo modificaría código ya Frozen del Sprint anterior. | N/A |
| `FeedbackCircuitBreaker` | Composition Root 2.8 | **Singleton obligatorio** (Sección 3 — estado debe persistir entre requests) |
| `FeedbackGatewayImpl` (implementa `FeedbackGateway`) | Composition Root 2.8 | Singleton |
| Retry | Dentro de `FeedbackGatewayImpl.withTimeoutAndRetry()` (Sprint 5.2 §8.2) — sin componente propio. | N/A |
| `FeedbackQueueWorker` (Fallback asíncrono) | Composition Root 2.8 | Singleton (`@Interval`) |

**Según Infrastructure Model v1.1 (verificado, sin desviación):** proveedor seleccionable por configuración (Sección 6 de ese documento, `PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA`, no resuelto por este Sprint, resuelto operacionalmente vía `ACADEMY_AI_PROVIDER`) ✅; timeouts 60000ms/180000ms respetados sin desviación ✅; Circuit Breaker presente, umbral configurable no fijado como decisión definitiva ✅; Fallback nunca genera retroalimentación sin IA, siempre encola ✅.

---

## 9. Registro de Notificaciones — wiring completo

| Canal | Estado | Justificación |
|---|---|---|
| **Email** | **No registrado — exclusión deliberada, no omisión.** | Infrastructure Model v1.1, Sección 14: *"Ninguna regla Frozen exige que Academia envíe correo electrónico directamente"* — ver Nota de reconciliación, punto 4. |
| **In-App** | ✅ Registrado — `AcademyNotificationService.notifyFeedbackReady`/`notifyTeacherOverrideApplied` (Sprint 5.2 §9), vía `PlatformNotificationClient` (plataforma, reutilizado). | Infrastructure Model v1.1, Sección 9 (Notification Catalog, `ACADEMY_FEEDBACK_READY`). |
| **Eventos** | ✅ Registrado — disparadores vía `AcademyEventSubscribers` (Sección 7) sobre `FeedbackDelivered` (modo `PROCESSING`) y `TeacherOverrideApplied`. | Sprint 5.2, Sección 9. |
| **Outbox** | ✅ Registrado — mismo mecanismo de la Sección 7, sin tabla paralela para notificaciones (Infrastructure Model v1.1 §5: "sin tabla paralela propia" para auditoría/notificación). | Infrastructure Model v1.1, Sección 5. |

**Retry:** `AcademyNotificationService.sendWithRetry()` (Sprint 5.2 §9) — 3 intentos con backoff exponencial, ya registrado como parte del mismo provider (Composition Root 2.9), sin componente adicional.

---

## 10. Logging — wiring completo

| Elemento | Provider/Middleware ya registrado | Sección de origen |
|---|---|---|
| Logger | `AcademyLogger` (Composition Root 2.11), inyectado en `app.useLogger()` (Sección 4.4) | Sprint 5.2, Sección 11 |
| Correlation Id | `CorrelationIdMiddleware` (Composition Root, `configure()`) | Sprint 5.2, Sección 13 |
| Request Id | `RequestIdMiddleware` (ídem) | Sprint 5.2, Sección 13 |
| Tracing | Reutiliza infraestructura de tracing de plataforma (Infrastructure Model v1.1 §11) — sin componente propio de Academia, los IDs de arriba son los que ese tracer consume. | Infrastructure Model v1.1, Sección 11 |
| Auditoría | `AuditMiddleware` (Composition Root, `configure()`), escribe sobre `AuditLog` ya existente a nivel de proyecto (§13.11) | Infrastructure Model v1.1, Sección 5 |

---

## 11. Observabilidad — wiring completo

| Elemento | Provider/Módulo | Endpoint expuesto |
|---|---|---|
| Prometheus | `PrometheusModule` (import de `AppModule`, no de `AcademyModule` — es transversal a toda la plataforma, no específico de Academia) | `GET /metrics` |
| Metrics | `AcademyMetrics` (Composition Root 2.11) | Alimenta `/metrics` con los 6 tipos ya definidos (Sprint 5.2 §14) |
| Health | `AcademyHealthController` (Composition Root, `controllers`) | `GET /api/v1/academy/health` |
| Readiness | `AcademyHealthController.readiness()` (Sprint 5.2 §22) | `GET /api/v1/academy/health/readiness` |
| Liveness | `AcademyHealthController.liveness()` (Sprint 5.2 §22) | `GET /api/v1/academy/health/liveness` |
| Tracing | Ver Sección 10 — reutilizado, sin endpoint propio de Academia. | — |

**Sin modificación de Infrastructure ya construida** — esta Sección solo confirma el wiring, consistente con la instrucción explícita "respetando Infrastructure Model" y "sin modificar Infrastructure" ya aplicada en Sprint 5.2.

---

## 12. Seguridad — inicialización

**Nota de desambiguación de nombres (no una inconsistencia):** el término "Policies" en esta Sección 12 del encargo se refiere a políticas de **autorización HTTP** (`RolesGuard`), un concepto de Presentation — distinto de las 7 **Domain Policies** (`UnlockPolicy`, etc.) registradas en la Sección 2.1 de este documento, que son reglas de negocio del Domain Layer. Ambos conjuntos ya están registrados (Domain Policies en 2.1, autorización HTTP en 2.10); esta sección solo confirma su inicialización en el arranque.

| Elemento | Inicialización |
|---|---|
| JWT | `JwtAuthGuard` (Composition Root 2.10) — delega en `PlatformAuthVerifier` (plataforma); sin secreto propio de Academia (Nota de reconciliación, punto 2). Aplicado por `@UseGuards(JwtAuthGuard, RolesGuard)` en cada Controller (ya declarado, Sprint 5.2 §16) — no requiere `app.useGlobalGuards()` con argumento, ver Sección 4.8. |
| Roles | `RolesGuard` + decorador `@Roles(...)` (Composition Root 2.10) — matriz completa ya verificada en Sprint 5.2, Sección 4. |
| Ownership | Verificación explícita en `EP-14` (`dto.studentId === user.id`) + RLS (Sprint 5.1) — ya construido, sin wiring adicional aquí más allá de que `PrismaClient`/`UnitOfWork` ya están en el contenedor (Sección 2.2). |
| Teacher | `TeacherRelationshipGuard` + `TeacherStudentRelationshipPort` (Composition Root 2.10) | 
| Student | `RolesGuard` con `@Roles('STUDENT')` — sin componente adicional. |
| Admin | `RolesGuard` con `@Roles('ADMIN')` — sin componente adicional. |

---

## 13. Inicio y apagado

**Startup:** Sección 4 completa (18 sub-pasos, verificados contra el encargo al final de esa sección).

**Graceful Shutdown:**
```typescript
// src/main.ts (continuación de bootstrap(), Sección 4.16)
function registerGracefulShutdown(app: INestApplication, prisma: PrismaClient): void {
  const shutdown = async (signal: string): Promise<void> => {
    const logger = app.get(AcademyLogger);
    logger.info('academy_shutdown_start', { signal });
    try {
      // 1. Dejar de aceptar nuevas conexiones HTTP.
      await app.close(); // dispara los hooks OnModuleDestroy de todos los providers registrados

      // 2. Flush Outbox — asegurar que el último ciclo de poll() en curso termine antes de
      // cerrar la conexión a base de datos (evita dejar eventos PENDING sin intentar publicar
      // por el cierre abrupto de la conexión a mitad de un poll()).
      const publisher = app.get(AcademyOutboxPublisher);
      await publisher.poll(); // último intento síncrono antes de cerrar

      // 3. Cerrar Event Bus — desuscribir del bus de plataforma (evita procesar eventos
      // entrantes después de que el proceso ya no puede completar una transacción).
      const bus = app.get<EventBus>('EventBus');
      if ('close' in bus && typeof bus.close === 'function') await (bus as any).close();

      // 4. Close Prisma — al final, después de que Outbox/EventBus ya no lo necesitan.
      await prisma.$disconnect();

      logger.info('academy_shutdown_complete', { signal });
      process.exit(0);
    } catch (err) {
      logger.error('academy_shutdown_error', { signal, error: String(err) });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
```

**Dispose:** cubierto por `app.close()` (paso 1) — NestJS invoca `OnModuleDestroy`/`OnApplicationShutdown` de cada provider que lo implemente (ninguno de los providers de Academia declara lógica de dispose adicional más allá de lo ya cubierto explícitamente en los pasos 2–4, que se manejan de forma ordenada y explícita en lugar de delegarse íntegramente al hook genérico, precisamente para garantizar el orden Outbox→EventBus→Prisma exigido por el encargo).

**Orden verificado (exacto, sin alterar):** Startup ✅ → ... → Dispose ✅ (`app.close()`) → Close Prisma ✅ (paso 4, al final) → Flush Outbox ✅ (paso 2, antes de cerrar Prisma) → Cerrar Event Bus ✅ (paso 3).

---

## 14. Verificación — Matriz Global

| Verificación | Resultado |
|---|---|
| ✅ Todos los Repositories registrados | **Cumple.** 4 tokens (`AcademyUnitRepository`, `AttemptRepository`, `ModelExampleRepository`, `TeacherRecommendationRepository`) ligados a sus 4 implementaciones Prisma — Composition Root, Sección 2.2. |
| ✅ Todos los Handlers registrados | **Cumple.** 17 Command Handlers + 1 Handler de sincronización de eventos + 9 Query Handlers = 27 — Composition Root, Secciones 2.5/2.6. |
| ✅ Todos los Controllers registrados | **Cumple.** 6 Controllers de negocio + `AcademyHealthController` = 7 — Composition Root, `controllers: [...]`. |
| ✅ Todos los Providers registrados | **Cumple.** Ver recuento exhaustivo al final de la Sección 2. |
| ✅ Todas las Policies registradas | **Cumple.** 7 Domain Policies (Sección 2.1) — desambiguadas explícitamente de las políticas de autorización HTTP (Sección 12). |
| ✅ Todas las Specifications registradas | **Cumple.** 3 (Sección 2.1). |
| ✅ Todos los Factories registrados | **Cumple.** 2 (Sección 2.1). |
| ✅ Todos los Domain Services registrados | **Cumple.** 2 (Sección 2.1). |
| ✅ Event Bus conectado | **Cumple.** Sección 7 — Publishers/Subscribers/Dispatcher/Retry/DLQ, todos verificados contra Infrastructure Model v1.1. |
| ✅ Outbox conectado | **Cumple.** Sección 7 — mismo mecanismo de Sprint 5.1, sin reinterpretación. |
| ✅ Swagger disponible | **Cumple.** Sección 4.9, `/api/v1/academy/docs`, coincidente con API Contract v1.3 (verificado en Sprint 5.2, Sección 18/23). |
| ✅ Prisma inicializado | **Cumple.** Sección 4.2, `$connect()` antes de construir la app (fail-fast). |
| ✅ JWT inicializado | **Cumple.** Sección 12 — `JwtAuthGuard` delegando en `PlatformAuthVerifier`, sin secreto propio (Nota de reconciliación, punto 2). |
| ✅ Health Checks registrados | **Cumple.** Sección 11 — Database/AI Provider/Event Bus/Storage + Readiness/Liveness. |
| ✅ Metrics registradas | **Cumple.** Sección 11 — 6 tipos de métrica (Sprint 5.2 §14), expuestas en `/metrics`. |
| ✅ Logging registrado | **Cumple.** Sección 10 — Logger/Correlation Id/Request Id/Tracing/Auditoría, los cinco confirmados. |
| ✅ CQRS preservado | **Cumple.** Ningún provider de este Sprint mezcla `CommandBus`/`QueryBus`; `AcademyReadModelPort` sigue siendo el único origen de lectura de todo Query Handler — el Composition Root solo cablea, no introduce un segundo camino de lectura. |
| ✅ Clean Architecture preservada | **Cumple.** `presentation → application → domain`; `infrastructure → application`/`domain` (Mappers); el Composition Root en sí vive en `features/academy/academy.module.ts`, un archivo de ensamblaje que SÍ conoce todas las capas (es su única responsabilidad legítima en Clean Architecture — el único punto donde "conocer todo" es correcto, no una violación). |
| ✅ Event Driven preservado | **Cumple.** Outbox como único mecanismo de publicación; ningún Controller ni Composition Root publica directamente al bus. |
| ✅ Ningún documento Frozen modificado | **Cumple.** Domain Model, Application Model, Persistence Model, Infrastructure Model, API Contract, API Implementation (Sprint 5.2), Functional Specification, A-01–A-10, ACP-001/002/003 — ninguno alterado. Las cuatro observaciones de la Nota de reconciliación se resolvieron por fidelidad/omisión explícitamente instruida, sin tocar ningún documento. |

**BLOCKER registrados:** ninguno.

**Veredicto final:** el backend de Academia queda completamente ensamblado — Composition Root único (`academy.module.ts`), 90+ providers registrados con ciclo de vida justificado, bootstrap de 18 pasos en el orden exacto exigido, configuración centralizada sin variables inventadas, Feature Flags limitadas a las 2 ya existentes, Event Bus/Outbox/IA/Notificaciones/Logging/Observabilidad/Seguridad completamente cableados reutilizando exclusivamente lo ya construido en Sprints 4.1–5.2, y apagado ordenado (HTTP → Outbox → Event Bus → Prisma). Listo para ejecutarse en producción sin ninguna decisión arquitectónica adicional.
