# ACADEMIA — Sprint 6.0 — BLOCKER

**Fecha:** 2026-07-21.
**Sprint:** 6.0 — Implementación Ejecutable del Backend (NestJS).
**Estado:** **DETENIDO.** No se generó código fuente. Se registra el BLOCKER exacto exigido por el propio encargo ("Si aparece una inconsistencia documental: NO modificar documentos. Registrar únicamente: ## BLOCKER con referencia exacta").

---

## BLOCKER

**Naturaleza:** el stack tecnológico asumido por todos los documentos Frozen de la capa backend de Academia (Infrastructure Model v1.1, Application Layer Specification v1.0, Infrastructure Services + API Layer v1.0, Composition Root v1.0) es **NestJS** — un framework de servidor Node.js independiente. El proyecto real, físico, en el que este código debería insertarse **no usa NestJS**: es una aplicación **Next.js 14** (Server Actions + Route Handlers), sin ningún proceso de servidor NestJS separado.

**Evidencia exacta (verificada directamente sobre el repositorio, no inferida):**

1. **`package.json`** (raíz del proyecto real) — `"next": "^14.2.0"` como framework; scripts `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`. **Ningún paquete `@nestjs/*`** en `dependencies` ni en `devDependencies` (verificado exhaustivamente, lista completa revisada) — ni `@nestjs/core`, ni `@nestjs/common`, ni `@nestjs/cqrs`, ni `@nestjs/swagger`, ni `@nestjs/terminus`, ni `@nestjs/config`, ni `@nestjs/schedule`.
2. **`features/my-plan/`** — el módulo hermano ya implementado en este mismo proyecto (Sprints 3.3.2–3.3.4.1, previos a Academia) — **no usa NestJS**. Su Composition Root (`features/my-plan/infrastructure/composition/myPlanContainer.ts`) es una función factory que construye y retorna un objeto plano (`MyPlanContainer`), no un `@Module()`. Sus Handlers (p. ej. `CancelLearningPlanHandler`) son clases TypeScript planas con un método público `.handle()`, invocadas directamente (`container.handlers.cancelLearningPlan.handle(command)`) — no `@CommandHandler()` ni `CommandBus.execute()`. Ningún archivo del árbol de Mi Plan contiene un decorador `@Injectable()`, `@Controller()`, `@Module()` ni ningún import de `@nestjs/*`.
3. **`features/academy/`** (carpeta ya existente en el repo, capa Frontend/Next.js) — ya contiene `actions/`, `pages/`, `services/`, siguiendo el mismo patrón de Server Actions de Next.js que el resto del proyecto (Dashboard, Mi Plan, Laboratorio, etc.) — ninguna carpeta `controllers/` NestJS.

**Documentos Frozen que asumen NestJS, en contradicción con lo anterior (referencia exacta):**
- `academia-infrastructure-model-v1.1-2026-07-19.md`, Sección 4: *"`CommandBus` / `QueryBus` (reutilizado del patrón ya vigente en Mi Plan/Dashboard)"* — afirmación que la evidencia del punto 2 muestra **inexacta**: Mi Plan no usa `CommandBus`/`QueryBus` de NestJS, usa invocación directa de Handler.
- `academia-application-layer-specification-v1.0-2026-07-20.md` (Sprint 5.0), Sección 0: patrón de invocación `CommandBus.execute(command)`/`QueryBus.execute(query)`.
- `academia-infrastructure-services-api-layer-v1.0-2026-07-21.md` (Sprint 5.2), Secciones 2–16: `@Controller()`, `@Module()`, `@Injectable()`, `@UseGuards()`, `@nestjs/swagger`, `@nestjs/terminus`.
- `academia-composition-root-bootstrap-v1.0-2026-07-21.md` (Sprint 5.3), Secciones 2 y 4: `academy.module.ts` como `@Module()`, `NestFactory.create(AppModule)`, `ScheduleModule.forRoot()`.

**Por qué esto detiene específicamente el Sprint 6.0 (generación de código compilable), y no los Sprints anteriores:** los Sprints 5.0–5.3 son documentos de **especificación** — su valor no dependía de ejecutarse. El Sprint 6.0 exige explícitamente *"código fuente completo y compilable"* que *"debe poder... integrarse al resto de la plataforma sin requerir rediseño arquitectónico"*. Generar las clases exactamente como las especifican los documentos Frozen (con decoradores `@nestjs/*`) produciría código que **no compila** en este repositorio sin antes añadir NestJS como dependencia nueva — una decisión de infraestructura/despliegue (¿segundo proceso de servidor? ¿en qué puerto? ¿cómo lo invoca Next.js?) que ningún documento Frozen resuelve y que este mismo Sprint prohíbe explícitamente tomar ("Este sprint NO diseña arquitectura").

**Las dos únicas resoluciones posibles, ambas fuera del alcance que este Sprint autoriza a decidir unilateralmente:**
- **(A)** Instalar NestJS como un segundo runtime junto a Next.js — requiere una decisión de arquitectura de despliegue no autorizada por ningún ACP/Resolución existente.
- **(B)** Reinterpretar los documentos Frozen de Sprint 5.0–5.3 al patrón real ya usado por Mi Plan (clases planas + Composition Root factory + Server Actions de Next.js, comportamiento equivalente, forma de código distinta) — esto modificaría la especificación concreta ya Frozen de esos documentos, prohibido explícitamente por este mismo encargo ("NO modificar: ... Composition Root").

**No se generó ningún archivo de código fuente** — hacerlo bajo cualquiera de las dos opciones sin autorización explícita del usuario habría constituido exactamente el tipo de "inventar arquitectura"/"modificar documentos Frozen" que este Sprint prohíbe.
