# Auditoría funcional del módulo "Academia" — Sprint 4.0.1

**Rol:** Arquitecto de Software Senior / Product Architect / Auditor Funcional. **Fecha:** 2026-07-19.
**Fuentes autorizadas:** `02_Conocimiento_Consolidado_Resuelto.md` (§4.1–4.6, §5.4, §5.7, §6.3–6.9, §6.11, §6.13–6.16, §7.1–7.7, §8.1–8.11, §9.1–9.7, §10.1–10.3, §11.4, §12.2–12.6, §13.4–13.8, §17.2, §17.8, §18.6, §18.12, §18.16–18.19, §18.20–18.21), `ARCHITECTURE.md`, `docs/modules/dashboard.md`, `docs/modules/mi-plan.md`, `features/academy/README.md`, `features/laboratory/README.md`.
**Alcance:** exclusivamente comportamiento funcional. No se auditó arquitectura técnica, Domain Layer, CQRS, Clean Architecture, Prisma, base de datos, APIs, RLS, permisos técnicos ni código existente (todo eso corresponde a auditorías posteriores, como ya ocurrió con Mi Plan: `mi-plan-implementability-audit-2026-07-17.md`). Ningún archivo existente fue modificado. No se resolvió ninguna contradicción ni se emitió ninguna resolución.

---

## 1. Objetivo del módulo

**Propósito pedagógico declarado:** *"Enseñar los fundamentos necesarios antes de escribir."* *"Este módulo sería la parte 'teórica' de tu antigua cartilla"* (§6.4, Doc 1).

**Propósito funcional declarado:** cubrir, antes de la práctica libre en Laboratorio, cómo funciona la producción escrita del DELF B2, los criterios oficiales de evaluación, los tipos de texto, la organización textual, el registro, los conectores, la gramática clave, el léxico y las estrategias para el examen (§6.4, Doc 1). Producto Architecture (Doc 3) lo divide en dos partes: *Academia DELF B2* (teoría del examen) y *Academia de Escritura* (práctica guiada por tipo de texto).

**Objetivos de aprendizaje:** alcanzar, al final de cada unidad, autonomía suficiente para enfrentar una nueva consigna del mismo tipo de texto sin depender constantemente del Coach IA (§7.5, aplicable a "cada módulo del entrenador" según §7.2).

**Objetivos del producto:** Academia DELF B2 es el módulo #2 de 5 en el alcance explícito del MVP (§4.1: *"1. Dashboard. 2. Academia DELF B2. 3. Laboratorio de Escritura. 4. Corrector Inteligente. 5. Simulador Oficial"*) — segunda prioridad declarada de todo el corpus, después del Dashboard.

**¿Existe una única definición coherente?** **No.** La síntesis integradora del propio documento (§8.11) describe a Academia con un alcance más amplio que "teoría antes de escribir": *"La Academia construye el conocimiento"*, en paralelo a *"el Laboratorio permite experimentar y consolidar competencias"* — es decir, Academia sí incluye construcción activa de conocimiento (coherente con su parte de "Academia de Escritura"), no solo teoría pasiva. Pero simultáneamente, la resolución vinculante 18.6 declara "Academia (de Escritura)" como ecosistema oficial **distinto** de "Conoce el DELF / Introducción al DELF B2" (que sustituye explícitamente a "Academia DELF B2 (parte teórica)"). Esto significa que el propio §6.4 —que presenta "Academia DELF B2" como el título de la sección que describe TODO el módulo, incluidas sus dos partes— queda en tensión directa con 18.6, que separa esa "parte teórica" en un ecosistema distinto. Ver Contradicción 1 (sección "Contradicciones").

---

## 2. Responsabilidades

**Pertenece a Academia (evidencia directa):**
- Contenido y práctica guiada de cada tipo de texto DELF B2 (`LETTER, ARTICLE, ESSAY, EMAIL, REPORT` — §13.5), siguiendo su secuencia interna obligatoria (ver sección 3).
- Retroalimentación formativa dentro del recorrido de una unidad (Coach IA/Feedback Engine, nunca resuelve la tarea por el estudiante — §8.5, §4.4).
- Progresión secuencial y desbloqueo de unidades (mecanismo no especificado, ver Vacíos).

**No pertenece a Academia (evidencia directa):**
- **Corrector Inteligente:** no es una responsabilidad ni entidad propia de Academia — es una capacidad transversal del Coach IA/Feedback Engine, accesible también desde Laboratorio y Simulador (§6.7; hecho vinculante por 18.6: *"'Corrector Inteligente' no se implementa como ecosistema navegable independiente"*).
- **Práctica libre sin guía:** responsabilidad exclusiva de Laboratorio (§6.6) — Academia siempre sigue una secuencia fija; Laboratorio no.
- **Evaluación sumativa/certificación oficial:** responsabilidad del módulo de Evaluación Final y del Simulador (§10.2, §6.9).
- **Decisión de qué contenido priorizar para un estudiante concreto:** responsabilidad del Motor Pedagógico Adaptativo, no de Academia (§9.7: *"La autoridad pedagógica recae en el Motor Pedagógico"* — la IA "puede explicar decisiones, nunca decidirlas").
- **Actualización de tablas de Mi Plan:** prohibido por regla general de arquitectura (§5.7: *"la Academia no modificará Mi Plan"*) — solo puede notificar vía evento.

**Relación con cada ecosistema mencionado en el brief:**

