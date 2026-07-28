# ACADEMIA — Auditoría de Cobertura Arquitectónica

**Rol:** Architecture Coverage Auditor (independiente — no autor de ningún documento auditado).
**Fecha:** 2026-07-19.
**Documentos auditados:** Product Blueprint, Arquitectura General, Platform Core Foundation (Frozen), Domain Model (Frozen), Application Model (Frozen), Academia Functional Specification (Frozen), Academia Infrastructure Model (Frozen), Academia API Contract (Review).
**Naturaleza de esta auditoría:** verificación de trazabilidad y cobertura. No se modifica, corrige, optimiza ni diseña nada. Todo elemento no trazable explícitamente se marca **SIN COBERTURA**, nunca se asume.

---

## ADENDA DE ACTUALIZACIÓN — 2026-07-20 (Reconciliación Documental, Sprint 4.2.2)

**Motivo:** entre la fecha original de esta auditoría (2026-07-19) y esta adenda, se ejecutaron **ACP-001** (A/B/C), **ACP-002** (A/B/C) y **ACP-003**, además de la Reconciliación Documental v1.4/v1.3 (Application Model/API Contract). Esta adenda actualiza el contenido de la auditoría original **in situ** (sin generar un documento nuevo) para que refleje el estado real del proyecto a 2026-07-20, conforme a lo exigido por el Hallazgo R-01 de la Reconciliación Arquitectónica del 2026-07-20.

**Findings de esta auditoría cerrados desde 2026-07-19 (detalle en la Sección "HALLAZGOS" más abajo, cada uno anotado en su lugar original):**
- **F-01** (`CU-02` sin orquestación) — **CERRADO** por ACP-001-A (`CMD-16 AdvanceStep`, `CMD-17 VerifyComprehension`, `EP-21`, `EP-22`).
- **F-02** (ambigüedad de "grupo") — **CERRADO** por ACP-001-B (decisión oficial: no existe `Group`/`GroupId`).
- **F-09** (ambigüedad IA dinámica vs. contenido estático, Biblioteca de Modelos) — **CERRADO** por ACP-001-C (`curatorialComment`, contenido estático).

**Artefactos añadidos al proyecto desde 2026-07-19, no presentes en la versión original de esta auditoría, incorporados aquí:** `CMD-16 AdvanceStep`, `CMD-17 VerifyComprehension`, `QRY-10 GetStudentUnitHistory` (Application Model, ahora v1.4); `EP-21`, `EP-22`, `EP-23` (API Contract, ahora v1.3); `CU-12 — Revisar historial académico detallado de un estudiante` (Functional Specification, ahora v1.3).

**Findings F-03 a F-08 y F-10:** sin cambio de estado — ninguno formó parte del alcance de ACP-001/002/003; F-03 (CU-xx de Administrador) y F-08 (CH-01, `TeacherId`) permanecen abiertos, de impacto Bajo, sin bloquear implementación.

**Métricas recalculadas:** ver Sección "MÉTRICAS", actualizada más abajo con nota de recálculo.

**Dictamen actualizado:** ver Sección "DICTAMEN FINAL", actualizada más abajo.

**Lo que esta adenda NO hace:** no reevalúa el Domain Model (sin cambios desde v1.1, no afectado por ningún ACP); no reabre ninguna Matriz E/F (Infrastructure/Platform Core, sin ACP que las afecte); no modifica ninguna resolución A-01–A-10.

---

## MATRIZ A — Functional Specification → Application Model

| Caso de Uso | Command(s)/Query(ies) | Cobertura |
|---|---|---|
| CU-01 Iniciar unidad | CMD-01 StartUnit | ✓ Completa |
| CU-02 Recorrer pasos previos a la producción (incl. verificación de comprensión) | `CMD-16 AdvanceStep`, `CMD-17 VerifyComprehension` *(añadidos ACP-001-A)* | ✓ **Completa — CERRADO (ACP-001-A, adenda 2026-07-20).** Antes: ✗ SIN COBERTURA (F-01, ERROR CRÍTICO). |
| CU-03 Producir y enviar primera versión | CMD-02 SubmitProduction, CMD-03 AutosaveDraft | ✓ Completa |
| CU-04 Recibir retroalimentación | CMD-04 RecordFeedbackDelivered, QRY-05 GetVersionFeedback | ✓ Completa |
| CU-05 Reescribir | CMD-05 SubmitRevision | ✓ Completa |
| CU-06 Reflexionar y completar unidad | CMD-06 AdvanceToReflection, CMD-07 CompleteReflection | ✓ Completa |
| CU-07 Repetir unidad completada | CMD-09 RepeatUnit (+ CMD-08 EvaluateMastery, narrado en Sección 5 del Functional Spec, punto 10) | ✓ Completa |
| CU-08 Consultar Biblioteca de Modelos | QRY-06 ListModelExamplesByTextType | ✓ Completa (lectura estudiante) |
| CU-09 Revisar progreso agregado (Profesor) | QRY-07 GetStudentProgressSummary, invocado una vez por estudiante seleccionado | ✓ **Completa — CERRADO (ACP-001-B, adenda 2026-07-20).** Antes: ⚠ Parcial (F-02, AMBIGÜEDAD). Decisión oficial: no existe "grupo" como entidad; la selección múltiple es responsabilidad exclusiva del Frontend sobre la Query de estudiante individual. |
| CU-10 Forzar bloqueo o reinicio | CMD-10 ApplyTeacherOverride | ✓ Completa |
| CU-11 Recomendar unidad | CMD-11 AssignUnitToStudent | ✓ **Completa — CERRADO (ACP-001-B/ACP-002-A, adenda 2026-07-20).** Antes: ⚠ Parcial (F-02). Mismo criterio que CU-09: sin "grupo" nativo, selección múltiple orquestada por el Frontend. |
| CU-12 Revisar historial académico detallado de un estudiante (Profesor) | `QRY-10 GetStudentUnitHistory` *(añadido ACP-003)* | ✓ **Completa — nuevo desde 2026-07-20 (ACP-003, adenda).** Caso de Uso no existía en la versión original de esta auditoría. |

