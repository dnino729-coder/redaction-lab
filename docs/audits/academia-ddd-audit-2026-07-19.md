# Auditoría DDD del Modelo de Dominio — Academia (Sprint 4.2.1)

**Documento auditado:** `docs/audits/academia-domain-model-v1.0-2026-07-19.md` ("Especificación del Modelo de Dominio — Academia v1.0"). **Fecha:** 2026-07-19.
**Alcance:** exclusivamente calidad DDD del modelo (Bounded Context, Aggregates, Entities, Value Objects, Enums, reglas, invariantes, máquina de estados, Domain Events, Domain Services, Policies, Specifications, Factories, relaciones entre agregados, integridad del dominio, aptitud Event-Driven/CQRS). No se evaluó funcionalidad, UX, base de datos, Prisma, APIs ni frontend. No se modificó el modelo ni las resoluciones A-01 a A-10.

---

## 1. Bounded Context

Los límites frente a Conoce el DELF, Laboratorio, Mi Plan, Coach IA, Motor Pedagógico y Gamificación están correctamente tipificados con los patrones de Context Mapping (Separate Ways, Published Language, Customer-Supplier, Conformist), cada uno con justificación trazable a una resolución. No se detecta ninguna frontera mal definida entre Academia y esos seis Bounded Context.

**Hallazgo H-04** — ver detalle abajo: la propiedad de `ModelExample` presenta una contradicción interna entre la Sección 1 (que la declara responsabilidad exclusiva de Academia) y la Sección 3 (que sitúa la gestión editorial "fuera de este Bounded Context de escritura").

---

## 2. Ubiquitous Language

El glosario es consistente en el resto del documento (un único nombre oficial por concepto, sinónimos prohibidos declarados, distinción correcta frente a términos homónimos de otros Bounded Context como "Nivel"/`current_level` o "Etapa"/`LearningPhase`).

**Hallazgo H-05** — ver detalle abajo: colisión del valor literal `MASTERED` entre dos enumeraciones de granularidad distinta.

---

## 3. Aggregate Roots

`AcademyUnit`, `Attempt` y `ModelExample` están correctamente justificados como Aggregate Root cada uno (identidad propia, ciclo de vida propio, límite de consistencia transaccional propio, tasa de cambio diferenciada como criterio explícito de separación entre `AcademyUnit` y `Attempt`). Ninguno de los tres debería degradarse a Entity, Value Object o Domain Service — la separación `AcademyUnit`/`Attempt` en particular está bien argumentada por tasa de cambio (criterio válido de Vernon), no por conveniencia arbitraria.

Se detectan dos problemas reales, no de existencia del Aggregate sino de su especificación:

**Hallazgo H-01 (severidad ALTA)**

## Hallazgo
La Invariante 12 ("Ninguna transición de `UnitState` ocurre sin que su `Attempt` correspondiente haya alcanzado el `UnitStep` equivalente") exige correspondencia estricta y permanente entre dos Aggregate Roots distintos. La Sección 15 declara explícitamente que la consistencia entre `AcademyUnit` y `Attempt` es "eventual... no transaccional conjunta", y la Sección 17 (Riesgo 3) reconoce una "ventana" real de desincronización entre ambos. Una regla llamada "invariante" no puede, por definición DDD, depender de sincronización eventual entre dos límites transaccionales distintos — o se garantiza dentro de un único agregado, o no es una invariante en sentido estricto.

## Severidad
ALTA

## Impacto
Sección 8 (Invariante 12), Sección 3 (AR-1/AR-2), Sección 15.

## Principio DDD involucrado
Límite de consistencia del Aggregate (Evans, Vernon): las invariantes deben poder protegerse dentro de la transacción de un único agregado; una regla que depende de dos agregados sincronizados por eventos es, como máximo, una regla de consistencia eventual, no una invariante.

## Evidencia
Sección 8, ítem 12, contrastado con Sección 15 ("La consistencia entre `AcademyUnit` y `Attempt` es eventual... no transaccional conjunta") y Sección 17, Riesgo 3.

## Corrección mínima
Reclasificar el ítem 12 de "Invariante" a "Regla de consistencia eventual" (el propio documento ya usa esta distinción para el Riesgo 3). No implica ningún cambio de comportamiento, regla de negocio ni resolución A-01 a A-10 — es una corrección de clasificación DDD.

---

**Hallazgo H-06 (severidad MEDIA)**

