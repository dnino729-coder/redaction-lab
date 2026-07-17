# Auditoría de implementabilidad — módulo "Mi Plan"

**Rol:** Principal Software Architect / Staff Engineer / Technical Auditor. **Fecha:** 2026-07-17.
**Pregunta única de esta auditoría:** ¿puede un desarrollador iniciar el Sprint 1 de Mi Plan sin improvisar ninguna decisión técnica, funcional o arquitectónica?
**Fuente de verdad:** `02_Conocimiento_Consolidado_Resuelto.md` (Resoluciones 18.1–18.20), `docs/audits/mi-plan-functional-audit-2026-07-17.md` (Fase 3.1), `docs/modules/mi-plan.md` (Fase 3.2), y el estado real del repositorio (`prisma/schema.prisma`, migraciones existentes, `ARCHITECTURE.md`, `features/my-plan/`). No se modifica ninguna resolución existente. No se proponen funcionalidades nuevas.

---

# 1. Cobertura funcional

| # | Funcionalidad | Estado | Evidencia documental | Observaciones |
|---|---|---|---|---|
| 1 | Creación automática del plan inicial | **Completa** | 12.4; 18.20.4 (transición atómica); 18.20.6 (seed desde `LearningPreference`) | Sin vacíos abiertos. |
| 2 | Cuenta regresiva al examen | **Completa** | `StudentProfile.target_exam_date` (ya en `schema.prisma`) | Dato ya disponible en producción. |
| 3 | Horas estudiadas vs. recomendadas | **Completa** | `DailyPlan`/`WeeklyPlan` (13.4, ya en `schema.prisma`) | Sin vacíos. |
| 4 | Calendario de entrenamiento completo | **Completa** | 18.20.1 (bloque 2 de 5) | Sin vacíos. |
| 5 | % de avance del plan | **Completa** | 13.4 (cálculo automático), `LearningProgress` ya en `schema.prisma` | Sin vacíos. |
| 6 | Metas semanales | **Completa** | `WeeklyPlan` (13.4) | Sin vacíos. |
| 7 | Objetivos personalizados (`LearningGoal`/`LearningObjective`) | **Parcial** | 13.4 (entidades y relación 1:N completas) | El campo `status` de ambas tablas no tiene valores de ENUM definidos en ningún documento (ver sección 2). |
| 8 | Fases y tareas (`LearningPhase`/`LearningTask`) | **Parcial** | 13.4 + 18.20.5 (`LearningTask.source`) | Mismo vacío de `status` sin ENUM; además, `completed_at` y `status` conviven sin regla de sincronización (ver sección 2). |
| 9 | Configuración de horario (`StudySchedule`) | **Completa** | 13.4 + 18.20.6 (relación con `LearningPreference`) | Sin vacíos. |
| 10 | Registro de sesiones de estudio (`StudySession`) | **Completa** | 13.4 (`completed` es BOOLEAN, sin ambigüedad de tipo) | Sin vacíos. |
| 11 | Reprogramación manual del plan | **Parcial** | 18.20.2 (flujo propuesta+confirmación cerrado) | El contrato/DTO exacto de la "propuesta" que entrega el Learning Planner no está definido (ver secciones 5 y 6). |
| 12 | Reorganización automática por inactividad | **Completa** (funcionalmente) | 18.20.3 (umbral: 3 días) | El mecanismo técnico del job (cron, cola, etc.) no está definido — correctamente delegado a Sprint 1 como decisión de implementación, no de negocio. |
| 13 | Generación adaptativa del calendario (Learning Planner) | **Parcial** | 18.20.8 (3 disparadores cerrados, autoridad del Motor Pedagógico) | Igual que el punto 11: falta el contrato de datos de entrada/salida del servicio. |
| 14 | Vista resumida en el Dashboard | **Completa** | Ya en producción (`features/dashboard`, namespace `dashboard.plan`) | Sin cambios requeridos. |
| 15 | Estado "sin plan activo" | **Completa** | 18.20.4 (tratado como estado defensivo, no como flujo de producto) | Sin vacíos. |

**Resumen:** 11 de 15 funcionalidades completamente especificadas; 4 en estado parcial, todas por la misma causa raíz (contrato de datos del Learning Planner y ENUM de `status` sin enumerar) — no por ausencia de decisión funcional.

---

