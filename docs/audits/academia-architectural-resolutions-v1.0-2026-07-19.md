# Resoluciones Arquitectónicas — Academia v1.0

**Base única:** `docs/audits/academia-functional-audit-2026-07-19.md` (Sprint 4.0.1). **Fecha:** 2026-07-19. **Carácter:** vinculante para todos los sprints siguientes del módulo Academia, a partir de este documento.

---

## Resolución A-01 — Relación entre "Conoce el DELF" y "Academia"

**Problema**
§6.4 y 18.6 no delimitan de forma operable el contenido de "Academia DELF B2" frente a "Conoce el DELF / Introducción al DELF B2".

**Decisión**
Conoce el DELF y Academia son dos ecosistemas independientes, sin relación de contención entre sí. Conoce el DELF es propietario exclusivo de todo el contenido teórico sobre el examen: estructura de la prueba, criterios oficiales de evaluación, rúbricas, estrategias, gestión del tiempo, errores frecuentes y consejos del examinador. Academia es propietaria exclusiva de la práctica guiada de producción escrita por tipo de texto (`LETTER, ARTICLE, ESSAY, EMAIL, REPORT`), estructurada en unidades secuenciales. Todo el contenido descrito en §6.4 bajo el rótulo "Academia DELF B2" pasa a pertenecer a Conoce el DELF; "Academia" designa en adelante, de forma exclusiva, lo que el corpus llamaba "Academia de Escritura". Navegación: dos espacios independientes y hermanos en el menú principal de 9 espacios (§8.3: "Introducción al DELF B2" y "Academia" ya aparecen como entradas separadas). Ninguna unidad de Academia depende de haber completado contenido de Conoce el DELF como precondición de acceso.

**Justificación**
18.6 ya declara "Conoce el DELF" como sustituto nominal de "Academia DELF B2 (parte teórica)" dentro de su propia tabla de nomenclatura oficial; esta resolución únicamente traslada esa sustitución de nombre a una separación de propiedad de contenido, eliminando la superposición.

**Consecuencias**
Ninguna entidad de dominio de Academia modela contenido teórico del examen. El catálogo de criterios/rúbricas/estrategias pertenece al dominio de Conoce el DELF, fuera del alcance del Sprint 4.1 de Academia.

**Impacto sobre otros módulos**
Conoce el DELF queda formalmente reconocido como ecosistema con contenido propio pendiente de especificación en un sprint dedicado (ruta ya reservada: `about-delf`, 18.19). Sin impacto sobre Mi Plan, Dashboard o Coach IA.

**Estado**
APROBADA

---

## Resolución A-02 — Flujo oficial de una unidad de Academia

**Problema**
Existen tres secuencias de pasos no reconciliadas (Doc 3: 10 pasos; Doc 8: 11 pasos; Doc 4/§7.2: 9 etapas genéricas).

**Decisión**
La secuencia oficial y única de una unidad de Academia es la de 11 pasos de Doc 8: Contextualizar → Definir objetivos → Comprender → Observar → Analizar → Practicar → Producir → Recibir retroalimentación → Reescribir → Reflexionar → Desbloquear. Ninguna unidad omite pasos ni altera el orden. Las secuencias de Doc 3 y Doc 4 quedan derogadas como especificación operativa de flujo; se conservan únicamente como registro histórico.

**Justificación**
Doc 8 es la fuente más granular y la única que declara explícitamente carácter obligatorio ("todas las unidades del entrenador deberán seguir exactamente el siguiente recorrido"), con el mismo criterio ya aplicado en 18.13 (UX Experience prevalece sobre Wireframe por mayor detalle). La secuencia de Doc 3 (10 pasos) es una descripción de producto de nivel superior sobre el mismo recorrido, no una especificación de UX competidora; sus pasos se absorben dentro de los 11 oficiales (p. ej. "Presentación"/"Objetivos"/"Estructura" de Doc 3 corresponden a "Contextualizar"/"Definir objetivos" de Doc 8; "Actividades IA"/"Mini evaluación"/"Retroalimentación" corresponden a "Producir"/"Recibir retroalimentación"). El ciclo de 9 etapas de Doc 4 es el principio pedagógico transversal aplicable a todo el "entrenador" (no exclusivo de Academia); sus 7 primeras etapas (Comprender, Observar, Analizar, Practicar, Recibir retroalimentación, Reescribir, Reflexionar) están íntegramente contenidas en los 11 pasos oficiales; sus dos etapas finales ("Entrenar nuevamente", "Dominar") no son pasos de una unidad individual sino comportamiento entre unidades, resuelto en A-07 y A-09.