| Ecosistema | Relación con Academia | Responsabilidad duplicada/ambigua detectada |
|---|---|---|
| **Conoce el DELF** | 18.6 los declara ecosistemas oficiales distintos (#3 vs #4), pero §6.4 describe contenido idéntico bajo el título "Academia DELF B2" | **Sí — crítica.** Ver Contradicción 1. |
| **Laboratorio** | Secuencial/conceptual: Academia "construye el conocimiento", Laboratorio "permite experimentar y consolidar" (§8.11). Sin dependencia técnica ni funcional obligatoria declarada entre ambos. | Posible — ver "Biblioteca de Modelos" (§6.5) vs. "Biblioteca temática" de Laboratorio (§6.6), sección Contradicciones. |
| **Simulador** | Ambos generan producciones escritas evaluadas, pero con marcos distintos (formativo de 10 categorías en Academia/Coach IA vs. rúbrica oficial DELF de 5+1 criterios en Simulador, según 18.12) | No hay duplicación de responsabilidad, pero **sí ambigüedad**: ningún documento indica qué marco usa la "mini evaluación"/"retroalimentación" dentro de una unidad de Academia. Ver Vacío 2. |
| **Coach IA** | Mentor contextual permanente dentro de cada unidad (§8.5); nunca decide el recorrido pedagógico (§9.7) | Sin ambigüedad — rol claramente acotado (acompañar, nunca decidir ni resolver). |
| **Corrector Inteligente** | No es un ecosistema — capacidad transversal ejercida también dentro de Academia (§6.7, 18.6) | Sin ambigüedad tras 18.6, aunque la sección 6.7 del documento (anterior a 18.6) todavía la presenta como si fuera casi un módulo propio con lista de funciones — 18.6 la reduce explícitamente a capacidad transversal. |
| **Dashboard** | Solo consume, resumido, el estado de Academia (bloques 4 y 7, §6.3); nunca al revés y nunca de forma directa (§5.7) | Sin ambigüedad. |
| **Mi Plan** | Academia es únicamente fuente de eventos (`EXTERNAL_ACTIVITY_COMPLETED`, `LearningTask.source = ACADEMY` ya definido en el lado de Mi Plan) — nunca escribe directamente en sus tablas | Sin ambigüedad en la dirección de la relación, pero sí vacío en el nivel de granularidad del evento (ver Vacío 6). |
| **Motor Pedagógico** | Prioriza contenido dentro de Academia (§9.7); Academia no decide su propio orden de recomendación para un estudiante específico | Sin ambigüedad de responsabilidad, pero superpuesto con el mecanismo de desbloqueo interno de unidades, que sí parece propio de Academia (§6.4) — no está claro si el Motor Pedagógico puede alterar el orden secuencial fijo de una unidad o solo la prioridad entre unidades ya desbloqueadas. Ver Vacío 3. |

---

## 3. Flujo del estudiante

**Punto de entrada:** desde el Dashboard, bloque 7 ("Acceso a los ecosistemas") o bloque 4 ("Continúa donde te quedaste" — §6.3), o desde la navegación principal de 9 espacios (§8.3).

**Hallazgo central de esta sección: existen tres descripciones del recorrido interno de una unidad, de tres fuentes distintas, que nunca se declaran equivalentes ni se mapean entre sí.**

| Paso | **Doc 3** — Product Architecture (§6.4, párrafo 3; 10 pasos) | **Doc 8** — UX Experience / NeuroUX (§6.4, párrafo 4; 11 pasos, "obligatoria... ninguna unidad podrá omitir etapas") | **Doc 4** — Metodología Pedagógica (§7.2; 9 etapas, "el estudiante recorrerá siempre las mismas etapas cognitivas") |
|---|---|---|---|
| 1 | Presentación | Contextualizar | Comprender |
| 2 | Objetivos | Definir objetivos | Observar |
| 3 | Estructura | Comprender | Analizar |
| 4 | Elementos lingüísticos | Observar | Practicar |
| 5 | Análisis de modelos | Analizar | Recibir retroalimentación |
| 6 | Ejemplos comentados | Practicar | Reescribir |
| 7 | Actividades IA | Producir | Reflexionar |
| 8 | Mini evaluación | Recibir retroalimentación | Entrenar nuevamente |
| 9 | Retroalimentación | Reescribir | Dominar |
| 10 | Desbloquear siguiente unidad | Reflexionar | — |
| 11 | — | Desbloquear | — |

Las tres comparten núcleo conceptual (comprender/analizar antes de producir; retroalimentación antes de reescribir; cierre reflexivo) pero **ni el orden ni el número de pasos coinciden**, y ninguna fuente indica cuál prevalece ni cómo se combinan. Ver Contradicción 2.

**Estados, decisiones, bloqueos y condiciones documentados (con independencia de cuál secuencia se use):**

- **Bloqueo/gate explícito:** *"El Coach IA verificará primero la comprensión de la consigna antes de permitir que el estudiante escriba"* (§7.2) — el estudiante no puede avanzar al paso de producción sin demostrar comprensión.
- **Regla de integridad de la secuencia:** *"Ninguna actividad, interacción del Coach IA o elemento de la plataforma podrá romper este ciclo de aprendizaje"* (§7.2); *"Ninguna unidad podrá omitir etapas esenciales ni alterar el orden general del recorrido"* (§6.4, Doc 8).
- **Reescritura obligatoria:** *"La primera versión nunca representa el producto final del aprendizaje"* — cada producción es *"un borrador susceptible de mejora"* (§7.2). No se documenta un número máximo ni mínimo de ciclos de reescritura.
- **Condición de desbloqueo de la siguiente unidad:** mencionada como paso final en dos de las tres secuencias, pero **su criterio exacto no está especificado en ninguna fuente** (¿aprobar con umbral mínimo?, ¿completar todos los pasos sin importar el resultado?). Ver Vacío 1.
- **Cierre de sesión (§8.9, aplicable al completar una unidad):** 1) resumen del aprendizaje, 2) evidencias de progreso, 3) reflexión metacognitiva, 4) próximo paso (recomendación del Dashboard), 5) despedida del Coach IA. *"El estudiante nunca abandonará la plataforma sin conocer cuál es la actividad que le permitirá continuar avanzando."*
- **Regla de continuidad (§6.3):** *"Al finalizar cualquier actividad, la plataforma no regresará automáticamente al menú principal. En su lugar, ofrecerá una transición natural hacia la siguiente etapa del recorrido."*
- **Adaptación decreciente de apoyo (§8.10, "andamiaje progresivo"):** "ayuda intensa al inicio, cada vez más discreta" — implica que el sistema debe reconocer en qué punto de dominio está el estudiante para una unidad/tipo de texto, pero no se documenta el mecanismo de medición.

