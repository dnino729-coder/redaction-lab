# ACADEMIA — Auditoría de Consistencia Transversal (Domain Model v1.1 como fuente de verdad)

**Rol:** Auditor de Consistencia Transversal, independiente — no autor de ningún documento auditado, no ejecutor de ningún ACP.
**Fecha:** 2026-07-20.
**Naturaleza de esta auditoría:** exclusivamente de detección. **Ningún documento fue modificado, corregido ni editado durante esta auditoría.** Su único propósito es verificar que `academia-domain-model-v1.1-2026-07-19.md` — declarado fuente de verdad del dominio — permanece consistente con todos los artefactos posteriores vigentes.

**Documentos de entrada (leídos en su totalidad para esta auditoría):**
- `docs/audits/academia-domain-model-v1.1-2026-07-19.md` (fuente de verdad del dominio, Frozen)
- `docs/audits/academia-functional-specification-v1.3-2026-07-20.md` (vigente, FROZEN)
- `docs/audits/academia-application-model-v1.3-2026-07-20.md` (vigente)
- `docs/audits/academia-infrastructure-model-v1.1-2026-07-19.md` (vigente)
- `docs/audits/academia-api-contract-v1.2-2026-07-20.md` (vigente)
- `docs/audits/academia-architecture-coverage-audit-2026-07-19.md` (único documento de Coverage Audit existente — tratado aquí como "vigente" por ausencia de una versión posterior)
- `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10)

**Fuera de alcance (confirmado, no evaluado):** calidad de código, Prisma, Frontend, UX, rendimiento, implementación.

---

## 1. Resumen ejecutivo

El Domain Model v1.1 permanece **correcto y no contaminado**: sus tres Aggregate Roots, sus 17 reglas de negocio, sus 11 invariantes más la Regla de Consistencia Eventual (8.1), su máquina de estados oficial, sus 13 Domain Events, sus 7 Policies y sus 3 Specifications se usan de forma fiel en el Application Model, el Infrastructure Model y el API Contract vigentes. Ninguna resolución A-01–A-10 aparece contradicha, reinterpretada ni omitida en ningún documento posterior. Los tres ciclos de ejecución (ACP-001, ACP-002, ACP-003) ya realizados sobre este módulo mantuvieron esa disciplina sin excepción.

Sin embargo, esta auditoría — al examinar por primera vez la consistencia **entre** los documentos posteriores, no solo cada uno contra el Domain Model por separado — detecta **dos categorías de desviación no registradas previamente**:

1. **Divergencia estructural entre los DTOs del Application Model (Sección 6) y los DTOs del API Contract (Sección 5).** Comparten el mismo nombre pero, en la mayoría de los casos, una forma de campos distinta, sin que ningún documento declare cuál de las dos formas es la autoritativa ni documente una función de mapeo entre ambas. Un caso concreto (`AttemptSummaryDTO.state` en el API Contract) introduce un campo sin respaldo en ningún documento anterior, con riesgo directo de contradecir la Invariante 6 del Domain Model si se interpreta literalmente como un segundo estado del `Attempt`.
2. **La Coverage Audit vigente (`academia-architecture-coverage-audit-2026-07-19.md`) es la única de este tipo y quedó completamente desactualizada** tras la ejecución de ACP-001, ACP-002 y ACP-003: no menciona `CMD-16`, `CMD-17`, `QRY-10`, `EP-21`, `EP-22`, `EP-23` ni `CU-12`, y presenta como abiertos hallazgos (F-01, F-02, F-09) que ya están cerrados. Cualquier lector que la consulte como estado actual del módulo recibiría información materialmente falsa.

Además, se detecta una imprecisión de menor severidad en el disparo del evento `RevisionStarted` (Application Model, `CMD-05`) frente al momento en que el Domain Model define su ocurrencia, y una redacción ambigua en `EP-05` del API Contract respecto a la evaluación de `MASTERED`.

Ninguno de estos hallazgos exige reabrir, modificar o reinterpretar el Domain Model, ningún Aggregate, Policy, Domain Event o resolución A-01–A-10. Las correcciones necesarias son enteramente de reconciliación documental entre las capas Application/API y de actualización de la Coverage Audit — no de rediseño.

---

## 2. Resultado por comprobación obligatoria

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Aggregate Roots — todo Command/Query/Endpoint respeta exactamente los tres Aggregate Roots (`AcademyUnit`, `Attempt`, `ModelExample`) | **Cumple.** Verificado uno a uno contra las 17 entradas de Commands/Queries del Application Model v1.3 y los 23 endpoints del API Contract v1.2. `CMD-11`/`EP-08` (recomendación docente) y `CMD-15` operan deliberadamente sin Aggregate, consistente con la resolución ARB ya registrada — no es una desviación. |
| 2 | Reglas de negocio — ninguna regla de la Functional Specification contradice las 17 reglas del dominio (RN-1 a RN-17) | **Cumple.** Las 13 Reglas funcionales visibles de la Functional Specification v1.3 (Sección 8) trazan sin contradicción a RN-1, RN-2, RN-3, RN-4, RN-5, RN-6, RN-11/RN-12, RN-13, RN-14, RN-15. Las reglas RN-7 a RN-10, RN-16, RN-17 no se repiten en la Functional Specification por ser reglas internas ya protegidas por el Domain Model (la propia Sección 8 lo declara explícitamente) — omisión deliberada, no contradicción. |
| 3 | Invariantes — ningún Command/Query viola las 11 invariantes + Regla de Consistencia Eventual (8.1) | **Cumple.** Verificado especialmente `CMD-09 RepeatUnit` (invariante 3/H-03, `UnitState` sin transición), `CMD-10 ApplyTeacherOverride` (invariante 10, el `Attempt` activo queda huérfano sin modificación directa) y el patrón de dos transacciones de `CMD-07` (invariante 6/8.1, consistencia eventual). Ver Hallazgo H-02 para un riesgo *potencial*, no confirmado, sobre la invariante 6. |
| 4 | Máquina de estados — toda transición usada por Application/API/Infrastructure corresponde exactamente a la tabla oficial (Sección 9 del Domain Model) | **Cumple, con una observación de redacción.** Ver Hallazgo H-03 (BAJA) sobre `EP-05`. |
| 5 | Domain Events — sin eventos faltantes, sin eventos inexistentes referenciados, consistencia productor/consumidor | **Cumple, con una observación de temporalidad.** Ver Hallazgo H-04 (MEDIA) sobre `RevisionStarted`. Los 13 eventos del Domain Model aparecen íntegros y sin invención en Application (Sección 3), Infrastructure (Sección 7, 12 internos + 1 externo = 13) y API Contract (Sección 4, "Eventos relacionados" por endpoint). |
| 6 | Policies — todas invocadas por su Aggregate correspondiente, ninguna decisión movida fuera del dominio | **Cumple.** Verificadas las 7 Policies una a una contra su Aggregate invocador declarado en el Domain Model (H-02): `UnlockPolicy`/`MasteryPolicy`/`CompletionPolicy`/`RepetitionPolicy`/`TeacherOverridePolicy` invocadas exclusivamente por `AcademyUnit`; `FeedbackPolicy`/`RevisionPolicy` invocadas exclusivamente por `Attempt`. El Application Model asigna cada Policy al Command correcto sin excepción (Sección 3). La consulta a Mi Plan para `CompletionPolicy` (CMD-07) es obtención de datos, no la decisión en sí — la decisión permanece en `AcademyUnit`. |
| 7 | Specifications — uso coherente en Application/CQRS con el modelo de dominio | **Cumple.** Las 3 Specifications se usan exactamente donde el Domain Model las asigna (`EligibleForUnlockSpecification`/`CMD-07`; `MasteryEligibleSpecification`/`CMD-08`; `RepeatableSpecification`/`CMD-09`). `QRY-01` activa por primera vez el "consumidor futuro" que el Domain Model (H-09) ya anticipaba para `EligibleForUnlockSpecification`/`RepeatableSpecification` — evolución prevista, no contradicción. |
| 8 | Trazabilidad — A-01 a A-10 reflejadas correctamente en todos los documentos posteriores | **Cumple para las diez resoluciones, con una desviación documental grave en un artefacto específico.** Ver Hallazgo H-01 (ALTA) sobre la Coverage Audit. Confirmado positivamente: A-10 punto (2) ("revisar toda producción... incluyendo el historial completo de versiones y la retroalimentación recibida") ya autorizaba, desde 2026-07-19, exactamente la capacidad que ACP-003 formalizó como CU-12/QRY-10/EP-23 — ACP-003 no introdujo alcance nuevo, solo formalizó una facultad de A-10 que había quedado sin Query/endpoint. |
| 9 | CQRS — todo Command/Query respaldado por el modelo de dominio, sin comportamiento no modelado | **Cumple.** `CMD-16`/`CMD-17` (ACP-001-A) y `QRY-10` (ACP-003) están respaldados por responsabilidades ya descritas textualmente en AR-2 (Sección 3 del Domain Model: "gobernar la posición actual dentro de la secuencia de 11 pasos" y "aplicar la puerta de comprensión") — no requieren comportamiento nuevo del dominio. Ver Hallazgo H-02 sobre un campo de DTO (no un Command/Query) sin respaldo. |
| 10 | Event-Driven — el uso de eventos preserva las garantías de dominio, sin contradecir la consistencia eventual definida | **Cumple, con la misma observación de H-04.** El patrón Outbox del Infrastructure Model implementa fielmente la Regla de Consistencia Eventual (8.1/H-01) sin alterarla; at-least-once delivery + idempotencia por `eventId` no contradice ninguna garantía del Domain Model. |

---

## 3. Hallazgos clasificados por severidad

### ALTA

#### H-01 — Coverage Audit vigente completamente desactualizada respecto al estado real del módulo

**Comprobación relacionada:** 8 (Trazabilidad).

**Evidencia documental:** `docs/audits/academia-architecture-coverage-audit-2026-07-19.md`, fechado 2026-07-19, anterior a la ejecución de ACP-001 (2026-07-19/20), ACP-002 (2026-07-20) y ACP-003 (2026-07-20). El documento:
- No menciona `CMD-16`, `CMD-17`, `QRY-10`, `EP-21`, `EP-22`, `EP-23` ni `CU-12` en ninguna de sus seis matrices ni en su inventario de elementos.
- Presenta como **abierto** el Hallazgo F-01 ("CU-02 sin cobertura... ERROR CRÍTICO") y F-02 ("ambigüedad de grupo... AMBIGÜEDAD"), ambos cerrados por ACP-001-A y ACP-001-B respectivamente desde 2026-07-19/20.
- Presenta como **abierto** F-09 ("ambigüedad IA dinámica vs. contenido estático en la Biblioteca de Modelos"), cerrado por ACP-001-C.
- Calcula una Cobertura funcional de 72.7% y una Cobertura total de 92.5% — cifras que la propia Auditoría de Certificación (`academia-architecture-certification-2026-07-19.md`, posterior) ya corrigió a 95.4% sin que este documento fuera actualizado ni marcado `SUPERSEDED`.
- Su Dictamen Final ("B) El módulo Academia requiere Change Proposal menor") describe una decisión ya tomada y ejecutada (es, de hecho, el origen documental de ACP-001), pero el documento nunca fue actualizado ni retirado tras esa ejecución.

**Impacto:** cualquier persona que consulte este documento como referencia del estado de cobertura del módulo Academia recibe información materialmente incorrecta — un `ERROR CRÍTICO` ya cerrado hace más de un ciclo de documentación se presenta como vigente. No bloquea la implementación en sí (los documentos que un equipo de desarrollo consultaría directamente — Application Model v1.3, API Contract v1.2, Functional Specification v1.3 — están correctamente sincronizados entre sí), pero representa un riesgo real de desinformación para cualquier auditoría, onboarding o revisión posterior que trate la Coverage Audit como fuente de verdad de estado, tal como su propio nombre sugiere.

**Corrección mínima recomendada:** emitir una revisión de la Coverage Audit (o una nota de estado al inicio del documento existente) que: (a) marque F-01, F-02 y F-09 como `CERRADO — ver ACP-001-A/B/C`; (b) incorpore `CMD-16/17`, `QRY-10`, `EP-21/22/23`, `CU-12` a las matrices correspondientes; (c) referencie la Auditoría de Certificación como fuente de las métricas ya corregidas; o, alternativamente, declarar formalmente este documento `SUPERSEDED` por la Auditoría de Certificación + los tres Registros de Ejecución de ACP, si esa es la intención real del proyecto. No requiere modificar el Domain Model ni ninguna resolución A-01–A-10.

---

#### H-02 — Divergencia estructural sistemática entre los DTOs del Application Model y los DTOs del API Contract

**Comprobación relacionada:** 9 (CQRS — forma del contrato expuesto por cada Query/Command), tangencialmente 1 y 4.

**Evidencia documental:** comparación campo por campo, Application Model v1.3 Sección 6 vs. API Contract v1.2 Sección 5:

| DTO | Application Model v1.3 (Sección 6) | API Contract v1.2 (Sección 5) | Divergencia |
|---|---|---|---|
| `AcademyUnitSummaryDTO` | `unitId, studentId, textType, state, unlockedAt?, completedAt?, masteredAt?, attemptCount, eligibleForUnlock?, repeatable?` | `unitId, textType, state, position, isRecommended` | Solo 3 campos en común (`unitId`, `textType`, `state`); el resto no se solapa en ninguna dirección. |
| `AcademyUnitDetailDTO` | extiende lo anterior + `currentAttemptId?, teacherOverrideCount` | extiende lo anterior + `activeAttemptId, attemptsCount` | Mismos conceptos, nombres distintos (`currentAttemptId`/`activeAttemptId`) y **semántica distinta** (`teacherOverrideCount` cuenta anulaciones docentes; `attemptsCount` cuenta intentos — no son el mismo dato). |
| `AttemptSummaryDTO` | `attemptId, unitId, currentStep, startedAt, isCurrent, versionCount` | `attemptId, unitId, state, currentStep, startedAt` | El API Contract introduce un campo `state` inexistente en el Application Model y en el Domain Model — ver riesgo específico más abajo. `isCurrent`/`versionCount` no aparecen en el API Contract. |
| `ContinuationStateDTO` | `unitId?, attemptId?, currentStep?, draftContent?, lastSavedAt?` | `unitId, attemptId, currentStep, lastActivityAt` | El API Contract **omite `draftContent`** — ver riesgo funcional específico más abajo. Campo renombrado `lastSavedAt` → `lastActivityAt`. |
| `DraftDTO` | `content, wordCount, characterCount, autosavedAt` | `attemptId, content, wordCount, lastSavedAt` | Falta `characterCount` en el API Contract; campo renombrado `autosavedAt` → `lastSavedAt`. |
| `VersionDTO` | `versionNumber, content, createdAt` | `versionId, attemptId, versionNumber, content, submittedAt, feedbackStatus` | El API Contract añade `versionId`, `attemptId`, `feedbackStatus`; renombra `createdAt` → `submittedAt`. |
| `FeedbackDTO` | `versionNumber, observations[], deliveredAt` | `feedbackId, versionId, status, observations[], generatedAt` | Identificación distinta (`versionNumber` vs. `feedbackId`/`versionId`); campos `status`/`generatedAt` sin equivalente en el Application Model. |
| `FeedbackObservationDTO` | `category, priority, strength, explanation, suggestion` | idéntico | **Sin divergencia** — único DTO compuesto que coincide exactamente. |
| `TeacherOverrideDTO` | `action, authorId, reason, appliedAt` | `overrideId, unitId, action, reason, appliedBy, appliedAt` | Divergencia menor: `authorId` vs. `appliedBy`; API Contract añade identificadores. |
| `StudentProgressSummaryDTO` | `studentId`, contadores por `UnitState` desglosados por `textType` | `studentId, unitsByState, unitsByTextType` | Equivalente en espíritu, forma/nombres distintos. |
| `StudentUnitHistoryDTO` | compuesto por `AttemptSummaryDTO`/`VersionDTO`/`FeedbackDTO` (ya existentes) | compuesto por los mismos tres DTOs | Al ser compuesto, **hereda transitivamente** todas las divergencias anteriores de sus tres componentes. |

**Riesgo específico 1 — `AttemptSummaryDTO.state` (API Contract v1.2, Sección 5):** este campo no aparece en ningún documento anterior (ni Domain Model, ni Application Model). El Domain Model declara explícitamente, como Invariante 6 (Sección 8): *"`UnitState` es la única máquina de estados autoritativa de una Unidad; `Attempt.currentStep` es información de posición interna, nunca un segundo estado paralelo o contradictorio."* Si `AttemptSummaryDTO.state` se implementara literalmente como un segundo valor de estado independiente de `AcademyUnit.state`, constituiría exactamente el antipatrón que esa invariante prohíbe. No hay evidencia de que sea una intención deliberada — ningún texto del API Contract explica su propósito ni su dominio de valores — por lo que se clasifica como riesgo, no como violación confirmada.

**Riesgo específico 2 — `ContinuationStateDTO` sin `draftContent` (API Contract v1.2, Sección 5, endpoint `EP-15`):** la Resolución A-06 exige que el mecanismo de continuidad restaure "el contenido del borrador guardado", y la Regla funcional 10 de la Functional Specification v1.3 exige que "el sistema restaura exactamente la unidad, el paso y el contenido en curso". El `ContinuationStateDTO` del Application Model (que respalda `QRY-03`) incluye `draftContent` explícitamente para satisfacer ese requisito en una sola consulta. El `ContinuationStateDTO` del API Contract (que respalda `EP-15`) no lo incluye — el contenido del borrador solo es recuperable mediante una segunda llamada, no documentada como tal, a `EP-17`. Ningún documento declara si esta separación en dos llamadas es una decisión deliberada de diseño REST o una omisión.

**Impacto:** riesgo real de que Backend y Frontend se implementen contra formas de contrato incompatibles si cada equipo usa un documento distinto como referencia — ninguno de los dos documentos se declara autoritativo sobre la forma de transporte. El riesgo específico 1 podría, en el peor caso, introducir una violación de la Invariante 6 del Domain Model si se materializa sin aclaración. El riesgo específico 2 podría dejar incompleta la implementación de A-06/Regla funcional 10 si `EP-15` se toma como la única fuente de continuidad sin documentar la llamada complementaria a `EP-17`.

**Corrección mínima recomendada:** (a) declarar explícitamente, en un ACP de sincronización documental (no de rediseño), cuál documento es autoritativo sobre la forma de transporte de cada DTO — recomendado: el API Contract, por ser el contrato real consumido por Frontend/Backend, dejando los DTOs del Application Model como una proyección lógica interna no necesariamente idéntica en forma; (b) eliminar o justificar explícitamente `AttemptSummaryDTO.state`, aclarando que no representa un segundo estado del `Attempt` (o retirarlo, si es un residuo de copia desde `AcademyUnitSummaryDTO`); (c) documentar explícitamente, en `EP-15`, que la reconstrucción completa de "Continúa donde te quedaste" requiere una llamada complementaria a `EP-17`, o añadir `draftContent` a `ContinuationStateDTO` del API Contract. Ninguna de estas correcciones requiere modificar el Domain Model, ningún Aggregate, invariante o resolución A-01–A-10 — es exclusivamente trabajo de reconciliación entre Application Model y API Contract.

---

### MEDIA

#### H-03 — `EP-05` (API Contract) sugiere una evaluación de `MASTERED` que su propio Application Model excluye de esa transacción

**Comprobación relacionada:** 4 (Máquina de estados).

**Evidencia documental:** API Contract v1.2, `EP-05` (Sección 4): *"Response contract: `AcademyUnitDetailDTO` reflejando el nuevo estado (`COMPLETED`, y `MASTERED` si aplica de forma diferida — ver PENDIENTE DE DECISIÓN DE API, Sección 8 de este documento no cubre evaluación de `MASTERED` vía API pública, ver exclusión deliberada más abajo)."* Contra Application Model v1.3, `CMD-07 CompleteReflection` (Sección 3 y recorrido detallado, Sección 7): la transición a `MASTERED` nunca ocurre dentro de `CMD-07` — es responsabilidad exclusiva de `CMD-08 EvaluateMastery`, con "disparador exacto PENDIENTE DE DECISIÓN DE ARQUITECTURA", explícitamente excluido de endpoint público (Sección 4 del API Contract, tabla de "Exclusiones deliberadas"). El propio Domain Model (Sección 9) confirma: `COMPLETED → MASTERED` es "no secuencial ni inmediata; asíncrona respecto a `COMPLETED`".

**Impacto:** bajo — la redacción de `EP-05` es ambigua/autocontradictoria (menciona `MASTERED` como posible resultado inmediato de la misma respuesta, luego se corrige a sí misma señalando que la evaluación de `MASTERED` está excluida), pero no hay evidencia de que el comportamiento real diseñado sea incorrecto: `CMD-08` permanece correctamente separado y asíncrono en el Application Model. Es un defecto de claridad de redacción, no una transición inventada.

**Corrección mínima recomendada:** simplificar la redacción de `EP-05` a `Response contract: AcademyUnitDetailDTO con state == COMPLETED` y eliminar la mención a `MASTERED` dentro de esa misma respuesta, dado que `EvaluateMastery` (`CMD-08`) ocurre en una transacción y momento completamente distintos y no expuestos por ningún endpoint público.

---

#### H-04 — Momento de emisión de `RevisionStarted` en el Application Model no coincide con el momento definido por el Domain Model

**Comprobación relacionada:** 5 (Domain Events), 10 (Event-Driven).

**Evidencia documental:** Domain Model v1.1, Sección 10, fila `RevisionStarted`: *"Cuándo ocurre: al iniciar una nueva `Draft` tras `FeedbackDelivered`."* Sección 9 (máquina de estados), transición `REVISION → AWAITING_FEEDBACK`: *"Evento que la dispara: `RevisionStarted` **seguido de** nueva `ProductionSubmitted`"* — el propio Domain Model describe ambos eventos como temporalmente distintos y secuenciales, no simultáneos.

Contra Application Model v1.3, `CMD-05 SubmitRevision` (Sección 3): *"Flujo principal: cargar `Attempt`; el `Attempt` emite `RevisionStarted`... congelar el `Draft` vigente en una nueva `Version`; el `Attempt` emite `ProductionSubmitted`/`FeedbackRequested`..."* — ambos eventos se emiten dentro de la **misma invocación** de `CMD-05`, es decir, en el momento del *envío* de la reescritura, no en el momento en que el estudiante *inicia* una nueva `Draft` (que ocurre, sin evento asociado, vía `CMD-03 AutosaveDraft`, Command que explícitamente "no publica eventos").

**Impacto:** medio — si `RevisionStarted` siempre se emite en el mismo instante que `ProductionSubmitted`, dentro del mismo Command, el evento pierde el propósito de trazabilidad que el propio Domain Model le asigna (H-11: "Event Sourcing parcial de `Attempt`", distinguir cuándo el estudiante *comenzó* a reescribir de cuándo *envió* la reescritura). No hay ningún Command en el Application Model que dispare `RevisionStarted` en el momento real de inicio de la reescritura (`CMD-03 AutosaveDraft` está explícitamente diseñado sin eventos). Esto no contradice ninguna regla de negocio ni invariante — es una imprecisión de granularidad temporal entre el Domain Model (que define el evento como marcador de "inicio") y su implementación orquestada (que lo emite como marcador de "envío").

**Corrección mínima recomendada:** (a) aclarar en el Domain Model, mediante nota editorial no funcional, que `RevisionStarted` se emite en la práctica junto con el envío de la reescritura (redefiniendo su "cuándo" para que coincida con la orquestación ya construida), o (b) ajustar el Application Model para que `RevisionStarted` se dispare en un punto distinto y anterior a `ProductionSubmitted` dentro del mismo Command (aún en una sola transacción de `Attempt`, sin violar el patrón de dos transacciones ya definido), preservando la distinción temporal que el Domain Model describe. Cualquiera de las dos opciones es una corrección de precisión documental o de orquestación de bajo riesgo — no reabre ninguna resolución A-01–A-10.

---

### BAJA

#### H-05 — Residuos ya conocidos, re-confirmados sin cambio de estado

**Comprobación relacionada:** 8 (Trazabilidad), 9 (CQRS).

**Evidencia documental:**
- `ModelExampleDTO`: el Application Model v1.3 (Sección 6) declara el campo `rating` sin `status`; el API Contract v1.2 (Sección 5) declara `status` (`ACTIVE`/`RETIRED`) sin `rating`. Ya registrado como "Fuera del alcance de ACP-002" en `academia-application-model-v1.2-2026-07-19.md` y en la Auditoría de Certificación previa — confirmado aquí como aún sin resolver, sin cambio de severidad.
- API Contract v1.2, Sección 1: continúa citando *"el mapeo 1:1 entre los 15 Commands y las 9 Queries ya definidos en el Application Model v1.0... y los 11 casos de uso"* — cifras desactualizadas (ahora 17 Commands, 9 Queries activas tras retiro de `QRY-08`, 12 Casos de Uso). Ya registrado como residuo editorial en el Registro de Ejecución de ACP-002.
- API Contract v1.2, encabezado ("Documentos Frozen consumidos como contrato obligatorio"): cita *"Application Model v1.1, Academia Functional Specification v1.1, Academia Infrastructure Model v1.1"* — no actualizado a v1.3/v1.3/v1.1 tras ACP-003, pese a que el propio Historial de cambios del mismo documento sí registra ACP-003 correctamente. Observación nueva, de la misma naturaleza editorial que las dos anteriores.

**Impacto:** bajo en los tres casos — ninguno afecta la corrección funcional del módulo; son referencias cruzadas desactualizadas dentro de metadatos/encabezados, no en el contenido operativo de los documentos.

**Corrección mínima recomendada:** agrupar los tres puntos en un futuro ACP de sincronización editorial (ya anticipado por el propio Registro de Ejecución de ACP-002), sin necesidad de tratamiento individual urgente.

---

## 4. Evaluación global

**Método:** partiendo de 100, se resta 15 puntos por cada hallazgo CRÍTICA, 8 por cada ALTA, 4 por cada MEDIA y 1 por cada BAJA — mismo tipo de fórmula explícita ya usado en la Auditoría de Certificación previa de este módulo, para mantener comparabilidad entre auditorías del mismo ciclo documental.

- CRÍTICA: 0 → −0
- ALTA: 2 (H-01, H-02) → −16
- MEDIA: 2 (H-03, H-04) → −8
- BAJA: 3 (dentro de H-05) → −3

**Puntaje:** 100 − 16 − 8 − 3 = **73/100**.

---

## 5. Veredicto

**C) REQUIERE CORRECCIONES**

**Justificación:** el Domain Model v1.1 en sí mismo permanece íntegro, y ninguna de las diez comprobaciones obligatorias revela una contradicción, invención o reinterpretación de un Aggregate, invariante, Policy, Specification, Domain Event o resolución A-01–A-10 ya aprobados — las diez comprobaciones se cumplen en su núcleo de dominio sin excepción. Esto descarta tanto `BLOQUEADO` (no hay contradicción estructural) como una calificación de `APTO PARA IMPLEMENTACIÓN` sin reservas.

Se descarta también `APTO CON OBSERVACIONES` porque el Hallazgo H-02 no es cosmético: la divergencia estructural sistemática entre los DTOs del Application Model y los del API Contract afecta a la mayoría de los contratos de datos del módulo, sin que ningún documento declare cuál forma es la autoritativa — un equipo de Backend y un equipo de Frontend que trabajaran cada uno directamente desde un documento distinto producirían implementaciones incompatibles entre sí, y uno de los dos casos concretos detectados (`AttemptSummaryDTO.state`) tiene, si se materializa sin aclaración, riesgo directo de violar la Invariante 6 del Domain Model. El Hallazgo H-01 (Coverage Audit obsoleta) agrava el riesgo de que esa reconciliación no se emprenda, al no existir ya un documento de estado confiable que lo señale como pendiente.

La corrección requerida es enteramente de **reconciliación entre las capas Application y API**, y de **actualización/retiro formal de la Coverage Audit** — ninguna de las dos acciones exige un nuevo ACP sobre el Domain Model, ningún Aggregate, ninguna Policy ni ninguna resolución A-01–A-10. Se recomienda, como próximo paso, un ACP de alcance limitado y explícito ("ACP-004 — Reconciliación de contratos de datos Application↔API + actualización de Coverage Audit"), siguiendo la misma disciplina de "registrar, no resolver por fuera de alcance" ya aplicada en los tres ciclos anteriores de este módulo.