**Consecuencias**
Se declara oficialmente: esta es la única máquina de procesos válida del proyecto para una unidad de Academia. Cualquier pantalla, componente o Handler futuro de Academia debe modelar exactamente estos 11 pasos, en este orden.

**Impacto sobre otros módulos**
Ninguno directo. Coach IA y Feedback Engine ya operan sobre los pasos 3 ("Comprender", gate de comprensión) y 8 ("Recibir retroalimentación") de esta secuencia sin cambio de contrato.

**Estado**
APROBADA

---

## Resolución A-03 — Condición de desbloqueo de la siguiente unidad

**Problema**
Ninguna fuente especifica el criterio de activación del paso 11 ("Desbloquear").

**Decisión**
La siguiente unidad se desbloquea exclusivamente cuando la unidad actual alcanza el paso 11 (Desbloquear) de la secuencia oficial (A-02), es decir, cuando el estudiante completa los 11 pasos en orden, incluyendo al menos un ciclo de reescritura (paso 9). No existe umbral mínimo de puntuación para desbloquear. No existen excepciones automáticas: el desbloqueo nunca ocurre por inactividad, por tiempo transcurrido, ni por decisión del Motor Pedagógico (que solo prioriza contenido ya desbloqueado, nunca desbloquea contenido nuevo). La única excepción es el override manual del Profesor (A-10).

**Justificación**
El corpus es consistente y reiterativo en que el error no es criterio de bloqueo ("el dominio no se medirá por la ausencia absoluta de errores", §7.2; "el error no define al estudiante", §8.6) y en que la evaluación dentro de Academia es formativa, no clasificatoria (A-05). Exigir un umbral de puntuación contradiría ambos principios.

**Consecuencias**
El desbloqueo es una función pura de finalización de secuencia, no de desempeño. No existen casos ambiguos: una unidad está o no en paso 11 completado.

**Impacto sobre otros módulos**
Ninguno. Es un comportamiento interno de Academia.

**Estado**
APROBADA

---

## Resolución A-04 — Biblioteca de Modelos vs. Biblioteca Temática

**Problema**
§6.5 (Biblioteca de Modelos) y §6.6 (Biblioteca temática, parte de Laboratorio) describen catálogos de texto potencialmente superpuestos sin propietario declarado.

**Decisión**
Son dos recursos distintos, con propietarios distintos. Biblioteca de Modelos pertenece a Academia: contiene producciones completas (modelos excelentes y con errores) con análisis comparativo de la IA sobre por qué unas puntúan mejor que otras; se consume dentro de los pasos 4-5 (Observar, Analizar) de la secuencia oficial de unidad (A-02). Biblioteca temática pertenece a Laboratorio: contiene textos auténticos clasificados por tema DELF, sin análisis comparativo de puntuación; se consume dentro del espacio "Exploración" de Laboratorio. Ninguna de las dos es propiedad compartida ni recurso único fusionado.

**Justificación**
§6.6 asigna "Biblioteca temática" a Laboratorio de forma explícita y estructural ("cuatro espacios" enumerados literalmente, con esa etiqueta). §6.5 no tiene asignación estructural equivalente en ningún ecosistema, pero su función (análisis comparativo de por qué una producción puntúa mejor que otra) coincide exactamente con el propósito de los pasos "Observar"/"Analizar" de Academia (A-02) y con la fórmula "aprendizaje basado en errores" (§7.6) propia del ciclo de Academia, no del espacio de exploración libre de Laboratorio.

**Consecuencias**
Cada ecosistema modela y mantiene su propio catálogo. No existe redirección cruzada de contenido entre ambos catálogos.

**Impacto sobre otros módulos**
18.16 (almacenamiento) ya agrupó "recursos de la Academia y Biblioteca de Modelos" — esta resolución confirma esa agrupación como correcta y la extiende formalmente al ámbito funcional.