## Hallazgo
`Attempt` puede acumular un número no acotado de `Version`/`Feedback`, ya que `RevisionPolicy` permite el ciclo `REVISION ⇄ AWAITING_FEEDBACK` "sin límite superior". Un agregado con una colección interna potencialmente ilimitada es un antipatrón de diseño de agregados explícitamente señalado por Vernon (coste de carga completa del agregado, riesgo de contención de concurrencia al crecer sin límite).

## Severidad
MEDIA

## Impacto
Sección 3 (AR-2, `Attempt`), Sección 4 (`Version`, `Feedback`).

## Principio DDD involucrado
Diseño efectivo de agregados (Vernon, *Implementing Domain-Driven Design*): evitar colecciones internas sin límite superior dentro del límite transaccional de un agregado.

## Evidencia
Sección 13 (`RevisionPolicy`: "ciclo `REVISION ⇄ AWAITING_FEEDBACK` sin límite superior") frente a Sección 3 (AR-2), que no menciona ningún límite ni tratamiento diferenciado del historial.

## Corrección mínima
Aclarar que `Attempt`, a efectos de sus propias invariantes de transición (RN-2, RN-4), solo necesita referenciar la `Version`/`Feedback` vigente; el historial completo de versiones anteriores puede tratarse como colección de solo lectura fuera del límite estricto de consistencia del agregado. No altera ninguna regla de negocio.

---

## 4. Entidades

`Draft`, `Version`, `Feedback` y `TeacherOverride` tienen identidad, pertenencia al agregado y comportamiento correctamente delimitados. No se detecta ninguna entidad mal ubicada ni con responsabilidad ambigua. Sin hallazgos adicionales en esta sección.

---

## 5. Value Objects

`StudentId`, `DraftContent`, `FeedbackObservation`, `MasteryCriterion`, `WordCountRange` y `VersionNumber` cumplen inmutabilidad, igualdad por valor y ausencia de identidad propia declarada explícitamente en cada caso. No se detecta comportamiento anémico problemático (los Value Objects de este modelo son apropiadamente ligeros — la ausencia de comportamiento rico en un VO no es, por sí misma, una anomalía). Sin hallazgos en esta sección.

---

## 6. Enumeraciones

**Hallazgo H-05 (severidad MEDIA)**

## Hallazgo
El valor `MASTERED` aparece como valor literal en dos enumeraciones distintas del mismo Bounded Context: `UnitState` (estado terminal de una `AcademyUnit`) y `MasteryLevel` (clasificación de evidencia de competencia, de granularidad más fina, que alimenta a `MasteryPolicy`). Aunque conceptualmente relacionados, son dos conceptos de dominio de nivel distinto (estado de la Unidad vs. clasificación de una competencia) que comparten el mismo nombre literal, lo que introduce riesgo real de ambigüedad en el Lenguaje Ubicuo y en cualquier implementación posterior que maneje ambos enums en el mismo contexto de código.

## Severidad
MEDIA

## Impacto
Sección 6 (Enumeraciones: `UnitState`, `MasteryLevel`).

## Principio DDD involucrado
Lenguaje Ubicuo (Evans): dentro de un mismo Bounded Context, un término no debería tener dos significados distintos según el enum en el que aparezca.

## Evidencia
Sección 6: `UnitState` incluye `MASTERED`; `MasteryLevel` incluye `MASTERED` como uno de sus tres valores (`DEVELOPING, CONSOLIDATING, MASTERED`).

## Corrección mínima
Renombrar el valor de `MasteryLevel` a un término distinto (p. ej. `MASTERED` → `PROFICIENT_SUSTAINED` o equivalente), preservando exactamente el criterio de A-07 ya aprobado — cambio puramente nominal, sin alterar ninguna regla.

---

**Hallazgo H-07 (severidad MEDIA)**

## Hallazgo
El orden jerárquico de prioridad de `FeedbackCategory` (macro→micro, §9.5, protegido por `FeedbackPolicy`) se representa únicamente mediante el orden de declaración del enum, sin un atributo explícito de prioridad. Esto es conocimiento de dominio relevante (la jerarquía de corrección) codificado de forma implícita en un detalle de representación, frágil ante cualquier reordenamiento futuro del enum y no autoexplicativo para quien lo consuma sin leer esta especificación completa.

## Severidad
MEDIA

## Impacto
Sección 6 (`FeedbackCategory`), Sección 13 (`FeedbackPolicy`).

## Principio DDD involucrado
Hacer explícito el conocimiento implícito del dominio (Evans, "Making Implicit Concepts Explicit").

