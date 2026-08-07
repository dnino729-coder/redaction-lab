# Especificación del Modelo de Dominio — Academia v1.2 (Reapertura — Context Mapping de Organization Management)

**Base única y vinculante:** `docs/audits/academia-functional-audit-2026-07-19.md`, `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10), `docs/audits/academia-domain-model-v1.1-2026-07-19.md` (versión anterior), `docs/audits/academia-ddd-audit-2026-07-19.md` (auditoría DDD, Sprint 4.2.1), y — nuevo en esta versión — `docs/platform/redaction-lab-platform-core-foundation-v1.2-2026-07-31.md` (Sección 10, Bounded Context Query Gateway) y los cuatro documentos FROZEN de Organization Management (Domain Model, Application Model, Infrastructure Model, API Contract).

**Nota de trazabilidad (heredada de v1.1):** el encargo original referenciaba `docs/audits/academia-domain-model-ddd-audit-2026-07-19.md`; el archivo realmente existente (mismo contenido, misma auditoría) es `docs/audits/academia-ddd-audit-2026-07-19.md`.

**Historial de cambios**

| Versión | Fecha | ACP relacionado | Cambio |
|---|---|---|---|
| 1.0 | 2026-07-19 | — (versión inicial) | Modelo de Dominio original: tres Aggregate Roots (`AcademyUnit`, `Attempt`, `ModelExample`), Context Mapping de 7 Bounded Contexts, Ubiquitous Language, Value Objects, Enumeraciones, Reglas de Negocio, Invariantes, Máquina de Estados, Domain Events, Domain Services, Factories, Policies, Specifications. |
| 1.1 | 2026-07-19 | — (Sprint 4.2.2, DDD Remediation, sin ACP formal previo al Estándar) | Once correcciones de clasificación/precisión DDD (H-01 a H-11), detalladas en "Registro de Correcciones" — ninguna modificó A-01 a A-10, ningún Aggregate, ninguna regla de negocio ni el Context Mapping. |
| 1.2 | 2026-07-31 | **Pendiente de formalización — ver nota de gobernanza abajo** | Incorporación de **Organization Management** al Context Mapping (Sección 1), como octava relación, tipo Customer-Supplier, consumida mediante el patrón Bounded Context Query Gateway ya definido en Platform Core Foundation v1.2 §10. Añadida la corrección H-12 (Registro de Correcciones). Ningún Aggregate, Entity, Value Object, regla de negocio, invariante, Command, Query ni Endpoint fue modificado o introducido. |

**Nota de gobernanza (transparencia obligatoria, no oculta):** esta reapertura fue solicitada directamente por el usuario, sin que exista todavía un Architecture Change Proposal formal y dedicado que la autorice — ACP-005 autorizó **exclusivamente** la reapertura de Platform Core Foundation, no la de ningún documento de Academia (`acp-005-platform-core-synchronous-integration-pattern-2026-07-31.md`, campo "Documentos que NO deberán tocarse todavía"). Per Architecture Change Management Standard §2, el Domain Model de Academia es un documento sujeto al proceso ACP. Este documento se entrega tal como fue solicitado, pero **no puede declararse formalmente `FROZEN`** hasta que se emita un ACP dedicado (análogo al patrón de formalización retroactiva ya usado en ACP-004) — ver Dictamen al final de este informe.

---

## 1. Bounded Context

**Nombre:** Academia (Academy).

**Propósito:** gobernar el ciclo de vida de la práctica guiada de producción escrita por tipo de texto DELF B2, mediante unidades secuenciales de 11 pasos fijos (A-02), con retroalimentación exclusivamente formativa (A-05) y progresión controlada por desbloqueo (A-03).

**Responsabilidades:**
- Poseer y gobernar el ciclo de vida completo de la Unidad de Academia y su máquina de estados (A-07).
- Poseer el flujo de Producción/Borrador/Versión/Retroalimentación dentro de cada intento de unidad.
- Poseer en exclusiva la Biblioteca de Modelos, íntegramente dentro de este Bounded Context (A-04) — ver Sección 3, AR-3, para la precisión de ownership añadida en v1.1 (H-04).
- Aplicar las reglas de desbloqueo (A-03), repetición (A-09) y dominio (A-07, criterio de `MASTERED`).
- Publicar el contrato de finalización de actividad hacia Mi Plan (A-08).
- Exponer facultades de supervisión al Profesor (A-10) sin ceder autoridad sobre las reglas automáticas del contexto.

**Límites (qué NO pertenece a este Bounded Context):**
- Contenido teórico del examen — pertenece íntegramente a Conoce el DELF (A-01); Academia no posee ninguna entidad de contenido teórico.
- Práctica libre no guiada — pertenece a Laboratorio.
- Biblioteca temática (textos auténticos por tema, exploración libre) — pertenece a Laboratorio (A-04).
- Evaluación sumativa/certificación oficial DELF — pertenece a Evaluación Final/Simulador; Academia nunca calcula ni almacena puntuación sobre la rúbrica oficial (A-05).
- Memoria conversacional y gestión del Coach IA — pertenece al Bounded Context Coach IA; Academia solo consume su capacidad de retroalimentación/mentoría como contrato externo.
- Decisión de priorización pedagógica entre ecosistemas — pertenece al Motor Pedagógico Adaptativo; Academia solo recibe y aplica su señal de prioridad, nunca la genera.
- Cálculo de recompensas/XP — pertenece a Gamificación; Academia solo publica el evento que la dispara.
- **La relación docente-estudiante en sí (quién tiene autoridad sobre quién) — pertenece íntegramente a Organization Management (nuevo en v1.2, H-12); Academia solo consulta el resultado ya resuelto, nunca posee ni deriva esa relación por sí misma.**

**Invariantes del contexto (transversales, no específicas de un agregado):**
- Toda Unidad de Academia pertenece exactamente a un Estudiante.
- Ninguna transición de estado ocurre fuera de la secuencia oficial de 11 pasos (A-02) ni de la máquina de estados oficial (A-07).
- Academia nunca escribe directamente sobre datos de otro Bounded Context; toda comunicación saliente ocurre exclusivamente mediante Eventos de Dominio.
- Academia nunca aplica la rúbrica oficial DELF ni almacena puntuación de certificación (A-05).

**Relaciones con otros Bounded Context (Context Mapping):**

| Bounded Context | Tipo de relación | Descripción |
|---|---|---|
| **Dashboard** | Upstream (Academia) / Downstream (Dashboard), **Published Language** | Academia publica estado resumido; Dashboard nunca consulta directamente (regla ya vinculante, §5.7). |
| **Mi Plan** | Upstream (Academia) / Downstream (Mi Plan), **Published Language** | Único contrato: evento de finalización (A-08). Sin dependencia en sentido inverso. |
| **Conoce el DELF** | **Separate Ways** | Sin contrato, sin dependencia en ningún sentido (A-01). |
| **Laboratorio** | **Separate Ways** | Sin agregado ni contrato compartido; límite de contenido resuelto en A-04. |
| **Coach IA** | **Customer-Supplier** (Academia = cliente aguas abajo) | Academia consume la capacidad de mentoría/retroalimentación como Open Host Service; no conoce ni accede a la memoria interna del Coach. |
| **Motor Pedagógico Adaptativo** | **Customer-Supplier, Academia en rol Conformist** | Academia acepta la señal de priorización sin alterarla ni negociarla; nunca la usa para desbloquear (A-03 lo excluye explícitamente). |
| **Gamificación** | Upstream (Academia) / Downstream (Gamificación), **Published Language** | Academia publica eventos de finalización/dominio; el cálculo de recompensa es responsabilidad exclusiva de Gamificación. |
| **Organization Management** *(nuevo, v1.2, H-12)* | **Customer-Supplier** (Academia = cliente aguas abajo) | Academia consume, mediante el patrón **Bounded Context Query Gateway** (Platform Core Foundation v1.2, Sección 10), las Queries `VerifyAuthority`/`EnumerateAuthority` ya expuestas por Organization Management, para resolver la relación docente-estudiante que las facultades del Profesor (A-10, CU-09 a CU-12) requieren. Academia nunca posee ni modifica ninguna `Organization`/`Membership`/`Role`; Organization Management nunca conoce `AcademyUnit`/`Attempt`/`Version`/`Feedback`. El mecanismo concreto de invocación (composition root, wiring) queda fuera de alcance de este documento — pertenece al Application Model/Infrastructure Model de Academia, en una revisión futura y separada. |

---

## 2. Ubiquitous Language

*(Sin cambios respecto a v1.1.)*

| Término oficial | Definición | Responsabilidad | Sinónimos prohibidos |
|---|---|---|---|
| **Unidad de Academia** (AcademyUnit) | Instancia, por estudiante y por tipo de texto, del recorrido guiado de 11 pasos. | Aggregate Root — gobierna estado y progresión. | Lección, Lesson, Módulo, Ejercicio, Actividad |
| **Paso** (UnitStep) | Una de las 11 etapas fijas y ordenadas de una Unidad (A-02). | Enum, posición dentro de un Intento. | Etapa, Fase |
| **Intento** (Attempt) | Un recorrido completo (o en curso) de los 11 pasos para una Unidad — el original o una repetición (A-09). | Aggregate Root — gobierna Borrador/Versión/Retroalimentación de ese recorrido. | Repetición (nombra la acción, no el objeto), Sesión |
| **Borrador** (Draft) | Contenido en curso, mutable, de la Producción dentro del paso Producir/Reescribir, antes de generar una Versión. | Entidad interna de Intento. | Versión provisional |
| **Versión** (Version) | Snapshot inmutable de una Producción, generado cada vez que el estudiante envía contenido a retroalimentación. | Entidad interna de Intento. | Revisión (reservado al estado `REVISION`/al acto de reescribir) |
| **Retroalimentación** (Feedback) | Evaluación formativa de una Versión, expresada exclusivamente mediante las 10 categorías (A-05). | Entidad interna de Intento. | Corrección, Evaluación, Calificación |
| **Categoría de Retroalimentación** (FeedbackCategory) | Una de las 10 dimensiones formativas jerárquicas (§9.5). | Enum. | Criterio (reservado a la rúbrica oficial DELF, fuera de alcance por A-05) |
| **Biblioteca de Modelos** (Model Library) | Colección de producciones ejemplares con análisis comparativo, propiedad exclusiva de Academia (A-04). | Colección de Aggregate Roots `ModelExample`. | Biblioteca temática (recurso distinto, propiedad de Laboratorio) |
| **Ejemplo Modelo** (ModelExample) | Una producción ejemplar individual con comentario de IA. | Aggregate Root. | Modelo, Ejemplo genérico |
| **Desbloqueo** (Unlock) | Transición que habilita el acceso a la siguiente Unidad (A-03). | Regla protegida por `UnlockPolicy`. | Liberación, Apertura |
| **Dominio** (Mastery) | Evidencia sostenida de competencia, criterio del estado terminal `MASTERED` (A-07). | Regla protegida por `MasteryPolicy`. | Nivel (reservado a `StudentProfile.current_level/target_level`, escala DELF distinta), Maestría |
| **Anulación docente** (TeacherOverride) | Acción del Profesor que fuerza bloqueo o reinicio de una Unidad (A-10). | Entidad interna de AcademyUnit. | Excepción, Anulación administrativa (reservado al Administrador, §6.15) |
| **Tipo de Texto** (TextType) | Género DELF B2 que una Unidad trabaja. | Enum, compartido como vocabulario con Producción Escrita (§13.5), no redefinido aquí. | Categoría de texto, Tipología |

**Nota de compatibilidad de vocabulario (v1.2, no modifica la tabla):** ninguno de los términos de `Organization Management` (`Organization`, `Member`, `Membership`, `Role`, `Authority`) se incorpora al Ubiquitous Language de Academia — Academia consume únicamente el resultado ya reducido (booleano/colección de identificadores) del Bounded Context Query Gateway, sin adoptar vocabulario ajeno, consistente con el límite de contexto ya vigente (Sección 1, invariante: "Academia nunca escribe directamente sobre datos de otro Bounded Context").

---

## 3. Aggregate Roots

*(Sin cambios respecto a v1.1 — ninguno de los tres Aggregate Roots fue modificado.)*

### AR-1 — AcademyUnit

**Propósito:** representar, para un Estudiante y un Tipo de Texto, el estado de progresión oficial (A-07) de una Unidad.

**Responsabilidades:** gobernar en exclusiva el valor de `UnitState`; decidir, por sí misma, si el desbloqueo hacia la siguiente Unidad procede — invocando `UnlockPolicy` como criterio de evaluación y aplicando el resultado sobre su propio estado (A-03); decidir, por sí misma, si `MASTERED` procede — invocando `MasteryPolicy` de la misma forma (A-07); aplicar anulaciones docentes sobre sí misma, evaluando su elegibilidad mediante `TeacherOverridePolicy` y aplicando el resultado (A-10); mantener referencia al Intento activo y al historial de Intentos (por identidad, no por composición). En todos los casos, es `AcademyUnit` quien invoca la Policy correspondiente y aplica el resultado sobre su propio estado — ninguna Policy muta el Aggregate directamente ni decide en su lugar (precisión añadida en v1.1, H-02).

**Invariantes:**
- El valor de `UnitState` es la única fuente de verdad de progreso de la Unidad — ningún otro objeto mantiene un estado paralelo (ver Riesgo 1, sección 17).
- `LOCKED` solo transiciona a `UNLOCKED` cuando la Unidad predecesora de la misma progresión alcanza `COMPLETED`, o por anulación docente explícita (A-03, A-10).
- `COMPLETED` y `MASTERED` son estados terminales; ninguno retrocede a un estado anterior (A-07).
- Una Unidad en `LOCKED` nunca puede tener un Intento activo.

**Ciclo de vida:** se crea (vía `AcademyUnitFactory`) cuando la Unidad entra por primera vez en el catálogo visible del estudiante; permanece indefinidamente (no se elimina; es repetible sin límite, A-09).

**Límites del agregado:** no contiene el contenido de la Producción/Borrador/Versión/Retroalimentación — esos viven en el agregado `Attempt`, referenciado por identidad. No contiene `ModelExample`.

**Justificación como Aggregate Root:** es la única entidad cuya consistencia transaccional (estado, desbloqueo, dominio, anulaciones) debe protegerse como una unidad indivisible frente a otros agregados; tiene identidad y ciclo de vida propios, independientes del contenido de cualquier Intento particular.

### AR-2 — Attempt

**Propósito:** representar un recorrido completo (o en curso) de los 11 pasos oficiales para una `AcademyUnit`.

**Responsabilidades:** gobernar la posición actual dentro de la secuencia de 11 pasos (`UnitStep`); gobernar el ciclo Borrador → Versión → Retroalimentación → Reescritura (mínimo un ciclo obligatorio, A-07), invocando `RevisionPolicy`/`FeedbackPolicy` como criterio y aplicando el resultado sobre su propio estado interno; aplicar la puerta de comprensión antes de permitir Producir (§7.2); soportar el mecanismo de autoguardado y continuidad (A-06). Es el propio `Attempt`, y no ninguna Policy externa, quien decide y muta su posición y su ciclo interno — la Policy solo aporta el criterio (precisión añadida en v1.1, H-02).

**Invariantes:**
- El paso actual solo avanza en el orden exacto de A-02; nunca retrocede salvo el ciclo explícito `REVISION ⇄ AWAITING_FEEDBACK`.
- No puede alcanzar el paso `Reflexionar` sin al menos una Versión con Retroalimentación entregada y al menos una Reescritura posterior (A-07).
- No puede alcanzar el paso `Producir` sin que la puerta de comprensión del paso `Comprender` esté satisfecha.
- Una Versión, una vez creada, es inmutable — cualquier cambio genera una Versión nueva.
- A efectos de su propio límite de consistencia transaccional, `Attempt` solo requiere la `Version`/`Feedback` vigente para evaluar sus invariantes de transición; las Versiones/Retroalimentaciones anteriores de ese mismo Intento se conservan como historial de solo lectura fuera de ese límite estricto, evitando que el agregado deba cargar una colección sin límite superior (precisión añadida en v1.1, H-06).

**Ciclo de vida:** se crea (vía `AttemptFactory`) al iniciar una Unidad por primera vez o al repetirla (A-09); termina implícitamente al alcanzar el paso `Desbloquear`, momento en que notifica a `AcademyUnit` (vía evento de dominio) para su transición a `COMPLETED`.

**Límites del agregado:** referencia a `AcademyUnit` únicamente por identidad (no la modifica directamente); referencia a `ModelExample` únicamente por identidad y en modo lectura.

**Justificación como Aggregate Root:** el ciclo Borrador/Versión/Retroalimentación requiere consistencia transaccional fuerte y frecuente durante una sesión activa, con una tasa de cambio muy distinta a la de `AcademyUnit` (que cambia una vez por transición de estado) — separarlo evita cargar/bloquear el agregado de progreso completo por cada carácter autoguardado del borrador.

### AR-3 — ModelExample

**Propósito:** representar una producción ejemplar individual de la Biblioteca de Modelos, con su comentario comparativo de IA.

**Responsabilidades:** mantener el contenido ejemplar, su calificación editorial (excelente/con errores) y el comentario de IA asociado; ser referenciable por `Attempt` durante los pasos Observar/Analizar.

**Invariantes:** un `ModelExample` pertenece exactamente a un `TextType` y pertenece íntegramente al Bounded Context Academia, sin excepción — consistente con la Sección 1 ("Poseer en exclusiva la Biblioteca de Modelos"). Su contenido es de solo lectura para `Attempt` (nunca se modifica desde el flujo del estudiante). Su mutación editorial es ejecutada exclusivamente por el actor Administrador (§6.15), mediante un comando dirigido a este mismo agregado dentro de este mismo Bounded Context.

**Ciclo de vida:** creado/editado/retirado de forma independiente del progreso de cualquier estudiante.

**Justificación como Aggregate Root:** tiene identidad y ciclo de vida propios, gestionados de forma completamente independiente de `AcademyUnit`/`Attempt`; no existe ninguna regla de consistencia que exija agruparlo con ellos.

---

## 4. Entidades

*(Sin cambios respecto a v1.1.)*

**Draft** (interna de `Attempt`) — Identidad: única por Intento (a lo sumo un Borrador activo a la vez). Atributos conceptuales: contenido actual, marca de tiempo del último autoguardado. Comportamiento: se reemplaza en cada autoguardado (A-06); se congela en una `Version` al enviarse a retroalimentación. Reglas asociadas: el contenido de un Borrador nunca se considera evaluable hasta convertirse en Versión.

**Version** (interna de `Attempt`) — Identidad: número secuencial dentro del Intento. Atributos conceptuales: contenido congelado, número de secuencia, marca de tiempo de creación. Comportamiento: inmutable una vez creada. Reglas asociadas: "no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión" (§13.5, ya vinculante).

**Feedback** (interna de `Attempt`) — Identidad: asociada 1:1 a la `Version` que evalúa. Atributos conceptuales: conjunto de `FeedbackObservation` (una por cada una de las 10 categorías aplicables), orden jerárquico macro→micro. Comportamiento: se genera exactamente una vez por Versión evaluada; puede originar una nueva Versión (reescritura) pero nunca se edita a sí misma. Reglas asociadas: A-05 (marco formativo exclusivo); tono no punitivo (§8.6, ya vinculante).

**TeacherOverride** (interna de `AcademyUnit`) — Identidad: única por acción de anulación registrada. Atributos conceptuales: acción (`FORCE_LOCK`/`FORCE_RESTART`), autor, marca de tiempo, motivo. Comportamiento: se aplica sobre `AcademyUnit` sin tocar directamente ningún `Attempt` en curso (ver invariante en sección 8). Reglas asociadas: A-10.

**Nota (H-06, v1.1):** a efectos del límite de consistencia transaccional del agregado `Attempt`, únicamente la `Version`/`Feedback` vigente participa de las invariantes de transición (RN-2, RN-4); las Versiones/Retroalimentaciones anteriores del mismo Intento se conservan como historial de solo lectura, fuera de ese límite estricto — ninguna regla de negocio cambia, solo el tratamiento del historial dentro del límite del agregado.

---

## 5. Value Objects

*(Sin cambios respecto a v1.1.)*

| Value Object | Propósito | Atributos | Inmutabilidad / Igualdad | Justificación |
|---|---|---|---|---|
| **StudentId** | Referencia externa al Estudiante (otro Bounded Context). | Identificador único. | Inmutable; igualdad por valor. | Academia no posee al Estudiante, solo lo referencia. |
| **DraftContent** | Contenido textual junto con sus métricas derivadas. | Texto, conteo de palabras, conteo de caracteres. | Inmutable; cada autoguardado reemplaza la instancia completa dentro de `Draft`. | Evita mutación parcial inconsistente entre texto y sus métricas. |
| **FeedbackObservation** | Una observación formativa dentro de una `Feedback`. | Categoría (`FeedbackCategory`), fortaleza/debilidad, explicación, sugerencia de mejora. | Inmutable; igualdad por valor. | No tiene identidad propia — solo tiene sentido como parte de un conjunto de Retroalimentación. |
| **MasteryCriterion** | Condición evaluada para el estado `MASTERED`. | Competencia asociada, ausencia de debilidad crítica, número de encuentros independientes requeridos. | Inmutable. | Encapsula el criterio de A-07 como una unidad verificable, reutilizable por `MasteryPolicy`. |
| **WordCountRange** | Límites de extensión de una Unidad. | Mínimo de palabras, máximo de palabras. | Inmutable; igualdad por valor. | Vocabulario ya establecido en §13.5 (`WritingPrompt`), reutilizado como conocimiento de dominio, no como diseño de persistencia. |
| **VersionNumber** | Identificador secuencial de una `Version` dentro de un `Attempt`. | Número entero positivo. | Inmutable; igualdad por valor; debe ser estrictamente secuencial sin huecos. | Aísla la regla de secuencialidad de la entidad `Version` misma. |

**Nota (v1.2):** no se introduce ningún Value Object nuevo. En particular, no se crea ninguna referencia tipada a `Organization`/`Membership`/`Role` — el resultado consumido de Organization Management (booleano/colección de identificadores) no requiere un Value Object propio dentro de Academia, consistente con que Academia nunca posee esos conceptos.

---

## 6. Enumeraciones

*(Sin cambios respecto a v1.1.)*

**UnitState** (A-07, exacta): `LOCKED, UNLOCKED, IN_PROGRESS, AWAITING_FEEDBACK, REVISION, REFLECTION, COMPLETED, MASTERED`.

**UnitStep** (A-02, exacta, orden fijo): `CONTEXTUALIZE, DEFINE_OBJECTIVES, COMPREHEND, OBSERVE, ANALYZE, PRACTICE, PRODUCE, RECEIVE_FEEDBACK, REWRITE, REFLECT, UNLOCK`.

**TextType** (heredado como vocabulario compartido de §13.5, no redefinido): `LETTER, ARTICLE, ESSAY, EMAIL, REPORT`.

**DifficultyLevel** (alineado a §13.5/`WritingTask`): `EASY, MEDIUM, HARD`.

**FeedbackCategory** (§9.5, orden = jerarquía de prioridad macro→micro, con `priority` explícito desde H-07): `COMPREHENSION(1), COMMUNICATIVE_INTENT(2), STRUCTURE(3), COHERENCE(4), COHESION(5), ARGUMENTATION(6), REGISTER(7), VOCABULARY(8), GRAMMAR(9), SPELLING(10)`.

**MasteryLevel** (desde H-05): `DEVELOPING, CONSOLIDATING, SUSTAINED`.

**FeedbackStrength**: `STRENGTH, WEAKNESS`.

**OverrideAction** (A-10, exacto): `FORCE_LOCK, FORCE_RESTART`.

---

## 7. Reglas de Negocio

*(Sin cambios respecto a v1.1 — las 17 reglas permanecen exactamente iguales.)*

| # | Regla | Agregado que la protege | Origen |
|---|---|---|---|
| RN-1 | Ninguna Unidad omite pasos ni altera el orden de la secuencia de 11 pasos. | `Attempt` | A-02 |
| RN-2 | El paso `Comprender` debe quedar satisfecho antes de permitir `Producir`. | `Attempt` | §7.2, A-02 |
| RN-3 | Toda retroalimentación se expresa exclusivamente mediante las 10 `FeedbackCategory`, nunca mediante la rúbrica oficial DELF. | `Attempt` | A-05 |
| RN-4 | Debe existir al menos un ciclo de reescritura antes de avanzar de `REVISION` a `REFLECTION`. | `Attempt` | A-07, §7.2 |
| RN-5 | Una `Version` ya creada nunca se modifica; cualquier cambio genera una `Version` nueva. | `Attempt` | §13.5 |
| RN-6 | El desbloqueo de la siguiente `AcademyUnit` ocurre exclusivamente cuando la Unidad predecesora alcanza `COMPLETED`; no existe umbral de puntuación. | `AcademyUnit` | A-03 |
| RN-7 | El Motor Pedagógico nunca puede desbloquear una Unidad; solo prioriza contenido ya desbloqueado. | `AcademyUnit` | A-03, §9.7 |
| RN-8 | `MASTERED` requiere ausencia de debilidad `HIGH`/`CRITICAL` sostenida en `COMPLETED` y en al menos un encuentro independiente posterior sin andamiaje. | `AcademyUnit` | A-07 |
| RN-9 | `COMPLETED` y `MASTERED` son estados terminales; ninguno retrocede. | `AcademyUnit` | A-07 |
| RN-10 | El evento `EXTERNAL_ACTIVITY_COMPLETED` se emite exactamente una vez por Unidad, únicamente en la transición a `COMPLETED`, y solo si existe una tarea de Mi Plan vinculada. | `AcademyUnit` | A-08 |
| RN-11 | Repetir una Unidad ya `COMPLETED`/`MASTERED` no revierte su estado, no reemite el evento de finalización y no revoca recompensas ya otorgadas. | `AcademyUnit` | A-09 |
| RN-12 | Cada repetición genera un `Attempt` nuevo e independiente, desde el paso `CONTEXTUALIZE`; los Intentos previos se conservan sin modificación. | `Attempt` / `AcademyUnit` | A-09 |
| RN-13 | El Profesor puede forzar `LOCKED` o reiniciar una Unidad; ninguna otra anulación está autorizada. | `AcademyUnit` | A-10 |
| RN-14 | El Profesor no puede editar contenido editorial (lecciones, actividades, `ModelExample`) — esa facultad pertenece exclusivamente al Administrador, actuando dentro del Bounded Context Academia (ver H-04). | `ModelExample` | A-10, §6.15 |
| RN-15 | El estado de continuidad (Unidad activa, paso actual, contenido del Borrador) se conserva indefinidamente ante abandono, sin expiración. | `Attempt` | A-06 |
| RN-16 | `ModelExample` pertenece a un único `TextType` y es de solo lectura para el flujo del estudiante. | `ModelExample` | A-04 |
| RN-17 | Ninguna `AcademyUnit` en `LOCKED` puede tener un `Attempt` activo. | `AcademyUnit` | A-07 |

**Nota (v1.2):** ninguna regla nueva se introduce para la verificación de relación docente-estudiante — RN-13 (facultades del Profesor) permanece exactamente igual; la precondición "relación docente establecida" (ya descrita en la Functional Specification v1.3, CU-09 a CU-12) sigue resolviéndose fuera del Domain Model, en la capa de Application (`AcademyAuthorizationGuard`), tal como ya ocurría antes de esta versión.

---

## 8. Invariantes

*(Sin cambios respecto a v1.1 — las 11 invariantes y la Sección 8.1 permanecen exactamente iguales.)*

1. Una Unidad en `LOCKED` nunca puede iniciarse (no existe transición directa `LOCKED → IN_PROGRESS`).
2. `COMPLETED` nunca vuelve a `IN_PROGRESS` ni a ningún estado anterior.
3. `MASTERED` nunca retrocede, bajo ninguna condición, incluida la repetición (A-09).
4. Una Unidad solo puede desbloquear a la siguiente desde `COMPLETED`.
5. La Retroalimentación siempre ocurre antes de `REFLECTION`.
6. `UnitState` es la única máquina de estados autoritativa de una Unidad; `Attempt.currentStep` es información de posición interna, nunca un segundo estado paralelo o contradictorio.
7. Un `Attempt` solo puede pertenecer a una `AcademyUnit`, y una `AcademyUnit` tiene, como máximo, un `Attempt` activo a la vez.
8. Una `Version` inmutable nunca se elimina ni se sobrescribe.
9. `EXTERNAL_ACTIVITY_COMPLETED` se emite como máximo una vez por Unidad y por primera finalización.
10. Un `TeacherOverride` que fuerza `LOCKED` o reinicia una Unidad nunca modifica directamente un `Attempt` en curso.
11. `ModelExample` nunca es modificado por `Attempt` ni por `AcademyUnit` — solo leído.

### 8.1 — Regla de Consistencia Eventual (H-01)

> Ninguna transición de `UnitState` ocurre sin que su `Attempt` correspondiente haya alcanzado el `UnitStep` equivalente.

Sin cambios respecto a v1.1.

---

## 9. Máquina de Estados

*(Sin cambios respecto a v1.1.)*

**Estados:** `LOCKED, UNLOCKED, IN_PROGRESS, AWAITING_FEEDBACK, REVISION, REFLECTION, COMPLETED, MASTERED`.

**Estados terminales:** `COMPLETED` (para el Intento activo) y `MASTERED` (terminal absoluto).

| Transición | Evento que la dispara | Restricción |
|---|---|---|
| `LOCKED → UNLOCKED` | `UnitUnlocked` o `TeacherOverrideApplied` (`FORCE_RESTART`) | Protegida por `UnlockPolicy` (RN-6, RN-7). |
| `UNLOCKED → IN_PROGRESS` | `UnitStarted` | Solo posible desde `UNLOCKED`. |
| `IN_PROGRESS → AWAITING_FEEDBACK` | `ProductionSubmitted` → `FeedbackRequested` | Requiere puerta de comprensión satisfecha (RN-2). |
| `AWAITING_FEEDBACK → REVISION` | `FeedbackDelivered` | — |
| `REVISION → AWAITING_FEEDBACK` | `RevisionStarted` seguido de nueva `ProductionSubmitted` | Ciclo sin límite superior. |
| `REVISION → REFLECTION` | `ReflectionStarted` | Requiere al menos un ciclo `REVISION` completado (RN-4). |
| `REFLECTION → COMPLETED` | `ReflectionCompleted` → `UnitCompleted` | — |
| `COMPLETED → MASTERED` | `UnitMastered` | No secuencial ni inmediata (invariante 4). |
| `Cualquier estado activo → LOCKED` | `TeacherOverrideApplied` (`FORCE_LOCK`) | No aplica sobre `COMPLETED`/`MASTERED` (RN-13, invariante 10). |

**Nota de repetición (H-03):** repetir una Unidad ya `COMPLETED`/`MASTERED` crea un nuevo `Attempt` (evento `UnitRepeated`) partiendo de `CONTEXTUALIZE`; `UnitState` no transiciona.

---

## 10. Domain Events

*(Sin cambios respecto a v1.1 — los trece eventos permanecen exactamente iguales.)*

| Evento | Quién lo emite | Cuándo ocurre | Quién puede consumirlo | Propósito |
|---|---|---|---|---|
| **UnitUnlocked** | `AcademyUnit` | Al transicionar `LOCKED → UNLOCKED` | Dashboard, Motor Pedagógico | Notificar disponibilidad de nuevo contenido. |
| **UnitStarted** | `Attempt` (vía `AcademyUnit`) | Al crear el primer `Attempt` de una Unidad | Dashboard (continuidad, A-06) | Marcar inicio de progresión activa. |
| **ProductionSubmitted** | `Attempt` | Al finalizar el paso `Producir` y congelar una `Version` | Coach IA/Feedback (contrato externo) | Registrar el hecho consumado de finalización de producción. |
| **FeedbackRequested** | `Attempt` | Inmediatamente después de `ProductionSubmitted` | Coach IA (Customer-Supplier) | Registrar la intención derivada de solicitar retroalimentación. |
| **FeedbackDelivered** | `Attempt` | Al recibir y registrar la `Feedback` completa | Estudiante, Competencias/Learning Analytics | Habilitar el paso `Reescribir`. |
| **RevisionStarted** | `Attempt` | Al iniciar una nueva `Draft` tras `FeedbackDelivered` | Auditoría interna (H-11) | Trazabilidad interna. |
| **ReflectionStarted** | `Attempt` | Al completar el ciclo mínimo de reescritura | Auditoría interna (H-11) | Trazabilidad interna. |
| **ReflectionCompleted** | `Attempt` | Al responder las preguntas metacognitivas | `AcademyUnit` | Disparar la transición final del Intento. |
| **UnitCompleted** | `AcademyUnit` | Al transicionar `REFLECTION → COMPLETED` | Mi Plan, Gamificación, Dashboard, siguiente `AcademyUnit` | Señalar finalización oficial. |
| **UnitMastered** | `AcademyUnit` | Al satisfacerse `MasteryPolicy` | Gamificación, Dashboard, Competencias | Señalar dominio sostenido. |
| **EXTERNAL_ACTIVITY_COMPLETED** | `AcademyUnit` | En el instante de `UnitCompleted` | Mi Plan (único consumidor) | Único contrato con Mi Plan (A-08). |
| **UnitRepeated** | `AcademyUnit` | Al crear un nuevo `Attempt` sobre Unidad ya terminal | Competencias/Learning Analytics | Registrar repetición. |
| **TeacherOverrideApplied** | `AcademyUnit` | Al registrar un `TeacherOverride` | Dashboard del Profesor, Auditoría | Registrar la excepción manual. |

**Nota (v1.2):** ningún Domain Event nuevo se introduce para la relación con Organization Management — la verificación de autoridad es una operación de lectura (Query), no una transición de estado de ningún Aggregate de Academia; consistente con el principio ya establecido en Organization Management (Ubiquitous Language v1.0 §3: "`Authority` nunca se almacena por sí misma").

---

## 11. Domain Services

*(Sin cambios respecto a v1.1.)*

**MasteryEvaluationService** — evalúa si una `AcademyUnit` satisface `MasteryPolicy` (RN-8). Invocado por `AcademyUnit` como colaborador.

**UnitSequenceService** — determina, para un Estudiante y un `TextType`, qué `AcademyUnit` es la predecesora de cuál (RN-6).

**Nota (v1.2):** no se introduce ningún Domain Service para consumir Organization Management — la verificación/enumeración de autoridad se resuelve en la capa de Application (`AcademyAuthorizationGuard`), nunca dentro del Domain Model de Academia, consistente con el principio ya vigente de que Domain nunca conoce Application ni Infrastructure.

---

## 12. Factories

*(Sin cambios respecto a v1.1.)*

**AcademyUnitFactory** — crea la instancia inicial de `AcademyUnit`.

**AttemptFactory** — crea un nuevo `Attempt` al iniciar o repetir una Unidad.

*(No se define una Factory dedicada para `ModelExample`.)*

---

## 13. Policies

*(Sin cambios respecto a v1.1 — las siete Policies permanecen exactamente iguales.)*

**UnlockPolicy**, **FeedbackPolicy**, **RevisionPolicy**, **MasteryPolicy**, **CompletionPolicy**, **RepetitionPolicy**, **TeacherOverridePolicy** — sin cambios de contenido respecto a v1.1.

---

## 14. Specifications

*(Sin cambios respecto a v1.1.)*

**EligibleForUnlockSpecification**, **MasteryEligibleSpecification**, **RepeatableSpecification** — sin cambios.

---

## 15. Relaciones entre Agregados

*(Sin cambios respecto a v1.1 — se añade una nota de alcance, sin alterar ninguna relación entre Aggregates de Academia.)*

- `AcademyUnit` referencia a su `Attempt` activo y a su historial de Intentos únicamente por identidad.
- `Attempt` referencia a `AcademyUnit` únicamente por identidad, en modo lectura.
- `Attempt` referencia a `ModelExample` únicamente por identidad, en modo lectura.
- `AcademyUnit` referencia a `StudentId` como identidad externa.
- Ningún agregado contiene una copia embebida de otro agregado.
- La consistencia entre `AcademyUnit` y `Attempt` es eventual, mediada por eventos de dominio (Sección 8.1, H-01).

**Nota de alcance (v1.2):** esta sección describe exclusivamente relaciones **entre los Aggregates propios de Academia**. La relación con Organization Management no es una relación entre Aggregates (Organization Management no es un Aggregate de Academia) — es una relación entre Bounded Contexts, ya descrita en la Sección 1 (Context Mapping) y en la Sección 16 (Integración con otros dominios), consumida exclusivamente a través del Bounded Context Query Gateway, nunca por referencia directa de ningún Aggregate de Academia hacia ningún Aggregate de Organization Management.

---

## 16. Integración con otros dominios (contratos funcionales)

- **Dashboard:** contrato de solo lectura — Academia publica estado resumido; Dashboard nunca consulta directamente (§5.7).
- **Mi Plan:** contrato único — `EXTERNAL_ACTIVITY_COMPLETED` (A-08).
- **Conoce el DELF:** sin contrato — Separate Ways (A-01).
- **Laboratorio:** sin contrato de agregados compartidos — Separate Ways (A-04).
- **Coach IA:** dos puntos de contrato conceptual — puerta de comprensión y generación de `Feedback`.
- **Motor Pedagógico Adaptativo:** contrato de recepción de señal de priorización.
- **Gamificación:** contrato de publicación de `UnitCompleted`/`UnitMastered`.
- **Organization Management** *(nuevo, v1.2, H-12):* contrato de consulta síncrona — Academia invoca, mediante el Bounded Context Query Gateway (Platform Core Foundation v1.2 §10), las Queries `VerifyAuthority`/`EnumerateAuthority` ya expuestas por Organization Management, para resolver si un Profesor tiene autoridad sobre un Estudiante determinado, antes de ejecutar `ApplyTeacherOverride` (CMD-10), `AssignUnitToStudent` (CMD-11), `GetStudentProgressSummary` (QRY-07) o `GetTeacherOverrideHistory` (QRY-09) — los cuatro puntos de la capa de Application de Academia ya identificados como dependientes de esta relación (Application Model v1.5 §13). Academia entrega dos identificadores (`teacherId`, `studentId`) y recibe un booleano o una colección de identificadores; nunca recibe ni conoce ninguna `Organization`, `Membership` ni `Role` completos.

---

## 17. Riesgos del Modelo

*(Sin cambios respecto a v1.1 — los cinco riesgos permanecen exactamente iguales; se añade un riesgo nuevo, explícito, de la relación con Organization Management.)*

**Riesgo 1 — Duplicación de estado entre `AcademyUnit` y `Attempt`.** Sin cambios.

**Riesgo 2 — Dependencia de `MasteryPolicy` sobre evidencia externa.** Sin cambios.

**Riesgo 3 — Consistencia eventual entre `AcademyUnit` y `Attempt`.** Sin cambios.

**Riesgo 4 — Alcance de `TeacherOverride` sobre Intentos activos.** Sin cambios.

**Riesgo 5 — Dependencia externa de `CompletionPolicy`.** Sin cambios (H-08).

**Riesgo 6 — Dependencia de la relación docente-estudiante sobre Organization Management, hoy no operable de punta a punta** *(nuevo, v1.2, H-12)*. Aunque Organization Management ya está FROZEN y el patrón de integración (Bounded Context Query Gateway) ya está definido en Platform Core Foundation v1.2, el adaptador real de Academia (`TeacherStudentRelationshipAdapter`) permanece, a la fecha de este documento, como un stub fail-closed (siempre retorna `false`) — el wiring concreto (`services/organizationManagement.ts`, sustitución del adaptador) requiere su propio ACP y su propia revisión de Application Model/Infrastructure Model de Academia, fuera del alcance de este documento. Este riesgo no es un defecto de este Domain Model — es la constancia honesta de que P-12/P-13/P-15 siguen sin ser operables con datos reales hasta que esa integración concreta se ejecute.

**Riesgo no aplicable — `ModelExample`.** Sin cambios.

---

## Cumplimiento de criterios de calidad

*(Sin cambios respecto a v1.1.)*

- **DDD:** tres Aggregate Roots correctamente delimitados; referencias cruzadas exclusivamente por identidad; lenguaje ubicuo sin colisión de literales.
- **Clean Architecture:** ningún elemento de este modelo referencia tecnología de persistencia, framework o transporte — incluida la relación con Organization Management, descrita exclusivamente como contrato funcional (Sección 16), nunca como mecanismo técnico.
- **SOLID/GRASP:** responsabilidades de un único agregado nunca se filtran a otro.
- **Alta cohesión / bajo acoplamiento:** sin cambios.
- **Modelo rico (Tell-Don't-Ask):** sin cambios.

---

## Registro de Correcciones

*(H-01 a H-11: idénticas a v1.1, no se reproducen aquí por brevedad — ver `docs/audits/academia-domain-model-v1.1-2026-07-19.md` para su texto completo e íntegro, sin ninguna alteración.)*

**H-12 — Incorporación de Organization Management al Context Mapping (v1.2).**
*Qué se modificó:* se añadió una octava fila a la tabla de Context Mapping (Sección 1), tipo Customer-Supplier, describiendo el consumo de `VerifyAuthority`/`EnumerateAuthority` de Organization Management mediante el Bounded Context Query Gateway (Platform Core Foundation v1.2 §10). Se añadió una entrada a "Límites" (Sección 1), una nota de compatibilidad de vocabulario (Sección 2), una nota de alcance en Relaciones entre Agregados (Sección 15), una entrada en Integración con otros dominios (Sección 16), y un nuevo Riesgo 6 (Sección 17).
*Dónde:* Secciones 1, 2, 15, 16, 17.
*Por qué:* Organization Management alcanzó el estado FROZEN y Platform Core Foundation v1.2 ya define el patrón oficial de integración — el Context Mapping de Academia, que hasta v1.1 no mencionaba esta dependencia en absoluto, debía reflejarla para permanecer exacto.
*Confirmación:* no se modificó ningún Aggregate Root, Entity, Value Object, Enumeración, Regla de Negocio, Invariante, Máquina de Estados, Domain Event, Domain Service, Factory, Policy ni Specification. No se introdujo ningún Command, Query ni Endpoint. Ninguna resolución A-01 a A-10 fue reinterpretada.

---

**Cierre.** Con la corrección H-12, el Context Mapping de Academia queda actualizado para reflejar su dependencia real y ya FROZEN hacia Organization Management, sin haber modificado ningún Aggregate, regla de negocio, invariante ni comportamiento ya certificado en v1.1. **Esta versión permanece en estado `MINOR REVISION` (Architecture Change Management Standard §3), no `FROZEN`, hasta que se emita el Architecture Change Proposal que formalmente autorice esta reapertura** — ver Nota de gobernanza al inicio de este documento y Dictamen del informe de entrega.
