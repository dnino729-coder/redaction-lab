PROJECT FREEZE PROTOCOL v1.0
Academia — Architecture & Implementation Baseline Freeze

---

## Baseline Summary

### Documentos Frozen (última versión vigente de cada uno — fuente de verdad)

| Documento | Versión vigente | Estado |
|---|---|---|
| Functional Specification | v1.3 (2026-07-20) | FROZEN |
| Domain Model | v1.1 (2026-07-19) | FROZEN |
| Application Model | v1.4 (2026-07-20) | FROZEN |
| Infrastructure Model | v1.1 (2026-07-19) | FROZEN |
| API Contract | v1.3 (2026-07-20) | FROZEN |
| Frontend Contract | v1.1 (2026-07-20) | FROZEN |
| Architecture Coverage Audit | 2026-07-19 | FROZEN |
| Application Layer Specification | v1.0 (2026-07-20) | FROZEN |
| Persistence Layer Specification | v1.0 (2026-07-21) | FROZEN |
| Infrastructure Services + API Layer Spec | v1.0 (2026-07-21) | FROZEN |
| Composition Root, DI & Bootstrap Spec | v1.0 (2026-07-21) | FROZEN |

**Versiones anteriores superadas (mismo tipo de documento, no autoritativas):** Functional Specification v1.0/v1.1-FROZEN/v1.2; Domain Model v1.0; Application Model v1.0/v1.1/v1.2/v1.3; Infrastructure Model v1.0; API Contract v1.0/v1.1/v1.2; Frontend Contract v1.0. Estado: **SUPERSEDED** — permanecen en el repositorio como registro histórico, ninguna es fuente de verdad vigente.

**Documentos de auditoría/reconciliación intermedios** (`academia-ddd-audit`, `academia-domain-vs-application-audit`, `academia-functional-audit`, `academia-reconciliacion-arquitectonica`, `academia-specification-consolidation`, `academia-arb-resoluciones-pendientes`, `academia-irb-resoluciones-infraestructura`, `academia-architectural-resolutions-v1.0`, `academia-domain-model-v1.1-cross-consistency-audit`, `academia-sprint-6.0-blocker`): Estado **DEPRECATED (histórico/trazabilidad)** — su contenido ya fue incorporado a los documentos Frozen listados arriba; se conservan como registro de auditoría, no deben consultarse como fuente de requisitos vigente.

### Documentos de la remediación H-01 (esta cadena de auditoría)

| Documento | Estado | Justificación |
|---|---|---|
| ACA-001 | SUPERSEDED (parcial) | Sus severidades fueron revisadas por ACA-002 (H-02, H-04, H-12, H-15 cambiaron de clasificación); su identificación original de H-01 fue confirmada y ampliada por ACA-003. Se conserva como registro histórico del primer barrido. |
| ACA-002 | FROZEN (registro de auditoría) | Última palabra sobre H-02 a H-15 (ninguno remediado aún — ver Pendientes). Su tratamiento de H-01 fue profundizado y confirmado por ACA-003. |
| ACA-003 | FROZEN | Evidencia definitiva e independiente del BOLA en EP-14/16/18, con cita textual del API Contract v1.3 y del Application Model v1.4. Veredicto: H-01 CONFIRMADO. |
| ACA-004 | FROZEN (registro histórico) | Confirmó, en su momento, que la remediación NO existía todavía (REMEDIATION FAILED). Ese hecho quedó superado por la implementación de Sprint 6.3.2, pero el informe en sí es un registro fiel de ese punto en el tiempo. |
| ACP-002 | FROZEN | Decisión arquitectónica aprobada para la remediación de H-01 (Opción B — extender `AcademyReadModelPort`, sin Repository/Aggregate en Query Handlers). Vinculante; cualquier cambio de enfoque requiere un nuevo ACP. |
| Sprint 6.3.1 Implementation Blueprint | FROZEN | Plan de implementación ya ejecutado en su totalidad (con una corrección de alcance disclosed: call site adicional en EP-05, autorizada por su propia Regla 12). |
| Sprint 6.3.2 Controlled Implementation | FROZEN (registro histórico) | Documenta los 12 archivos modificados y la verificación de compilación. El código que produjo pasa a formar parte del "Código Frozen" de la baseline (ver abajo), con la salvedad de validación runtime pendiente. |
| Sprint 6.3.3 Runtime Validation | **ACTIVE / NO CERRADO** | Único documento de esta cadena que NO puede marcarse FROZEN: concluyó `VALIDATION NOT EXECUTABLE` por ausencia de PostgreSQL, Clerk, Next.js y datos de prueba en el entorno de auditoría. Este es el pendiente real que impide certificar el cierre funcional de H-01. |