**Hallazgo de Matriz A adicional (dirección inversa — Commands sin CU formal):** `CMD-12/13/14` (gestión de `ModelExample`) trazan únicamente a la tabla de permisos del Administrador (Functional Spec, Sección 2), no a un Caso de Uso numerado en la Sección 7. **Sin cambio desde 2026-07-19 — ver F-03, aún abierto.** `CMD-15` (`ProvisionAcademyUnitsForStudent`) no traza a ningún Caso de Uso ni a ninguna narrativa explícita de origen. **Sin cambio — ver F-04, aún abierto.**

**Veredicto Matriz A (actualizado, adenda 2026-07-20):** 12 de 12 Casos de Uso con orquestación completa (12/12 = 100%). Los tres déficits originales (CU-02 sin cobertura; CU-09, CU-11 parciales) quedaron cerrados por ACP-001-A y ACP-001-B/ACP-002-A respectivamente; `CU-12` se incorporó completo desde su formalización (ACP-003).

---

## MATRIZ B — Application Model → Domain Model

| Command/Query | Aggregate(s)/elemento Domain usado | ¿Existe en Domain Model? | ¿Evento inventado? |
|---|---|---|---|
| CMD-01 StartUnit | `AcademyUnit`, `AttemptFactory`, `UnlockPolicy` | Sí | No — `UnitStarted` ya Frozen |
| CMD-02 SubmitProduction | `Attempt`, `Version`, `FeedbackPolicy` | Sí | No — `ProductionSubmitted`, `FeedbackRequested` ya Frozen |
| CMD-03 AutosaveDraft | `Draft` | Sí | N/A (no requiere evento) |
| CMD-04 RecordFeedbackDelivered | `Feedback` | Sí | No — `FeedbackDelivered` ya Frozen |
| CMD-05 SubmitRevision | `Attempt`, `Version`, `RevisionPolicy` | Sí | No — `RevisionStarted` ya Frozen |
| CMD-06 AdvanceToReflection | `Attempt`, `UnitStep` | Sí | No — `ReflectionStarted` ya Frozen |
| CMD-07 CompleteReflection | `Attempt`, `AcademyUnit`, `CompletionPolicy` | Sí | No — `ReflectionCompleted`, `UnitCompleted` ya Frozen |
| CMD-08 EvaluateMastery | `MasteryPolicy`, `MasteryEvaluationService`, `MasteryEligibleSpecification` | Sí | No — `UnitMastered` ya Frozen |
| CMD-09 RepeatUnit | `AcademyUnit`, `RepetitionPolicy`, `RepeatableSpecification` | Sí | No — `UnitRepeated` ya Frozen |
| CMD-10 ApplyTeacherOverride | `TeacherOverride`, `TeacherOverridePolicy` | Sí | No — `TeacherOverrideApplied` ya Frozen |
| CMD-11 AssignUnitToStudent (recomendar) | *(ninguno — deliberado, resolución ARB)* | N/A por diseño | N/A — no aplica |
| CMD-12/13/14 (ModelExample CRUD) | `ModelExample` | Sí | N/A (contenido editorial, sin evento de dominio) |
| CMD-15 ProvisionAcademyUnitsForStudent | `AcademyUnitFactory` | Sí | N/A |
| CMD-16 AdvanceStep *(añadido ACP-001-A, adenda 2026-07-20)* | `Attempt` | Sí | N/A (mismo criterio de granularidad que `CMD-03`) |
| CMD-17 VerifyComprehension *(añadido ACP-001-A, adenda 2026-07-20)* | `Attempt` | Sí | N/A |
| QRY-01 a QRY-07, QRY-09 *(QRY-08 retirada, ACP-002-B)* | `AcademyUnit`, `Attempt`, `Draft`, `Feedback`, `ModelExample` (según cada query) | Sí, en todos los casos | N/A |
| QRY-10 GetStudentUnitHistory *(añadida ACP-003, adenda 2026-07-20)* | `AcademyUnit`, `Attempt` (reutiliza exclusivamente Repositories ya existentes) | Sí | N/A |

**Veredicto Matriz B (actualizado, adenda 2026-07-20):** cumple en su totalidad, incluidos los tres elementos añadidos desde 2026-07-19. Ningún Command exige un Aggregate inexistente. Ninguna Query consulta información no disponible. Ningún evento fue inventado. El caso `CMD-11` sin uso de Aggregate es un diseño deliberado ya validado (IRB de Infraestructura, Pendiente 1), no una anomalía.

---

## MATRIZ C — Application Model → API Contract

| Elemento Application | Endpoint API | Estado |
|---|---|---|
| CMD-01 | EP-01 | ✓ |
| CMD-02 / CMD-05 | EP-03 | ✓ |
| CMD-03 | EP-02 | ✓ |
| CMD-04 | *(interno, sin endpoint)* | ✓ Exclusión deliberada, documentada |
| CMD-06 | EP-04 | ✓ |
| CMD-07 | EP-05 | ✓ |
| CMD-08 | *(interno, sin endpoint)* | ✓ Exclusión deliberada, documentada |
| CMD-09 | EP-06 | ✓ |
| CMD-10 | EP-07 | ✓ |
| CMD-11 | EP-08 | ✓ (alcance individual únicamente, ver Matriz A) |
| CMD-12/13/14 | EP-09/10/11 | ✓ |
| CMD-15 | *(interno, sin endpoint)* | ✓ Exclusión deliberada, documentada |
| CMD-16 *(añadido ACP-001-A)* | EP-21 | ✓ |
| CMD-17 *(añadido ACP-001-A)* | EP-22 | ✓ |
| QRY-01 a QRY-07, QRY-09 *(QRY-08 retirada, ACP-002-B)* | EP-12 a EP-20 | ✓, uno a uno — **corregido en la Reconciliación Documental v1.3 del API Contract (2026-07-20, R-04):** las nueve referencias "Dependencias" de `EP-12` a `EP-20` citaban un `QRY-XX` distinto al real (incluido `EP-19` citando `QRY-08`, retirada); ya corregidas. |
| QRY-10 *(añadida ACP-003)* | EP-23 | ✓ |

