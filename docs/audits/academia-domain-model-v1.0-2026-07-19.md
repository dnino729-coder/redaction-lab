# Especificación del Modelo de Dominio — Academia v1.0 (Sprint 4.1)

**Base única y vinculante:** `docs/audits/academia-functional-audit-2026-07-19.md` (Sprint 4.0.1) y `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (Sprint 4.0.2, resoluciones A-01 a A-10).

**Nota de trazabilidad:** el encargo referencia `docs/resolutions/academia-architecture-resolutions-v1.md`; el documento realmente vigente y utilizado como fuente en este sprint es `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (mismo contenido, mismas diez resoluciones A-01 a A-10, ruta distinta a la citada en el encargo). Se señala aquí por trazabilidad, sin que esto altere ninguna decisión.

Ninguna resolución A-01 a A-10 fue reinterpretada, cuestionada o modificada. Ninguna funcionalidad nueva fue introducida. Este documento pertenece exclusivamente al Domain Layer: no contiene diseño de base de datos, Prisma, DTOs, APIs, casos de uso, CQRS, Repositories, Mappers, Infrastructure, persistencia, UI ni código.

---

## 1. Bounded Context

**Nombre:** Academia (Academy).

**Propósito:** gobernar el ciclo de vida de la práctica guiada de producción escrita por tipo de texto DELF B2, mediante unidades secuenciales de 11 pasos fijos (A-02), con retroalimentación exclusivamente formativa (A-05) y progresión controlada por desbloqueo (A-03).

**Responsabilidades:**
- Poseer y gobernar el ciclo de vida completo de la Unidad de Academia y su máquina de estados (A-07).
- Poseer el flujo de Producción/Borrador/Versión/Retroalimentación dentro de cada intento de unidad.
- Poseer en exclusiva la Biblioteca de Modelos (A-04).
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

**Responsabilidades:** gobernar en exclusiva el valor de `UnitState`; decidir si el desbloqueo hacia la siguiente Unidad procede (A-03, vía `UnlockPolicy`); decidir si `MASTERED` procede (A-07, vía `MasteryPolicy`); aplicar anulaciones docentes (A-10); mantener referencia al Intento activo y al historial de Intentos (por identidad, no por composición).

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

**Responsabilidades:** gobernar la posición actual dentro de la secuencia de 11 pasos (`UnitStep`); gobernar el ciclo Borrador → Versión → Retroalimentación → Reescritura (mínimo un ciclo obligatorio, A-07); aplicar la puerta de comprensión antes de permitir Producir (§7.2); soportar el mecanismo de autoguardado y continuidad (A-06).

**Invariantes:**
- El paso actual solo avanza en el orden exacto de A-02; nunca retrocede salvo el ciclo explícito `REVISION ⇄ AWAITING_FEEDBACK`.
- No puede alcanzar el paso `Reflexionar` sin al menos una Versión con Retroalimentación entregada y al menos una Reescritura posterior (A-07).
- No puede alcanzar el paso `Producir` sin que la puerta de comprensión del paso `Comprender` esté satisfecha.
- Una Versión, una vez creada, es inmutable — cualquier cambio genera una Versión nueva.

**Ciclo de vida:** se crea (vía `AttemptFactory`) al iniciar una Unidad por primera vez o al repetirla (A-09); termina implícitamente al alcanzar el paso `Desbloquear`, momento en que notifica a `AcademyUnit` (vía evento de dominio) para su transición a `COMPLETED`.

**Límites del agregado:** referencia a `AcademyUnit` únicamente por identidad (no la modifica directamente); referencia a `ModelExample` únicamente por identidad y en modo lectura.

**Justificación como Aggregate Root:** el ciclo Borrador/Versión/Retroalimentación requiere consistencia transaccional fuerte y frecuente durante una sesión activa, con una tasa de cambio muy distinta a la de `AcademyUnit` (que cambia una vez por transición de estado) — separarlo evita cargar/bloquear el agregado de progreso completo por cada carácter autoguardado del borrador.

### AR-3 — ModelExample

**Propósito:** representar una producción ejemplar individual de la Biblioteca de Modelos, con su comentario comparativo de IA.

**Responsabilidades:** mantener el contenido ejemplar, su calificación editorial (excelente/con errores) y el comentario de IA asociado; ser referenciable por `Attempt` durante los pasos Observar/Analizar.