**Nota de trazabilidad (Configuration Control):** ACA-004, ACP-002 y el informe de Sprint 6.3.2 fueron entregados como contenido de chat durante esta sesión, sin persistirse como archivo individual en el repositorio (a diferencia de ACA-001/002/003, Sprint 6.3.1 y Sprint 6.3.3, que sí existen como archivos `.md` en la raíz de `RedactionLab`). Se recomienda, como acción de higiene documental (no como nueva decisión técnica), persistir esos tres como archivos para mantener el mismo nivel de trazabilidad que el resto de la cadena.

### Código Frozen

Todo `features/academy/` (Domain, Application, Infrastructure, API, Actions), `app/api/v1/academy/**` (23 Route Handlers + 3 Health), y la adición de `"/api/v1/academy/health(.*)"` en `middleware/auth.ts`, en el estado exacto que quedó al cierre de Sprint 6.3.2 (incluyendo los 12 archivos de la remediación H-01). El esquema Prisma y migraciones relevantes a Academia (`AcademyUnit`, `Attempt`, `Draft`, `Version`, `Feedback`, `ModelExample`, `TeacherOverride`, `TeacherRecommendation` y sus RLS) — FROZEN, sin cambios de Sprint 6.3.2 en adelante.

### Contratos Frozen

API Contract v1.3 (23 endpoints, EP-01 a EP-23), Frontend Contract v1.1, `academy.openapi.json` (22 paths, 23 operaciones de negocio + 3 Health) — FROZEN, sin discrepancias no resueltas (la discrepancia "22 vs 23" fue reconciliada en ACA-002 como error del texto del encargo de auditoría, no del artefacto).

### Arquitectura Frozen

Clean Architecture (dirección de dependencias Presentation → Application → Domain, Infrastructure implementando puertos de Application), CQRS (Query Handlers dependen EXCLUSIVAMENTE de `AcademyReadModelPort`, confirmado explícitamente para los 3 Query Handlers remediados en Sprint 6.3.2), DDD (Aggregates/Value Objects/Specifications de Domain sin tocar desde Sprint 6.0), Composition Root (`academyContainer.ts`, patrón de contenedor memoizado — con el hallazgo MAJOR ya documentado en ACA-002/H-02 de Service Locator, aceptado como deuda técnica de backlog, no bloqueante).

### Decisiones Frozen

ACP-001 (A/B/C, extensión de Application Model y desambiguación de "grupo"/Biblioteca de Modelos), ACP-002 (remediación H-01), ACP-003 (Teacher Review Visibility), Resolución 18.24 (RLS vs `withServiceContext`, aplicable también como precedente de diseño para Academia), y todas las Resoluciones Arquitectónicas de Academia v1.0.

---

## Frozen Components

### Componentes protegidos (requieren ACP para cualquier cambio)

- Domain (Aggregates, Value Objects, Specifications, Policies, Domain Events, Domain Services de Academia)
- Application (Commands, Queries, Handlers, DTO públicos, Validators, Puertos — incluidos los 3 Puertos/Handlers ya modificados por la remediación H-01, cuya firma actual queda fija)
- Infrastructure (Repositories Prisma, `PrismaAcademyReadModelPort`, UnitOfWork, Outbox, adaptadores de IA/Notificación, `PrismaClientContext`)
- API Contract v1.3 (los 23 endpoints, sus contratos de request/response, códigos HTTP)
- Frontend Contract v1.1
- Composition Root (`academyContainer.ts` — estructura de construcción del contenedor, ciclo de vida singleton)
- CQRS (separación Command/Query, regla "todo Query Handler usa EXCLUSIVAMENTE `AcademyReadModelPort`")
- DDD (límites de Aggregate, invariantes de Domain)
- Clean Architecture (dirección de dependencias entre capas)
- SOLID (responsabilidades ya asignadas por capa/clase)
- Eventos de Domain (`UnitStarted`, `ReflectionCompleted`, etc., y su propagación vía Outbox)
- Commands (los 18 ya definidos, sus DTO de request)
- Queries (las 9 ya definidas, incluidos los 3 Request DTO ya extendidos con `studentId` por la remediación H-01 — esa extensión queda fija, no reabierta)
- DTO públicos (Response DTO consumidos por Frontend según el Frontend Contract)
- Endpoints públicos (los 23 de `/api/v1/academy/*` + 3 de Health)
- Modelo de datos (schema Prisma de las tablas de Academia y sus relaciones)
- Contratos OpenAPI (`academy.openapi.json`)

---

## Pending Runtime Validation

**Único pendiente real y bloqueante identificado (no se incluyen mejoras futuras, solo bloqueadores existentes):**