---

## 4. Casos de uso

### CU1 — Iniciar una unidad de Academia de Escritura
- **Actor:** Estudiante.
- **Objetivo:** comenzar el recorrido guiado de un tipo de texto DELF B2.
- **Precondiciones:** unidad desbloqueada (criterio no documentado, ver Vacío 1); sesión autenticada.
- **Flujo principal:** el estudiante selecciona un tipo de texto desbloqueado → el sistema presenta el primer paso de la secuencia (Contextualizar/Presentación, según la fuente) → el estudiante avanza paso a paso sin poder omitir ni reordenar etapas.
- **Flujos alternativos:** si el estudiante abandona a mitad de la unidad, el Dashboard debe permitir continuidad exacta ("Continúa donde te quedaste", §6.3) — mecanismo de persistencia de progreso intra-unidad no documentado (ver Vacío 5).
- **Postcondiciones:** la unidad queda en estado "en progreso" (nomenclatura de estado no documentada para Academia).

### CU2 — Consultar contenido teórico del examen
- **Actor:** Estudiante.
- **Objetivo:** comprender estructura del examen, criterios oficiales, estrategias.
- **Precondiciones:** ninguna condición de desbloqueo documentada explícitamente para esta parte (a diferencia de las unidades de práctica).
- **Flujo principal:** el estudiante accede al contenido teórico (bajo el nombre "Academia DELF B2" según §6.4, o "Conoce el DELF"/"Introducción al DELF B2" según 18.6 — ver Contradicción 1) → consulta estructura de la prueba, criterios, rúbricas, gestión del tiempo, errores frecuentes, consejos del examinador.
- **Flujos alternativos:** ninguno documentado.
- **Postcondiciones:** ninguna transición de estado documentada (a diferencia de las unidades de práctica, que sí desbloquean progresión).

### CU3 — Recibir retroalimentación tras producir un texto (dentro de una unidad)
- **Actor:** Estudiante + Coach IA/Feedback Engine.
- **Objetivo:** obtener retroalimentación formativa sobre la producción del paso "Producir"/"Ejemplos comentados"/equivalente (según la secuencia).
- **Precondiciones:** el estudiante debe haber completado el paso de producción; el sistema debe haber construido el contexto pedagógico (perfil, historial, memoria del Coach — §9.4).
- **Flujo principal:** el sistema envía la producción al Feedback Engine (vía AI Orchestrator, nunca directamente a un proveedor de IA) → se aplica la jerarquía de corrección de 10 categorías, macro antes que micro, *"nunca comienza por la gramática"* (§9.5) → se entrega retroalimentación con tono no punitivo (*"Claude evitará utilizar expresiones categóricas como 'incorrecto', 'fallaste'..."*, §8.6) → secuencia del Coach: reconoce esfuerzo → explica el aspecto a mejorar → ofrece explicación adaptada → propone acción concreta.
- **Flujos alternativos:** no documentado si existe un límite de intentos de retroalimentación por producción.
- **Postcondiciones:** el estudiante puede avanzar al paso de reescritura; la memoria pedagógica del Coach se actualiza (§9.4).

### CU4 — Reescribir tras la retroalimentación
- **Actor:** Estudiante.
- **Objetivo:** mejorar la producción aplicando la retroalimentación recibida.
- **Precondiciones:** retroalimentación ya entregada (CU3 completado).
- **Flujo principal:** el estudiante reescribe su producción; la versión anterior se conserva (regla general de Producción Escrita, §13.5: no se sobrescribe, cada cambio genera una versión nueva — nota: esta regla proviene del modelo de datos de §13.5, citada aquí únicamente como evidencia de comportamiento funcional esperado, sin auditar el modelo técnico).
- **Flujos alternativos:** no documentado si el sistema exige un número mínimo de ciclos de reescritura antes de permitir avanzar al paso de reflexión.
- **Postcondiciones:** el estudiante avanza al paso de reflexión.