**Invariantes:** un `ModelExample` pertenece exactamente a un `TextType`; su contenido es de solo lectura para `Attempt` (nunca se modifica desde el flujo del estudiante, solo desde la gestión editorial del Administrador, fuera de este Bounded Context de escritura — §6.15).

**Ciclo de vida:** creado/editado/retirado de forma independiente del progreso de cualquier estudiante.

**Justificación como Aggregate Root:** tiene identidad y ciclo de vida propios, gestionados de forma completamente independiente de `AcademyUnit`/`Attempt`; no existe ninguna regla de consistencia que exija agruparlo con ellos.

---

## 4. Entidades

**Draft** (interna de `Attempt`) — Identidad: única por Intento (a lo sumo un Borrador activo a la vez). Atributos conceptuales: contenido actual, marca de tiempo del último autoguardado. Comportamiento: se reemplaza en cada autoguardado (A-06); se congela en una `Version` al enviarse a retroalimentación. Reglas asociadas: el contenido de un Borrador nunca se considera evaluable hasta convertirse en Versión.

**Version** (interna de `Attempt`) — Identidad: número secuencial dentro del Intento. Atributos conceptuales: contenido congelado, número de secuencia, marca de tiempo de creación. Comportamiento: inmutable una vez creada. Reglas asociadas: "no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión" (§13.5, ya vinculante).

**Feedback** (interna de `Attempt`) — Identidad: asociada 1:1 a la `Version` que evalúa. Atributos conceptuales: conjunto de `FeedbackObservation` (una por cada una de las 10 categorías aplicables), orden jerárquico macro→micro. Comportamiento: se genera exactamente una vez por Versión evaluada; puede originar una nueva Versión (reescritura) pero nunca se edita a sí misma. Reglas asociadas: A-05 (marco formativo exclusivo); tono no punitivo (§8.6, ya vinculante).

**TeacherOverride** (interna de `AcademyUnit`) — Identidad: única por acción de anulación registrada. Atributos conceptuales: acción (`FORCE_LOCK`/`FORCE_RESTART`), autor, marca de tiempo, motivo. Comportamiento: se aplica sobre `AcademyUnit` sin tocar directamente ningún `Attempt` en curso (ver invariante en sección 8). Reglas asociadas: A-10.

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

**UnitState** (A-07, exacta, sin modificación): `LOCKED, UNLOCKED, IN_PROGRESS, AWAITING_FEEDBACK, REVISION, REFLECTION, COMPLETED, MASTERED`.

**UnitStep** (A-02, exacta, orden fijo): `CONTEXTUALIZE, DEFINE_OBJECTIVES, COMPREHEND, OBSERVE, ANALYZE, PRACTICE, PRODUCE, RECEIVE_FEEDBACK, REWRITE, REFLECT, UNLOCK`.

**TextType** (heredado como vocabulario compartido de §13.5, no redefinido): `LETTER, ARTICLE, ESSAY, EMAIL, REPORT`.

**DifficultyLevel** (alineado a §13.5/`WritingTask`, distinto y no confundible con la escala de `LearningTask.difficulty` de Mi Plan, que incluye `EXPERT` y pertenece a otro Bounded Context): `EASY, MEDIUM, HARD`.

**FeedbackCategory** (§9.5, orden = jerarquía de prioridad macro→micro, exacta): `COMPREHENSION, COMMUNICATIVE_INTENT, STRUCTURE, COHERENCE, COHESION, ARGUMENTATION, REGISTER, VOCABULARY, GRAMMAR, SPELLING`.

**MasteryLevel** (elaboración de dominio del criterio ya aprobado en A-07, no una nueva regla de negocio — clasifica la evidencia de competencia que alimenta a `MasteryPolicy`): `DEVELOPING, CONSOLIDATING, MASTERED`.

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
| RN-14 | El Profesor no puede editar contenido editorial (lecciones, actividades, `ModelExample`) — esa facultad pertenece exclusivamente al Administrador. | `ModelExample` | A-10, §6.15 |
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
12. Ninguna transición de `UnitState` ocurre sin que su `Attempt` correspondiente haya alcanzado el `UnitStep` equivalente (correspondencia estricta entre pasos y estados, sección 9).

---