**Veredicto Matriz C (actualizado, adenda 2026-07-20):** cumple en su totalidad, incluidos los cuatro elementos añadidos desde 2026-07-19 y la corrección de trazabilidad `QRY-XX` de la Reconciliación Documental. Todo Command público posee endpoint. Toda Query activa posee endpoint correctamente referenciado. No existen endpoints huérfanos. No existen Commands internos expuestos. **Excepción registrada (fuera del alcance de esta adenda, detectada durante la Reconciliación Documental):** `QRY-09 GetTeacherOverrideHistory` no tiene endpoint de lectura propio en el API Contract — pendiente de un futuro ACP, no de esta auditoría.

---

## MATRIZ D — API Contract → Functional Specification

Los 20 endpoints (EP-01 a EP-20) trazan cada uno a un Caso de Uso o a una regla explícita de la Functional Specification, según ya quedó documentado endpoint por endpoint en el propio API Contract. Ningún endpoint implementa una funcionalidad no descrita en la Functional Specification.

**Excepción a señalar (no un endpoint huérfano, sino una extensión declarada):** `TeacherRecommendationDTO` (usado por EP-08) no existía como DTO nombrado en el Application Model v1.0 original — su propósito funcional sí existe (CU-11), pero el DTO es una extensión de Presentation posterior a la resolución ARB. Ya fue señalado con trazabilidad explícita en el propio API Contract; se reconfirma aquí como no problemático, no como hallazgo nuevo.

**Veredicto Matriz D:** cumple. Ningún endpoint sin propósito funcional. Ninguna funcionalidad inexistente implementada.

---

## MATRIZ E — Infrastructure → Application

| Componente Infrastructure | Caso de uso que implementa | ¿Contiene lógica funcional? |
|---|---|---|
| `AcademyUnitRepository` / `AttemptRepository` / `ModelExampleRepository` | Persistencia de los Aggregates ya existentes | No — solo mapeo/persistencia |
| `TeacherRecommendationRepository` | CU-11 | No |
| `FeedbackGateway` / `FeedbackProviderAdapter` | CU-04 | No — orquesta, no decide |
| `AcademyNotificationAdapter` | Notificación diferida (Functional Spec, Sección 11) | No |
| `ModelExampleStorageAdapter` | CU-08 (soporte) | No |
| `AcademyAuthorizationGuard` | CU-09, CU-10, CU-11 (verificación de relación docente) | No — verifica, no decide reglas de negocio |
| `UnitOfWork` / Outbox | Patrón de sincronización Attempt→AcademyUnit (ya definido en Application Model) | No |

**Veredicto Matriz E:** cumple. Todos los adaptadores implementan exclusivamente casos de uso ya existentes. Ningún componente de infraestructura contiene lógica funcional — confirmado por inspección de cada componente contra su descripción en el Infrastructure Model.

---

## MATRIZ F — Platform Core → Infrastructure

| Componente Platform Core | Uso en Infrastructure de Academia | Conformidad |
|---|---|---|
| Notification Catalog | `AcademyNotificationAdapter` usa exclusivamente `ACADEMY_FEEDBACK_READY`, tipo ya aprobado mediante el proceso de extensión del Catalog | ✓ Correcto |
| AI Provider (estándar de Gateway) | `FeedbackGateway` implementa la estrategia interfaz + selección por configuración ya resuelta por el IRB | ⚠ Ver F-10 — el estándar de Core aún no existe como documento individual propio, aunque su patrón ya se usa correctamente |
| Background Jobs (patrón) | `feedback-queue.worker.ts` sigue el patrón tabla+worker ya resuelto por el IRB | ⚠ Ver F-10 — misma situación que el punto anterior |
| Permission Catalog | Roles STUDENT/TEACHER/ADMIN reutilizados sin extensión | ✓ Correcto |
| Audit Catalog (`AuditLog`) | Reutilizado para CU-10/CU-11 sin tabla paralela propia | ✓ Correcto |
| RLS + Unit of Work | Reutilizado sin modificación del contrato de Mi Plan (Resolución 18.24) | ✓ Correcto |

**Dependencias prohibidas verificadas:** ningún componente de Infrastructure de Academia importa código de otro módulo funcional (Mi Plan, Laboratorio); el Core nunca depende de Academia en ninguna dirección — confirmado por inspección del Infrastructure Model, Secciones 2 y 3.

**Veredicto Matriz F:** cumple, con una observación documental no bloqueante (F-10).

---

## COBERTURA DE ENTIDADES, VALUE OBJECTS, AGGREGATES, POLICIES, SPECIFICATIONS Y DOMAIN EVENTS