**Estado**
APROBADA

---

## Resolución A-05 — Marco de evaluación utilizado por Academia

**Problema**
No estaba confirmado si Academia usa el marco formativo de 10 categorías o la rúbrica oficial DELF de 5+1 criterios.

**Decisión**
Academia utiliza exclusivamente la evaluación formativa de 10 categorías del Coach IA (§9.5): Comprensión, Intención comunicativa, Estructura, Coherencia, Cohesión, Argumentación, Registro, Vocabulario, Gramática, Ortografía, con orden jerárquico macro→micro. La rúbrica oficial DELF de 5+1 criterios (`RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe, RichesseLinguistique`) queda excluida de Academia sin excepción; su uso permanece reservado a Simulador y Evaluación Final. Ninguna pantalla de Academia muestra puntuación sobre 25 puntos ni indicadores ligados a certificación.

**Justificación**
18.12 ya fija que la rúbrica oficial "se usa exclusivamente para la puntuación oficial de simulacros y evaluación final" y que el marco de 10 categorías "sigue usando... durante todo el ciclo de aprendizaje" — Academia es, por definición, parte del ciclo de aprendizaje, no de la evaluación sumativa.

**Consecuencias**
Toda retroalimentación/mini evaluación dentro de una unidad se expresa en términos de las 10 categorías, nunca en puntuación numérica de certificación.

**Impacto sobre otros módulos**
Ninguno sobre Simulador/Evaluación Final, que conservan su rúbrica sin cambios.

**Estado**
APROBADA

---

## Resolución A-06 — Mecanismo "Continúa donde te quedaste"

**Problema**
La función de continuidad estaba prometida a nivel de producto (§6.3) sin mecanismo funcional definido para Academia.

**Decisión**
El sistema guarda, para cada unidad en curso de un estudiante: la unidad activa, el paso actual dentro de la secuencia oficial (A-02), y el contenido del borrador en progreso si el estudiante se encuentra en los pasos 7 o 9 (Producir/Reescribir). El guardado ocurre en dos momentos: automáticamente al completar cada paso (transición de estado, A-07), y de forma continua mientras el estudiante escribe dentro de los pasos 7/9 (autoguardado periódico del borrador, consistente con el campo ya documentado `WritingDraft.autosaved_at`, §13.5). Al volver a entrar, el sistema restaura exactamente el paso y el contenido del borrador guardado — el estudiante nunca reinicia una unidad en curso desde el paso 1. El acceso se realiza en un único clic desde el bloque "Continúa donde te quedaste" del Dashboard (§6.3) o directamente desde el mapa de unidades de Academia. Si el estudiante abandona una unidad sin completarla, la unidad permanece indefinidamente en el estado en el que quedó (no existe expiración, reinicio automático ni penalización por inactividad).

**Justificación**
El campo `autosaved_at` de `WritingDraft` ya documentado en §13.5 es evidencia directa de que el autoguardado de borrador es un comportamiento ya previsto por el proyecto; esta resolución solo lo declara explícitamente aplicable a Academia y fija el resto del mecanismo por consistencia con la regla de continuidad ya vinculante (§6.3: "nunca abandonará la plataforma sin conocer cuál es la actividad que le permitirá continuar avanzando").

**Consecuencias**
Ninguna unidad iniciada puede perderse por abandono. El estado "en curso" es persistente sin límite de tiempo.

**Impacto sobre otros módulos**
Dashboard consume este estado sin cambios en su contrato ya documentado (bloque 4).

**Estado**
APROBADA

---

## Resolución A-07 — Máquina de estados oficial de una Unidad de Academia

**Problema**
No existía una máquina de estados única para una unidad de Academia.

**Decisión**
Se declara la siguiente máquina de estados como la única válida del proyecto para una Unidad de Academia:

```
LOCKED
  ↓ (la unidad anterior de la misma progresión alcanza COMPLETED — A-03)
UNLOCKED
  ↓ (el estudiante entra a la unidad, paso 1)
IN_PROGRESS
  ↓ (pasos 1-7 completados; envío de la producción al paso 8)
AWAITING_FEEDBACK
  ↓ (retroalimentación entregada, paso 9)
REVISION
  ↺ (el estudiante puede volver a AWAITING_FEEDBACK tantas veces como reescriba; mínimo un ciclo REVISION obligatorio antes de continuar — "la primera versión nunca representa el producto final", §7.2)
  ↓ (paso 10)
REFLECTION
  ↓ (paso 11 ejecutado)
COMPLETED
  ↓ (evidencia sostenida de dominio en encuentros posteriores — ver criterio abajo)
MASTERED
```

`MASTERED` no es una transición secuencial directa desde `COMPLETED`: se activa cuando, tras alcanzar `COMPLETED`, el estudiante demuestra desempeño sin debilidades `HIGH`/`CRITICAL` (§13.8, `Weakness`) en las competencias asociadas al tipo de texto de la unidad, tanto en el cierre de esa unidad como en al menos un encuentro posterior independiente con el mismo tipo de texto (repetición de la unidad —A-09—, Centro de Entrenamiento o Laboratorio) sin nueva intervención de andamiaje del Coach IA. `LOCKED` y `UNLOCKED` son mutuamente excluyentes y cubren toda unidad no iniciada; `IN_PROGRESS`, `AWAITING_FEEDBACK`, `REVISION`, `REFLECTION` cubren toda unidad activa; `COMPLETED` y `MASTERED` son los únicos estados terminales, y `MASTERED` nunca revierte a un estado anterior.

**Justificación**
Los ocho estados cubren exactamente los 11 pasos de la secuencia oficial (A-02) sin solapamiento ni vacío, y añaden únicamente dos estados no cubiertos por la secuencia de pasos pero exigidos por el propio corpus: `MASTERED`, que corresponde a la etapa "Dominar" del ciclo genérico (§7.2, §7.5), definida aquí con un criterio verificable y objetivo (ausencia de debilidad crítica sostenida en dos encuentros) en vez de dejarla como aspiración descriptiva sin condición operable.

**Consecuencias**
Todo Handler/componente de Academia debe implementar exactamente estos 8 estados, sin estados intermedios adicionales.

**Impacto sobre otros módulos**
Gamificación y Mi Plan consumen únicamente la transición a `COMPLETED` (ver A-08); `MASTERED` es un estado interno de Academia/Competencias, no notificado a Mi Plan (ver A-08).

**Estado**
APROBADA

---

## Resolución A-08 — Emisión del evento `EXTERNAL_ACTIVITY_COMPLETED`

**Problema**
No estaba definido cuándo, cuántas veces y bajo qué condición Academia emite este evento.

**Decisión**
Academia dispara `EXTERNAL_ACTIVITY_COMPLETED` exactamente una vez por unidad: en el instante en que la unidad transiciona a `COMPLETED` (A-07). El emisor es la propia unidad de Academia (nunca un paso intermedio). Condición: el evento solo se emite si existe una `LearningTask` de Mi Plan con `source = ACADEMY` vinculada a esa unidad; si el estudiante completó la unidad de forma autodirigida, sin tarea de Mi Plan asociada, no se emite ningún evento. La transición posterior a `MASTERED` nunca vuelve a emitir este evento ni ningún evento equivalente hacia Mi Plan. Repetir una unidad ya completada (A-09) tampoco reemite el evento.

**Justificación**
El contrato ya aprobado del lado de Mi Plan exige exactamente un disparo por finalización de tarea externa y prohíbe que un ecosistema escriba directamente en sus tablas; emitir el evento sin `LearningTask` asociada no tendría receptor válido. `COMPLETED` es el único punto de la máquina de estados (A-07) que representa "finalización de la actividad" en el sentido que Mi Plan necesita; `MASTERED` es una señal de competencia, no de finalización de tarea.

**Consecuencias**
Un único punto de disparo, sin ambigüedad de granularidad.

**Impacto sobre otros módulos**
Mi Plan recibe como máximo un evento por unidad y por estudiante; ningún riesgo de duplicidad de actualización de `LearningTask.status`.

**Estado**
APROBADA

---

## Resolución A-09 — Reglas de repetición de una unidad

**Problema**
No estaba definido si una unidad completada puede repetirse, cuántas veces, ni qué ocurre con el progreso y las versiones previas.