## 9. Máquina de Estados (formalización de A-07 — sin modificaciones)

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
| `COMPLETED → IN_PROGRESS` (nuevo Intento) | `UnitRepeated` (A-09) | No es una transición de la misma Unidad hacia atrás — crea un `Attempt` nuevo; `UnitState` permanece `COMPLETED`/`MASTERED` a nivel de logro histórico mientras el nuevo Intento progresa en paralelo como práctica adicional (ver Riesgo 3, sección 17, sobre esta dualidad). |
| `Cualquier estado activo → LOCKED` | `TeacherOverrideApplied` (acción `FORCE_LOCK`) | Excepción única (A-10); no aplica sobre `COMPLETED`/`MASTERED` (RN-13, invariante 10). |

---

## 10. Domain Events

| Evento | Quién lo emite | Cuándo ocurre | Quién puede consumirlo | Propósito |
|---|---|---|---|---|
| **UnitUnlocked** | `AcademyUnit` | Al transicionar `LOCKED → UNLOCKED` | Dashboard, Motor Pedagógico | Notificar disponibilidad de nuevo contenido. |
| **UnitStarted** | `Attempt` (vía `AcademyUnit`) | Al crear el primer `Attempt` de una Unidad | Dashboard (continuidad, A-06) | Marcar inicio de progresión activa. |
| **ProductionSubmitted** | `Attempt` | Al finalizar el paso `Producir` y congelar una `Version` | Coach IA/Feedback (contrato externo) | Disparar el proceso de retroalimentación. |
| **FeedbackRequested** | `Attempt` | Inmediatamente después de `ProductionSubmitted` | Coach IA (Customer-Supplier) | Solicitar generación de `Feedback`. |
| **FeedbackDelivered** | `Attempt` | Al recibir y registrar la `Feedback` completa | Estudiante (vía Dashboard/notificación), Competencias/Learning Analytics | Habilitar el paso `Reescribir`. |
| **RevisionStarted** | `Attempt` | Al iniciar una nueva `Draft` tras `FeedbackDelivered` | — (interno) | Registrar inicio de ciclo de reescritura. |
| **ReflectionStarted** | `Attempt` | Al completar el ciclo mínimo de reescritura (RN-4) | — (interno) | Habilitar el paso `Reflexionar`. |
| **ReflectionCompleted** | `Attempt` | Al responder las preguntas metacognitivas del paso 10 | `AcademyUnit` | Disparar la transición final del Intento. |
| **UnitCompleted** | `AcademyUnit` | Al transicionar `REFLECTION → COMPLETED` | Mi Plan (vía `EXTERNAL_ACTIVITY_COMPLETED`), Gamificación, Dashboard, siguiente `AcademyUnit` (desbloqueo) | Señalar finalización oficial de la Unidad. |
| **UnitMastered** | `AcademyUnit` | Al satisfacerse `MasteryPolicy` (RN-8) | Gamificación, Dashboard, Competencias | Señalar dominio sostenido, sin efecto sobre Mi Plan. |
| **EXTERNAL_ACTIVITY_COMPLETED** | `AcademyUnit` | En el mismo instante de `UnitCompleted`, condicionado a `CompletionPolicy` (RN-10) | Mi Plan (único consumidor autorizado) | Único contrato de integración con Mi Plan (A-08). |
| **UnitRepeated** *(evento adicional, requerido por A-09, no listado explícitamente en el encargo)* | `AcademyUnit` | Al crear un nuevo `Attempt` sobre una Unidad ya `COMPLETED`/`MASTERED` | Competencias/Learning Analytics (evidencia para `MasteryPolicy`) | Registrar repetición sin alterar el estado de logro. |
| **TeacherOverrideApplied** *(evento adicional, requerido por A-10, no listado explícitamente en el encargo)* | `AcademyUnit` | Al registrar un `TeacherOverride` (`FORCE_LOCK`/`FORCE_RESTART`) | Dashboard del Profesor, Auditoría | Registrar la excepción manual y su autor. |

---

## 11. Domain Services

**MasteryEvaluationService** — evalúa si una `AcademyUnit` satisface `MasteryPolicy` (RN-8), combinando la propia evidencia de la Unidad (Intentos, Retroalimentación) con evidencia de competencia proveniente de otro Bounded Context (fortalezas/debilidades). Justificación: la evaluación de dominio no pertenece naturalmente a `AcademyUnit` en solitario porque requiere conocimiento agregado de más de un encuentro y de una fuente de evidencia externa — es un proceso de dominio significativo sin hogar natural en un único agregado (criterio clásico de Domain Service, Evans).