# 2. Modelo de dominio

Las 10 entidades de 13.4 tienen atributos, relaciones y cardinalidades completos y sin contradicciones (User 1:N LearningPlan; LearningPlan 1:N LearningGoal/LearningPhase/DailyPlan/WeeklyPlan; LearningPlan 1:1 StudySchedule/LearningProgress; LearningGoal 1:N LearningObjective; LearningPhase 1:N LearningTask; LearningTask 1:N StudySession; User 1:N StudySession). El ciclo de vida a nivel de agregado (plan → hijas) está resuelto por 18.20.7: sin eliminación, vigencia derivada de `LearningPlan.status`.

**Vacíos detectados en esta auditoría (no identificados en Fases 3.1/3.2):**

1. **`status` sin ENUM enumerado en 4 de las 6 entidades nuevas.** 13.4 define `LearningGoal.status`, `LearningObjective.status`, `LearningPhase.status` y `LearningTask.status` como campo `status` a secas, sin listar sus valores — a diferencia de `LearningPlan.status` (`ACTIVE, PAUSED, COMPLETED, CANCELLED`, sí enumerado) o `LearningTask.difficulty` (`EASY, MEDIUM, HARD, EXPERT`, sí enumerado) en la misma ficha. Un desarrollador que llegue a `CREATE TYPE` para estas 4 tablas tendría que inventar los valores — exactamente el tipo de improvisación que esta auditoría debe detectar.
2. **Redundancia sin regla entre `completed_at` (nullable) y `status` en `LearningGoal`/`LearningObjective`/`LearningPhase`/`LearningTask`.** Ambas columnas parecen señalizar lo mismo (si algo está completado) sin que el documento aclare si son independientes, si `completed_at IS NOT NULL` debe implicar necesariamente `status = COMPLETED` (una vez enumerado), o si `status` cubre más estados que solo completado/pendiente. Relacionado directamente con el vacío 1.
3. **`LearningTask.source` (18.20.5) no está reflejado en el listado de atributos de 13.4** — es una extensión ya decidida y justificada, pero cualquier lectura de 13.4 en aislado (sin cruzar con 18.20) seguiría sin mostrarlo. No es un vacío de decisión (ya está resuelto), es un vacío de consolidación documental: 13.4 no fue editado para incorporar la extensión, solo se registró en 18.20/`mi-plan.md`.

Ninguno de los tres vacíos anteriores contradice una decisión ya tomada; los tres son omisiones no detectadas en las fases previas.

---

# 3. Modelo de datos

