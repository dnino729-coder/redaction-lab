# ACADEMIA — Reconciliación Arquitectónica (Post Domain Audit)

**Rol:** Principal Software Architect — DDD, Clean Architecture, CQRS, Event-Driven Architecture, Specification by Contract.
**Fecha:** 2026-07-20.
**Naturaleza:** exclusivamente de detección y reconciliación documental. No se modifica, reescribe ni regenera ningún documento. No se propone una nueva arquitectura.

**Documentos analizados conjuntamente (fuente arquitectónica única):**
- Domain Model — `academia-domain-model-v1.1-2026-07-19.md` (Frozen)
- Application Model — `academia-application-model-v1.3-2026-07-20.md`
- API Contract — `academia-api-contract-v1.2-2026-07-20.md`
- Infrastructure Model — `academia-infrastructure-model-v1.1-2026-07-19.md`
- Functional Specification — `academia-functional-specification-v1.3-2026-07-20.md` (Frozen)
- Coverage Audit — `academia-architecture-coverage-audit-2026-07-19.md`
- Auditoría DDD — `academia-ddd-audit-2026-07-19.md` (H-01 a H-11, ya resueltos en Domain Model v1.1)
- Auditoría Domain vs. Application — `academia-domain-vs-application-audit-2026-07-19.md` (CH-01, aún abierto)
- Resoluciones Arquitectónicas — `academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10)
- ACP aprobados y ejecutados — `acp-001-registro-de-ejecucion-2026-07-19.md`, `acp-002-registro-de-ejecucion-2026-07-20.md`, `acp-003-registro-de-ejecucion-2026-07-20.md`

**Regla de no-invención aplicada:** cuando dos documentos expresan la misma decisión con redacción distinta, se consideran consistentes y no se reportan. Solo se listan contradicciones verificables mediante evidencia textual citada por documento y sección.

---

## 1. Resumen ejecutivo

Reconstruido el modelo oficial (Fase 1) y comparados todos los documentos entre sí, en ambas direcciones, no solo contra el Domain Model (Fase 2), **ningún hallazgo alcanza el nivel BLOCKER**: los tres Aggregate Roots, las 17 reglas RN-1 a RN-17, las 11 invariantes + Regla de Consistencia Eventual (8.1), la máquina de estados oficial, los 13 Domain Events, las 7 Policies, las 3 Specifications y las diez resoluciones A-01–A-10 permanecen intactos y correctamente reflejados en Application, Infrastructure y API. Ningún hallazgo de esta reconciliación exige tocar ninguno de esos elementos protegidos.

Se detectan, sin embargo, **nueve inconsistencias reales entre documentos posteriores al Domain Model**, ninguna de origen en el Domain Model mismo:

- Una **desalineación sistemática de numeración `QRY-XX`** entre los Commands/Queries del Application Model y el campo "Dependencias" de nueve endpoints consecutivos del API Contract (`EP-12` a `EP-20`) — de mayor alcance que lo ya registrado como residuo (que solo mencionaba `EP-17`–`EP-20`), y con un caso agravado: `EP-19` cita `QRY-08`, una Query formalmente **retirada**.
- Una **divergencia estructural sistemática entre los DTOs del Application Model y los del API Contract** que comparten nombre — ya detectada en la auditoría de consistencia previa, reconfirmada aquí bajo el método de comparación total-contra-total.
- Un campo (`AttemptSummaryDTO.state`, API Contract) sin respaldo en ningún documento anterior, con riesgo de introducir un segundo estado paralelo al `UnitState` del `Attempt` — prohibido explícitamente por la Invariante 6 del Domain Model.
- Una Coverage Audit completamente desactualizada respecto al estado real del módulo tras ACP-001/002/003.
- Cuatro hallazgos adicionales de severidad MEDIA/BAJA, tres de ellos ya conocidos y re-confirmados sin cambio de estado.

Ninguna corrección propuesta exige modificar A-01–A-10, ningún ACP ya aprobado, ningún Bounded Context, Aggregate Root, regla de negocio, invariante, máquina de estados o flujo oficial.

---

## 2. Tabla de hallazgos

| ID | Severidad | Documento(s) | Estado |
|---|---|---|---|
| R-01 | ALTA | Coverage Audit | Nuevo (alcance ya conocido; gravedad reconfirmada) |
| R-02 | ALTA | Application Model ↔ API Contract | Nuevo (detectado en auditoría de consistencia previa, 2026-07-20) |
| R-03 | ALTA | API Contract (`AttemptSummaryDTO`) | Nuevo (detectado en auditoría de consistencia previa, 2026-07-20) |
| R-04 | ALTA | API Contract (Sección 4, `EP-12`–`EP-20`) | **Nuevo — no detectado en ninguna auditoría previa en su alcance real** |
| R-05 | MEDIA | API Contract (`EP-05`) | Nuevo (detectado en auditoría de consistencia previa, 2026-07-20) |
| R-06 | MEDIA | Application Model (`CMD-05`) vs. Domain Model | Nuevo (detectado en auditoría de consistencia previa, 2026-07-20) |
| R-07 | BAJA | Functional Specification | Ya conocido (F-03, Coverage Audit 2026-07-19) — reconfirmado sin cambio |
| R-08 | BAJA | Application Model ↔ API Contract (`ModelExampleDTO`) | Ya conocido (residuo ACP-002/ACP-003) — reconfirmado sin cambio |
| R-09 | BAJA | API Contract (encabezado, Sección 1, `CMD-11`) | Ya conocido en parte (residuo ACP-002) — alcance ampliado aquí |

**BLOCKER: ninguno.**

---

## 3. Hallazgos completos

### R-01 — Coverage Audit no refleja el estado real del proyecto

**Hallazgo:** la Coverage Audit vigente (`academia-architecture-coverage-audit-2026-07-19.md`) presenta como abiertos hallazgos ya cerrados (F-01, F-02, F-09) y no incorpora ningún elemento añadido por ACP-001/002/003 (`CMD-16`, `CMD-17`, `QRY-10`, `EP-21`, `EP-22`, `EP-23`, `CU-12`).

**Evidencia:** Coverage Audit, Sección "HALLAZGOS" (F-01: *"ERROR CRÍTICO"*, F-02: *"AMBIGÜEDAD"*, F-09: *"AMBIGÜEDAD"*) y Sección "MÉTRICAS" (72.7%/92.5%) — ninguno actualizado tras `acp-001-registro-de-ejecucion-2026-07-19.md`, `acp-002-registro-de-ejecucion-2026-07-20.md` ni `acp-003-registro-de-ejecucion-2026-07-20.md`. Contraste directo: Application Model v1.3 Sección 3 (`CMD-16`, `CMD-17`, `QRY-10` presentes) y API Contract v1.2 Sección 4 (`EP-21`, `EP-22`, `EP-23` presentes) — ninguno de estos seis elementos aparece en ninguna matriz de la Coverage Audit.

**Impacto:** cualquier consulta a este documento como estado de cobertura produce una lectura falsa del módulo — un `ERROR CRÍTICO` cerrado hace tres ciclos de ejecución se presenta como vigente.

**Principio violado:** Trazabilidad documental (no es un principio DDD/Clean Architecture en sentido estricto; es una violación de la disciplina de gestión de cambios ya establecida por el propio `Architecture Change Management Standard v1.0` del proyecto, que exige que cada ACP deje evidencia de cierre en los documentos afectados).

**Corrección mínima:** añadir una nota de estado al inicio de la Coverage Audit remitiendo a los tres Registros de Ejecución y a la Auditoría de Certificación como fuente de las cifras vigentes; o declararla formalmente `SUPERSEDED`. No requiere recalcular las matrices desde cero.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** No. **Afecta API Contract:** No. **Afecta Infrastructure:** No. *(Corrección exclusivamente sobre el propio documento de Coverage Audit.)*

---

### R-02 — Divergencia estructural entre DTOs del Application Model y del API Contract

**Hallazgo:** `AcademyUnitSummaryDTO`, `AcademyUnitDetailDTO`, `AttemptSummaryDTO`, `ContinuationStateDTO`, `DraftDTO`, `VersionDTO` y `FeedbackDTO` comparten nombre entre el Application Model (Sección 6) y el API Contract (Sección 5), pero declaran conjuntos de campos distintos, sin que ningún documento indique cuál es la forma autoritativa de transporte ni documente una función de mapeo entre ambas.

**Evidencia:** comparación campo por campo, Application Model v1.3 Sección 6 vs. API Contract v1.2 Sección 5. Ejemplo más claro: `ContinuationStateDTO` del Application Model incluye `draftContent?`; la versión del API Contract (que respalda `EP-15`) lo omite por completo, pese a que A-06 y la Regla funcional 10 de la Functional Specification exigen restaurar "exactamente... el contenido en curso".

**Impacto:** riesgo de que Backend y Frontend implementen formas de contrato incompatibles si cada equipo usa un documento distinto como referencia; riesgo de que `EP-15` no pueda, por sí solo, satisfacer A-06 sin una llamada adicional no documentada a `EP-17`.

**Principio violado:** Clean Architecture (el DTO de un puerto/capa debe tener una forma única y no ambigua entre las capas que lo comparten); consistencia de contrato en CQRS (el "lado de lectura" expuesto debe ser el mismo en toda la cadena Application→API).

**Corrección mínima:** declarar explícitamente en un futuro ACP editorial cuál documento es autoritativo sobre la forma de transporte de cada DTO (recomendado: API Contract, por ser el contrato real consumido por Frontend/Backend); documentar la llamada complementaria a `EP-17` en `EP-15`, o añadir `draftContent` al `ContinuationStateDTO` del API Contract.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** Sí (aclaración de rol de sus DTOs). **Afecta API Contract:** Sí (ajuste de campos/documentación). **Afecta Infrastructure:** No.

---

### R-03 — `AttemptSummaryDTO.state` (API Contract) introduce un campo de estado sin respaldo, con riesgo sobre la Invariante 6

**Hallazgo:** el API Contract declara `AttemptSummaryDTO: attemptId, unitId, state, currentStep, startedAt` — el campo `state` no existe en el Application Model, ni en el Domain Model, ni en ninguna otra referencia previa a `Attempt`.

**Evidencia:** API Contract v1.2, Sección 5, `AttemptSummaryDTO`. Contraste: Domain Model v1.1, Sección 8, Invariante 6: *"`UnitState` es la única máquina de estados autoritativa de una Unidad; `Attempt.currentStep` es información de posición interna, nunca un segundo estado paralelo o contradictorio."* Application Model v1.3, Sección 6, `AttemptSummaryDTO` (sin campo `state`, solo `currentStep`).

**Impacto:** si se implementa literalmente como un segundo estado independiente de `AcademyUnit.state`, constituye exactamente el antipatrón que la Invariante 6 prohíbe. Sin evidencia de intención deliberada en ningún texto del API Contract.

**Principio violado:** DDD — invariante de agregado (un único origen de verdad de estado); Single Source of Truth.

**Corrección mínima:** retirar el campo `state` de `AttemptSummaryDTO` en el API Contract (probable residuo de copia desde `AcademyUnitSummaryDTO`), o, si tiene un propósito real distinto, documentarlo explícitamente aclarando que no es un segundo estado del `Attempt`.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No (no se toca; el riesgo es solo si se materializa sin corrección). **Afecta Application Model:** No. **Afecta API Contract:** Sí. **Afecta Infrastructure:** No.

---

### R-04 — Numeración `QRY-XX` desalineada entre Application Model y API Contract, `EP-12` a `EP-20`, con una referencia a Query retirada

**Hallazgo:** el campo "Dependencias" de nueve endpoints consecutivos del API Contract (`EP-12` a `EP-20`) cita un identificador `QRY-XX` que no corresponde al Query real que produce el DTO declarado en ese mismo endpoint — el patrón es un desplazamiento sistemático de -1 respecto a la numeración real del Application Model, con dos casos agravados.

**Evidencia (Application Model v1.3, Sección 3/5, vs. API Contract v1.2, Sección 4):**

| Endpoint | DTO que retorna (según su propio Response contract) | Query citada en "Dependencias" | Query real que produce ese DTO (Application Model) |
|---|---|---|---|
| `EP-12` | `StudentProgressSummaryDTO` | `QRY-01` | `QRY-07 GetStudentProgressSummary` |
| `EP-13` | `AcademyUnitSummaryDTO[]` | `QRY-02` | `QRY-01 ListAcademyUnitsForStudent` |
| `EP-14` | `AcademyUnitDetailDTO` | `QRY-03` | `QRY-02 GetAcademyUnitDetail` |
| `EP-15` | `ContinuationStateDTO` | `QRY-04` | `QRY-03 GetContinuationState` |
| `EP-16` | `AttemptSummaryDTO[]` | `QRY-05` | `QRY-04 GetAttemptHistory` |
| `EP-17` | `DraftDTO` | `QRY-06` | **Ninguna Query del Application Model produce `DraftDTO` de forma aislada** — no existe un `QRY-XX` correcto al cual apuntar. |
| `EP-18` | `FeedbackDTO` | `QRY-07` | `QRY-05 GetVersionFeedback` |
| `EP-19` | `ModelExampleDTO[]` | **`QRY-08`** | `QRY-06 ListModelExamplesByTextType` — **`QRY-08` fue formalmente retirada en ACP-002-B** (Application Model v1.3, Sección 3: *"QRY-08 — (retirada, v1.2, ACP-002-B)... Este identificador queda reservado y no reutilizado"*). |
| `EP-20` | `StudentProgressSummaryDTO` (vista docente) | `QRY-09` | `QRY-07 GetStudentProgressSummary` (mismo Query que `EP-12`, según el propio Application Model, Sección 13: *"consultar `GetStudentProgressSummary`... sobre estudiantes con relación docente"*) |

Esto ya había sido parcialmente registrado — el "FUERA DEL ALCANCE DE ACP-003" del `acp-003-registro-de-ejecucion-2026-07-20.md` menciona *"numeración QRY-XX desalineada en EP-17–EP-20"* — pero esa nota subestima el alcance real: la desalineación cubre `EP-12` a `EP-20` (9 endpoints, no 4), y no señala el caso más grave (`EP-19` apuntando a una Query retirada) ni el caso sin solución directa (`EP-17`, que no tiene ningún `QRY-XX` correcto al cual corregirse — el Application Model nunca definió una Query dedicada para "obtener el borrador actual" de forma aislada).

**Impacto:** cualquier implementador que siga literalmente el campo "Dependencias" del API Contract para ubicar la lógica de Application correspondiente terminará en el Query equivocado en 8 de 9 casos, y en un Query inexistente en uno de ellos (`EP-19`). Es un defecto de trazabilidad verificable con evidencia textual directa, no una diferencia de redacción.

**Principio violado:** CQRS (trazabilidad 1:1 entre el lado de lectura expuesto y su Query de origen); REST (un recurso de solo lectura debe declarar su fuente de datos real).

**Corrección mínima:** corregir el campo "Dependencias" de `EP-12` a `EP-20` en el API Contract para que cite el `QRY-XX` correcto según la tabla anterior; para `EP-17`, añadir explícitamente la Query faltante al Application Model (una extensión aditiva menor, análoga a `QRY-10`) o documentar que `EP-17` se resuelve mediante lectura directa de `Draft` sin una Query nombrada. Ningún cambio de comportamiento — es exclusivamente corrección de citas cruzadas.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** Posiblemente Sí, solo si se opta por nombrar formalmente la Query faltante de `EP-17` (aditivo, sin tocar ninguna existente). **Afecta API Contract:** Sí. **Afecta Infrastructure:** No.

---

### R-05 — `EP-05` sugiere una evaluación de `MASTERED` que su propia orquestación excluye de esa transacción

**Hallazgo:** el Response contract de `EP-05` menciona `MASTERED` como posible resultado inmediato de esa misma respuesta, contradiciendo la separación ya definida entre `CMD-07` (síncrono) y `CMD-08 EvaluateMastery` (asíncrono, sin endpoint público).

**Evidencia:** API Contract v1.2, `EP-05`: *"Response contract: `AcademyUnitDetailDTO` reflejando el nuevo estado (`COMPLETED`, y `MASTERED` si aplica de forma diferida...)"*. Contraste: Application Model v1.3, `CMD-07` (Sección 3 y recorrido de Sección 7) nunca invoca `MasteryPolicy` ni emite `UnitMastered` dentro de su propio flujo; `CMD-08` es un Command separado, de disparador pendiente, explícitamente excluido de endpoint (API Contract, Sección 4, "Exclusiones deliberadas").

**Impacto:** bajo — riesgo de que un implementador espere `MASTERED` en la respuesta síncrona de `EP-05`, cuando por diseño esa transición ocurre en un momento y transacción distintos.

**Principio violado:** consistencia de contrato Application↔API; claridad de las garantías síncronas vs. asíncronas ya definidas (CQRS/Event-Driven).

**Corrección mínima:** simplificar el Response contract de `EP-05` a `state == COMPLETED` únicamente, eliminando la mención a `MASTERED` dentro de esa respuesta.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** No. **Afecta API Contract:** Sí. **Afecta Infrastructure:** No.

---

### R-06 — Momento de emisión de `RevisionStarted` no coincide con la definición del Domain Model

**Hallazgo:** el Domain Model define `RevisionStarted` como el evento que marca el *inicio* de una nueva `Draft` tras `FeedbackDelivered`, distinto y anterior a `ProductionSubmitted`; el Application Model lo emite dentro del mismo Command (`CMD-05 SubmitRevision`) que ya congela la nueva `Version` y emite `ProductionSubmitted` — es decir, en el momento del *envío*, no del *inicio*.

**Evidencia:** Domain Model v1.1, Sección 10, fila `RevisionStarted`: *"Cuándo ocurre: al iniciar una nueva `Draft` tras `FeedbackDelivered`."* Sección 9: *"`RevisionStarted` **seguido de** nueva `ProductionSubmitted`"* (eventos secuenciales, no simultáneos). Application Model v1.3, `CMD-05`: ambos eventos se emiten dentro del mismo flujo principal, en la misma invocación.

**Impacto:** medio — el evento pierde parte del valor de trazabilidad temporal que el Domain Model le asigna (H-11: distinguir "cuándo empezó" de "cuándo envió"), ya que `CMD-03 AutosaveDraft` (que sí ocurre en el momento real de inicio) está diseñado explícitamente sin publicar eventos.

**Principio violado:** Event Sourcing parcial / precisión semántica de Domain Events (el nombre y el momento de un evento deben coincidir).

**Corrección mínima:** ajustar la nota de "cuándo ocurre" de `RevisionStarted` en el Domain Model para reflejar que se emite junto al envío (cambio editorial, sin efecto de comportamiento), o mover su disparo en el Application Model a un punto distinto dentro de la misma transacción de `Attempt`.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** Posiblemente Sí (solo nota editorial de "cuándo", sin cambiar el evento, su emisor ni su propósito) — alternativa preferible: **Afecta Application Model:** Sí. **Afecta API Contract:** No. **Afecta Infrastructure:** No.

---

### R-07 — `CMD-12`/`CMD-13`/`CMD-14` (gestión de `ModelExample`) sin Caso de Uso formal en la Functional Specification

**Hallazgo:** las operaciones del Administrador sobre `ModelExample` no tienen un `CU-xx` dedicado con el mismo formato objetivo/actor/precondiciones/flujo/excepciones/resultado usado para Estudiante y Profesor — solo trazan a la tabla de permisos (Sección 2).

**Evidencia:** Functional Specification v1.3, Sección 7 (`CU-01` a `CU-12`, ninguno para Administrador) vs. Sección 2 (fila Administrador, permisos genéricos). Ya identificado como F-03 en la Coverage Audit 2026-07-19, clasificado `DOCUMENTACIÓN`, sin exigir Change Proposal.

**Impacto:** bajo — la trazabilidad ya existe por otra vía (tabla de permisos + `CMD-12/13/14` + `EP-09/10/11`); no bloquea implementación.

**Principio violado:** completitud documental (no un principio arquitectónico en sentido estricto).

**Corrección mínima:** agregar `CU-13`, `CU-14`, `CU-15` (o equivalente) para Administrador en una futura revisión editorial de la Functional Specification.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** No. **Afecta API Contract:** No. **Afecta Infrastructure:** No.

---

### R-08 — `ModelExampleDTO`: `rating` (Application Model) vs. `status` (API Contract)

**Hallazgo:** el Application Model declara el campo `rating` en `ModelExampleDTO` sin `status`; el API Contract declara `status` (`ACTIVE`/`RETIRED`) sin `rating`.

**Evidencia:** Application Model v1.3, Sección 6, `ModelExampleDTO`. API Contract v1.2, Sección 5, `ModelExampleDTO`. Ya registrado como residuo "Fuera del alcance de ACP-002" en `academia-application-model-v1.2-2026-07-19.md` y reconfirmado en la Auditoría de Certificación previa — sin cambio de estado desde entonces.

**Impacto:** bajo — instancia adicional del patrón general de R-02, ya conocida.

**Principio violado:** mismo que R-02 (consistencia de forma de DTO compartido).

**Corrección mínima:** decidir si ambos campos coexisten (unificar en ambos documentos) o si uno es residuo de una versión anterior a retirar.

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** Sí. **Afecta API Contract:** Sí. **Afecta Infrastructure:** No.

---

### R-09 — Referencias de versión desactualizadas dentro del propio API Contract

**Hallazgo:** el encabezado del API Contract v1.2 ("Documentos Frozen consumidos como contrato obligatorio") cita *"Application Model v1.1, Academia Functional Specification v1.1, Academia Infrastructure Model v1.1"* pese a que las versiones vigentes son v1.3, v1.3 y v1.1 respectivamente; la Sección 1 cita *"15 Commands y... 9 Queries ya definidos en el Application Model v1.0"* y *"11 casos de uso"* (ahora 17 Commands, 9 Queries activas, 12 Casos de Uso); las referencias cruzadas de `CMD-11` en el Application Model citan *"Functional Specification v1.2"* y *"API Contract v1.1"*, ya superadas por v1.3 y v1.2.

**Evidencia:** API Contract v1.2, línea de encabezado y Sección 1. Application Model v1.3, Sección 3, `CMD-11`, "Referencias cruzadas". El primer punto ya estaba parcialmente registrado como residuo editorial en el Registro de Ejecución de ACP-002; el resto se confirma aquí por primera vez bajo el mismo patrón.

**Impacto:** bajo — puramente de metadatos/citación, sin efecto en el contenido operativo de ningún documento.

**Principio violado:** ninguno arquitectónico — higiene de referencias documentales.

**Corrección mínima:** actualizar las referencias de versión en un futuro ACP de sincronización editorial (el mismo ya anticipado para R-01/R-08).

**Afecta A-01...A-10:** No. **Afecta Domain Model:** No. **Afecta Application Model:** Sí (menor). **Afecta API Contract:** Sí (menor). **Afecta Infrastructure:** No.

---

## 4. Plan mínimo de corrección, ordenado por prioridad

1. **R-04** — Corregir el campo "Dependencias" de `EP-12` a `EP-20` en el API Contract; resolver el caso sin Query correcta de `EP-17`. Es puramente una corrección de citas, de alto valor de trazabilidad y bajo esfuerzo.
2. **R-03** — Retirar o justificar `AttemptSummaryDTO.state` en el API Contract, cerrando el riesgo sobre la Invariante 6.
3. **R-02** — Emitir un ACP editorial de reconciliación de forma de DTOs compartidos entre Application Model y API Contract (incluye, como caso particular ya conocido, R-08).
4. **R-01** — Actualizar o declarar `SUPERSEDED` la Coverage Audit.
5. **R-05 / R-06** — Ajustes de redacción puntual en `EP-05` y en el "cuándo" de `RevisionStarted`.
6. **R-07 / R-09** — Agrupar en el mismo ACP editorial del punto 3: `CU-xx` de Administrador y limpieza de referencias de versión.

Ninguno de los seis puntos requiere reabrir A-01–A-10, ningún ACP ya aprobado, ni ningún elemento del Domain Model.

---

## 5. Veredicto

**C) REQUIERE CORRECCIONES**

El núcleo arquitectónico (Domain Model, sus tres Aggregate Roots, sus 17 reglas, sus invariantes, su máquina de estados, sus Domain Events, sus Policies y Specifications, y las diez resoluciones A-01–A-10) está completo y consistente en todos los documentos posteriores — no hay BLOCKER ni base para descalificar el módulo. Tampoco corresponde `APTO CON OBSERVACIONES`: R-04 es una contradicción de trazabilidad verificable, con evidencia textual directa, que afecta a nueve endpoints y a un caso donde el propio contrato cita una Query formalmente retirada — no es una diferencia de redacción, es una cita cruzada incorrecta. R-02/R-03 presentan el mismo nivel de exigencia de corrección antes de que dos equipos distintos (Backend/Frontend) puedan implementar contra el mismo contrato con garantía de coincidencia. Estas tres correcciones, junto con la actualización de la Coverage Audit (R-01), deben resolverse — mediante un ACP de alcance editorial, sin tocar el Domain Model — antes de considerar el módulo `APTO PARA CONTINUAR` sin reservas.