| Categoría | Elemento | Clasificación | Nota |
|---|---|---|---|
| Aggregate | `AcademyUnit` | ✓ Utilizado | |
| Aggregate | `Attempt` | ✓ Utilizado | |
| Aggregate | `ModelExample` | ✓ Utilizado | |
| Entity | `Draft` | ✓ Utilizado | |
| Entity | `Version` | ✓ Utilizado | |
| Entity | `Feedback` | ✓ Utilizado | |
| Entity | `TeacherOverride` | ✓ Utilizado | |
| VO | `StudentId` | ✓ Utilizado | |
| VO | `DraftContent` | ✓ Utilizado | |
| VO | `FeedbackObservation` | ✓ Utilizado | |
| VO | `MasteryCriterion` | ✓ Utilizado | Uso interno de Domain (CMD-08), correctamente no expuesto |
| VO | `WordCountRange` | ✓ Utilizado | |
| VO | `VersionNumber` | ✓ Utilizado | |
| VO | `TeacherId` | ⚠ Parcialmente utilizado | Existe solo como Change Proposal CH-01, no ratificado |
| Enum | `UnitState` (8) | ✓ Utilizado | |
| Enum | `UnitStep` (11) | ⚠ Parcialmente utilizado | Solo ~5 de 11 valores tienen Command/endpoint que los transicione (ver F-01) |
| Enum | `TextType` (5) | ✓ Utilizado | |
| Enum | `DifficultyLevel` | ✗ **Sin uso** | No aparece en ningún Command, Query, DTO ni endpoint (ver F-06) |
| Enum | `FeedbackCategory` (10) | ✓ Utilizado | |
| Enum | `MasteryLevel` | ⚠ Parcialmente utilizado | Usado en Domain/Policy, no expuesto en ningún DTO (ver F-07) |
| Enum | `FeedbackStrength` | ✓ Utilizado | |
| Enum | `OverrideAction` | ✓ Utilizado | |
| Domain Service | `MasteryEvaluationService` | ✓ Utilizado | |
| Domain Service | `UnitSequenceService` | ✓ Utilizado | |
| Factory | `AcademyUnitFactory` | ✓ Utilizado | |
| Factory | `AttemptFactory` | ✓ Utilizado | |
| Policy | `UnlockPolicy` | ✓ Utilizado | |
| Policy | `FeedbackPolicy` | ✓ Utilizado | |
| Policy | `RevisionPolicy` | ✓ Utilizado | |
| Policy | `MasteryPolicy` | ✓ Utilizado | |
| Policy | `CompletionPolicy` | ✓ Utilizado | |
| Policy | `RepetitionPolicy` | ✓ Utilizado | |
| Policy | `TeacherOverridePolicy` | ✓ Utilizado | |
| Specification | `EligibleForUnlockSpecification` | ✓ Utilizado | |
| Specification | `MasteryEligibleSpecification` | ✓ Utilizado | |
| Specification | `RepeatableSpecification` | ✓ Utilizado | |
| Domain Event | `UnitUnlocked` | ⚠ Parcialmente utilizado | Comportamiento definido (A-03), pero no nombrado explícitamente en la orquestación documentada de CMD-07/EP-05 (ver F-05) |
| Domain Event | `UnitStarted` | ✓ Utilizado | |
| Domain Event | `ProductionSubmitted` | ✓ Utilizado | |
| Domain Event | `FeedbackRequested` | ✓ Utilizado | |
| Domain Event | `FeedbackDelivered` | ✓ Utilizado | |
| Domain Event | `RevisionStarted` | ✓ Utilizado | |
| Domain Event | `ReflectionStarted` | ✓ Utilizado | |
| Domain Event | `ReflectionCompleted` | ✓ Utilizado | |
| Domain Event | `UnitCompleted` | ✓ Utilizado | |
| Domain Event | `UnitMastered` | ✓ Utilizado | |
| Domain Event | `EXTERNAL_ACTIVITY_COMPLETED` | ✓ Utilizado | |
| Domain Event | `UnitRepeated` | ✓ Utilizado | |
| Domain Event | `TeacherOverrideApplied` | ✓ Utilizado | |

**Resumen:** 44 ✓ Utilizado / 4 ⚠ Parcialmente utilizado / 1 ✗ Sin uso, sobre 49 elementos inventariados.

---

## COBERTURA DE DTOs

| DTO | Request/Response | Clasificación |
|---|---|---|
| `AcademyUnitSummaryDTO` | Response | ✓ Utilizado |
| `AcademyUnitDetailDTO` | Response | ✓ Utilizado |
| `AttemptSummaryDTO` | Response | ✓ Utilizado |
| `ContinuationStateDTO` | Response | ✓ Utilizado |
| `DraftDTO` | Request/Response | ✓ Utilizado |
| `VersionDTO` | Request/Response | ✓ Utilizado |
| `FeedbackObservationDTO` | Response (anidado) | ✓ Utilizado |
| `FeedbackDTO` | Response | ✓ Utilizado |
| `ModelExampleDTO` | Request/Response | ✓ Utilizado |
| `TeacherOverrideDTO` | Request/Response | ✓ Utilizado |
| `TeacherRecommendationDTO` | Request/Response | ✓ Utilizado (extensión post-ARB, trazabilidad explícita) |
| `StudentProgressSummaryDTO` | Response | ✓ Utilizado |
| `StudentUnitHistoryDTO` *(añadido ACP-003, adenda 2026-07-20)* | Response | ✓ Utilizado |
| Eventos (Domain Events como contrato de integración) | — | ✓ Utilizado (ver tabla de Domain Events arriba) |
| View Models (Frontend) | — | ✗ Sin cobertura — **esperado**, corresponde a Frontend Contract, fase aún no iniciada, no es un defecto |

**Veredicto (actualizado, adenda 2026-07-20):** cobertura completa de DTOs de Request/Response/Eventos para el alcance ya definido, incluido `StudentUnitHistoryDTO`. La discrepancia `rating`/`status` de `ModelExampleDTO`, señalada como observación en la Auditoría de Certificación previa, quedó **cerrada en la Reconciliación Documental v1.4/v1.3 (2026-07-20, R-02)** — ambos campos coexisten ahora en Application Model y API Contract. La ausencia de View Models sigue siendo apropiada en esta fase, no un hallazgo.

---

## COBERTURA DE SEGURIDAD

- **Todos los endpoints tienen autorización:** verificado — los 20 endpoints (Sección 4 del API Contract) declaran explícitamente rol y, cuando corresponde, verificación de relación (RLS para Estudiante, relación docente-estudiante para Profesor). ✓ Cumple.
- **Todos los actores funcionales poseen permisos definidos:** Estudiante, Profesor y Administrador tienen su matriz de permisos completa (Functional Spec Sección 2, reflejada en API Contract Sección 7). ✓ Cumple.
- **Ningún permiso aparece sin respaldo funcional:** verificado contra el Permission Catalog general del proyecto (STUDENT/TEACHER/ADMIN/SUPER_ADMIN/REVIEWER/AI_SERVICE/SYSTEM) — Academia usa únicamente STUDENT, TEACHER, ADMIN y, de forma indirecta en Infraestructura, AI_SERVICE. `SUPER_ADMIN` y `REVIEWER` no son usados por Academia, lo cual es correcto y esperado (son roles de otros módulos, no una omisión de Academia). **No problema.**

---

## COBERTURA DE IA