La ejecución en tiempo real de la validación de la remediación H-01 (Sprint 6.3.3) nunca se completó — concluyó explícitamente `VALIDATION NOT EXECUTABLE` por ausencia, en el entorno de trabajo, de: instancia PostgreSQL activa con `DATABASE_URL` real, `node_modules` del proyecto instalado (`npm install`), Prisma Client generado contra una base de datos real, servidor Next.js en ejecución, credenciales/sesión de Clerk (JWT real de prueba), y datos de prueba (seed con al menos 2 estudiantes con recursos propios cada uno). Como consecuencia:

- No existe evidencia de ejecución real de que el BOLA (OWASP API1:2023) haya desaparecido de EP-14, EP-16 y EP-18 — solo evidencia estática de código (trazabilidad de tipos y de lectura de la implementación).
- No existe evidencia de ejecución real de que EP-01, EP-03 y EP-05 (regresión) sigan comportándose igual que antes de la remediación.
- El Definition of Done del Blueprint Sprint 6.3.1 tiene 4 de 7 criterios cumplidos y 3 de 7 no verificables sin runtime (ver Sprint 6.3.3).

Este es el **único bloqueador real** que impide certificar el cierre funcional de H-01 y, por extensión, impide clasificar el proyecto como "Release Candidate" o superior. No es una decisión arquitectónica pendiente (el diseño está aprobado y sin discusión abierta) — es una brecha operativa de entorno de verificación.

---

## Release Status

### Estado del repositorio: **Code Freeze**

Justificación exclusivamente con evidencia ya registrada en esta cadena de auditoría:
- Todos los documentos de diseño (Functional Spec, Domain/Application/Infrastructure Model, API/Frontend Contract) están en su versión final Frozen, sin ninguna discusión arquitectónica abierta (confirmado explícitamente en el contexto de este mismo encargo: "No existen decisiones arquitectónicas pendientes que bloqueen el desarrollo").
- El código de Academia (incluida la remediación H-01) está implementado y compila sin errores nuevos (`tsc --noEmit`, Sprint 6.3.2).
- No existe ningún ciclo de QA/runtime ejecutado — ni para H-01 ni, según lo revisado en esta y en sesiones previas, para ningún otro endpoint de Academia (no se encontró ningún archivo `*.test.ts`/`*.spec.ts` en `features/academy` en ningún punto de esta auditoría).
- No se cumple el criterio de "Release Candidate" (exigiría al menos una ronda de QA/runtime ejecutada con resultado registrado) ni el de "Production Ready" (exigiría, además, staging validado). Tampoco es simplemente "Development" (el diseño y la implementación de la baseline actual están terminados, no en curso) ni "Feature Complete" en el sentido estricto de QA (esa etiqueta suele presuponer que lo implementado ya fue ejercitado funcionalmente, lo cual no se ha demostrado).

### Próximo Sprint — Sprint 6.3.4 (propuesto, limitado a Runtime Validation / QA / CI)

Único alcance permitido, sin desarrollo funcional nuevo:
1. Aprovisionar un entorno de ejecución (PostgreSQL real o efímero de CI, `node_modules` instalado, Prisma Client generado, Clerk en modo test o doble de autenticación).
2. Ejecutar un seed con al menos 2 estudiantes y datos cruzados (unidades/intentos de cada uno) suficiente para ejercitar el Caso 2 (recurso ajeno) de Sprint 6.3.3.
3. Ejecutar los 7 casos de verificación funcional y los 3 de regresión (EP-01/03/05) ya especificados en el Runtime Validation Report de Sprint 6.3.3, sin modificar código salvo que se descubra un defecto de implementación (no de diseño) — en cuyo caso aplica como "corrección de bugs" (permitida sin ACP, ver Configuration Rules).
4. Emitir una auditoría de cierre (mismo método que ACA-003/004) que certifique, con evidencia de ejecución real, `H-01 DESCARTADO` o, si la ejecución revela un defecto, reabra el hallazgo con evidencia.
5. Solo tras esa certificación, reevaluar si el repositorio puede reclasificarse como "Release Candidate".

---

## Configuration Rules

A partir de esta congelación, toda modificación posterior al código, contratos, arquitectura o documentos Frozen listados arriba debe:

1. **Abrir un ACP** formal (numerado consecutivamente tras ACP-003) antes de cualquier cambio de diseño, contrato o arquitectura.
2. **Indicar impacto** explícito: qué capa(s) (Domain/Application/Infrastructure/API/Frontend), qué endpoints, qué Commands/Queries/DTO/Eventos se ven afectados.
3. **Identificar documentos afectados**: cuál(es) de los documentos Frozen listados en "Baseline Summary" quedarían Superseded por el cambio propuesto, y qué nueva versión los reemplazaría.
4. **Actualizar versiones**: todo documento modificado sube de versión (p. ej. API Contract v1.3 → v1.4) — nunca se edita un documento Frozen in place sin nueva numeración.
5. **Registrar compatibilidad**: declarar explícitamente si el cambio es compatible hacia atrás (aditivo, campos opcionales) o si requiere una versión de API nueva (`/v2/`), siguiendo la estrategia de versionado ya definida en API Contract v1.3 Sección 10.
6. **Mantener trazabilidad**: todo ACP debe referenciar el/los hallazgo(s) u origen que lo motiva (auditoría, incidente, requisito de negocio) y quedar enlazado a los Sprints/Blueprints que lo implementen, siguiendo exactamente el patrón ya usado por H-01 (ACA-001→002→003→004→ACP-002→Blueprint→Implementación→Validación).

### Cambios permitidos SIN abrir un ACP

- Corrección de bugs que no alteren contratos, DTO públicos, endpoints ni reglas de negocio ya documentadas (incluye defectos que la Runtime Validation pendiente pudiera descubrir en la implementación de H-01, siempre que la corrección no cambie el enfoque aprobado en ACP-002).
- Creación y ejecución de pruebas (unitarias, de aplicación, integración, autorización, regresión, seguridad).
- Documentación (comentarios de código, READMEs, este mismo tipo de informes de auditoría/gobernanza).
- Logging y observabilidad (siempre que no introduzcan una dependencia de infraestructura nueva no autorizada — ver H-14 de ACA-002, aún sin resolver y fuera de alcance de un ACP dado que no hay documento Frozen que lo exija).
- Configuración (variables de entorno, umbrales no funcionales).
- Optimización de rendimiento sin cambio de comportamiento observable (p. ej. índices adicionales, siempre que no alteren el modelo de datos ya Frozen en su forma, solo en su rendimiento).

### Cambios que requieren obligatoriamente un ACP

- Nuevos endpoints o eliminación/renombrado de endpoints existentes.
- Cambio de cualquier contrato (API Contract, Frontend Contract, OpenAPI, DTO público).
- Nuevos Commands o Queries, o cambio de firma de los 18+9 ya existentes (más allá de lo ya congelado por la remediación H-01).
- Cambios de Aggregate, Entidad o relación del Domain Model.
- Cambios de relaciones en el modelo de datos (Prisma schema).
- Cambios en la separación CQRS (p. ej., permitir que un Query Handler use un Repository, exactamente la Opción A descartada en ACP-002).
- Cambios de puertos de Application (`AcademyReadModelPort` y los demás).
- Cambios de arquitectura (Composition Root, patrón de Service Locator ya documentado como deuda en H-02 — su remediación futura, si se decide abordar, requiere su propio ACP).
- Cambios de seguridad o autorización (cualquier modificación a `resolveAcademyActor`, `requireRole`, `AcademyAuthorizationGuard`, o al mecanismo de ownership recién introducido por H-01).
- Cambios de eventos de Domain (nuevos eventos, cambio de payload de los ya existentes, cambio del patrón de dos transacciones).

---

## Final Recommendation

Congelar formalmente la baseline de diseño y arquitectura de Academia — no existe ninguna decisión técnica pendiente que la bloquee, y la cadena completa de documentos (Functional Specification → ... → Composition Root Bootstrap) está en su versión final consistente. Simultáneamente, declarar explícitamente que el Code Freeze actual **no equivale a un cierre funcional certificado de H-01**: el único trabajo pendiente antes de avanzar a Release Candidate es puramente operativo (aprovisionar entorno y ejecutar el Runtime Validation ya especificado en Sprint 6.3.3), no una decisión de diseño. Se recomienda que el Sprint 6.3.4 (Runtime Validation / QA / CI) sea el próximo Sprint autorizado, y que ningún Sprint de nuevo desarrollo funcional (p. ej. Sprint 6.4 Frontend Integration) inicie antes de que esa validación quede certificada con evidencia de ejecución real.

---

## Veredicto Final

B) PROJECT FROZEN WITH BLOCKERS

Justificación con evidencia existente: la baseline de arquitectura, contratos y documentos de diseño no tiene ninguna decisión pendiente (confirmado en el contexto de este mismo encargo y en la cadena completa ACA-001 a Sprint 6.3.2) y puede congelarse sin reservas. Sin embargo, existe un bloqueador real y ya documentado — la Runtime Validation de la remediación H-01 (Sprint 6.3.3) concluyó formalmente `VALIDATION NOT EXECUTABLE`, no `VALIDATION PASSED` — que impide certificar que el propio código ya congelado se comporta como fue diseñado. Congelar sin señalar este bloqueador ocultaría el único pendiente real del proyecto; rechazar el freeze por completo ignoraría que el bloqueador es operativo (entorno de ejecución), no arquitectónico, y por tanto no invalida la baseline de diseño en sí.