## Evidencia
Sección 6 ("orden = jerarquía de prioridad macro→micro, exacta") y Sección 13 (`FeedbackPolicy`: "en orden jerárquico macro→micro").

## Corrección mínima
Añadir, junto a la enumeración, un atributo o tabla de prioridad explícita asociada a `FeedbackCategory` (p. ej. un número de orden declarado, no solo la posición de declaración). No cambia ninguna regla, solo su representación explícita.

*(Nota: `UnitStep`, cuyo orden también es semánticamente significativo, no presenta este problema — en ese caso la secuencia ordenada es el propósito declarado y central del enum, no un uso secundario implícito como en `FeedbackCategory`.)*

---

## 7. Reglas de negocio

Las 17 reglas están numeradas, cada una asociada a un único Aggregate protector y trazada a una resolución A-01–A-10 o a una sección del corpus funcional ya vinculante. No se detectan reglas contradictorias entre sí ni reglas fuera del dominio (ninguna regla de negocio describe persistencia, UI o infraestructura). La ambigüedad de ownership de RN-14 (protegida nominalmente por `ModelExample`, pero cuya contraparte de edición se sitúa "fuera del Bounded Context" en la Sección 3) es la misma evidencia ya reportada como H-04; no se cuenta dos veces.

---

## 8. Invariantes

Cubierto mayormente en la Sección 3 de esta auditoría (H-01). Un hallazgo adicional, de menor severidad, relacionado con la misma familia de dependencia externa:

**Hallazgo H-08 (severidad BAJA)**

## Hallazgo
`CompletionPolicy` (RN-10) exige verificar la existencia de una tarea de Mi Plan vinculada — dato que pertenece a otro Bounded Context. El propio documento ya reconoce esta clase de dependencia externa como riesgo explícito para `MasteryPolicy` (Riesgo 2, Sección 17), pero no declara un riesgo simétrico para `CompletionPolicy`, pese a compartir exactamente el mismo patrón de acoplamiento.

## Severidad
BAJA

## Impacto
Sección 13 (`CompletionPolicy`), Sección 17 (ausencia de riesgo simétrico a Riesgo 2).

## Principio DDD involucrado
Transparencia de dependencias externas al agregado / minimización de acoplamiento entre Bounded Context.

## Evidencia
Sección 13 (`CompletionPolicy`) frente a Sección 17, Riesgo 2 (que reconoce esta clase de dependencia solo para `MasteryPolicy`).

## Corrección mínima
Añadir una línea de riesgo simétrica a Riesgo 2, aplicada a `CompletionPolicy`. No cambia ninguna regla ni resolución.

---

## 9. Máquina de estados

Los 8 estados de `UnitState` son alcanzables y ninguno está muerto. No se detectan estados duplicados. Se detecta una transición ambiguamente especificada:

**Hallazgo H-03 (severidad ALTA)**

## Hallazgo
La fila "`COMPLETED → IN_PROGRESS` (nuevo Intento)" de la tabla de transiciones (Sección 9) es contradictoria: la notación de flecha declara una transición del valor de `UnitState` de `COMPLETED` a `IN_PROGRESS`, pero el texto de la misma fila aclara que "`UnitState` permanece `COMPLETED`/`MASTERED`... mientras el nuevo Intento progresa en paralelo" — es decir, `UnitState` no transiciona en absoluto durante una repetición. La tabla, tal como está redactada, es ambigua sobre si `MASTERED`/`COMPLETED` deja de ser el valor vigente de `UnitState` durante una repetición, lo cual además entra en tensión aparente con la Invariante 3 ("`MASTERED` nunca retrocede... incluida la repetición") si se lee la fila literalmente.

## Severidad
ALTA

## Impacto
Sección 9 (tabla de transiciones de `UnitState`).

## Principio DDD involucrado
Especificación formal no ambigua de la máquina de estados — un artefacto que debe poder implementarse directamente sin reinterpretación (requisito explícito de este sprint).

## Evidencia
Sección 9, fila "`COMPLETED → IN_PROGRESS` (nuevo Intento)".

## Corrección mínima
Eliminar esa fila de la tabla de transiciones formales de `UnitState` (no representa una transición real de ese atributo) y reubicar la información de "nuevo Intento sobre Unidad ya completada" como nota aparte, fuera de la tabla. No altera A-09 ni ninguna otra resolución — es una corrección de forma de la tabla, el comportamiento descrito en prosa ya es correcto.

---

## 10. Domain Events