**UnitSequenceService** — determina, para un Estudiante y un `TextType`, qué `AcademyUnit` es la predecesora de cuál, a efectos de aplicar `UnlockPolicy` (RN-6). Justificación: coordina múltiples instancias de `AcademyUnit` del mismo estudiante simultáneamente; ninguna instancia individual de `AcademyUnit` conoce por sí misma su posición relativa dentro de la progresión completa.

*(No se identifican más Domain Services: las reglas de anulación docente y de repetición se resuelven como comportamiento propio del agregado `AcademyUnit`, no como coordinación externa — ver sección 17, riesgo evitado por diseño.)*

---

## 12. Factories

**AcademyUnitFactory** — crea la instancia inicial de `AcademyUnit` para un Estudiante cuando una Unidad del catálogo se vuelve visible por primera vez. Encapsula la determinación del estado inicial (`UNLOCKED` si es la primera Unidad de su `TextType` en la progresión del estudiante; `LOCKED` en cualquier otro caso) — una decisión que depende de conocimiento externo a la propia instancia (posición en la secuencia, vía `UnitSequenceService`) y que un constructor simple no debe resolver por sí mismo.

**AttemptFactory** — crea un nuevo `Attempt` al iniciar una Unidad por primera vez o al repetirla (A-09). Encapsula las invariantes de creación: paso inicial siempre `CONTEXTUALIZE`, `Draft` vacío, referencia correcta a `AcademyUnit`, numeración secuencial del Intento respecto a los anteriores.

*(No se define una Factory dedicada para `ModelExample`: su creación no involucra invariantes complejas más allá de la asignación de `TextType`, y un constructor simple es suficiente — proporcionalidad, evitando sobre-ingeniería.)*

---

## 13. Policies

**UnlockPolicy** — `AcademyUnit` predecesora en `COMPLETED` ⇒ Unidad siguiente elegible para `UNLOCKED` (RN-6). Sin umbral de puntuación, sin excepción salvo `TeacherOverride`.

**FeedbackPolicy** — toda `Feedback` se expresa mediante las 10 `FeedbackCategory`, en orden jerárquico macro→micro; nunca mediante la rúbrica oficial DELF (RN-3, A-05).

**RevisionPolicy** — mínimo un ciclo `REVISION` completado antes de `REFLECTION`; ciclo `REVISION ⇄ AWAITING_FEEDBACK` sin límite superior (RN-4).

**MasteryPolicy** — `MasteryCriterion` satisfecho ⇔ ausencia de debilidad `HIGH`/`CRITICAL` sostenida en `COMPLETED` y en al menos un encuentro independiente posterior sin andamiaje (RN-8, A-07).

**CompletionPolicy** — `EXTERNAL_ACTIVITY_COMPLETED` se emite si y solo si existe una tarea de Mi Plan vinculada a la Unidad en el momento de `COMPLETED` (RN-10, A-08).

**RepetitionPolicy** — repetición permitida sin límite desde `COMPLETED`/`MASTERED`; no revierte estado, no reemite evento, no revoca recompensas (RN-11, RN-12, A-09).

**TeacherOverridePolicy** — `FORCE_LOCK` válido desde cualquier estado activo (`UNLOCKED` a `REFLECTION` inclusive), inválido desde `LOCKED`; `FORCE_RESTART` válido únicamente desde `COMPLETED`/`MASTERED` (RN-13, A-10).

---

## 14. Specifications

**EligibleForUnlockSpecification** — predicado reutilizable: "esta `AcademyUnit` es elegible para `UNLOCKED`" (misma regla que `UnlockPolicy`, expresada en forma composable/consultable). Reutilizada tanto para validar una transición puntual como para listar todas las Unidades elegibles de un Estudiante.

**MasteryEligibleSpecification** — predicado reutilizable: "esta `AcademyUnit` satisface el criterio de `MASTERED`" (misma regla que `MasteryPolicy`, en forma consultable). Reutilizada por `MasteryEvaluationService` y por consultas de progreso agregado (p. ej., para el Profesor, A-10).

**RepeatableSpecification** — predicado reutilizable: "esta `AcademyUnit` puede repetirse" (`COMPLETED` o `MASTERED`). Reutilizada tanto para validar el inicio de una repetición como para listar Unidades repetibles.

*(Relación con las Policies: cada Specification expresa, en forma composable y consultable, el mismo predicado que su Policy correspondiente aplica como validación puntual — superposición intencional, consistente con el patrón Specification de Evans.)*