### CU5 — Reflexionar y cerrar la unidad
- **Actor:** Estudiante.
- **Objetivo:** consolidar metacognición y cerrar el ciclo de la unidad.
- **Precondiciones:** reescritura completada (CU4).
- **Flujo principal:** el sistema presenta preguntas metacognitivas (§7.2: ¿qué aprendí?, ¿qué fue lo más difícil?, ¿qué estrategia funcionó?, ¿qué debo practicar de nuevo?) → cierre de sesión de 5 pasos (§8.9) → intento de desbloqueo de la siguiente unidad.
- **Flujos alternativos:** ninguno documentado.
- **Postcondiciones:** unidad marcada como completada (nomenclatura de estado no documentada); posible emisión de evento de finalización hacia Mi Plan/Gamificación (ver sección 7 y CU9).

### CU6 — El Motor Pedagógico prioriza contenido dentro de Academia
- **Actor:** Motor Pedagógico Adaptativo (no humano).
- **Objetivo:** priorizar unidades relacionadas con competencias débiles del estudiante.
- **Precondiciones:** existencia de indicadores de competencia (Learning Analytics, §13.8) por debajo de un umbral.
- **Flujo principal:** regla "si-entonces" (§9.7): si una competencia está bajo el umbral → priorizar actividades relacionadas dentro de Academia (y Laboratorio, Centro de Entrenamiento).
- **Flujos alternativos:** si hay dominio sostenido → aumentar gradualmente la dificultad (§9.7).
- **Postcondiciones:** el mapa de unidades visible para el estudiante refleja la nueva priorización — mecanismo exacto de cómo se refleja no documentado.

### CU7 — Profesor asigna/revisa actividad de Academia
- **Actor:** Profesor.
- **Objetivo:** asignar contenido o revisar el progreso de un estudiante/grupo en Academia.
- **Precondiciones:** no documentadas con precisión.
- **Flujo principal:** §6.14 solo declara, de forma genérica para todo el espacio del profesor, "asignar tareas"/"asignar actividades" y "ver las producciones escritas, hacer correcciones" — sin especificar si esto opera a nivel de unidad de Academia concreta.
- **Flujos alternativos:** no documentados.
- **Postcondiciones:** no documentadas. **Caso de uso incompleto por falta de especificación — ver Vacío 4.**

### CU8 — Administrador edita contenido editorial de Academia
- **Actor:** Administrador.
- **Objetivo:** mantener actualizado el contenido de Academia sin intervención de desarrollo.
- **Precondiciones:** acceso al Panel Administrativo.
- **Flujo principal:** §6.15: *"editar lecciones, actividades, ejemplos, recursos, rúbricas, insignias — sin necesidad de modificar el código."*
- **Flujos alternativos:** no documentados.
- **Postcondiciones:** contenido actualizado, disponible para estudiantes en su próxima visita a Academia.

### CU9 — Notificar finalización de actividad a Mi Plan
- **Actor:** Academia (emisor) → Mi Plan (consumidor).
- **Objetivo:** mantener sincronizado el progreso del plan de estudio cuando una tarea de Mi Plan está vinculada a una actividad de Academia (`LearningTask.source = ACADEMY`).
- **Precondiciones:** existe una `LearningTask` de Mi Plan con `source = ACADEMY` vinculada a la actividad completada (contrato ya definido desde el lado de Mi Plan, `docs/modules/mi-plan.md`).
- **Flujo principal:** el estudiante completa la unidad/actividad (CU5) → Academia emite el evento `EXTERNAL_ACTIVITY_COMPLETED` (único mecanismo permitido, *"ningún ecosistema escribe directamente en tablas de Mi Plan"*) → Mi Plan actualiza el estado de la tarea correspondiente.
- **Flujos alternativos:** no documentado qué ocurre si la actividad completada en Academia no tiene ninguna `LearningTask` de Mi Plan asociada (caso de estudio libre, no derivado del plan) — se infiere, sin confirmación textual directa, que en ese caso no se emite el evento o se emite sin efecto en Mi Plan.
- **Postcondiciones:** `LearningTask.status` actualizado en Mi Plan; recalculo de `LearningProgress` (fuera del alcance técnico de esta auditoría, mencionado solo como consecuencia funcional ya documentada por Mi Plan).
- **Vacío detectado:** no se documenta si el evento debe emitirse por cada paso de la secuencia o solo al completar la unidad entera. Ver Vacío 6.

---

## 5. Reglas funcionales (MUST)

1. *"Ninguna unidad podrá omitir etapas esenciales ni alterar el orden general del recorrido"* (§6.4, Doc 8) — aplicable solo a la secuencia de 11 pasos; no está claro si aplica igual a la de 10 pasos de Doc 3 (ver Contradicción 2).
2. *"La unidad comenzará siempre con una fase de planificación, nunca con la escritura directa"* (§7.2).
3. *"El Coach IA verificará primero la comprensión de la consigna antes de permitir que el estudiante escriba"* (§7.2).
4. *"La retroalimentación se centrará inicialmente en aspectos macrotextuales... antes de corregir errores gramaticales menores"* (§7.2, §9.5).
5. *"La inteligencia artificial no entregará respuestas antes de que el estudiante haya pensado"* (§7.2); *"En ningún caso generará la respuesta completa ni redactará el texto por el estudiante"* (§8.5).
6. *"Las actividades no comenzarán con escritura libre sin una fase previa de comprensión y análisis"* (§7.2).
7. *"La evaluación no se limitará a una calificación final, sino que acompañará todo el proceso"* (§7.2).
8. Tono prohibido en toda retroalimentación: *"Claude evitará utilizar expresiones categóricas como 'incorrecto', 'fallaste' o 'respuesta equivocada'"* (§8.6).
9. *"Ninguna corrección deberá finalizar sin ofrecer una posibilidad real de mejora"* (§8.6).
10. Regla de arquitectura funcional: *"Los ecosistemas no deberán comunicarse directamente entre sí"* — ejemplo textual explícito: *"la Academia no modificará Mi Plan"* (§5.7).
11. *"La autoridad pedagógica recae en el Motor Pedagógico"* — la IA (incluido el Coach dentro de Academia) *"puede explicar decisiones, nunca decidirlas"* (§9.7).
12. *"Toda decisión deberá ser explicable y trazable. Ninguna decisión dependerá del azar"* (§9.7).

