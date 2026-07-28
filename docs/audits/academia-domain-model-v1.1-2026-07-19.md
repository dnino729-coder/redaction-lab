# Especificación del Modelo de Dominio — Academia v1.1 (Sprint 4.2.2 — DDD Remediation)

**Base única y vinculante:** `docs/audits/academia-functional-audit-2026-07-19.md`, `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10), `docs/audits/academia-domain-model-v1.0-2026-07-19.md` (versión anterior) y `docs/audits/academia-ddd-audit-2026-07-19.md` (auditoría DDD, Sprint 4.2.1 — 11 hallazgos H-01 a H-11).

**Nota de trazabilidad:** el encargo referencia `docs/audits/academia-domain-model-ddd-audit-2026-07-19.md`; el archivo realmente existente (mismo contenido, misma auditoría) es `docs/audits/academia-ddd-audit-2026-07-19.md`. Se señala por consistencia con la nota equivalente ya dejada en v1.0.

Ninguna resolución A-01 a A-10 fue modificada. El flujo oficial de 11 pasos (A-02), la máquina de estados oficial (A-07), los tres Aggregate Roots, los Domain Services, las Factories, los Value Objects y todas las reglas funcionales permanecen exactamente iguales a v1.0. Los cambios de esta versión son exclusivamente correcciones de clasificación, redacción y precisión DDD exigidas por la auditoría del Sprint 4.2.1, detalladas una por una en la sección final "Registro de Correcciones".

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

---

## 2. Ubiquitous Language

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

---

## 3. Aggregate Roots

### AR-1 — AcademyUnit

**Propósito:** representar, para un Estudiante y un Tipo de Texto, el estado de progresión oficial (A-07) de una Unidad.

**Responsabilidades:** gobernar en exclusiva el valor de `UnitState`; decidir, por sí misma, si el desbloqueo hacia la siguiente Unidad procede — invocando `UnlockPolicy` como criterio de evaluación y aplicando el resultado sobre su propio estado (A-03); decidir, por sí misma, si `MASTERED` procede — invocando `MasteryPolicy` de la misma forma (A-07); aplicar anulaciones docentes sobre sí misma, evaluando su elegibilidad mediante `TeacherOverridePolicy` y aplicando el resultado (A-10); mantener referencia al Intento activo y al historial de Intentos (por identidad, no por composición). **En todos los casos, es `AcademyUnit` quien invoca la Policy correspondiente y aplica el resultado sobre su propio estado — ninguna Policy muta el Aggregate directamente ni decide en su lugar (precisión añadida en v1.1, ver H-02, Registro de Correcciones).**

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

**Responsabilidades:** gobernar la posición actual dentro de la secuencia de 11 pasos (`UnitStep`); gobernar el ciclo Borrador → Versión → Retroalimentación → Reescritura (mínimo un ciclo obligatorio, A-07), invocando `RevisionPolicy`/`FeedbackPolicy` como criterio y aplicando el resultado sobre su propio estado interno; aplicar la puerta de comprensión antes de permitir Producir (§7.2); soportar el mecanismo de autoguardado y continuidad (A-06). **Es el propio `Attempt`, y no ninguna Policy externa, quien decide y muta su posición y su ciclo interno — la Policy solo aporta el criterio (precisión añadida en v1.1, ver H-02, Registro de Correcciones).**

**Invariantes:**
- El paso actual solo avanza en el orden exacto de A-02; nunca retrocede salvo el ciclo explícito `REVISION ⇄ AWAITING_FEEDBACK`.
- No puede alcanzar el paso `Reflexionar` sin al menos una Versión con Retroalimentación entregada y al menos una Reescritura posterior (A-07).
- No puede alcanzar el paso `Producir` sin que la puerta de comprensión del paso `Comprender` esté satisfecha.
- Una Versión, una vez creada, es inmutable — cualquier cambio genera una Versión nueva.
- **A efectos de su propio límite de consistencia transaccional, `Attempt` solo requiere la `Version`/`Feedback` vigente para evaluar sus invariantes de transición; las Versiones/Retroalimentaciones anteriores de ese mismo Intento se conservan como historial de solo lectura fuera de ese límite estricto, evitando que el agregado deba cargar una colección sin límite superior (precisión añadida en v1.1, ver H-06, Registro de Correcciones).**

**Ciclo de vida:** se crea (vía `AttemptFactory`) al iniciar una Unidad por primera vez o al repetirla (A-09); termina implícitamente al alcanzar el paso `Desbloquear`, momento en que notifica a `AcademyUnit` (vía evento de dominio) para su transición a `COMPLETED`.

**Límites del agregado:** referencia a `AcademyUnit` únicamente por identidad (no la modifica directamente); referencia a `ModelExample` únicamente por identidad y en modo lectura.

**Justificación como Aggregate Root:** el ciclo Borrador/Versión/Retroalimentación requiere consistencia transaccional fuerte y frecuente durante una sesión activa, con una tasa de cambio muy distinta a la de `AcademyUnit` (que cambia una vez por transición de estado) — separarlo evita cargar/bloquear el agregado de progreso completo por cada carácter autoguardado del borrador.

### AR-3 — ModelExample

**Propósito:** representar una producción ejemplar individual de la Biblioteca de Modelos, con su comentario comparativo de IA.

**Responsabilidades:** mantener el contenido ejemplar, su calificación editorial (excelente/con errores) y el comentario de IA asociado; ser referenciable por `Attempt` durante los pasos Observar/Analizar.

**Invariantes:** un `ModelExample` pertenece exactamente a un `TextType` y **pertenece íntegramente al Bounded Context Academia**, sin excepción — consistente con la Sección 1 ("Poseer en exclusiva la Biblioteca de Modelos"). Su contenido es de solo lectura para `Attempt` (nunca se modifica desde el flujo del estudiante). Su mutación editorial es ejecutada exclusivamente por el actor Administrador (§6.15), mediante un comando dirigido a este mismo agregado dentro de este mismo Bounded Context — el Administrador es un actor autorizado a operar sobre `ModelExample`, no evidencia de que `ModelExample` pertenezca a otro Bounded Context. **Esta es la única interpretación válida de ownership de `ModelExample` a partir de v1.1 (corrección de la ambigüedad de v1.0, ver H-04, Registro de Correcciones).**

**Ciclo de vida:** creado/editado/retirado de forma independiente del progreso de cualquier estudiante.

**Justificación como Aggregate Root:** tiene identidad y ciclo de vida propios, gestionados de forma completamente independiente de `AcademyUnit`/`Attempt`; no existe ninguna regla de consistencia que exija agruparlo con ellos.

---

## 4. Entidades

**Draft** (interna de `Attempt`) — Identidad: única por Intento (a lo sumo un Borrador activo a la vez). Atributos conceptuales: contenido actual, marca de tiempo del último autoguardado. Comportamiento: se reemplaza en cada autoguardado (A-06); se congela en una `Version` al enviarse a retroalimentación. Reglas asociadas: el contenido de un Borrador nunca se considera evaluable hasta convertirse en Versión.

**Version** (interna de `Attempt`) — Identidad: número secuencial dentro del Intento. Atributos conceptuales: contenido congelado, número de secuencia, marca de tiempo de creación. Comportamiento: inmutable una vez creada. Reglas asociadas: "no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión" (§13.5, ya vinculante).

**Feedback** (interna de `Attempt`) — Identidad: asociada 1:1 a la `Version` que evalúa. Atributos conceptuales: conjunto de `FeedbackObservation` (una por cada una de las 10 categorías aplicables), orden jerárquico macro→micro. Comportamiento: se genera exactamente una vez por Versión evaluada; puede originar una nueva Versión (reescritura) pero nunca se edita a sí misma. Reglas asociadas: A-05 (marco formativo exclusivo); tono no punitivo (§8.6, ya vinculante).

**TeacherOverride** (interna de `AcademyUnit`) — Identidad: única por acción de anulación registrada. Atributos conceptuales: acción (`FORCE_LOCK`/`FORCE_RESTART`), autor, marca de tiempo, motivo. Comportamiento: se aplica sobre `AcademyUnit` sin tocar directamente ningún `Attempt` en curso (ver invariante en sección 8). Reglas asociadas: A-10.

**Nota (H-06, v1.1):** a efectos del límite de consistencia transaccional del agregado `Attempt`, únicamente la `Version`/`Feedback` vigente participa de las invariantes de transición (RN-2, RN-4); las Versiones/Retroalimentaciones anteriores del mismo Intento se conservan como historial de solo lectura, fuera de ese límite estricto — ninguna regla de negocio cambia, solo el tratamiento del historial dentro del límite del agregado.

---

## 5. Value Objects

| Value Object | Propósito | Atributos | Inmutabilidad / Igualdad | Justificación |
|---|---|---|---|---|
| **StudentId** | Referencia externa al Estudiante (otro Bounded Context). | Identificador único. | Inmutable; igualdad por valor. | Academia no posee al Estudiante, solo lo referencia. |
| **DraftContent** | Contenido textual junto con sus métricas derivadas. | Texto, conteo de palabras, conteo de caracteres. | Inmutable; cada autoguardado reemplaza la instancia completa dentro de `Draft`. | Evita mutación parcial inconsistente entre texto y sus métricas. |
| **FeedbackObservation** | Una observación formativa dentro de una `Feedback`. | Categoría (`FeedbackCategory`), fortaleza/debilidad, explicación, sugerencia de mejora. | Inmutable; igualdad por valor. | No tiene identidad propia — solo tiene sentido como parte de un conjunto de Retroalimentación. |
| **MasteryCriterion** | Condición evaluada para el estado `MASTERED`. | Competencia asociada, ausencia de debilidad crítica, número de encuentros independientes requeridos. | Inmutable. | Encapsula el criterio de A-07 como una unidad verificable, reutilizable por `MasteryPolicy`. |
| **WordCountRange** | Límites de extensión de una Unidad. | Mínimo de palabras, máximo de palabras. | Inmutable; igualdad por valor. | Vocabulario ya establecido en §13.5 (`WritingPrompt`), reutilizado como conocimiento de dominio, no como diseño de persistencia. |
| **VersionNumber** | Identificador secuencial de una `Version` dentro de un `Attempt`. | Número entero positivo. | Inmutable; igualdad por valor; debe ser estrictamente secuencial sin huecos. | Aísla la regla de secuencialidad de la entidad `Version` misma. |

---

## 6. Enumeraciones

**UnitState** (A-07, exacta, sin modificación en v1.1): `LOCKED, UNLOCKED, IN_PROGRESS, AWAITING_FEEDBACK, REVISION, REFLECTION, COMPLETED, MASTERED`.

**UnitStep** (A-02, exacta, orden fijo): `CONTEXTUALIZE, DEFINE_OBJECTIVES, COMPREHEND, OBSERVE, ANALYZE, PRACTICE, PRODUCE, RECEIVE_FEEDBACK, REWRITE, REFLECT, UNLOCK`.

**TextType** (heredado como vocabulario compartido de §13.5, no redefinido): `LETTER, ARTICLE, ESSAY, EMAIL, REPORT`.

**DifficultyLevel** (alineado a §13.5/`WritingTask`, distinto y no confundible con la escala de `LearningTask.difficulty` de Mi Plan, que incluye `EXPERT` y pertenece a otro Bounded Context): `EASY, MEDIUM, HARD`.

**FeedbackCategory** (§9.5, orden = jerarquía de prioridad macro→micro): `COMPREHENSION, COMMUNICATIVE_INTENT, STRUCTURE, COHERENCE, COHESION, ARGUMENTATION, REGISTER, VOCABULARY, GRAMMAR, SPELLING`. **Corrección v1.1 (H-07):** cada categoría lleva asociado un atributo explícito de prioridad (`priority`, entero de 1 a 10), declarado independientemente del orden de listado del enum, de forma que la jerarquía macro→micro (RN-3, `FeedbackPolicy`) no dependa únicamente del orden de declaración: `COMPREHENSION(1), COMMUNICATIVE_INTENT(2), STRUCTURE(3), COHERENCE(4), COHESION(5), ARGUMENTATION(6), REGISTER(7), VOCABULARY(8), GRAMMAR(9), SPELLING(10)`. El criterio de prioridad no cambia respecto a v1.0 — solo se hace explícito.

**MasteryLevel** (elaboración de dominio del criterio ya aprobado en A-07, no una nueva regla de negocio): `DEVELOPING, CONSOLIDATING, SUSTAINED`. **Corrección v1.1 (H-05):** el tercer valor se renombra de `MASTERED` (v1.0) a `SUSTAINED`, para eliminar la colisión literal con `UnitState.MASTERED` — el criterio que representa (evidencia de competencia sostenida, alimentando `MasteryPolicy`) permanece exactamente igual; `UnitState.MASTERED` no se modifica.

**FeedbackStrength** (marca cada `FeedbackObservation`, evidenciado por §8.6/§9.5): `STRENGTH, WEAKNESS`.

**OverrideAction** (A-10, exacto — solo las dos acciones explícitamente aprobadas): `FORCE_LOCK, FORCE_RESTART`.

---

## 7. Reglas de Negocio

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

---

## 8. Invariantes

1. Una Unidad en `LOCKED` nunca puede iniciarse (no existe transición directa `LOCKED → IN_PROGRESS`).
2. `COMPLETED` nunca vuelve a `IN_PROGRESS` ni a ningún estado anterior.
3. `MASTERED` nunca retrocede, bajo ninguna condición, incluida la repetición (A-09).
4. Una Unidad solo puede desbloquear a la siguiente desde `COMPLETED` (nunca desde `MASTERED` como evento adicional — el desbloqueo ya ocurrió al alcanzar `COMPLETED`; `MASTERED` es un estado posterior sobre la misma Unidad, no genera un segundo desbloqueo).
5. La Retroalimentación siempre ocurre antes de `REFLECTION` (no existe ruta que omita `AWAITING_FEEDBACK`/`REVISION`).
6. `UnitState` es la única máquina de estados autoritativa de una Unidad; `Attempt.currentStep` es información de posición interna, nunca un segundo estado paralelo o contradictorio.
7. Un `Attempt` solo puede pertenecer a una `AcademyUnit`, y una `AcademyUnit` tiene, como máximo, un `Attempt` activo a la vez (los demás son historial).
8. Una `Version` inmutable nunca se elimina ni se sobrescribe.
9. `EXTERNAL_ACTIVITY_COMPLETED` se emite como máximo una vez por Unidad y por primera finalización — nunca en repeticiones, nunca en la transición a `MASTERED`.
10. Un `TeacherOverride` que fuerza `LOCKED` o reinicia una Unidad nunca modifica directamente un `Attempt` en curso: el Intento activo, si existe, queda huérfano (se conserva como historial, no se elimina ni se fuerza a completar) y un nuevo `Attempt` se crea únicamente si el estudiante reinicia efectivamente la Unidad.
11. `ModelExample` nunca es modificado por `Attempt` ni por `AcademyUnit` — solo leído.

### 8.1 — Regla de Consistencia Eventual (reclasificada en v1.1, H-01)

La siguiente regla, presente en v1.0 como **Invariante 12**, se reclasifica en v1.1 como **Regla de Consistencia Eventual** — no se garantiza dentro del límite transaccional de un único agregado, sino mediante sincronización asíncrona entre `AcademyUnit` y `Attempt` (ver Sección 15):

> Ninguna transición de `UnitState` ocurre sin que su `Attempt` correspondiente haya alcanzado el `UnitStep` equivalente.

El comportamiento descrito **no cambia respecto a v1.0**. La corrección es exclusivamente de clasificación DDD: una invariante, en sentido estricto (Evans/Vernon), debe poder garantizarse dentro de la transacción de un único agregado; esta regla depende de dos Aggregate Roots sincronizados por eventos, por lo que corresponde nombrarla como regla de consistencia eventual, no como invariante (ver H-01, Registro de Correcciones).

---

## 9. Máquina de Estados (formalización de A-07 — comportamiento sin modificación)

**Estados:** `LOCKED, UNLOCKED, IN_PROGRESS, AWAITING_FEEDBACK, REVISION, REFLECTION, COMPLETED, MASTERED`.

**Estados terminales:** `COMPLETED` (terminal para el Intento activo, no para la Unidad — habilita repetición, A-09) y `MASTERED` (terminal absoluto, nunca retrocede, invariante 3).

| Transición | Evento que la dispara | Restricción |
|---|---|---|
| `LOCKED → UNLOCKED` | `UnitUnlocked` (Unidad predecesora alcanza `COMPLETED`) **o** `TeacherOverrideApplied` (acción `FORCE_RESTART` sobre una Unidad previamente bloqueada por anulación) | Protegida por `UnlockPolicy` (RN-6, RN-7). |
| `UNLOCKED → IN_PROGRESS` | `UnitStarted` (creación de `Attempt`, paso `CONTEXTUALIZE`) | Solo posible desde `UNLOCKED`. |
| `IN_PROGRESS → AWAITING_FEEDBACK` | `ProductionSubmitted` → `FeedbackRequested` (pasos 1-7 completados, envío al paso 8) | Requiere puerta de comprensión satisfecha (RN-2). |
| `AWAITING_FEEDBACK → REVISION` | `FeedbackDelivered` (paso 9) | — |
| `REVISION → AWAITING_FEEDBACK` | `RevisionStarted` seguido de nueva `ProductionSubmitted` | Ciclo sin límite superior de repeticiones dentro del mismo Intento. |
| `REVISION → REFLECTION` | `ReflectionStarted` (paso 10) | Requiere al menos un ciclo `REVISION` completado (RN-4). |
| `REFLECTION → COMPLETED` | `ReflectionCompleted` → `UnitCompleted` (paso 11 ejecutado) | — |
| `COMPLETED → MASTERED` | `UnitMastered` (evidencia sostenida, criterio `MasteryPolicy`) | No secuencial ni inmediata; asíncrona respecto a `COMPLETED` (invariante 4). |
| `Cualquier estado activo → LOCKED` | `TeacherOverrideApplied` (acción `FORCE_LOCK`) | Excepción única (A-10); no aplica sobre `COMPLETED`/`MASTERED` (RN-13, invariante 10). |

**Corrección v1.1 (H-03):** la fila `COMPLETED → IN_PROGRESS` presente en v1.0 se **elimina** de esta tabla formal — no representa una transición real del valor de `UnitState`. La información correspondiente a la repetición de una Unidad se documenta a continuación, fuera de la máquina de estados formal, sin modificar A-09:

> **Nota — repetición de una Unidad (A-09, no es una transición de `UnitState`):** repetir una Unidad ya `COMPLETED`/`MASTERED` crea un nuevo `Attempt` (evento `UnitRepeated`, Sección 10) partiendo del paso `CONTEXTUALIZE`. El valor de `UnitState` de la Unidad **no transiciona**: conserva `COMPLETED`/`MASTERED` como logro histórico durante todo el desarrollo del nuevo Intento, consistente con la Invariante 3 (`MASTERED` nunca retrocede). El nuevo `Attempt` progresa por su propia posición de `UnitStep`, de forma completamente independiente del valor de `UnitState` de la Unidad a la que pertenece.

---

## 10. Domain Events

| Evento | Quién lo emite | Cuándo ocurre | Quién puede consumirlo | Propósito |
|---|---|---|---|---|
| **UnitUnlocked** | `AcademyUnit` | Al transicionar `LOCKED → UNLOCKED` | Dashboard, Motor Pedagógico | Notificar disponibilidad de nuevo contenido. |
| **UnitStarted** | `Attempt` (vía `AcademyUnit`) | Al crear el primer `Attempt` de una Unidad | Dashboard (continuidad, A-06) | Marcar inicio de progresión activa. |
| **ProductionSubmitted** | `Attempt` | Al finalizar el paso `Producir` y congelar una `Version` | Coach IA/Feedback (contrato externo) | Registrar el **hecho consumado** de que el estudiante finalizó su producción para esta Versión — útil como registro histórico/auditoría incluso si, en esta versión, no tiene consumidor distinto de `FeedbackRequested` (precisión v1.1, H-10). |
| **FeedbackRequested** | `Attempt` | Inmediatamente después de `ProductionSubmitted` | Coach IA (Customer-Supplier) | Registrar la **intención derivada** de solicitar retroalimentación sobre esa Producción — distinta del hecho en sí (`ProductionSubmitted`), de forma que la solicitud de retroalimentación pueda, en el futuro, diferirse, reintentarse o enrutarse de forma distinta sin alterar el hecho original de envío (precisión v1.1, H-10). |
| **FeedbackDelivered** | `Attempt` | Al recibir y registrar la `Feedback` completa | Estudiante (vía Dashboard/notificación), Competencias/Learning Analytics | Habilitar el paso `Reescribir`. |
| **RevisionStarted** | `Attempt` | Al iniciar una nueva `Draft` tras `FeedbackDelivered` | Registro de auditoría interna del propio dominio — sin consumidor externo en esta versión (precisión v1.1, H-11) | Trazabilidad del recorrido del Intento (Event Sourcing parcial de `Attempt`), no integración externa. |
| **ReflectionStarted** | `Attempt` | Al completar el ciclo mínimo de reescritura (RN-4) | Registro de auditoría interna del propio dominio — sin consumidor externo en esta versión (precisión v1.1, H-11) | Trazabilidad del recorrido del Intento, no integración externa. |
| **ReflectionCompleted** | `Attempt` | Al responder las preguntas metacognitivas del paso 10 | `AcademyUnit` | Disparar la transición final del Intento. |
| **UnitCompleted** | `AcademyUnit` | Al transicionar `REFLECTION → COMPLETED` | Mi Plan (vía `EXTERNAL_ACTIVITY_COMPLETED`), Gamificación, Dashboard, siguiente `AcademyUnit` (desbloqueo) | Señalar finalización oficial de la Unidad. |
| **UnitMastered** | `AcademyUnit` | Al satisfacerse `MasteryPolicy` (RN-8) | Gamificación, Dashboard, Competencias | Señalar dominio sostenido, sin efecto sobre Mi Plan. |
| **EXTERNAL_ACTIVITY_COMPLETED** | `AcademyUnit` | En el mismo instante de `UnitCompleted`, condicionado a `CompletionPolicy` (RN-10) | Mi Plan (único consumidor autorizado) | Único contrato de integración con Mi Plan (A-08). |
| **UnitRepeated** *(evento adicional, requerido por A-09)* | `AcademyUnit` | Al crear un nuevo `Attempt` sobre una Unidad ya `COMPLETED`/`MASTERED` | Competencias/Learning Analytics (evidencia para `MasteryPolicy`) | Registrar repetición sin alterar el estado de logro (ver nota de la Sección 9). |
| **TeacherOverrideApplied** *(evento adicional, requerido por A-10)* | `AcademyUnit` | Al registrar un `TeacherOverride` (`FORCE_LOCK`/`FORCE_RESTART`) | Dashboard del Profesor, Auditoría | Registrar la excepción manual y su autor. |

---

## 11. Domain Services

**MasteryEvaluationService** — evalúa si una `AcademyUnit` satisface `MasteryPolicy` (RN-8), combinando la propia evidencia de la Unidad (Intentos, Retroalimentación) con evidencia de competencia proveniente de otro Bounded Context (fortalezas/debilidades). Justificación: la evaluación de dominio no pertenece naturalmente a `AcademyUnit` en solitario porque requiere conocimiento agregado de más de un encuentro y de una fuente de evidencia externa — es un proceso de dominio significativo sin hogar natural en un único agregado (criterio clásico de Domain Service, Evans). Es invocado por `AcademyUnit` como colaborador; el resultado lo aplica `AcademyUnit` sobre sí misma (consistente con H-02).

**UnitSequenceService** — determina, para un Estudiante y un `TextType`, qué `AcademyUnit` es la predecesora de cuál, a efectos de aplicar `UnlockPolicy` (RN-6). Justificación: coordina múltiples instancias de `AcademyUnit` del mismo estudiante simultáneamente; ninguna instancia individual de `AcademyUnit` conoce por sí misma su posición relativa dentro de la progresión completa.

*(No se identifican más Domain Services: las reglas de anulación docente y de repetición se resuelven como comportamiento propio del agregado `AcademyUnit`, no como coordinación externa.)*

---

## 12. Factories

**AcademyUnitFactory** — crea la instancia inicial de `AcademyUnit` para un Estudiante cuando una Unidad del catálogo se vuelve visible por primera vez. Encapsula la determinación del estado inicial (`UNLOCKED` si es la primera Unidad de su `TextType` en la progresión del estudiante; `LOCKED` en cualquier otro caso) — una decisión que depende de conocimiento externo a la propia instancia (posición en la secuencia, vía `UnitSequenceService`) y que un constructor simple no debe resolver por sí mismo.

**AttemptFactory** — crea un nuevo `Attempt` al iniciar una Unidad por primera vez o al repetirla (A-09). Encapsula las invariantes de creación: paso inicial siempre `CONTEXTUALIZE`, `Draft` vacío, referencia correcta a `AcademyUnit`, numeración secuencial del Intento respecto a los anteriores.

*(No se define una Factory dedicada para `ModelExample`: su creación no involucra invariantes complejas más allá de la asignación de `TextType`, y un constructor simple es suficiente — proporcionalidad, evitando sobre-ingeniería.)*

---

## 13. Policies

**Precisión de invocación (v1.1, H-02):** todas las Policies de esta sección son invocadas por el propio Aggregate (`AcademyUnit` o `Attempt`, según corresponda) desde su propio comportamiento — el Aggregate consulta la Policy como criterio de evaluación y aplica el resultado sobre su propio estado. Ninguna Policy muta un Aggregate directamente ni sustituye su comportamiento. Esta precisión no cambia el contenido de ninguna Policy respecto a v1.0, solo aclara la dirección de invocación (Aggregate → invoca Policy → aplica resultado sobre sí mismo).

**UnlockPolicy** *(invocada por `AcademyUnit`)* — `AcademyUnit` predecesora en `COMPLETED` ⇒ Unidad siguiente elegible para `UNLOCKED` (RN-6). Sin umbral de puntuación, sin excepción salvo `TeacherOverride`.

**FeedbackPolicy** *(invocada por `Attempt`)* — toda `Feedback` se expresa mediante las 10 `FeedbackCategory`, en orden jerárquico macro→micro (ver `priority` explícito, Sección 6, H-07); nunca mediante la rúbrica oficial DELF (RN-3, A-05).

**RevisionPolicy** *(invocada por `Attempt`)* — mínimo un ciclo `REVISION` completado antes de `REFLECTION`; ciclo `REVISION ⇄ AWAITING_FEEDBACK` sin límite superior (RN-4).

**MasteryPolicy** *(invocada por `AcademyUnit`, vía `MasteryEvaluationService`)* — `MasteryCriterion` satisfecho ⇔ ausencia de debilidad `HIGH`/`CRITICAL` sostenida en `COMPLETED` y en al menos un encuentro independiente posterior sin andamiaje (RN-8, A-07).

**CompletionPolicy** *(invocada por `AcademyUnit`)* — `EXTERNAL_ACTIVITY_COMPLETED` se emite si y solo si existe una tarea de Mi Plan vinculada a la Unidad en el momento de `COMPLETED` (RN-10, A-08).

**RepetitionPolicy** *(invocada por `AcademyUnit`)* — repetición permitida sin límite desde `COMPLETED`/`MASTERED`; no revierte estado, no reemite evento, no revoca recompensas (RN-11, RN-12, A-09).

**TeacherOverridePolicy** *(invocada por `AcademyUnit`)* — `FORCE_LOCK` válido desde cualquier estado activo (`UNLOCKED` a `REFLECTION` inclusive), inválido desde `LOCKED`; `FORCE_RESTART` válido únicamente desde `COMPLETED`/`MASTERED` (RN-13, A-10).

---

## 14. Specifications

**EligibleForUnlockSpecification** — predicado reutilizable: "esta `AcademyUnit` es elegible para `UNLOCKED`" (misma regla que `UnlockPolicy`, expresada en forma composable/consultable).

**MasteryEligibleSpecification** — predicado reutilizable: "esta `AcademyUnit` satisface el criterio de `MASTERED`" (misma regla que `MasteryPolicy`, en forma consultable).

**RepeatableSpecification** — predicado reutilizable: "esta `AcademyUnit` puede repetirse" (`COMPLETED` o `MASTERED`).

**Nota sobre consumidores (v1.1, H-09):** en esta versión del modelo no existe un consumidor de consulta ya documentado más allá de la validación puntual, ya cubierta por la Policy homóloga de cada Specification. Las tres se mantienen deliberadamente **preparadas para consultas futuras** (p. ej., listados de progreso agregado para el Profesor —A-10—, o paneles de priorización del Motor Pedagógico) sin necesidad de rediseño cuando ese consumidor se materialice. No se eliminan por ausencia de consumidor actual: el patrón Specification está pensado precisamente para esa reutilización diferida entre validación puntual y consulta compuesta (Evans) — la superposición con su Policy homóloga es intencional, no redundancia accidental.

---

## 15. Relaciones entre Agregados

- `AcademyUnit` referencia a su `Attempt` activo y a su historial de Intentos **únicamente por identidad** (nunca por composición).
- `Attempt` referencia a `AcademyUnit` **únicamente por identidad**, en modo lectura (no la modifica directamente; toda transición de `AcademyUnit` ocurre en respuesta a un evento emitido por `Attempt`, nunca por escritura directa cruzada).
- `Attempt` referencia a `ModelExample` **únicamente por identidad**, en modo lectura, durante los pasos `Observar`/`Analizar`.
- `AcademyUnit` referencia a `StudentId` como identidad externa (otro Bounded Context).
- Ningún agregado contiene una copia embebida de otro agregado — todas las relaciones cruzadas son por identidad, preservando límites de consistencia transaccional independientes por agregado (cada unidad de trabajo modifica exactamente un agregado).
- La consistencia entre `AcademyUnit` y `Attempt` es **eventual**, mediada por eventos de dominio (`ReflectionCompleted → UnitCompleted`), no transaccional conjunta — coherente con la regla DDD de "un agregado por transacción". **La regla de correspondencia estricta entre el paso de `Attempt` y el estado de `AcademyUnit`, clasificada en v1.0 como Invariante 12, se reclasifica en v1.1 como Regla de Consistencia Eventual (Sección 8.1, H-01) — el comportamiento no cambia, solo su nombre técnico.**

---

## 16. Integración con otros dominios (contratos funcionales)

- **Dashboard:** contrato de solo lectura — Academia publica, de forma resumida, la Unidad activa, el paso actual y la marca de última actividad; Dashboard construye su propio modelo de lectura a partir de esa publicación. Academia nunca recibe consultas directas de Dashboard (§5.7).
- **Mi Plan:** contrato único — `EXTERNAL_ACTIVITY_COMPLETED` (A-08), exactamente una vez por Unidad, condicionado a `CompletionPolicy`. Sin ningún otro contrato en ningún sentido.
- **Conoce el DELF:** sin contrato — Separate Ways (A-01).
- **Laboratorio:** sin contrato de agregados compartidos — Separate Ways; límite de contenido ya resuelto en A-04 (Biblioteca de Modelos vs. Biblioteca temática, sin superposición ni referencia cruzada).
- **Coach IA:** dos puntos de contrato conceptual — (1) puerta de comprensión antes del paso `Producir` (Coach IA verifica comprensión); (2) generación de `Feedback` a partir de una `ProductionSubmitted`. En ambos casos, Academia entrega contexto (Producción, perfil pedagógico) y recibe un resultado (aprobación de comprensión / conjunto de `FeedbackObservation`), sin acceder a la memoria interna del Coach.
- **Motor Pedagógico Adaptativo:** contrato de recepción — Academia recibe una señal de priorización (qué Unidades/Tipos de Texto destacar) y la aplica únicamente a nivel de presentación de prioridad, nunca alterando `UnlockPolicy` ni el estado de ninguna Unidad (A-03, RN-7).
- **Gamificación:** contrato de publicación — Academia publica `UnitCompleted` y `UnitMastered` como eventos disparadores; el cálculo de recompensa/XP es responsabilidad exclusiva de Gamificación, sin conocimiento por parte de Academia de cómo se traduce el evento en recompensa.

---

## 17. Riesgos del Modelo

**Riesgo 1 — Duplicación de estado entre `AcademyUnit` y `Attempt`.** El diseño de dos agregados (progreso vs. intento activo) crea el riesgo de que una implementación futura añada un campo de estado independiente en `Attempt` que contradiga a `UnitState`. Mitigación ya incorporada en el modelo: invariante 6 declara explícitamente a `UnitState` como única fuente de verdad; `Attempt` solo expone `UnitStep` (posición), nunca un estado propio equivalente.

**Riesgo 2 — Dependencia de `MasteryPolicy` sobre evidencia externa al Bounded Context.** El criterio de `MASTERED`, ya aprobado en A-07, requiere señales de competencia (fortalezas/debilidades) que se originan fuera de Academia. Esto no es un defecto de este modelo — es un costo inherente a un criterio ya aprobado — pero implica que `MasteryEvaluationService` no puede resolver `MASTERED` de forma completamente autónoma; el contrato exacto de esa evidencia externa queda pendiente de definición en el Domain Layer de detalle (Sprint 4.3), sin que esto reabra ninguna decisión funcional ya tomada.

**Riesgo 3 — Consistencia eventual entre `AcademyUnit` y `Attempt`.** Al ser agregados separados, existe una ventana en la que `Attempt` ya alcanzó su último paso pero `AcademyUnit` aún no procesó el evento de transición. Esta ventana es la manifestación concreta de la Regla de Consistencia Eventual formalizada en la Sección 8.1 (H-01) — se declara explícitamente como un trade-off DDD aceptado (aggregates transaccionalmente independientes), no como un defecto, y debe manejarse con cuidado en Sprint 4.5 (Application Layer) mediante el orden correcto de manejo de eventos.

**Riesgo 4 — Alcance de `TeacherOverride` sobre Intentos activos.** Un `FORCE_LOCK` o `FORCE_RESTART` podría, en una implementación descuidada, intentar modificar directamente un `Attempt` en curso, rompiendo el límite de agregados. Mitigación ya incorporada: invariante 10 prohíbe explícitamente esa modificación directa; el Intento activo queda huérfano en vez de alterado.

**Riesgo 5 — Dependencia externa de `CompletionPolicy` no señalada simétricamente en v1.0 (corregido en v1.1, H-08).** Al igual que `MasteryPolicy` (Riesgo 2), `CompletionPolicy` (RN-10) depende de conocer la existencia de una tarea de Mi Plan vinculada — dato externo a Academia. Se reconoce aquí, explícitamente y por simetría con el Riesgo 2, que la decisión de emitir `EXTERNAL_ACTIVITY_COMPLETED` no puede resolverse de forma completamente autónoma dentro de Academia sin una fuente de esa información (local, ya sea réplica de lectura o consulta puntual); el mecanismo exacto queda, igual que en el Riesgo 2, pendiente de definición en el Domain Layer de detalle (Sprint 4.3), sin reabrir ninguna decisión funcional de A-08.

**Riesgo no aplicable — `ModelExample`.** No se identifica riesgo estructural: es un agregado simple, sin relación de consistencia con `AcademyUnit`/`Attempt`, de mutación exclusivamente editorial y ajena al flujo del estudiante (RN-14), con ownership ya no ambiguo tras H-04. No requiere mitigación adicional.

---

## Cumplimiento de criterios de calidad

- **DDD:** tres Aggregate Roots correctamente delimitados por consistencia transaccional real, no por conveniencia técnica; referencias cruzadas exclusivamente por identidad; lenguaje ubicuo con sinónimos prohibidos explícitos y, desde v1.1, sin colisión de literales entre enums (H-05).
- **Clean Architecture / Persistencia ignorante:** ningún elemento de este modelo referencia tecnología de persistencia, framework o formato de transporte.
- **SOLID/GRASP:** responsabilidades de un único agregado nunca se filtran a otro (SRP a nivel de agregado); Domain Services limitados estrictamente a coordinación que no pertenece a ningún agregado individual.
- **Alta cohesión / bajo acoplamiento:** `AcademyUnit` y `Attempt` separados por tasa de cambio y responsabilidad; historial de `Version`/`Feedback` explícitamente fuera del límite estricto de consistencia (H-06), evitando crecimiento no acotado del agregado.
- **Modelo rico (Tell-Don't-Ask):** desde v1.1, cada Aggregate Root declara explícitamente que invoca sus Policies y aplica el resultado sobre sí mismo — ninguna Policy decide ni muta un Aggregate en su lugar (H-02).

---

## Registro de Correcciones

**H-01 — Reclasificación de la Invariante 12.**
*Qué se modificó:* el ítem "12" de la lista de Invariantes (Sección 8, v1.0) se retiró de esa lista (ahora Sección 8 numera 1-11) y se trasladó, con idéntico contenido textual, a una nueva subsección "8.1 — Regla de Consistencia Eventual". Se añadió una nota cruzada en la Sección 15.
*Dónde:* Sección 8 y Sección 8.1 (nueva); referencia cruzada en Sección 15.
*Por qué:* una invariante debe poder garantizarse dentro del límite transaccional de un único agregado; esta regla depende de dos Aggregate Roots (`AcademyUnit`, `Attempt`) sincronizados mediante eventos, consistencia declarada como "eventual" en la propia Sección 15 — la clasificación correcta en DDD es "regla de consistencia eventual", no "invariante".
*Confirmación:* no cambia ninguna resolución A-01–A-10. El comportamiento descrito por la regla es exactamente el mismo en v1.0 y v1.1.

**H-02 — Precisión de invocación de Policies (Tell-Don't-Ask).**
*Qué se modificó:* se añadió, en las descripciones de responsabilidades de AR-1 (`AcademyUnit`) y AR-2 (`Attempt`) en la Sección 3, y en un párrafo introductorio nuevo de la Sección 13, la aclaración explícita de que cada Aggregate Root invoca su Policy correspondiente como criterio de evaluación y aplica el resultado sobre su propio estado — nunca al revés. Se añadió, junto a cada una de las siete Policies en la Sección 13, qué Aggregate la invoca.
*Dónde:* Sección 3 (AR-1, AR-2), Sección 11 (nota de invocación en `MasteryEvaluationService`), Sección 13 (párrafo introductorio y las siete entradas de Policy).
*Por qué:* la redacción de v1.0 podía leerse como que la Policy decidía por sí sola, lo cual introduce riesgo de Anemic Domain Model. Se precisa la dirección de invocación sin mover ninguna lógica fuera del Aggregate.
*Confirmación:* no se movió ninguna regla ni lógica de un Aggregate a una Policy ni viceversa; el contenido de cada Policy es idéntico a v1.0. No cambia ninguna resolución A-01–A-10.

**H-03 — Corrección de la fila `COMPLETED → IN_PROGRESS` en la máquina de estados.**
*Qué se modificó:* se eliminó esa fila de la tabla formal de transiciones (Sección 9). Se añadió, fuera de la tabla, una nota explícita describiendo la repetición de una Unidad como creación de un nuevo `Attempt`, con conservación del `UnitState` de la Unidad (sin transición).
*Dónde:* Sección 9.
*Por qué:* la fila, tal como estaba en v1.0, era contradictoria consigo misma (la notación de flecha implicaba una transición de `UnitState` que el propio texto de esa fila negaba).
*Confirmación:* no se modificó A-09; el comportamiento de la repetición (nuevo Intento, sin reversión de `COMPLETED`/`MASTERED`) es exactamente el mismo, solo se corrigió su representación en la tabla formal.

**H-04 — Ownership de `ModelExample`.**
*Qué se modificó:* se reescribió la frase de invariantes de AR-3 (Sección 3) que en v1.0 decía que la gestión editorial del Administrador ocurre "fuera de este Bounded Context de escritura", reemplazándola por la aclaración de que `ModelExample` pertenece íntegramente al Bounded Context Academia y que el Administrador es un actor autorizado a operar sobre ese mismo agregado, no evidencia de un Bounded Context distinto.
*Dónde:* Sección 3 (AR-3), Sección 1 (referencia cruzada añadida), RN-14 (Sección 7, nota añadida).
*Por qué:* la Sección 1 ya declaraba a Academia como propietaria exclusiva de la Biblioteca de Modelos; la Sección 3 de v1.0 contradecía esto al situar la edición "fuera" del Bounded Context. Ahora existe una única interpretación: ownership completo dentro de Academia.
*Confirmación:* no cambia ninguna facultad ya definida en A-04/A-10/§6.15 — el Administrador sigue siendo quien edita, el Profesor sigue sin poder hacerlo (RN-14 sin cambios de contenido).

**H-05 — Colisión del valor `MASTERED`.**
*Qué se modificó:* el tercer valor de la enumeración `MasteryLevel` (Sección 6) se renombró de `MASTERED` a `SUSTAINED`.
*Dónde:* Sección 6 (`MasteryLevel`).
*Por qué:* eliminar la colisión literal con `UnitState.MASTERED`, que representa un concepto de granularidad distinta (estado terminal de la Unidad vs. clasificación de evidencia de competencia).
*Confirmación:* `UnitState` no se modificó. El criterio que `MasteryLevel.SUSTAINED` representa es exactamente el mismo que representaba `MasteryLevel.MASTERED` en v1.0 — cambio puramente nominal.

**H-06 — Colección potencialmente ilimitada dentro de `Attempt`.**
*Qué se modificó:* se añadió una invariante adicional en AR-2 (Sección 3) y una nota en la Sección 4, aclarando que el límite de consistencia transaccional de `Attempt` solo requiere la `Version`/`Feedback` vigente; el historial de Versiones/Retroalimentaciones anteriores se trata como colección de solo lectura fuera de ese límite estricto.
*Dónde:* Sección 3 (AR-2, invariantes), Sección 4 (nota final).
*Por qué:* mitigar el riesgo de agregado con colección interna sin límite superior (`RevisionPolicy` permite ciclos de reescritura ilimitados), sin alterar esa política.
*Confirmación:* `RevisionPolicy` (RN-4) permanece exactamente igual — sigue sin límite superior de ciclos. Solo se precisa cómo el agregado trata su propio historial a efectos de límite de consistencia, no una nueva regla de negocio.

**H-07 — Prioridad implícita de `FeedbackCategory`.**
*Qué se modificó:* se añadió, junto a la enumeración `FeedbackCategory` (Sección 6), un atributo explícito de prioridad (`priority: 1..10`) para cada categoría, listado independientemente del orden de declaración del enum.
*Dónde:* Sección 6 (`FeedbackCategory`).
*Por qué:* evitar que la jerarquía macro→micro (§9.5, RN-3) dependa únicamente del orden de declaración del enum, un detalle de representación frágil.
*Confirmación:* el orden/jerarquía de prioridad es exactamente el mismo que en v1.0 (§9.5) — solo se hizo explícito como atributo, no se alteró.

**H-08 — Riesgo simétrico para `CompletionPolicy`.**
*Qué se modificó:* se añadió un nuevo "Riesgo 5" en la Sección 17, simétrico al Riesgo 2 ya existente para `MasteryPolicy`, aplicado a la dependencia de `CompletionPolicy` sobre la existencia de una tarea de Mi Plan.
*Dónde:* Sección 17 (nuevo Riesgo 5).
*Por qué:* la misma clase de dependencia externa reconocida para `MasteryPolicy` en v1.0 no estaba señalada para `CompletionPolicy`, pese a compartir el mismo patrón de acoplamiento.
*Confirmación:* no cambia el contenido de `CompletionPolicy` ni de A-08 — es una adición de transparencia sobre un riesgo ya implícito.

**H-09 — Justificación de las Specifications.**
*Qué se modificó:* se amplió la nota final de la Sección 14, aclarando explícitamente que, ante la ausencia de un consumidor de consulta ya documentado, las tres Specifications quedan preparadas deliberadamente para consultas futuras, sin necesidad de rediseño.
*Dónde:* Sección 14 (nota final, ampliada).
*Por qué:* evidenciar que la superposición con las Policies homólogas es una decisión de diseño intencional (reutilización diferida), no complejidad no justificada.
*Confirmación:* no se eliminó ni se modificó ninguna Specification ni Policy — solo se amplió su justificación textual.

**H-10 — Diferencia entre `ProductionSubmitted` y `FeedbackRequested`.**
*Qué se modificó:* se amplió la columna "Propósito" de ambos eventos en la Sección 10, explicando que `ProductionSubmitted` registra el hecho consumado y `FeedbackRequested` registra la intención derivada de solicitar retroalimentación.
*Dónde:* Sección 10 (filas `ProductionSubmitted`, `FeedbackRequested`).
*Por qué:* aclarar la distinción conceptual entre ambos eventos, señalada como no evidente por la auditoría.
*Confirmación:* ambos eventos se mantienen, en el mismo momento de emisión y con el mismo emisor que en v1.0 — no se fusionaron ni se eliminó ninguno.

**H-11 — Propósito de `RevisionStarted`/`ReflectionStarted`.**
*Qué se modificó:* se actualizó la columna "Quién puede consumirlo" de ambos eventos en la Sección 10, indicando explícitamente que son registros de auditoría interna del propio dominio (Event Sourcing parcial de `Attempt`), sin consumidor externo en esta versión.
*Dónde:* Sección 10 (filas `RevisionStarted`, `ReflectionStarted`).
*Por qué:* aclarar por qué existen como Domain Events pese a no tener consumidor externo documentado.
*Confirmación:* ambos eventos se mantienen exactamente como en v1.0 — solo se documentó su propósito interno.

---

**Cierre.** Con las once correcciones anteriores, el Modelo de Dominio de Academia queda completamente consistente desde la perspectiva de Domain-Driven Design, sin haber modificado el flujo de 11 pasos (A-02), la máquina de estados oficial (A-07), ningún Aggregate Root, ninguna regla de negocio, ningún evento funcional, ningún límite del Bounded Context ni ninguna de las resoluciones A-01 a A-10. Esta versión v1.1 queda lista para servir de base al Sprint 4.2 (Implementability Audit) sin hallazgos DDD pendientes de severidad ALTA.