Ownership y momento de emisión están bien definidos para 11 de los 13 eventos. Se detectan dos observaciones de granularidad, ambas de severidad baja:

**Hallazgo H-10 (severidad BAJA)**

## Hallazgo
`ProductionSubmitted` y `FeedbackRequested` se disparan en el mismo instante conceptual ("inmediatamente después de"), sin que el documento indique un consumidor diferenciado entre ambos ni justifique por qué son dos eventos de dominio distintos en lugar de uno solo.

## Severidad
BAJA

## Impacto
Sección 10.

## Principio DDD involucrado
Granularidad de Domain Events: un evento debe representar un hecho de negocio significativo por sí mismo, no una descomposición técnica sin propósito diferenciado.

## Evidencia
Sección 10, filas `ProductionSubmitted` y `FeedbackRequested`.

## Corrección mínima
Ninguna obligatoria. Si en Sprint 4.3 se confirma un consumidor realmente distinto para cada uno, mantener ambos; en caso contrario, documentar `ProductionSubmitted` como el hecho y `FeedbackRequested` como la intención derivada, aclarando la relación causal en la propia tabla.

---

**Hallazgo H-11 (severidad BAJA)**

## Hallazgo
`RevisionStarted` y `ReflectionStarted` se declaran sin consumidor externo ("— (interno)"), lo que cuestiona si ameritan la ceremonia de un Domain Event formal frente a ser simplemente cambios de estado internos de `Attempt`.

## Severidad
BAJA

## Impacto
Sección 10.

## Principio DDD involucrado
Un Domain Event aporta valor cuando otro componente necesita conocerlo; sin consumidor, su única justificación válida es trazabilidad/auditoría interna (uso legítimo, pero debe declararse como tal).

## Evidencia
Sección 10, filas `RevisionStarted`/`ReflectionStarted`, columna "Quién puede consumirlo: — (interno)".

## Corrección mínima
Ninguna obligatoria — son válidos como registro de auditoría interna del propio `Attempt`; se recomienda únicamente documentar explícitamente ese propósito en el Domain Layer de detalle (Sprint 4.3).

No se detecta pérdida de eventos, duplicidad no justificada, ni acoplamiento indebido en el resto de los 13 eventos.

---

## 11. Domain Services

`MasteryEvaluationService` y `UnitSequenceService` están correctamente justificados bajo el criterio clásico de Evans (proceso de dominio que no pertenece naturalmente a un único objeto). No se detecta Service Explosion (solo dos servicios, ambos con justificación de coordinación cruzada real). No se detecta Feature Envy de estos servicios hacia los agregados.

Se detecta, sin embargo, un riesgo relacionado de modelo anémico derivado del uso extensivo de Policies (ver Sección 12 de esta auditoría, H-02) — no atribuible a los Domain Services en sí, sino al patrón general de delegación del modelo.

---

## 12. Policies

Las siete Policies están individualmente bien justificadas (una regla, un agregado protegido, trazabilidad a una resolución). Se detecta un riesgo de diseño en su conjunto:

**Hallazgo H-02 (severidad ALTA)**

## Hallazgo
El modelo delega la práctica totalidad de las decisiones de transición de estado de `AcademyUnit`/`Attempt` (desbloqueo, dominio, finalización, revisión, anulación docente) a siete objetos `Policy` externos, en lugar de expresarlas como comportamiento propio invocado desde dentro del Aggregate. El patrón Policy es legítimo en DDD para reglas complejas o reutilizables, pero la Sección 3 describe a `AcademyUnit` como quien "decide... vía `UnlockPolicy`"/"vía `MasteryPolicy`", lo cual, sin una aclaración explícita de que es el propio Aggregate quien invoca y aplica el resultado de la Policy sobre sí mismo, introduce riesgo real de Anemic Domain Model (el Aggregate se limita a exponer estado y delegar toda decisión a colaboradores externos, en lugar de encapsular comportamiento) — riesgo de violación de Tell-Don't-Ask.

## Severidad
ALTA

## Impacto
Sección 3 (AR-1, AR-2), Sección 13 (siete Policies).

## Principio DDD involucrado
Rich Domain Model / Tell-Don't-Ask (Evans, Vernon): el comportamiento debe vivir dentro del Aggregate que protege el dato; las Policies deben ser colaboradores consultados por el Aggregate, no sustitutos de su comportamiento.

## Evidencia
Sección 3 ("decide si el desbloqueo... procede (A-03, vía `UnlockPolicy`)"; "decide si `MASTERED` procede (A-07, vía `MasteryPolicy`)") y Sección 13 (siete Policies listadas sin aclarar explícitamente quién las invoca).