**Verificación de compatibilidad entre reglas:** las reglas 1–9 y 11–12 son mutuamente compatibles y consistentes entre sí. La regla 1, sin embargo, entra en tensión funcional con la existencia misma de tres secuencias distintas de pasos (sección 3): una regla que exige "no alterar el orden general del recorrido" presupone que existe un único recorrido oficial, lo cual no está garantizado por la documentación actual. No se detectaron reglas MUST mutuamente contradictorias en sentido estricto (ninguna regla ordena explícitamente lo contrario de otra) — el problema es de **flujo de referencia ambiguo**, no de reglas antagónicas.

---

## 6. Navegación

**Pantallas inferidas (ninguna fuente presenta wireframes de Academia específicamente; se infiere de la estructura funcional descrita):**
- Mapa/lista de unidades de Academia (teoría + práctica por tipo de texto), con estado de desbloqueo visible.
- Pantalla de contenido teórico ("Academia DELF B2"/"Conoce el DELF" — nombre ambiguo, Contradicción 1).
- Pantallas secuenciales por paso dentro de una unidad de práctica (no se documenta si cada paso es una pantalla separada o un flujo continuo en una sola vista).
- Pantalla/sección de "Biblioteca de Modelos" (§6.5) — posible superposición con "Biblioteca temática" del Laboratorio (Contradicción 3).
- Pantalla de cierre de unidad (resumen, evidencias, reflexión, próximo paso, despedida — §8.9).

**Entradas:** Dashboard, bloque 4 ("Continúa donde te quedaste") y bloque 7 ("Acceso a los ecosistemas", §6.3); navegación principal de 9 espacios (§8.3); posible entrada desde recomendación directa del Coach IA (mensaje contextual, §6.3 ejemplo: *"Hoy recomendamos: continuar Academia..."*).

**Salidas:** regla de continuidad (§6.3): nunca regresa automáticamente al menú principal; ofrece "transición natural hacia la siguiente etapa del recorrido". Al cerrar una unidad, el Dashboard "actualiza el plan y muestra la siguiente recomendación" (§8.9, paso 4).

**Navegación interna:** estrictamente secuencial dentro de una unidad (no se puede saltar ni reordenar pasos, regla 1 de la sección 5); el mapa de unidades sí permite navegación no lineal entre unidades ya desbloqueadas (implícito, no se documenta explícitamente si existe esta libertad o si el desbloqueo también impone un orden estricto entre unidades — ver Vacío 1, extendido aquí a nivel de navegación entre unidades, no solo de pasos dentro de una unidad).

**Navegación hacia otros ecosistemas:** nunca directa (§5.7); toda transición pasa por el Dashboard o el Motor de Orquestación — coherente con la regla de continuidad ya citada.

---

## 7. Dependencias funcionales

| Ecosistema | Naturaleza funcional de la dependencia | Dirección | Evidencia |
|---|---|---|---|
| **Dashboard** | Consume estado resumido de Academia (última unidad, recomendación) | Academia → Dashboard (lectura indirecta, nunca consulta directa) | §6.3, §5.7 |
| **Mi Plan** | Consume finalización de actividades vía evento; nunca al revés | Academia → Mi Plan (por evento) | §5.7, `docs/modules/mi-plan.md` |
| **Motor Pedagógico Adaptativo** | Decide qué contenido de Academia priorizar para cada estudiante | Motor → Academia | §9.7 |
| **Coach IA** | Acompaña cada unidad; nunca decide el recorrido | Bidireccional funcional (Academia solicita acompañamiento; Coach usa memoria previa) | §8.5, §9.1–9.4 |
| **Laboratorio** | Relación conceptual de secuencia pedagógica ("construir conocimiento" antes de "experimentar/consolidar"), sin dependencia funcional obligatoria declarada | Ninguna dirección obligatoria documentada | §8.11 |
| **Simulador** | Comparten el concepto de producción escrita evaluada, con marcos de evaluación distintos y no unificados dentro de Academia (ver Vacío 2) | Sin dependencia funcional directa documentada | 18.12 |
| **Gamificación** | Posible fuente de eventos de recompensa al completar unidades (por analogía con el patrón ya usado por Mi Plan); **no hay evidencia textual que mencione a Academia específicamente como emisor de eventos de gamificación** | Inferido, no documentado directamente para Academia | §11.4 (genérico) |

---

## 8. Contenido