| Interacción IA (Functional Spec, Sección 10) | Origen funcional | Contrato API | Integración Infrastructure |
|---|---|---|---|
| Retroalimentación formativa (10 categorías) | ✓ | ✓ (EP-03, EP-18) | ✓ (`FeedbackGateway`) |
| Verificación de comprensión | ✓ | ✗ **SIN COBERTURA** | ✗ **SIN COBERTURA** |
| Generación de "Actividades IA" (contenido de práctica corta) | ✓ | ✗ **SIN COBERTURA** | ✗ **SIN COBERTURA** |
| Comentario comparativo en Biblioteca de Modelos | ✓ | ⚠ Modelado como contenido estático (CMD-12/13), no como generación dinámica — ver F-09 | ⚠ Mismo comentario |

**Veredicto:** de las cuatro interacciones de IA declaradas en la Functional Specification, solo una (retroalimentación formativa) tiene cobertura completa en las tres capas. Las otras tres presentan vacío total o ambigüedad — todas comparten la misma causa raíz que F-01 (pasos 1–6 del recorrido sin Application Model), excepto el comentario comparativo, que es un hallazgo independiente (F-09).

---

## COBERTURA DE NOTIFICACIONES

| Notificación | Evento origen | Destinatario | ¿Pertenece al Notification Catalog? |
|---|---|---|---|
| `ACADEMY_FEEDBACK_READY` | Retroalimentación solicitada que excede la ventana objetivo (Functional Spec, Sección 11) | STUDENT | ✓ Sí — aprobado formalmente en Platform Core Foundation |

**Veredicto:** cobertura completa. Es la única notificación declarada por Academia en cualquier documento Frozen; no existe ninguna notificación implementada sin evento origen, destinatario o pertenencia al catálogo. **No problema.**

---

## COBERTURA DE ESTADOS

| Máquina de estados | Application | Infrastructure | API |
|---|---|---|---|
| `UnitState` (8 valores: LOCKED→...→MASTERED) | ✓ Completa (CMD-01/06/07/09/10 cubren todas las transiciones documentadas) | ✓ Completa (`AcademyUnitRepository`, RLS) | ✓ Completa (`AcademyUnitDetailDTO.state`) |
| `UnitStep` (11 valores) | ⚠ Parcial — solo los pasos desde "Producir" en adelante tienen Command (ver F-01) | ⚠ Parcial (mismo origen) | ⚠ Parcial (mismo origen) |

**Veredicto:** la máquina de estados de la unidad (`UnitState`) está completamente representada en las tres capas. La máquina de pasos interna (`UnitStep`) no lo está — es la misma causa raíz que F-01, no un hallazgo adicional independiente.

---

## HALLAZGOS

### F-01
**Título:** Pasos previos del recorrido (CU-02, `UnitStep` 1–6) sin cobertura en Application, Infrastructure ni API.
**Capas afectadas:** Funcional (existe), Aplicación (ausente), Infraestructura (ausente), API (ausente).
**Descripción:** la Functional Specification (CU-02) exige contextualizar, definir objetivos, comprender (con verificación explícita), observar, analizar y practicar antes de producir texto — 6 de los 11 valores del enum `UnitStep` ya Frozen en el Domain Model. Ningún Command ni Query del Application Model cubre la persistencia de avance por estos pasos ni la verificación de comprensión. En consecuencia, tampoco existe endpoint de API ni componente de Infrastructure para ellos.
**Clasificación:** Funcional + Aplicación.
**Impacto:** Alto.
**Riesgo:** bloquea la implementación completa de más de la mitad del recorrido oficial de cualquier unidad; el Frontend no tendría contrato contra el cual construir esas pantallas.
**Recomendación:** definir los Commands/Queries faltantes en el Application Model (adición, no ruptura de lo ya existente) antes de iniciar Frontend Contract para estas pantallas.
**¿Requiere Change Proposal?:** Sí.
**¿Qué documento debe modificarse?:** Application Model (extensión aditiva).
**Clasificación final:** ~~ERROR CRÍTICO~~ → **CERRADO (adenda 2026-07-20).** Resuelto por ACP-001-A: `CMD-16 AdvanceStep`, `CMD-17 VerifyComprehension` (Application Model, ahora v1.4) y `EP-21`, `EP-22` (API Contract, ahora v1.3) cubren íntegramente los 6 pasos previamente sin orquestación. Ver `acp-001-registro-de-ejecucion-2026-07-19.md`.

### F-02
**Título:** Representación de "grupo" ausente en el Application Model (afecta CU-09 y CU-11 en su totalidad documentada).
**Capas afectadas:** Funcional, Aplicación, API.
**Descripción:** la Functional Specification permite acciones docentes "sobre un estudiante o un grupo completo" (CU-09, CU-11), pero ningún Command, Query ni DTO define `GroupId` o una vista agregada de grupo.
**Clasificación:** Funcional + Aplicación.
**Impacto:** Medio.
**Riesgo:** el Profesor no puede operar sobre un grupo mediante el contrato ya definido; solo la variante individual está implementable.
**Recomendación:** aclarar si "grupo" es un concepto de primera clase (requiere modelado nuevo) o una responsabilidad de iteración del Frontend sobre estudiantes individuales (no requiere cambio de Application/Domain) — decisión de producto, no resoluble por esta auditoría.
**¿Requiere Change Proposal?:** Sí, condicionado a la decisión anterior.
**¿Qué documento debe modificarse?:** Functional Specification (aclaración) y, si se opta por modelar grupo como concepto propio, Application Model.
**Clasificación final:** ~~AMBIGÜEDAD~~ → **CERRADO (adenda 2026-07-20).** Resuelto por ACP-001-B: decisión oficial, no existe `Group` ni `GroupId` como entidad; toda acción "sobre un grupo" es selección múltiple de estudiantes orquestada por el Frontend sobre los endpoints/Queries de estudiante individual (`QRY-07`, `EP-07`/`EP-08`/`EP-20`). Ver `acp-001-registro-de-ejecucion-2026-07-19.md`.