## Corrección mínima
Aclarar en el Domain Layer de detalle (Sprint 4.3) que cada Policy es invocada desde un método de comportamiento del propio Aggregate (p. ej. `AcademyUnit.evaluateUnlock(policy)`), de forma que el Aggregate siga siendo quien decide y muta su propio estado, y la Policy solo aporte el criterio de evaluación. Es una precisión de responsabilidad, no un cambio de regla de negocio ni de ninguna resolución.

---

También se observa, sin ameritar hallazgo formal por su severidad marginal: `RepetitionPolicy` documenta mayormente ausencia de efectos ("no revierte, no reemite, no revoca") más que una decisión activa — es una Policy legítima pero de contenido mayormente negativo/declarativo; no requiere corrección.

---

## 13. Specifications

**Hallazgo H-09 (severidad BAJA)**

## Hallazgo
Las tres Specifications (`EligibleForUnlockSpecification`, `MasteryEligibleSpecification`, `RepeatableSpecification`) se justifican por su reutilización en "listar" casos de consulta, pero el documento no cita ningún consumidor concreto de esa forma consultable más allá de la validación puntual ya cubierta por su Policy homóloga. El propio documento reconoce la superposición ("el mismo predicado que su Policy correspondiente") sin evidenciar el valor diferencial añadido.

## Severidad
BAJA

## Impacto
Sección 14.

## Principio DDD involucrado
El patrón Specification aporta valor cuando existe una necesidad real de composición/consulta reutilizable ya identificada (Evans); introducirlo sin consumidor concreto documentado es complejidad anticipada, no una violación de principios.

## Evidencia
Sección 14, nota final ("Relación con las Policies: cada Specification expresa... el mismo predicado que su Policy correspondiente").

## Corrección mínima
Ninguna obligatoria — mantener si Sprint 4.2 (Implementability Audit) confirma un consumidor de consulta real; en caso contrario, podrían fusionarse con sus Policies homólogas sin pérdida funcional.

---

## 14. Factories

`AcademyUnitFactory` y `AttemptFactory` están bien justificadas (encapsulan invariantes de creación no triviales). La decisión explícita de NO crear una Factory para `ModelExample` ("evitando sobre-ingeniería") es correcta y proporcional — no se fuerza el patrón donde no aporta valor. Sin hallazgos en esta sección.

---

## 15. Relaciones entre agregados

Todas las referencias cruzadas son por identidad, sin composición ni referencias embebidas — correcto. La tensión entre esta sección y la Invariante 12 ya fue reportada como H-01; no se cuenta dos veces aquí.

---

## 16. Domain Integrity

No se detecta God Aggregate (los tres agregados están correctamente acotados en tamaño y responsabilidad, salvo el riesgo de colección ilimitada ya reportado en H-06, que es un riesgo de crecimiento, no evidencia de que el agregado ya sea excesivo). No se detecta Inappropriate Intimacy entre agregados (las referencias son por identidad, sin acceso a estado interno ajeno). No se detecta violación del Law of Demeter dentro del propio documento (no hay navegación encadenada entre agregados descrita). El riesgo de Tell-Don't-Ask ya fue reportado como H-02. No se detecta Primitive Obsession: los conceptos que lo ameritan (`StudentId`, `VersionNumber`, `WordCountRange`, etc.) ya están modelados como Value Objects explícitos. No se detecta Shotgun Surgery previsible: los tres agregados tienen responsabilidades suficientemente cohesivas como para que un cambio de regla futuro (dentro del alcance ya aprobado) probablemente afecte a un único agregado.

---

## 17. Event Driven

Las garantías de "exactamente una vez" (RN-9, RN-10) están correctamente expresadas como reglas de dominio. La idempotencia de entrega, el orden de entrega y la posible pérdida de eventos son, correctamente, responsabilidad de Infrastructure/Event Bus — fuera del alcance de un documento de Domain Layer, y el documento no invade ese territorio (no problema). El orden causal de los eventos dentro de un mismo Intento (`ProductionSubmitted → FeedbackRequested → FeedbackDelivered → RevisionStarted → ... → ReflectionCompleted → UnitCompleted`) es consistente con la máquina de estados de la Sección 9, salvo la ambigüedad ya reportada en H-03.

---

## 18. CQRS Readiness