| Etiqueta usada en el corpus | Descripción funcional | Fuente | ¿Pertenece a Academia? |
|---|---|---|---|
| **Academia DELF B2** | Teoría del examen: estructura, criterios oficiales, rúbricas, estrategias, gestión del tiempo, errores frecuentes, consejos del examinador | §6.4 (Doc 1, Doc 3) | Sí, según §6.4 — pero 18.6 lo trata como "sustituido" por "Conoce el DELF". **Ambiguo.** |
| **Academia de Escritura** | Práctica guiada por tipo de texto, secuencia obligatoria de pasos | §6.4 (Doc 3) | Sí, sin ambigüedad — coincide con el nombre oficial de 18.6 ("Academia (de Escritura)"). |
| **Conoce el DELF / Introducción al DELF B2** | Ecosistema oficial #3 de la tabla de nomenclatura de 18.6, "sustituye a Academia DELF B2 (parte teórica)" | 18.6 | Formalmente **distinto** de Academia (#4) según 18.6, pero su descripción funcional no está desarrollada en ninguna sección propia — solo aparece nombrado en §8.3 (navegación) y en la tabla de 18.6. |
| **Biblioteca de Modelos** | Modelos completos, producciones excelentes y con errores, con análisis de la IA de por qué unas puntúan mejor que otras | §6.5 (posicionada entre Academia y Laboratorio en la estructura del documento) | Ambiguo — ver Contradicción 3. |
| **Biblioteca temática** | Textos auténticos clasificados por tema DELF, uno de los "cuatro espacios" explícitamente listados como parte del Laboratorio | §6.6 | Declarada como parte de Laboratorio, no de Academia — pero conceptualmente muy similar a "Biblioteca de Modelos". |

**Duplicidad/conflicto detectado:** dos pares de nombres (Academia DELF B2/Conoce el DELF; Biblioteca de Modelos/Biblioteca temática) describen contenido funcionalmente equivalente o casi equivalente sin que el corpus aclare si son la misma cosa con nombre distinto, dos cosas distintas, o una que sustituye a la otra. Ver sección Contradicciones.

---

## 9. Estado del estudiante

| Concepto solicitado | Estado en la documentación |
|---|---|
| **Progreso** | No existe ninguna entidad ni campo documentado de progreso a nivel de unidad de Academia (a diferencia de Mi Plan, cuyo `LearningTask.status` ya está formalizado por la resolución 18.21). El único progreso documentado que referencia actividades de Academia es indirecto, vía `LearningTask.source = ACADEMY` en Mi Plan — que registra que *una tarea del plan* está vinculada a Academia, no el estado interno de la unidad misma. |
| **Avance** | §8.8 (niveles de adaptación) describe avance como entrada del sistema de personalización, no como un dato expuesto al estudiante específicamente para Academia. |
| **Desbloqueo** | Mencionado como paso final de dos de las tres secuencias documentadas (sección 3), sin criterio de activación especificado. **Vacío 1.** |
| **Repetición** | La reescritura (paso obligatorio dentro de una unidad) sí está documentada, sin límite de ciclos especificado. La repetición de una **unidad ya completada** no está mencionada en ninguna fuente. **Vacío no listado previamente — se añade como parte de esta auditoría (ver Vacíos, punto 7).** |
| **Finalización** | Se infiere que ocurre al completar el último paso de la secuencia ("Desbloquear"), pero no existe declaración explícita de un estado "unidad completada" ni de un estado "módulo Academia completado" a nivel agregado. |
| **Reinicio** | No documentado. |
| **Continuidad** | Prometida a nivel de producto ("Continúa donde te quedaste", bloque 4 del Dashboard, §6.3) pero sin mecanismo funcional específico documentado para Academia (¿en qué paso exacto retoma?, ¿se conserva el borrador en curso?). **Vacío 5.** |

---

## 10. Integración pedagógica

**¿Cuándo interviene el Coach IA?** De forma continua dentro de la unidad: explica conceptos, aclara instrucciones, formula preguntas, orienta la planificación, da retroalimentación (paso de retroalimentación de cualquiera de las tres secuencias), sugiere estrategias — nunca genera la respuesta completa ni redacta por el estudiante (§8.5). Interviene también en el gate de comprensión antes de permitir escribir (§7.2, regla 3 de la sección 5).

**¿Cuándo interviene la IA (más allá del Coach — Feedback Engine, Recommendation Engine)?** En el paso de retroalimentación/evaluación (denominado "Recibir retroalimentación" en Doc 8, "Mini evaluación"+"Retroalimentación" en Doc 3) — el Feedback Engine analiza la producción vía AI Orchestrator (§9.4); el Recommendation Engine genera "contenidos de la Academia" recomendados basados en el historial (§9.4, lista de servicios especializados).

**¿Cuándo interviene el Motor Pedagógico?** No dentro del recorrido paso a paso de una unidad (eso lo gobierna la secuencia fija, sección 3), sino en la selección de qué unidades/contenido se muestran como prioritarios para un estudiante concreto (§9.7, tabla de integración: *"Academia | Selecciona contenidos prioritarios"*). La autoridad pedagógica recae en este motor, no en el Coach ni en la IA generativa (regla 11, sección 5).

**¿Cuándo interviene Mi Plan?** Nunca durante el recorrido de una unidad (regla de no comunicación directa entre ecosistemas, §5.7) — únicamente después, como consumidor pasivo del evento de finalización (`EXTERNAL_ACTIVITY_COMPLETED`), y solo si la actividad completada corresponde a una `LearningTask` con `source = ACADEMY` ya creada por Mi Plan.

---

## Hallazgos