---

## 15. Relaciones entre Agregados

- `AcademyUnit` referencia a su `Attempt` activo y a su historial de Intentos **únicamente por identidad** (nunca por composición).
- `Attempt` referencia a `AcademyUnit` **únicamente por identidad**, en modo lectura (no la modifica directamente; toda transición de `AcademyUnit` ocurre en respuesta a un evento emitido por `Attempt`, nunca por escritura directa cruzada).
- `Attempt` referencia a `ModelExample` **únicamente por identidad**, en modo lectura, durante los pasos `Observar`/`Analizar`.
- `AcademyUnit` referencia a `StudentId` como identidad externa (otro Bounded Context).
- Ningún agregado contiene una copia embebida de otro agregado — todas las relaciones cruzadas son por identidad, preservando límites de consistencia transaccional independientes por agregado (cada unidad de trabajo modifica exactamente un agregado).
- La consistencia entre `AcademyUnit` y `Attempt` es **eventual**, mediada por eventos de dominio (`ReflectionCompleted → UnitCompleted`), no transaccional conjunta — coherente con la regla DDD de "un agregado por transacción".

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

**Riesgo 3 — Consistencia eventual entre `AcademyUnit` y `Attempt`, y ambigüedad de la transición `COMPLETED → IN_PROGRESS` en repetición.** Al ser agregados separados, existe una ventana en la que `Attempt` ya alcanzó su último paso pero `AcademyUnit` aún no procesó el evento de transición. Adicionalmente, una repetición (A-09) crea un nuevo `Attempt` mientras `AcademyUnit.state` permanece en `COMPLETED`/`MASTERED` como logro histórico — este modelo declara explícitamente que ambos hechos coexisten sin conflicto (el logro no se revierte; el nuevo Intento progresa como práctica adicional), pero cualquier lectura ingenua de "estado de la Unidad" sin distinguir "logro histórico" de "intento en curso" podría interpretarse erróneamente como una contradicción. Mitigación: la distinción queda documentada explícitamente en la tabla de transiciones (sección 9) y debe preservarse en el Domain Layer de detalle.

**Riesgo 4 — Alcance de `TeacherOverride` sobre Intentos activos.** Un `FORCE_LOCK` o `FORCE_RESTART` podría, en una implementación descuidada, intentar modificar directamente un `Attempt` en curso, rompiendo el límite de agregados. Mitigación ya incorporada: invariante 10 prohíbe explícitamente esa modificación directa; el Intento activo queda huérfano en vez de alterado.

**Riesgo no aplicable — `ModelExample`.** No se identifica riesgo estructural: es un agregado simple, sin relación de consistencia con `AcademyUnit`/`Attempt`, de mutación exclusivamente editorial y ajena al flujo del estudiante (RN-14). No requiere mitigación adicional.

---

## Cumplimiento de criterios de calidad

- **DDD:** tres Aggregate Roots correctamente delimitados por consistencia transaccional real, no por conveniencia técnica; referencias cruzadas exclusivamente por identidad; lenguaje ubicuo con sinónimos prohibidos explícitos para evitar ambigüedad entre Bounded Contexts.
- **Clean Architecture / Persistencia ignorante:** ningún elemento de este modelo referencia tecnología de persistencia, framework o formato de transporte.
- **SOLID/GRASP:** responsabilidades de un único agregado nunca se filtran a otro (SRP a nivel de agregado); Domain Services limitados estrictamente a coordinación que no pertenece a ningún agregado individual (evita el anti-patrón de servicio anémico que absorbe lógica que debería vivir en la entidad).
- **Alta cohesión / bajo acoplamiento:** `AcademyUnit` y `Attempt` separados por tasa de cambio y responsabilidad, no fusionados por comodidad; `ModelExample` completamente desacoplado del flujo del estudiante.
- **Modelo rico:** las reglas de negocio (sección 7) se protegen dentro de los propios agregados/entidades mediante invariantes (sección 8) y Policies, no como validación externa desconectada del objeto que gobierna el dato.

---

**Cierre.** Ninguna de las diez resoluciones A-01 a A-10 fue modificada, reinterpretada ni cuestionada. El flujo oficial de 11 pasos (A-02) y la máquina de estados oficial (A-07) se formalizaron exactamente como fueron aprobados. Este modelo de dominio queda listo como base para el Sprint 4.2 (Implementability Audit).