El modelo es apto para servir de base a Commands (una operación por transición documentada en la Sección 9), Queries (los Value Objects/Enums exponen datos de lectura sin acoplarse a comportamiento de escritura) y Projections (los Domain Events de la Sección 10 son suficientes para construir modelos de lectura en Dashboard/Gamificación sin exponer los agregados internos). La consistencia eventual entre `AcademyUnit` y `Attempt`, señalada como debilidad DDD estricta en H-01, es simultáneamente una fortaleza natural para un diseño Event-Driven/CQRS (los eventos que sincronizan ambos agregados son exactamente los que alimentarían los Event Handlers/Projections de un Sprint de Application Layer). No se detecta ningún obstáculo estructural para CQRS.

---

## Evaluación General

**BUENO**

---

## Calidad DDD (0-100)

**80 / 100**

Justificación breve: tres Aggregate Roots correctamente delimitados y justificados, Lenguaje Ubicuo mayormente consistente, máquina de estados completa y trazable a A-07, Domain Events y Policies con ownership correcto en su gran mayoría. Los tres hallazgos ALTA (H-01, H-02, H-03) son reales y deben cerrarse antes de Sprint 4.3, pero ninguno exige rediseñar agregados, fusionar/dividir el modelo, ni tocar A-01 a A-10 — todas las correcciones mínimas son de clasificación, redacción o precisión de responsabilidad.

---

## Tabla resumen

| ID | Hallazgo | Severidad | Principio DDD | Requiere cambio |
|---|---|---|---|---|
| H-01 | Invariante 12 exige consistencia estricta entre dos agregados con consistencia eventual declarada | ALTA | Límite de consistencia del Aggregate | Sí — reclasificar como regla de consistencia eventual |
| H-02 | Delegación total de decisiones a Policies externas — riesgo de Anemic Domain Model | ALTA | Rich Domain Model / Tell-Don't-Ask | Sí — precisar que el Aggregate invoca y aplica la Policy sobre sí mismo |
| H-03 | Fila "COMPLETED → IN_PROGRESS" ambigua/contradictoria en la tabla de transiciones | ALTA | Especificación formal no ambigua de la máquina de estados | Sí — eliminar la fila, reubicar como nota |
| H-04 | Ownership de `ModelExample` contradictorio entre Sección 1 y Sección 3 | MEDIA | Límites del Bounded Context | Sí — aclarar una única frase |
| H-05 | Colisión del valor `MASTERED` entre `UnitState` y `MasteryLevel` | MEDIA | Lenguaje Ubicuo | Sí — renombrar el valor de `MasteryLevel` |
| H-06 | `Attempt` puede acumular colección ilimitada de `Version`/`Feedback` | MEDIA | Diseño efectivo de agregados (Vernon) | Sí — acotar referencia a versión/feedback vigente |
| H-07 | Prioridad de `FeedbackCategory` codificada implícitamente en el orden del enum | MEDIA | Hacer explícito el conocimiento del dominio | Sí — añadir atributo de prioridad explícito |
| H-08 | `CompletionPolicy` depende de otro Bounded Context sin riesgo simétrico declarado | BAJA | Transparencia de dependencias externas | Sí — añadir línea de riesgo simétrica |
| H-09 | Valor diferencial de las Specifications no evidenciado con consumidor concreto | BAJA | Uso justificado del patrón Specification | No obligatorio |
| H-10 | `ProductionSubmitted`/`FeedbackRequested` sin consumidor diferenciado documentado | BAJA | Granularidad de Domain Events | No obligatorio |
| H-11 | `RevisionStarted`/`ReflectionStarted` sin consumidor externo declarado | BAJA | Propósito de un Domain Event | No obligatorio |

---

## Veredicto

El modelo está **apto para avanzar** directamente hacia Use Cases, Commands, Queries, Repositories, Domain Events, Prisma e Infrastructure, **condicionado a cerrar previamente los tres hallazgos de severidad ALTA (H-01, H-02, H-03)**. Ninguno de los tres requiere rediseñar el Domain Layer: son, respectivamente, una reclasificación de una invariante, una precisión de responsabilidad sobre cómo el Aggregate invoca sus Policies, y una corrección de forma en una tabla — ninguno modifica el flujo de 11 pasos, la máquina de estados aprobada, ni ninguna resolución A-01 a A-10. Los ocho hallazgos MEDIA/BAJA restantes son mejoras de precisión documental, no bloqueantes: el modelo puede proceder a Sprint 4.2 (Implementability Audit) sin esperar a resolverlos, aunque se recomienda cerrarlos en el mismo ciclo que H-01 a H-03 por eficiencia.