### F-03
**Título:** Casos de uso de Administrador no formalizados como CU-xx en la Functional Specification.
**Capas afectadas:** Documentación, Funcional.
**Descripción:** `CMD-12/13/14` (gestión de `ModelExample`) trazan solo a la tabla de permisos (Sección 2), no a un Caso de Uso con el mismo formato objetivo/actor/precondiciones/flujo/excepciones/resultado usado para Estudiante y Profesor.
**Clasificación:** Documentación.
**Impacto:** Bajo.
**Riesgo:** bajo — trazabilidad ya existe por otra vía; no bloquea implementación.
**Recomendación:** agregar CU-xx formales para Administrador en una futura revisión editorial.
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** Functional Specification.
**Clasificación final:** **DOCUMENTACIÓN.**

### F-04
**Título:** `CMD-15` (`ProvisionAcademyUnitsForStudent`) sin narrativa de origen en la Functional Specification.
**Capas afectadas:** Documentación, Funcional.
**Descripción:** ningún documento Frozen explica cuándo ni por qué se provisionan las `AcademyUnit` de un estudiante nuevo.
**Clasificación:** Documentación.
**Impacto:** Bajo.
**Riesgo:** bajo — ya excluido correctamente del API Contract como interno.
**Recomendación:** agregar una nota aclaratoria en la Functional Specification sobre el origen de la provisión (probablemente ligado a matriculación, fuera del límite de Academia).
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** Functional Specification.
**Clasificación final:** **DOCUMENTACIÓN.**

### F-05
**Título:** Evento `UnitUnlocked` sin mención explícita en la orquestación documentada de CMD-07/EP-05.
**Capas afectadas:** Aplicación, API.
**Descripción:** el efecto ("se desbloquea la siguiente unidad") está descrito narrativamente, pero el nombre simbólico del evento no aparece en la lista de "eventos relacionados" de EP-05 ni en la orquestación documentada de CMD-07.
**Clasificación:** Documentación.
**Impacto:** Bajo.
**Riesgo:** bajo — el comportamiento en sí está correctamente definido por A-03; solo falta precisión nominal.
**Recomendación:** nombrar explícitamente `UnitUnlocked` en ambos documentos en la próxima revisión editorial.
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** Application Model / API Contract.
**Clasificación final:** **DOCUMENTACIÓN.**

### F-06
**Título:** `DifficultyLevel` sin uso trazable en ningún documento posterior al Domain Model.
**Capas afectadas:** Dominio, Aplicación, API.
**Descripción:** el enum existe en el Domain Model pero no aparece en ningún Command, Query, DTO, endpoint ni regla de Infrastructure.
**Clasificación:** Dominio.
**Impacto:** Bajo.
**Riesgo:** bajo — no bloquea funcionalidad; podría ser un elemento reservado para expansión futura no activado en el alcance actual.
**Recomendación:** confirmar si `DifficultyLevel` es vigente para el MVP o reservado para expansión futura, y documentarlo explícitamente en cualquiera de los dos casos.
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** Domain Model (nota aclaratoria, no redefinición).
**Clasificación final:** **AMBIGÜEDAD.**

### F-07
**Título:** `MasteryLevel` no expuesto en ningún DTO de respuesta.
**Capas afectadas:** Dominio, API.
**Descripción:** el estudiante ve que una unidad llegó a `MASTERED` (vía `AcademyUnitDetailDTO.state`), pero no ve su progreso granular hacia el dominio (`DEVELOPING`/`CONSOLIDATING`/`SUSTAINED`) en ningún endpoint.
**Clasificación:** Dominio + API.
**Impacto:** Bajo.
**Riesgo:** bajo — decisión de alcance de producto, no un defecto de cobertura estructural.
**Recomendación:** evaluar en una futura revisión de API Contract si conviene exponerlo (adición, no rompe nada existente).
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** API Contract (extensión aditiva futura, opcional).
**Clasificación final:** **NO PROBLEMA.**

### F-08
**Título:** `TeacherId` no formalizado como Value Object (Change Proposal CH-01 pendiente).
**Capas afectadas:** Dominio.
**Descripción:** ya identificado y gestionado desde el ciclo Domain-vs-Application; sin efecto de comportamiento.
**Clasificación:** Dominio.
**Impacto:** Bajo.
**Riesgo:** bajo, ya conocido y aceptado.
**Recomendación:** cerrar formalmente CH-01.
**¿Requiere Change Proposal?:** Ya existe (CH-01) — no se requiere uno nuevo.
**¿Qué documento debe modificarse?:** Domain Model (incorporar CH-01).
**Clasificación final:** **DOCUMENTACIÓN** (hallazgo ya conocido, no nuevo).

### F-09
**Título:** Ambigüedad entre generación dinámica por IA y contenido estático editorial para el comentario comparativo de la Biblioteca de Modelos.
**Capas afectadas:** Funcional, Aplicación, API.
**Descripción:** la Functional Specification (Sección 10) declara que la IA "genera comentario comparativo dentro de la Biblioteca de Modelos", pero el Application Model/API Contract modelan ese campo como contenido estático gestionado por el Administrador vía `CMD-12`/`CMD-13` (`ModelExampleDTO.comparativeComment`), sin generación dinámica en tiempo de consulta.
**Clasificación:** Funcional + Aplicación.
**Impacto:** Medio.
**Riesgo:** si la intención real era generación dinámica por IA en cada consulta y se implementa como estático (como quedó modelado), el resultado no cumpliría la intención funcional documentada — o viceversa.
**Recomendación:** aclarar explícitamente en una revisión de la Functional Specification cuál de las dos interpretaciones es la correcta.
**¿Requiere Change Proposal?:** Sí, si se determina que debe ser dinámico (afectaría Application Model y API Contract); No, si se confirma que es estático (solo aclaración documental).
**¿Qué documento debe modificarse?:** Functional Specification (aclaración obligatoria) y, condicionalmente, Application Model / API Contract.
**Clasificación final:** ~~AMBIGÜEDAD~~ → **CERRADO (adenda 2026-07-20).** Resuelto por ACP-001-C: decisión oficial, el comentario comparativo es contenido curatorial estático, de autoría del Administrador (`curatorialComment`), no generado dinámicamente por IA en el alcance actual. Ver `acp-001-registro-de-ejecucion-2026-07-19.md`.