| Elemento | Estado | Detalle |
|---|---|---|
| `schema.prisma` | **Parcial** | 4 de 10 entidades existen (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`), todas de solo lectura. Las 6 restantes no tienen modelo Prisma — confirmado (`grep model` sobre `schema.prisma`, sin resultados para `LearningGoal/Objective/Phase/Task/StudySchedule/StudySession`). |
| Migraciones | **Falta** | No existe ninguna migración para las 6 entidades nuevas (esperado — Fase 3.2 fue exclusivamente de arquitectura, sin implementación, tal como se instruyó). |
| Índices | **Completa (como patrón), pendiente de ejecución** | La convención `idx_<tabla>_<columnas>` (13.13, reforzada por la migración `202607171200_constraint_naming_standardization`) es directamente aplicable sin ambigüedad a las tablas nuevas. |
| Constraints | **Completa (como patrón), pendiente de ejecución** | Mismo caso: `pk_`/`fk_`/`uq_`/`ck_` ya validados y en uso — 18.20.12 ya exige aplicarlo desde el origen. Sin decisión pendiente. |
| RLS | **Incompleta** | Las 4 tablas existentes solo tienen `GRANT SELECT` para `dashboard_app_role` (confirmado en `202607170900_dashboard_rls_policies/migration.sql`) — ninguna política de escritura (`INSERT`/`UPDATE`) existe todavía para el propio estudiante sobre su fila. Las 6 tablas nuevas no tienen ninguna política. El **patrón** a seguir está totalmente definido y validado empíricamente (mismo mecanismo `SET LOCAL ROLE dashboard_app_role` + `current_student_id()` ya probado con PGlite para lectura) — no hay decisión de diseño pendiente, solo ejecución. |
| Relaciones | **Completa** | Sin ambigüedad, ver sección 2. |

**Conclusión de esta sección:** no existe ninguna decisión de modelado de datos pendiente; lo que falta es exclusivamente trabajo de Sprint 1 (crear la migración, aplicar el patrón ya probado), con la única excepción real de los ENUM sin enumerar (sección 2, vacío 1), que sí es una decisión pendiente y no una tarea de ejecución.

---

# 4. Casos de uso

Base: los 6 casos de uso de la Fase 3.1 (`CU-01` a `CU-06`).

| Caso de uso | Estado | Nota |
|---|---|---|
| CU-01 — Consultar el plan activo | **Completo** | Sin cambios necesarios tras 18.20. |
| CU-02 — Completar una tarea del plan | **Incompleto (desactualizado)** | El texto original de la Fase 3.1 no refleja la regla de 18.20.5 (`source`): el flujo principal debía reescribirse para bifurcar entre finalización manual (`SELF_DIRECTED`) y finalización exclusivamente automática (cualquier otro `source`). La decisión ya existe (18.20.5); el caso de uso, como documento, no fue actualizado para incorporarla — riesgo de que un desarrollador lea solo `CU-02` y no cruce con 18.20. |
| CU-03 — Reorganización automática por inactividad | **Completo** | El umbral (3 días) ya cierra la única ambigüedad que tenía. |
| CU-04 — Reprogramar el plan manualmente | **Incompleto** | El flujo de dos pasos (propuesta + confirmación) ya está definido (18.20.2), pero el caso de uso no especifica el contenido exacto de la "propuesta" mostrada al estudiante — depende del contrato del Learning Planner, no definido (sección 6). |
| CU-05 — Creación automática del plan inicial | **Completo** | Cerrado por 18.20.4/18.20.6. |
| CU-06 — Registrar una sesión de estudio | **Completo** | Sin ambigüedad. |
| *(No existe)* Consultar historial de planes no activos | **Inexistente — deliberadamente fuera de alcance** | 18.20 (nota de la decisión 7) declara explícitamente esta consulta fuera del alcance funcional de esta fase. No es un vacío, es una exclusión documentada. |

---

# 5. APIs

| Elemento | Estado | Detalle |
|---|---|---|
| Endpoints | **Parcial** | 12 operaciones identificadas (Fase 3.1, sección 9) a nivel de propósito ("obtener plan activo", "marcar tarea completada", etc.). Ninguna tiene ruta, verbo HTTP o forma (Route Handler vs. Server Action) asignada — decisión de implementación normal, no bloqueante por sí sola. |
| Contratos / DTO | **Falta** | Ningún documento define la forma exacta de request/response de ninguna operación, ni el DTO de la "propuesta" del Learning Planner (el más crítico, por ser insumo directo de una decisión que ve y confirma el estudiante). |
| Errores | **Falta** | No existe, ni en la documentación de Mi Plan ni en el resto del proyecto auditado hasta ahora, un contrato de error estándar (formato de código/mensaje) para las APIs — vacío heredado del proyecto en general, no exclusivo de Mi Plan, pero que Mi Plan tampoco cierra. |
| Respuestas | **Falta** | Mismo caso que Contratos/DTO. |
| Autenticación | **Completa** | Reutiliza el mecanismo ya implementado y probado end-to-end para el Dashboard (Clerk + webhook de aprovisionamiento + resolución `clerkUserId → studentId`). Sin decisión pendiente. |
| Autorización | **Parcial** | El patrón RLS de aislamiento por estudiante está probado para lectura; su extensión a escritura es mecánica (sección 3) pero no está aún expresada como política SQL. |
| Validaciones | **Falta (esperado)** | Ninguna regla de validación de campo (rangos de fecha, longitud de texto, etc.) está especificada más allá de las restricciones CHECK ya genéricas del proyecto (13.12: "porcentajes 0-100"). Es trabajo normal de Sprint 1, no una decisión de producto pendiente. |

---

# 6. Eventos de dominio

Los 5 eventos definidos en `docs/modules/mi-plan.md` (sección 2.9): `PLAN_CREATED`, `PLAN_TASK_COMPLETED`, `PLAN_REORGANIZATION_REQUESTED`, `PLAN_INACTIVITY_THRESHOLD_REACHED`, `EXTERNAL_ACTIVITY_COMPLETED`.

| Evento | Productor | Consumidor | Payload | Disparador | Persistencia |
|---|---|---|---|---|---|
| `PLAN_CREATED` | Servicio de creación de planes | Dashboard (indirecto), Notificaciones | Definido (conceptual) | Definido | **No definida** |
| `PLAN_TASK_COMPLETED` | Servicio de finalización de tareas | Gamificación, Evolución | Definido (conceptual) | Definido | **No definida** |
| `PLAN_REORGANIZATION_REQUESTED` | Servicio de reprogramación | Learning Planner | Definido (conceptual) | Definido | **No definida** |
| `PLAN_INACTIVITY_THRESHOLD_REACHED` | Job de reorganización automática | Learning Planner, Coach IA | Definido (conceptual) | Definido | **No definida** |
| `EXTERNAL_ACTIVITY_COMPLETED` | Academia/Laboratorio/Entrenamiento/Simulador | Servicio de finalización de tareas | Definido (conceptual) | Definido | **No definida** |

**Ningún evento está huérfano** — los 5 tienen productor y consumidor nombrados sin ambigüedad. Sin embargo, **ninguno de los 5 tiene definido su mecanismo de persistencia/entrega**, y esto no es un olvido menor: `ARCHITECTURE.md` (sección 7, regla 3) declara explícitamente que la comunicación entre features pasa "por `services/` o por el Motor de Orquestación **cuando exista**" — es decir, el propio proyecto documenta que el Motor de Orquestación (la pieza que naturalmente implementaría estos eventos como tal) **no existe todavía**. Hoy, el único mecanismo de comunicación entre módulos realmente implementado es la llamada directa a funciones de `services/` compartidos (patrón usado por Dashboard con `services/database`, `services/gamification`, `services/analytics`).

**Consecuencia:** para que estos 5 eventos sean implementables sin improvisar, falta una decisión explícita de **cómo se materializan en esta fase del proyecto** — por ejemplo (sin que esta auditoría proponga cuál elegir, por estar fuera de su mandato): llamada síncrona directa a una función de servicio (igual que el resto del proyecto hoy), tabla de outbox con procesamiento posterior, o cola real. Sin esa decisión, un desarrollador de Sprint 1 tendría que elegirla por su cuenta.

---

# 7. Integración entre módulos

| Módulo | Estado | Detalle |
|---|---|---|
| Dashboard | **Completa** | Contrato de solo lectura ya implementado y sin cambios exigidos (18.20.10 lo confirma explícitamente). |
| Laboratorio | **Parcial** | Mi Plan define qué espera recibir (`EXTERNAL_ACTIVITY_COMPLETED`), pero Laboratorio no tiene auditoría ni especificación propia todavía — el contrato es unilateral, no confirmado por un módulo que aún no existe. No bloquea el Sprint 1 de Mi Plan (puede implementarse el receptor sin emisores reales todavía), pero es una dependencia externa abierta. |
| Learning Planner | **Parcial** | Disparadores y autoridad de decisión cerrados (18.20.8); contrato de datos no definido (secciones 5 y 6). |
| Gamificación | **Parcial** | Evento y límite de responsabilidad ya definidos (18.20.10); la propia resolución 18.20 ya señala como pendiente confirmar si `services/gamification` soporta hoy consumir un evento externo — auto-declarado, no es un hallazgo nuevo de esta auditoría. |
| Evaluación | **Incompleta** | La secuencia de 5.7 obliga a que Mi Plan se actualice tras evaluarse una producción escrita, pero no se especifica si ese disparo usa `EXTERNAL_ACTIVITY_COMPLETED` o un evento distinto — Evaluación tampoco tiene auditoría propia todavía. |
| Perfil | **Completa** | Relación acotada y sin ambigüedad (18.20.6). |
| Configuración | **Baja prioridad, sin cerrar** | Solo tocada tangencialmente vía `NotificationPreference` (recordatorios) — no bloqueante para Sprint 1. |
| Panel Docente | **Incompleta** | Sin relación documentada en ninguna fase — aceptable en la medida en que Panel Docente tampoco está especificado ni implementado; se señala para que no se dé por evaluado implícitamente. |
| Base de Datos | Ver sección 3. | |
| Servicios | **Parcial** | Los servicios lógicos de Mi Plan están nombrados y su responsabilidad delimitada (`mi-plan.md`, 2.4), pero ninguno tiene firma de interfaz (entrada/salida) definida — normal para esta etapa, no es una decisión de producto pendiente. |
| APIs | Ver sección 5. | |

**Dependencias no documentadas detectadas:** la integración con Laboratorio y Evaluación depende de módulos que todavía no tienen especificación propia — no es un defecto de Mi Plan, pero sí una dependencia real que condiciona cuándo esas dos integraciones concretas (no el resto del módulo) pueden completarse.

---

# 8. Arquitectura

| Principio | ¿Se puede respetar sin nuevas decisiones? |
|---|---|
| Clean Architecture / capas (`database → repositories → services → features`) | **Sí** — patrón ya usado en Dashboard, directamente replicable. |
| SOLID | **Sí** — nada en la especificación de Mi Plan exige violar responsabilidad única o inversión de dependencias; los servicios ya están delimitados por responsabilidad (2.4 de `mi-plan.md`). |
| DDD (entidades, agregados, reglas dentro del dominio) | **Sí** — el agregado `LearningPlan` y sus hijas, con reglas de invariancia ya declaradas (13.4 + 18.20.7), es un agregado DDD coherente. |
| Repository Pattern | **Sí** — mismo patrón `database/queries → database/repositories` ya validado. |
| Service Layer | **Sí** — servicios ya nombrados y delimitados. |
| RLS | **Sí, como patrón** — ver sección 3; sin decisión de diseño pendiente, solo ejecución. |
| Prisma | **Sí** — convención de nomenclatura y `map:` ya resuelta y en uso (18.20.12). |
| Eventos | **No** — es la única excepción real de esta lista. Implementar los 5 eventos de 18.20.10 tal como están descritos requiere, como mínimo, decidir su mecanismo de entrega/persistencia (sección 6), algo que ARCHITECTURE.md reconoce explícitamente como infraestructura aún no existente en el proyecto ("Motor de Orquestación... cuando exista"). |

**Conclusión:** 7 de 8 principios pueden respetarse sin ninguna decisión adicional. El octavo (eventos) es el único punto de la arquitectura de Mi Plan que, tal como está especificado hoy, no puede implementarse sin que alguien —dentro o fuera del alcance de esta auditoría— decida el mecanismo técnico de entrega.

---

# 9. Seguridad

| Aspecto | Estado | Detalle |
|---|---|---|
| Autenticación | **Completa** | Clerk, ya implementado y validado para todo el proyecto. |
| Autorización | **Parcial** | Patrón de aislamiento por estudiante (RLS + `SET LOCAL ROLE`) probado para lectura; falta ejecutar (no decidir) su extensión a escritura. |
| RLS | Ver sección 3. | |
| Permisos/roles | **Completa** | No se requiere ningún rol de Postgres nuevo — extender el `GRANT` de `dashboard_app_role` ya existente (de `SELECT` a `SELECT, INSERT, UPDATE`) es suficiente, siguiendo exactamente el patrón ya usado y auditado para `dashboard_service_role` sobre `"user"`. |
| Eventos | **Parcial** | El mecanismo de entrega no definido (sección 6) también deja sin definir bajo qué rol de base de datos se ejecutarían las escrituras que un evento dispare (p. ej., ¿la actualización de `LearningProgress` tras `PLAN_TASK_COMPLETED` corre con `dashboard_app_role` o requiere un contexto de servicio tipo `dashboard_service_role`?) — pregunta derivada del mismo vacío, no uno nuevo. |
| Protección de datos | **Completa** | Ninguna entidad nueva introduce datos sensibles distintos a los ya cubiertos por el modelo de RLS existente (todas se resuelven por `student_id`, mismo patrón ya protegido). |

---

# 10. Implementabilidad

**¿Puede comenzar la implementación completa del Sprint 1 (todo lo definido en 18.20) sin tomar nuevas decisiones? NO.**

Faltan exactamente estas decisiones, no más:

1. **Valores del ENUM `status`** para `LearningGoal`, `LearningObjective`, `LearningPhase` y `LearningTask` (13.4 los deja sin enumerar; sección 2 de esta auditoría).
2. **Regla de relación entre `completed_at` y `status`** en esas mismas 4 entidades (sección 2).
3. **Mecanismo técnico de persistencia/entrega de los 5 eventos de dominio** de 18.20.10 (sección 6) — no cuál tecnología usar en abstracto, sino si para esta fase del proyecto se implementan como llamada síncrona directa a servicio (patrón ya vigente) o como un mecanismo nuevo.
4. **Contrato de datos (DTO) de la propuesta del Learning Planner** — entrada y salida exactas del servicio que consumen el flujo de reprogramación (18.20.2) y el de reorganización automática (18.20.8).
5. **Contrato de error estándar de las APIs** — vacío heredado del proyecto general, no resuelto tampoco por Mi Plan.

**Sin embargo, un subconjunto acotado del Sprint 1 sí puede comenzar hoy sin improvisar ninguna decisión:** todo lo relativo a modelo de datos, migración, RLS de lectura/escritura básica y los 3 bloques de información que no dependen del Learning Planner ni de eventos entre ecosistemas (Resumen, Calendario, Configuración de horario) tiene especificación completa y patrones ya probados para copiar. Los bloques de Objetivos/Fases-Tareas requieren primero cerrar las decisiones 1 y 2. La reprogramación (bloque 5, parte del flujo) y cualquier consumo real de eventos externos requieren cerrar las decisiones 3 y 4 antes de codificarse.

---

# 11. Riesgos

**CRÍTICOS**

Ninguno detectado. A diferencia de auditorías previas del proyecto (bloqueantes de Auth/RLS sobre código ya en producción), Mi Plan no tiene código implementado todavía — no existe superficie donde un riesgo pueda materializarse como falla de seguridad o de datos en producción hoy mismo.

**ALTOS**

- **Mecanismo de persistencia de eventos no definido.** Impacto: bloquea la implementación literal de 18.20.10 tal como está redactada; riesgo de que Sprint 1 invente un mecanismo ad-hoc incompatible con un futuro Motor de Orquestación. Probabilidad: alta si se avanza sin resolverlo. Recomendación: decidir explícitamente, antes de tocar código, si los 5 eventos se implementan como llamadas síncronas a `services/` (patrón ya vigente en todo el proyecto) para esta fase, dejando la migración a un mecanismo de eventos real como decisión futura y explícita, no implícita.
- **ENUM `status` sin valores en 4 entidades.** Impacto: bloquea literalmente la migración inicial de esas tablas — no se puede escribir `CREATE TYPE ... AS ENUM (...)` sin los valores. Probabilidad: certeza (se necesita en el primer `CREATE TABLE`). Recomendación: cerrar como una resolución adicional puntual antes de iniciar la migración de Mi Plan.
- **Contrato del Learning Planner no definido.** Impacto: bloquea específicamente reprogramación y reorganización automática (no el resto del módulo). Probabilidad: alta si esas funcionalidades se incluyen en el primer sprint. Recomendación: si el Sprint 1 no necesita cubrir reprogramación/reorganización de extremo a extremo, excluirlas explícitamente del alcance del sprint y resolver el contrato en paralelo.

**MEDIOS**

- **Redundancia `completed_at`/`status` sin regla.** Impacto: inconsistencia de datos si se implementan ambos campos sin sincronización. Probabilidad: media. Recomendación: resolver junto con el vacío del ENUM (mismo origen).
- **Integración con Laboratorio/Evaluación no confirmada del lado emisor.** Impacto: el receptor de Mi Plan puede quedar sin tráfico real hasta que esos módulos existan. Probabilidad: alta pero de bajo daño (no bloquea Mi Plan, solo pospone su utilidad plena). Recomendación: implementar el receptor de forma tolerante a la ausencia de emisores, sin bloquear el resto del módulo por su ausencia.
- **`CU-02` (Fase 3.1) desactualizado frente a 18.20.5.** Impacto: un desarrollador que lea solo el caso de uso original puede pasar por alto la restricción de `source`. Probabilidad: media. Recomendación: al iniciar Sprint 1, leer `CU-02` junto con 18.20.5, no de forma aislada (no requiere reabrir ni reescribir el documento de la Fase 3.1, que se conserva sin modificar).
- **Ausencia de contrato de error estándar de API a nivel de proyecto.** Impacto: Mi Plan podría implementar un formato de error distinto al de futuros módulos. Probabilidad: media. Recomendación: definirlo como decisión transversal del proyecto, no exclusiva de Mi Plan.

**BAJOS**

- **Panel Docente sin relación documentada.** Impacto: ninguno inmediato, ese módulo no existe. Recomendación: revisar cuando Panel Docente tenga su propia especificación.
- **Validaciones de campo no especificadas.** Impacto: bajo, es trabajo normal de Sprint 1 (Zod u otro). Recomendación: ninguna acción previa requerida.
- **Estado de carga (skeleton) de Mi Plan no confirmado explícitamente.** Impacto: bajo, patrón ya existente en Dashboard es directamente reutilizable. Recomendación: replicar el patrón sin necesidad de nueva decisión.

---

# 12. Checklist final

- Cobertura funcional de las 15 funcionalidades identificadas — ⚠️ PARCIAL
- Modelo de dominio: entidades, atributos, relaciones, cardinalidades — ✅ COMPLETO
- Modelo de dominio: valores de ENUM `status` en entidades nuevas — ❌ FALTA
- Modelo de dominio: ciclo de vida de entidades hijas — ✅ COMPLETO
- `schema.prisma` con las 10 entidades de Mi Plan — ❌ FALTA
- Migración de las 6 entidades nuevas — ❌ FALTA
- Convención de nomenclatura de constraints/índices aplicable — ✅ COMPLETO
- RLS de lectura sobre entidades ya existentes — ✅ COMPLETO
- RLS de escritura sobre entidades ya existentes — ❌ FALTA
- RLS sobre entidades nuevas — ❌ FALTA
- Casos de uso definidos y vigentes — ⚠️ PARCIAL
- Endpoints identificados — ✅ COMPLETO
- Contratos/DTO de API — ❌ FALTA
- Contrato de error de API — ❌ FALTA
- Autenticación — ✅ COMPLETO
- Autorización (patrón) — ✅ COMPLETO
- Eventos de dominio: productor/consumidor/payload/disparador — ✅ COMPLETO
- Eventos de dominio: mecanismo de persistencia/entrega — ❌ FALTA
- Integración con Dashboard — ✅ COMPLETO
- Integración con Gamificación (contrato) — ✅ COMPLETO
- Integración con Laboratorio/Evaluación (confirmación externa) — ⚠️ PARCIAL
- Contrato del Learning Planner (DTO) — ❌ FALTA
- Arquitectura por capas / SOLID / DDD / Repository / Service Layer — ✅ COMPLETO
- Seguridad — roles y permisos de base de datos — ✅ COMPLETO
- Documentación consolidada (18.1–18.20) sin contradicciones internas sobre Mi Plan — ✅ COMPLETO

---

# 13. Veredicto final

## 🟡 IMPLEMENTACIÓN AUTORIZADA CON OBSERVACIONES

**Justificación técnica.** Las Fases 3.1 y 3.2 cerraron correctamente los 10 vacíos funcionales/arquitectónicos que originalmente impedían iniciar el módulo — ninguna de esas 10 decisiones quedó abierta, y esta auditoría no encontró ninguna contradicción entre ellas ni con el resto del documento consolidado. Sin embargo, esta auditoría de implementabilidad (un nivel de detalle distinto, más cercano al código, que las dos fases anteriores no cubrían por diseño) encontró **5 decisiones adicionales, concretas y acotadas**, no detectadas antes: valores de ENUM sin enumerar en 4 tablas, la relación `completed_at`/`status` sin regla, el mecanismo de persistencia de los eventos de dominio, el contrato de datos del Learning Planner, y el contrato de error de API. Ninguna de las 5 exige reabrir ni contradecir una resolución existente — todas son cierres puntuales del mismo tipo ya aplicado en 18.15–18.19.

**Confirmación explícita:** el desarrollador **no puede** iniciar el Sprint 1 completo (los 5 bloques de Mi Plan con reprogramación y consumo de eventos externos) sin tomar antes las 5 decisiones listadas en la sección 10. El desarrollador **sí puede** iniciar de inmediato, sin improvisar nada, el subconjunto del Sprint 1 correspondiente a modelo de datos base, RLS de lectura/escritura sobre los bloques de Resumen, Calendario y Configuración, reutilizando en su totalidad los patrones ya probados en el Dashboard. La recomendación técnica es secuenciar el Sprint 1 exactamente en ese orden: fundamento de datos primero, cierre de las 5 decisiones en paralelo, integración con Learning Planner/eventos después.