**Decisión**
Una unidad en estado `COMPLETED` o `MASTERED` puede repetirse voluntariamente por el estudiante, sin límite de veces. Repetir no revierte el estado `COMPLETED`/`MASTERED` de la unidad ni desbloquea/bloquea ninguna otra unidad de forma distinta a como ya ocurrió en el primer intento. Repetir no reemite `EXTERNAL_ACTIVITY_COMPLETED` (A-08) ni revoca recompensas de Gamificación ya otorgadas por la primera finalización. Cada repetición genera una `WritingSubmission` nueva e independiente, recorriendo de nuevo la secuencia oficial completa (A-02) desde el paso 1; las versiones (`WritingVersion`) de intentos anteriores se conservan sin modificación y quedan visibles en el historial del estudiante (`WritingHistory`, Evolución/Perfil, §6.11).

**Justificación**
La regla ya vigente en §13.5 ("no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión") se extiende de forma directa y sin contradicción a nivel de intento completo: repetir es generar una nueva `WritingSubmission`, no alterar la anterior. La ausencia de límite es consistente con el principio de práctica deliberada y recuperación activa (§7.3) como mecanismo central de aprendizaje del proyecto.

**Consecuencias**
El historial de intentos de una unidad es acumulativo, nunca destructivo.

**Impacto sobre otros módulos**
Mi Plan y Gamificación no reciben ninguna señal adicional por repeticiones (ver A-08). Competencias/Learning Analytics (§13.8) sí registran cada `CompetencyAssessment` de cada repetición, alimentando el criterio de `MASTERED` (A-07).

**Estado**
APROBADA

---

## Resolución A-10 — Comportamiento del Profesor respecto a Academia

**Problema**
§6.14 describe el rol del Profesor de forma genérica, sin nivel de detalle operable para Academia.

**Decisión**
El Profesor puede: (1) asignar unidades específicas de Academia a un estudiante o a un grupo completo, además de la asignación genérica de actividades ya prevista; (2) revisar toda producción (`WritingSubmission`) generada en Academia por sus estudiantes, incluyendo el historial completo de versiones y la retroalimentación recibida; (3) bloquear manualmente (forzar `LOCKED`, A-07) una unidad ya desbloqueada automáticamente para un estudiante o grupo específico, como excepción al desbloqueo automático de A-03; (4) reiniciar una unidad para un estudiante, autorizando una repetición supervisada bajo las mismas reglas de A-09; (5) observar el progreso agregado de Academia por estudiante o grupo: unidades bloqueadas, desbloqueadas, en curso, completadas y dominadas. El Profesor no puede: editar el contenido editorial de las unidades (lecciones, actividades, rúbricas) — eso permanece exclusivo del Administrador (§6.15); ni alterar el criterio general de desbloqueo (A-03) para todos los estudiantes, solo aplicarlo/revertirlo caso por caso.

**Justificación**
§6.14 ya autoriza genéricamente "asignar tareas", "seguir el progreso", "revisar estadísticas" y "ver las producciones escritas, hacer correcciones"; esta resolución fija esas facultades genéricas al nivel de granularidad de unidad de Academia, sin ampliar el alcance ya aprobado hacia terreno reservado al Administrador (§6.15).

**Consecuencias**
El override del Profesor (bloqueo/reinicio manual) es la única excepción reconocida a las reglas automáticas de A-03 y A-09.

**Impacto sobre otros módulos**
Espacio del Profesor (§6.14) queda con una interfaz de control sobre Academia completamente especificada para su futuro sprint de implementación.

**Estado**
APROBADA

---

**Cierre.** Con las diez resoluciones anteriores, la especificación funcional de Academia queda completamente determinada: identidad y límites frente a Conoce el DELF (A-01), flujo único de unidad (A-02), condición de desbloqueo (A-03), propiedad de las bibliotecas (A-04), marco de evaluación (A-05), mecanismo de continuidad (A-06), máquina de estados (A-07), contrato de integración con Mi Plan (A-08), reglas de repetición (A-09) y facultades del Profesor (A-10). No queda ninguna decisión funcional pendiente. El Sprint 4.1 (Modelo de Dominio) puede iniciar sin necesidad de nuevas decisiones funcionales.