### F-10
**Título:** Patrones de Platform Core (AI Provider Gateway, Background Jobs) usados por Academia antes de existir como documentos individuales formales del Core.
**Capas afectadas:** Infraestructura, Plataforma.
**Descripción:** ambos patrones ya están completamente especificados a nivel de Academia (resoluciones IRB), pero el propio Platform Core Foundation los lista como "componentes que deberán convertirse en documentos individuales futuros" — es decir, aún no existen como estándar Core independiente de Academia.
**Clasificación:** Documentación.
**Impacto:** Bajo.
**Riesgo:** bajo para Academia (ya resuelto); riesgo de secuenciación para futuros módulos que necesiten el mismo patrón sin un documento Core al cual referirse.
**Recomendación:** priorizar la redacción de esos dos documentos individuales de Core usando las resoluciones de Academia como base, tal como el propio Platform Core Foundation ya anticipó en su Resultado, punto 2.
**¿Requiere Change Proposal?:** No.
**¿Qué documento debe modificarse?:** Platform Core Foundation (agregar los documentos individuales ya previstos).
**Clasificación final:** **DOCUMENTACIÓN.**

---

## MÉTRICAS

**Método:** cada porcentaje se calcula como (elementos con cobertura completa confirmada ÷ elementos totales inventariados en esa capa) × 100. Los elementos con cobertura parcial (⚠) se reportan como conteo separado, no se promedian dentro del porcentaje principal, para no ocultar la distinción entre "completo" y "parcial" detrás de una fórmula compuesta.

**Cobertura funcional (Matriz A):** 8 de 11 Casos de Uso con orquestación completa = **72.7%** completa. 2 de 11 parciales (18.2%) — CU-09, CU-11. 1 de 11 sin cobertura (9.1%) — CU-02.

**Cobertura Domain (inventario de entidades/VO/enums/eventos/etc.):** 44 de 49 elementos ✓ Utilizado = **89.8%**. 4 de 49 (8.2%) ⚠ Parcial. 1 de 49 (2.0%) ✗ Sin uso.

**Cobertura Application (Matriz B + Matriz C):** 24 de 24 Commands/Queries correctamente trazables a Domain y correctamente expuestos o excluidos deliberadamente en API = **100%**. (Los déficits de alcance funcional de CU-02/CU-09/CU-11 se cuentan en Cobertura funcional, no aquí, para no duplicar el mismo hallazgo en dos métricas distintas con el mismo peso.)

**Cobertura Infrastructure (Matriz E + Matriz F):** 100% de los componentes de infraestructura necesarios para los 21 Commands/Queries ya definidos en Application Model están documentados y libres de lógica funcional = **100%**. (F-10 es una observación de secuenciación documental del Platform Core, no una carencia de cobertura de Academia.)

**Cobertura API (Matriz C + Matriz D):** 21 de 21 elementos del Application Model (12 Commands públicos + 9 Queries) poseen endpoint = **100%** sobre la superficie ya definida por Application Model. (Nuevamente, el déficit real está aguas arriba, en Matriz A, no en esta capa.)

**Cobertura total del módulo:** promedio simple, sin ponderación adicional, de las cinco cifras anteriores: (72.7 + 89.8 + 100 + 100 + 100) ÷ 5 = **92.5%**.

*(Cifras originales de 2026-07-19, conservadas como registro histórico. Ver recálculo inmediatamente abajo, adenda 2026-07-20.)*

---

## MÉTRICAS — ACTUALIZACIÓN 2026-07-20 (adenda, mismo método de cálculo)

**Cobertura funcional (Matriz A):** 12 de 12 Casos de Uso con orquestación completa = **100%**. (CU-02 cerrado por ACP-001-A; CU-09/CU-11 cerrados por ACP-001-B/ACP-002-A; CU-12 incorporado completo por ACP-003.)

**Cobertura Domain:** sin cambio — el Domain Model no fue tocado por ningún ACP. **89.8%** (44/49 ✓, 4/49 ⚠, 1/49 ✗) — cifra original de la Auditoría de Certificación (2026-07-19), aún vigente al no haberse modificado el Domain Model.

**Cobertura Application (Matriz B + Matriz C):** 27 de 27 Commands/Queries (17 Commands + 9 Queries activas + 1 Query retirada correctamente marcada como tal) correctamente trazables a Domain y correctamente expuestos o excluidos deliberadamente en API = **100%**.

**Cobertura Infrastructure (Matriz E + Matriz F):** sin ACP que la afecte — **100%**, sin cambio.

**Cobertura API (Matriz C + Matriz D):** 26 de 26 elementos del Application Model (17 Commands + 9 Queries activas) poseen endpoint, con las nueve referencias `QRY-XX` de `EP-12`–`EP-20` ya corregidas (Reconciliación Documental v1.3) = **100%**. (`QRY-09` sin endpoint de lectura queda registrado como excepción fuera del alcance de esta adenda, no computada como déficit de esta métrica porque no proviene de ningún ACP ya ejecutado sobre este ciclo — ver Matriz C.)

**Cobertura total del módulo (adenda 2026-07-20):** (100 + 89.8 + 100 + 100 + 100) ÷ 5 = **97.96% ≈ 98.0%**.

---

## AUDITORÍA FINAL

**1. ¿Cuántos huecos arquitectónicos reales existen?**
Tres hallazgos con impacto real sobre la implementabilidad: **F-01** (bloqueo directo, ERROR CRÍTICO), **F-02** (bloqueo parcial, AMBIGÜEDAD con impacto Medio) y **F-09** (riesgo de implementación incorrecta, AMBIGÜEDAD con impacto Medio). Los siete restantes (F-03 a F-08, F-10) son de clasificación DOCUMENTACIÓN o NO PROBLEMA — no bloquean ni distorsionan la implementación.

**2. ¿Son exactamente los mismos detectados durante API Review?**
Parcialmente. F-01 y F-02 son exactamente los mismos dos puntos ya señalados como "PENDIENTE DE DECISIÓN DE API #1" y "#2" durante la revisión del API Contract — esta auditoría confirma, con evidencia adicional, que su origen real está en el Application Model (Matriz A), no solo en el API Contract.