| # | Severidad | Descripción | Evidencia documental | Impacto | Riesgo |
|---|---|---|---|---|---|
| H1 | **Crítico** | Contradicción de identidad entre "Academia DELF B2" (título de §6.4, contenido teórico del examen) y "Conoce el DELF / Introducción al DELF B2" (18.6, ecosistema oficial #3, declarado como sustituto de "Academia DELF B2 (parte teórica)") | §6.4 vs. tabla de 18.6, fila 3 | No es posible determinar con certeza qué contenido teórico pertenece a "Academia" y cuál a un ecosistema distinto ("Conoce el DELF") que además no tiene ninguna especificación funcional propia desarrollada | Diseñar el alcance de Academia sin resolver esto arriesga construir contenido duplicado o en el ecosistema equivocado |
| H2 | **Crítico** | Existen tres secuencias de pasos distintas para lo que aparenta ser el mismo concepto de "unidad de Academia", de tres documentos fuente distintos (Doc 3: 10 pasos; Doc 8: 11 pasos; Doc 4/§7.2: 9 etapas genéricas), sin que ninguna fuente las declare equivalentes o indique cuál prevalece | Tabla comparativa, sección 3 de este documento | Imposible derivar un único flujo/máquina de estados de UI sin decidir cuál secuencia (o combinación) es la autoritativa | Implementar un flujo que deba rehacerse por completo al resolverse la ambigüedad |
| H3 | **Alto** | Ausencia de criterio de desbloqueo documentado para el paso final ("Desbloquear siguiente unidad") en ambas secuencias que lo incluyen | Sección 3; §6.4 (Doc 3 y Doc 8) | El sistema no puede implementar control de progresión sin asumir una regla no documentada | Asumir un criterio arbitrario (p. ej. "completar todos los pasos" vs. "aprobar con umbral mínimo") que contradiga una decisión de producto posterior |
| H4 | **Alto** | Solapamiento no resuelto entre "Biblioteca de Modelos" (§6.5, ubicada narrativamente dentro de la sección de Academia) y "Biblioteca temática" (§6.6, uno de los "cuatro espacios" explícitamente listados como parte del Laboratorio) — ambas describen catálogos de textos con análisis | §6.5 vs. §6.6 | Ambigüedad sobre a qué ecosistema/feature pertenece este catálogo | Duplicar el catálogo entre dos features, o asignarlo al ecosistema equivocado |
| H5 | **Medio** | No existe entidad ni estado de progreso por unidad de Academia documentado (a diferencia de Mi Plan, ya formalizado por 18.21) | §13.4–13.8 (ausencia); contraste directo con 18.21 (Mi Plan) | La función "Continúa donde te quedaste" (ya prometida en el Dashboard, §6.3) no tiene mecanismo funcional documentado para Academia específicamente | Prometer al usuario una funcionalidad de continuidad que no puede implementarse sin inventar el mecanismo |
| H6 | **Medio** | El rol del Profesor sobre Academia se describe de forma genérica ("asignar actividades", "ver producciones"), sin especificar si controla asignación/desbloqueo de unidades concretas | §6.14 | El caso de uso CU7 queda funcionalmente incompleto | Bloquea el diseño de permisos docente-Academia en un sprint futuro dedicado al Espacio del Profesor |
| H7 | **Bajo** | No se documenta si la retroalimentación/mini-evaluación dentro de una unidad de Academia usa el marco formativo de 10 categorías (Coach IA, §9.5) o la rúbrica oficial DELF de 5+1 criterios (§10.2) | 18.12 (declara el uso general de cada marco sin mencionar a Academia explícitamente en ninguno de los dos lados) | Bajo impacto funcional inmediato (la evidencia indirecta —"el Coach IA sigue usando las 10 categorías durante todo el ciclo de aprendizaje"— sugiere el marco formativo), pero no es una certeza documental | Diseñar la integración de evaluación con el marco equivocado |

---

## Vacíos

1. **Criterio exacto de desbloqueo de la siguiente unidad** — no documentado en ninguna fuente (ver H3).
2. **Marco de evaluación aplicable a la retroalimentación dentro de Academia** (formativo vs. sumativo) — no confirmado explícitamente (ver H7).
3. **Alcance de la intervención del Motor Pedagógico sobre el orden interno de una unidad** — no está claro si solo prioriza qué unidades mostrar o si también puede alterar la secuencia fija de pasos dentro de una unidad ya iniciada.
4. **Precondiciones/postcondiciones del caso de uso del Profesor sobre Academia** — no especificadas (ver H6).
5. **Mecanismo funcional de "Continúa donde te quedaste" para Academia** — prometido a nivel de producto, sin especificación de en qué granularidad se retoma (paso, unidad, sesión) (ver H5).
6. **Nivel de granularidad del evento `EXTERNAL_ACTIVITY_COMPLETED` emitido por Academia hacia Mi Plan** — no se documenta si se emite por cada paso o solo al completar la unidad entera.
7. **Posibilidad de reiniciar/repetir una unidad ya completada** — no mencionada en ninguna fuente.
8. **Número de ciclos de reescritura permitidos/exigidos dentro de una unidad** — la reescritura es obligatoria al menos una vez, pero no hay límite superior ni inferior documentado.
9. **Mecanismo de medición del "andamiaje progresivo"** (§8.10: ayuda decreciente según dominio) aplicado específicamente dentro de Academia — el principio está declarado, el mecanismo de cálculo no.

---

## Contradicciones

**Contradicción 1 (crítica) — Identidad de "Academia DELF B2" vs. "Conoce el DELF":** §6.4 usa "Academia DELF B2" como título de la sección que describe la parte teórica del módulo Academia. La resolución 18.6 (tabla de nomenclatura oficial, vinculante) declara "Conoce el DELF / Introducción al DELF B2" como ecosistema oficial **#3**, explícitamente distinto de "Academia (de Escritura)" (ecosistema oficial **#4**), y anota que "Conoce el DELF" **sustituye** a "Academia DELF B2 (parte teórica)" como nomenclatura descartada. Esto implica que la parte teórica descrita en §6.4 debería, según 18.6, pertenecer a un ecosistema distinto de Academia — pero §6.4 sigue presentándola como parte integral de la sección "Academia" del documento, sin que 18.6 la reescriba ni la elimine de ese contexto (regla general de consolidación: "las versiones descartadas... no se eliminan").

**Contradicción 2 (crítica) — Tres secuencias de pasos incompatibles para el recorrido de una unidad:** ver tabla comparativa completa en la sección 3 de este documento. Doc 3 describe 10 pasos, Doc 8 describe 11 pasos declarados "obligatorios" y "sin poder alterar el orden", y Doc 4/§7.2 describe un ciclo pedagógico genérico de 9 etapas aplicable a "todo módulo del entrenador". Ninguna fuente reconcilia las tres.

**Contradicción 3 (media) — Biblioteca de Modelos vs. Biblioteca temática:** ver H4. §6.5 (posicionada en el documento entre Academia §6.4 y Laboratorio §6.6) describe un catálogo de "modelos completos, producciones excelentes, producciones con errores, análisis detallado" sin asignarlo explícitamente a ningún ecosistema con nombre. §6.6 lista "Biblioteca temática" como uno de los cuatro espacios explícitos del Laboratorio, con una descripción ("textos auténticos, clasificados por temas DELF") parcialmente distinta pero funcionalmente adyacente.

---

## Preguntas abiertas (indispensables antes del Sprint 4.1)

1. ¿Qué contenido pertenece exactamente a "Academia" y cuál a "Conoce el DELF"? ¿Son el mismo ecosistema con dos nombres, o dos ecosistemas reales con límites por definir? (bloqueante — Contradicción 1)
2. ¿Cuál de las tres secuencias de pasos documentadas (10, 11, o 9 genérica) es la autoritativa para el flujo de una unidad de Academia, o cómo se combinan en una sola? (bloqueante — Contradicción 2)
3. ¿Cuál es el criterio exacto que determina el desbloqueo de la siguiente unidad? (bloqueante — Vacío 1, necesario para cualquier diseño de estado)
4. ¿"Biblioteca de Modelos" pertenece a Academia, a Laboratorio, o es un recurso compartido entre ambos? (bloqueante — Contradicción 3)
5. ¿Qué marco de evaluación (10 categorías formativas o rúbrica DELF sumativa) aplica a la retroalimentación dentro de una unidad de Academia? (bloqueante para definir el contrato funcional con el Feedback Engine)
6. ¿Existe, o debe definirse, un estado de progreso por unidad que soporte la función ya prometida "Continúa donde te quedaste"? (bloqueante para cualquier diseño de persistencia funcional)

---

## Recomendaciones

*(Limitadas a señalar qué debe resolverse antes del Sprint 4.1 — no se proponen soluciones ni implementaciones, conforme a las restricciones de este encargo.)*

1. Resolver, mediante decisión de producto/nueva resolución arquitectónica, la relación exacta entre "Academia" y "Conoce el DELF" (Pregunta abierta 1) antes de continuar cualquier trabajo de especificación adicional.
2. Determinar cuál secuencia de pasos (o combinación) rige el recorrido de una unidad (Pregunta abierta 2) — es la pieza de información más determinante para cualquier diseño posterior de estado/flujo.
3. Definir el criterio de desbloqueo progresivo entre unidades (Pregunta abierta 3).
4. Resolver el solapamiento entre Biblioteca de Modelos y Biblioteca temática (Pregunta abierta 4).
5. Aclarar el marco de evaluación aplicable dentro de Academia (Pregunta abierta 5).
6. Especificar el mecanismo funcional de continuidad ("Continúa donde te quedaste") para Academia (Pregunta abierta 6).
7. Completar la especificación del rol del Profesor sobre Academia (Hallazgo H6) antes de que el Espacio del Profesor dependa de esta interacción.

---

## Veredicto

**🟡 Requiere resoluciones arquitectónicas adicionales antes del Sprint 4.1.**

Justificación, basada exclusivamente en evidencia documental: la especificación funcional de Academia contiene dos contradicciones de severidad **crítica** (H1: identidad Academia/Conoce el DELF; H2: tres secuencias de pasos incompatibles) que impiden derivar, a partir de la documentación actual, una única definición coherente de "qué es una unidad de Academia" y "qué contenido le pertenece" — precisamente lo que el Sprint 4.1 (Modelo de Datos) necesitaría como punto de partida. A esto se suman cuatro hallazgos adicionales de severidad alta/media (H3–H6) y nueve vacíos que, aunque no bloquean por sí solos el inicio del modelado de datos, sí introducen supuestos no verificables si se avanzara sin resolverlos.

Este veredicto es consistente con el patrón ya seguido por Mi Plan: la auditoría funcional de Mi Plan (`mi-plan-functional-audit-2026-07-17.md`) tampoco encontró el módulo listo de inmediato, sino que exigió una fase de resolución de vacíos (10 vacíos, resueltos mediante las resoluciones 18.20–18.21) antes de proceder a su auditoría de implementabilidad y, solo después, a su Domain Layer. Academia debe seguir la misma ruta: no se recomienda iniciar el Sprint 4.1 hasta que, como mínimo, las Preguntas abiertas 1–4 tengan una resolución formal.

No se emite, en este documento, ninguna resolución ni propuesta de solución — conforme a las restricciones del encargo, esa es una tarea posterior y separada.