**3. ¿Existe algún hueco nuevo?**
Sí. **F-09** (ambigüedad del comentario comparativo de la Biblioteca de Modelos, IA dinámica vs. contenido estático) no había sido detectado en ninguna revisión anterior de este ciclo documental. Los hallazgos F-03 a F-08 y F-10 también son nuevos, pero de naturaleza documental/menor, no arquitectónica en el sentido que bloquea implementación.

**4. ¿Puede iniciarse Frontend Contract?**
**NO.**
**Justificación:** F-01 deja sin ningún contrato de Backend a 6 de los 11 pasos oficiales de cada unidad (más de la mitad del recorrido central del módulo) — el Frontend no tiene sobre qué construir esas pantallas sin inventar comportamiento no documentado, lo cual violaría la misma disciplina aplicada en todo este ciclo. F-02 deja sin contrato la variante grupal de dos Casos de Uso ya Frozen. Iniciar Frontend Contract en este estado obligaría a la siguiente fase a asumir o inventar exactamente lo que este ciclo de documentación ha evitado deliberadamente en cada sprint anterior.

*(Preguntas 1–4 conservadas como registro histórico de 2026-07-19. Ver actualización inmediatamente abajo, adenda 2026-07-20.)*

---

## AUDITORÍA FINAL — ACTUALIZACIÓN 2026-07-20 (adenda)

**1. ¿Cuántos huecos arquitectónicos reales quedan?**
Ninguno con impacto bloqueante. F-01, F-02 y F-09 —los tres únicos con impacto real detectados en 2026-07-19— están **cerrados** (ACP-001-A/B/C, ver Sección "HALLAZGOS"). F-03, F-04, F-06, F-07, F-08, F-10 permanecen abiertos, todos de clasificación DOCUMENTACIÓN/AMBIGÜEDAD/NO PROBLEMA de impacto Bajo, sin bloquear implementación — sin cambio de estado desde 2026-07-19.

**2. ¿Existe algún hueco nuevo desde 2026-07-19?**
No, en el sentido de "vacío arquitectónico" — el Domain Model, los Aggregates, las Policies y las resoluciones A-01–A-10 permanecen intactos. Sí se detectaron, y ya fueron corregidos por la Reconciliación Documental v1.4/v1.3 (2026-07-20), tres inconsistencias puramente documentales entre Application Model y API Contract (divergencia de forma de DTOs compartidos, un campo sin respaldo en `AttemptSummaryDTO`, y una desalineación de numeración `QRY-XX` en nueve endpoints) — ninguna de las tres exigió modificar el Domain Model ni ninguna resolución A-01–A-10. Queda registrada, fuera del alcance de esa reconciliación, la ausencia de endpoint de lectura para `QRY-09 GetTeacherOverrideHistory`.

**3. ¿Puede iniciarse Frontend Contract?**
**SÍ — y ya fue iniciado y completado.** `academia-frontend-contract-v1.1-2026-07-20.md` existe, con dictamen `A) READY FOR IMPLEMENTATION`, posterior al cierre de F-01/F-02/F-09.

---

## DICTAMEN FINAL

**B) El módulo Academia requiere Change Proposal menor.** *(dictamen original de 2026-07-19, conservado como registro histórico — ver actualización inmediatamente abajo.)*

**Justificación detallada (2026-07-19):** ningún hallazgo de esta auditoría contradice, invalida o exige revertir una decisión ya Frozen — ni una sola Policy, Aggregate, Domain Event, Command o endpoint ya definido resultó incorrecto o mal diseñado (Matrices B, C, D, E y F cumplen en su totalidad). Los tres hallazgos con impacto real (F-01, F-02, F-09) son, en los tres casos, **vacíos por omisión, no errores por comisión**: piezas que la Functional Specification ya declaró pero que el Application Model nunca llegó a modelar con el mismo nivel de detalle que el resto del módulo. La corrección necesaria es enteramente aditiva — nuevos Commands/Queries para los pasos 1–6 del recorrido, una decisión de alcance sobre "grupo", y una aclaración sobre el origen del comentario comparativo — sin necesidad de reabrir ni modificar ningún Aggregate, Policy, Domain Event o resolución A-01–A-10 ya aprobados. Esto descarta la opción C (revisión estructural), que solo se justificaría si la causa raíz revelara un defecto de diseño en los cimientos ya construidos, lo cual esta auditoría no encontró en ninguna de las seis matrices. Al mismo tiempo, la magnitud de F-01 (más de la mitad de los pasos de una unidad sin contrato) impide declarar la opción A (cobertura completa): el módulo no puede avanzar a Frontend Contract sin resolver, como mínimo, F-01 y F-02 mediante un Change Proposal formal sobre el Application Model.

---

## DICTAMEN FINAL — ACTUALIZACIÓN 2026-07-20 (adenda)

**A) El módulo Academia tiene cobertura completa — apto para implementación.**

**Justificación:** los tres hallazgos que sostenían el dictamen `B` de 2026-07-19 (F-01, F-02, F-09) fueron cerrados mediante ACP-001-A/B/C, sin reabrir ni modificar ningún Aggregate, Policy, Domain Event o resolución A-01–A-10. Las tres inconsistencias documentales detectadas posteriormente por la Reconciliación Arquitectónica (R-02, R-03, R-04) fueron, a su vez, corregidas por la Reconciliación Documental de esta misma fecha, sin requerir ningún Change Proposal sobre el Domain Model. La cobertura funcional (Matriz A) alcanza 12/12 Casos de Uso completos; la cobertura Application/API alcanza 100% con trazabilidad `QRY-XX` corregida. Frontend Contract ya fue completado con dictamen `READY FOR IMPLEMENTATION`. Queda registrada, sin bloquear esta calificación, la ausencia de endpoint para `QRY-09` (impacto Bajo, ningún caso de uso Frozen exige explícitamente su exposición vía API) y los residuos documentales de impacto Bajo ya conocidos (F-03, F-04, F-06, F-07, F-08, F-10, CH-01) — ninguno exige un Change Proposal sobre el Domain Model ni reabre ninguna resolución A-01–A-10.
