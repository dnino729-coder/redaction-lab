# Especificación técnica consolidada del módulo "Academia" — Sprint 4.0, Fase 1

**Rol:** Arquitecto de Software Senior / Auditor de Documentación. **Fecha:** 2026-07-19.
**Fuente única de verdad:** `02_Conocimiento_Consolidado_Resuelto.md` (secciones 1, 4.1–4.6, 5.1–5.7, 6.3–6.9, 6.11, 6.16, 7.1–7.7, 8.1–8.11, 9.1–9.7, 10.1–10.3, 11.1–11.5, 12.2–12.6, 13.1–13.2, 13.4–13.9, 13.12–13.15, 17.2, 17.8, 18.6, 18.12, 18.15–18.19), documentación ya generada del proyecto (`docs/modules/mi-plan.md`, `docs/modules/dashboard.md`, `ARCHITECTURE.md`) y artefactos de código existentes (`prisma/schema.prisma`, `prompts/*/index.ts`, `features/academy/README.md`, `features/laboratory/README.md`, `prisma/migrations/*`).
**Alcance de este documento:** exclusivamente análisis y consolidación de especificación. No contiene código, esquema Prisma nuevo, ni propuestas de implementación. Ningún archivo existente del proyecto fue modificado para producir este documento.

---

## 1. Resumen ejecutivo

"Academia" es el ecosistema documentado como responsable de construir el conocimiento teórico y procedimental que el estudiante necesita **antes** de producir texto libremente — la contraparte formativa del Laboratorio (práctica libre) y el Simulador (evaluación sumativa). La síntesis integradora del propio corpus lo resume sin ambigüedad: *"El Dashboard organiza el recorrido del estudiante. Mi Plan estructura el entrenamiento a largo plazo. **La Academia construye el conocimiento.** El Laboratorio permite experimentar y consolidar competencias"* (§8.11).

La resolución 18.6 (vinculante, cierra el conflicto de nomenclatura de §17.2) fija su nombre oficial como **"Academia (de Escritura)"**, distinto de **"Conoce el DELF / Introducción al DELF B2"** (contenido teórico sobre el examen) y de **"Laboratorio de Lectura y Escritura"** (práctica libre). La ruta técnica ya está resuelta y aplicada en código: `academy` (18.19, tabla de mapeo canónico; confirmado por `features/academy/` ya existente en el repositorio).

A diferencia de Mi Plan, Dashboard, y en menor medida Coach IA (todos ya auditados/implementados en sprints previos), Academia **no tiene ningún artefacto de auditoría funcional o de implementabilidad previo** en `docs/audits/`, ninguna entidad de Domain Modeling propia completamente definida en el esquema físico (`prisma/schema.prisma` solo contiene 6 de las ~20 tablas de Producción Escrita/Evaluación documentadas en §13.5–13.6, todas ellas orientadas a lectura del Dashboard, no a escritura del propio ecosistema), y ningún módulo de documentación dedicado (`docs/modules/academia.md` no existe). El directorio `features/academy/` existe solo como scaffolding vacío (`.gitkeep` en cada subcarpeta, README declarando explícitamente "Sin lógica de producto todavía").

Este documento reconstruye la especificación de Academia a partir de fuentes dispersas en 8 secciones distintas del documento consolidado (§4, §6, §7, §8, §9, §10, §11, §13, §17, §18) y documenta 6 hallazgos, 5 vacíos y 6 preguntas abiertas que deben resolverse antes del Sprint 4.1 (Modelo de Datos). **Veredicto anticipado (desarrollado en la sección 17): 🟡 no está lista para iniciar el Sprint 4.1 sin antes emitir al menos una resolución arquitectónica adicional**, siguiendo el mismo patrón que exigió Mi Plan (auditoría funcional → auditoría de implementabilidad → resoluciones 18.20–18.23 → recién entonces Sprint 3.3.1).

---

## 2. Objetivos

**Objetivo pedagógico central (Doc 1, §6.4):** *"Enseñar los fundamentos necesarios antes de escribir."* *"Este módulo sería la parte 'teórica' de tu antigua cartilla."*

**Objetivo funcional (§6.4, Doc 1):** cubrir, antes de que el estudiante practique libremente en el Laboratorio: cómo funciona la producción escrita del DELF B2; criterios oficiales de evaluación; tipos de texto; organización textual; registro formal e informal; conectores; gramática clave; léxico; estrategias para el examen.

**Objetivo de autonomía (§7.5, aplicable transversalmente a toda unidad del "entrenador", según §7.2: "Cada módulo del entrenador, independientemente del tipo de texto trabajado, respetará esta secuencia pedagógica"):** que el estudiante alcance, al concluir cada unidad de Academia, autonomía suficiente para enfrentar una nueva consigna del mismo tipo de texto sin depender constantemente del Coach IA.

**Objetivo de integración (§9.7, tabla "Integración con los ecosistemas"):** el Motor Pedagógico Adaptativo "selecciona contenidos prioritarios" dentro de Academia en función de competencias débiles detectadas — Academia no decide su propio contenido de forma aislada, sino que recibe priorización externa del Motor Pedagógico (§9.7: *"La autoridad pedagógica recae en el Motor Pedagógico"* — la IA, incluido el Coach dentro de Academia, "puede explicar decisiones, nunca decidirlas").

**Objetivo de producto (§4.1, MVP):** Academia DELF B2 es el módulo #2 de 5 en el alcance explícito de la primera versión del producto (*"Para esa primera versión, me centraría en: 1. Dashboard. 2. Academia DELF B2. 3. Laboratorio de Escritura. 4. Corrector Inteligente. 5. Simulador Oficial"*) — es, junto con Dashboard, uno de los dos módulos de mayor prioridad declarada en todo el corpus.

---

## 3. Alcance

### 3.1 Qué incluye (según §6.4, §4.2, §4.3, dividido en dos partes explícitas por Doc 3)

1. **Academia DELF B2** (parte teórica del examen): estructura de la prueba, criterios oficiales de evaluación, rúbricas, estrategias, gestión del tiempo, errores frecuentes, consejos del examinador.
2. **Academia de Escritura** (práctica guiada por tipo de texto): todos los tipos de texto trabajados (§4.5: cartas de motivación, cartas de reclamación, correo de lectores, foro, carta abierta — ampliado en el modelo de datos, `WritingTask.task_type`, a `LETTER, ARTICLE, ESSAY, EMAIL, REPORT`, §13.5), cada uno recorriendo la **secuencia NeuroUX obligatoria de 11 pasos** (§6.4, Doc 8 Cap. 5 — cita textual: *"Todas las unidades del entrenador deberán seguir exactamente el siguiente recorrido"*): 1) Contextualizar, 2) Definir objetivos, 3) Comprender, 4) Observar, 5) Analizar, 6) Practicar, 7) Producir, 8) Recibir retroalimentación, 9) Reescribir, 10) Reflexionar, 11) Desbloquear (siguiente unidad). *"Ninguna unidad podrá omitir etapas esenciales ni alterar el orden general del recorrido."*

Esta secuencia de 11 pasos es una variante, con mayor granularidad de UI/UX, del ciclo pedagógico genérico de 9 etapas descrito en §7.2 (Comprender → Observar → Analizar → Practicar → Recibir retroalimentación → Reescribir → Reflexionar → Entrenar nuevamente → Dominar) — ambos ciclos comparten núcleo (comprender/observar/analizar/practicar/retroalimentación/reescribir/reflexionar) pero ninguna fuente declara explícitamente que sean el mismo ciclo con nombres distintos ni cómo se corresponden paso a paso (ver Hallazgo 6.1 en la sección 13).

### 3.2 Qué excluye explícitamente

- **Corrección/evaluación como capacidad propia:** el "Corrector Inteligente" **no** es parte de Academia como entidad propia — es una capacidad transversal del Coach IA/Feedback Engine, accesible también desde Laboratorio y Simulador (§6.7, confirmado y hecho vinculante por 18.6: *"'Corrector Inteligente' no se implementa como ecosistema navegable independiente; su funcionalidad queda integrada como capacidad transversal del Coach IA / Feedback Engine"*).
- **Práctica libre sin guía estructurada:** eso es responsabilidad exclusiva del Laboratorio (§6.6, cuatro espacios: Biblioteca temática, Exploración, Escritura libre, Generador inteligente) — Academia siempre sigue la secuencia fija de 11 pasos, el Laboratorio no tiene secuencia obligatoria.
- **Evaluación sumativa/certificación oficial:** corresponde al módulo de Evaluación Final y Certificación (§10.2) y al Simulador (§6.9) — la "Mini evaluación" dentro del paso 8 de la secuencia de Academia es formativa, no genera `ExamAttempt`/`EvaluationResult` (entidades exclusivas de §13.6, ligadas a `Exam`, no a `WritingTask`).
- **Decisión de contenido pedagógico:** Academia no decide autónomamente qué unidad mostrar; recibe la priorización del Motor Pedagógico Adaptativo (§9.7) y no debe iniciar comunicación con otros ecosistemas por sí misma — regla general de arquitectura, §5.7: *"Los ecosistemas no deberán comunicarse directamente entre sí... la Academia no modificará Mi Plan."*

### 3.3 Alcance temático (MVP vs. roadmap)

Alcance vigente del MVP: exclusivamente DELF B2, francés (§4.1, §7.7: *"DELF B2 Producción Escrita" / "Production Écrite"*). Fuera del alcance actual, documentado como roadmap (§4.6): DALF C1/C2, otros niveles DELF (A1/A2/B1), producción oral, comprensión oral/escrita, otros idiomas. La resolución 18.17 ya deja el campo `WritingTask.delf_level` preparado como `ENUM A1-C2` (en vez de restringido a `B2`) para esta ampliación futura, aunque el único valor operativo en el MVP siga siendo `B2`.

---

## 4. Actores

| Actor | Rol frente a Academia | Fuente |
|---|---|---|
| **Estudiante** | Actor principal; consume unidades, ejecuta la secuencia de 11 pasos, recibe retroalimentación y decide cuándo avanzar (dentro de las restricciones de desbloqueo progresivo). | §6.4, §7, §8 |
| **Coach IA** | Mentor contextual permanente dentro de cada unidad: explica conceptos, aclara instrucciones, formula preguntas, da retroalimentación, sugiere estrategias — *"En ningún caso generará la respuesta completa ni redactará el texto por el estudiante"* (§8.5). No decide el recorrido pedagógico, solo lo explica/acompaña (§9.7). | §6.13, §8.5, §9.1–9.4 |
| **Motor Pedagógico Adaptativo** | Actor no humano con autoridad pedagógica: selecciona contenidos prioritarios de Academia según competencias débiles/fuertes detectadas (§9.7, tabla de integración). | §9.7 |
| **Profesor** (Espacio del Profesor) | Puede "ver las producciones escritas" y "asignar actividades" (§6.14) — el corpus no específica si esto incluye asignar unidades concretas de Academia o solo actividades genéricas; ver Pregunta abierta 15.3. | §6.14 |
| **Administrador** (Panel Administrativo) | Gestiona contenidos: *"editar lecciones, actividades, ejemplos, recursos, rúbricas, insignias — sin necesidad de modificar el código"* (§6.15) — Academia es, junto con Laboratorio, el ecosistema con mayor volumen de contenido editorial gestionable (lecciones/unidades). | §6.15 |
| **AI Orchestrator / Feedback Engine / Recommendation Engine** | Servicios de IA que Academia consume indirectamente (nunca de forma directa — solo el AI Orchestrator habla con los proveedores de modelos, §9.4) para generar contenido de "Actividades IA" (paso 7 de la secuencia) y priorizar recomendaciones. | §9.4 |

---

## 5. Casos de uso

No existe, en ningún documento fuente, una lista explícita de "casos de uso" de Academia con ese formato (a diferencia de otros artefactos ya auditados del proyecto, que sí tuvieron ese trabajo de reconstrucción hecho por un sprint dedicado — p. ej. Mi Plan, `docs/audits/mi-plan-functional-audit-2026-07-17.md`). Los siguientes se infieren, con evidencia directa, de §6.4, §7.2, §8.2 y §9.7:

| # | Caso de uso | Actor principal | Descripción | Fuente |
|---|---|---|---|---|
| 1 | Consultar el mapa de unidades de Academia | Estudiante | Ver qué unidades están desbloqueadas/bloqueadas/completadas, organizadas por tipo de texto DELF B2. | §6.4, §7.2 (paso "Desbloquear") |
| 2 | Iniciar una unidad de Academia DELF B2 (teoría del examen) | Estudiante | Acceder a contenido sobre estructura del examen, criterios oficiales, rúbricas, gestión del tiempo. | §6.4 (parte 1) |
| 3 | Recorrer una unidad de Academia de Escritura (práctica guiada de un tipo de texto) | Estudiante | Ejecutar secuencialmente los 11 pasos NeuroUX sin poder omitir etapas. | §6.4 (parte 2), §8.1 |
| 4 | Recibir retroalimentación formativa dentro de una unidad (paso 8) | Estudiante + Coach IA/Feedback Engine | El Coach IA/Feedback Engine analiza la mini-producción del estudiante según las 10 categorías jerárquicas de corrección (§9.5), no la rúbrica oficial de 5+1 criterios (reservada a Simulador/Evaluación Final, §18.12). | §9.5, §18.12 |
| 5 | Reescribir tras la retroalimentación (paso 9) | Estudiante | *"La primera versión nunca representa el producto final del aprendizaje"* (§7.2). | §7.2 |
| 6 | Reflexionar al cierre de la unidad (paso 10) | Estudiante | Preguntas metacognitivas (§7.2, §8.9): ¿qué aprendí?, ¿qué fue lo más difícil?, ¿qué estrategia funcionó? | §7.2, §8.9 |
| 7 | Desbloquear la siguiente unidad (paso 11) | Sistema (regla de negocio, no manual) | Progresión secuencial — condición de desbloqueo no está especificada exactamente (ver Vacío 14.1). | §6.4 |
| 8 | Recibir contenido priorizado por el Motor Pedagógico | Estudiante (pasivo) / Motor Pedagógico Adaptativo | Cuando una competencia está bajo el umbral, el Motor prioriza actividades relacionadas dentro de Academia (regla "si-entonces", §9.7). | §9.7 |
| 9 | Notificar finalización de actividad a Mi Plan | Academia (emisor) → Mi Plan (consumidor) | Vía el evento de integración ya definido por Mi Plan, `EXTERNAL_ACTIVITY_COMPLETED` (ver sección 10 de este documento). | `docs/modules/mi-plan.md` líneas 283, 288 |
| 10 | Consultar Biblioteca de Modelos / Biblioteca temática | Estudiante | Modelos completos, producciones excelentes y con errores, con análisis de la IA de por qué unas puntúan mejor que otras. Existe ambigüedad sobre si esto es un caso de uso propio de Academia o del Laboratorio — ver Hallazgo 13.6. | §6.5, §6.6 |
| 11 | (Profesor) Asignar/revisar actividades de Academia a un grupo | Profesor | No especificado con el nivel de detalle de los demás casos de uso — ver Pregunta abierta 15.3. | §6.14 |
| 12 | (Administrador) Editar contenido editorial de Academia (lecciones, actividades, ejemplos, rúbricas) | Administrador | Sin necesidad de modificar código, vía Panel Administrativo. | §6.15 |

---

## 6. Arquitectura

**Patrón general del proyecto (obligatorio para Academia, sin excepción):** Feature-Driven Architecture (resolución 18.2, vinculante) — `features/academy/` con subcarpetas estándar (`components/, pages/, hooks/, services/, types/, schemas/, utils/, constants/, actions/`), ya presentes como scaffolding vacío en el repositorio, confirmado en esta misma investigación (`find features/academy -type f` → solo `.gitkeep` y `README.md`). Regla dura de aislamiento (§5.4, reiterada en el propio README del scaffold): *"Una feature nunca importa directamente de otra feature"* — la comunicación con Mi Plan, Dashboard, Coach IA y Gamificación debe pasar por `services/` compartidos o por el Motor de Orquestación (§5.7).

**Capas internas esperadas (por analogía directa con Mi Plan, único módulo de dominio ya implementado en el proyecto siguiendo esta metodología — Sprints 3.3.1–3.3.4.2):** Domain (entidades `WritingTask`, `WritingSubmission`, etc. con Value Objects e invariantes), Application (Handlers CQRS: comandos como `StartUnitCommand`/`SubmitDraftCommand`, queries como `GetUnitProgressQuery`), Infrastructure (Repositories/Mappers/UnitOfWork/QueryServices sobre Prisma + Supabase, con RLS vía `dashboard_app_role`/`dashboard_service_role` siguiendo el patrón ya resuelto por 18.24). **Esta capa aún no existe para Academia** — es una inferencia por consistencia metodológica, no una especificación documentada explícitamente para este módulo en particular.

**Comunicación entre ecosistemas — regla dura (§5.7):** *"Los ecosistemas no deberán comunicarse directamente entre sí"* — ejemplo textual explícito: *"la Academia no modificará Mi Plan"*. Toda interacción pasa por el Motor de Orquestación o por eventos de dominio (patrón ya implementado por Mi Plan vía `EXTERNAL_ACTIVITY_COMPLETED`).

**AI Orchestrator como única puerta de entrada a modelos de lenguaje (§9.4):** *"Ningún módulo de la plataforma deberá comunicarse directamente con OpenAI, Anthropic u otros proveedores."* Academia consume el Feedback Engine (retroalimentación del paso 8), el Recommendation Engine (contenido priorizado) y el Prompt Engine (§9.6) — nunca invoca un proveedor de IA directamente. El repositorio de prompts (`prompts/feedback/index.ts`, `prompts/recommendations/index.ts`, `prompts/coach/index.ts`) ya existe como scaffolding vacío consistente con esta regla (*"No deberán existir prompts incrustados en el código de la aplicación"*, §9.6); no existe `prompts/academy/index.ts` ni categoría de prompt dedicada a Academia — solo categorías genéricas (grammar, simulation, feedback, recommendations, coach, evaluation, writing).

**Almacenamiento de archivos/recursos:** Supabase Storage, no AWS S3 (18.16, decisión explícitamente vinculante que menciona "recursos de la Academia y Biblioteca de Modelos" entre los módulos impactados).

**i18n (obligatorio, 18.18/18.19):** todo texto de interfaz de Academia (incluyendo estados vacíos, mensajes de error/éxito, tooltips, contenido de notificaciones) debe vivir en `messages/fr.json` (fuente primaria) y `messages/es.json` (traducción), nunca como literal en componente/Server Action. La ruta de código/URL ya está fijada en inglés: `academy` (18.19).

---

## 7. Modelo conceptual

### 7.1 Entidades documentadas — Producción Escrita (§13.5, Domain Modeling Cap. 5)

`WritingTask, WritingPrompt, WritingSubmission, WritingDraft, WritingVersion, WritingCorrection, WritingFeedback, WritingScore, WritingAttachment, WritingHistory`. Campos y relaciones clave: `WritingTask.task_type` (`LETTER, ARTICLE, ESSAY, EMAIL, REPORT`), `WritingTask.delf_level` (`ENUM A1-C2` tras 18.17), `WritingSubmission.status` (`DRAFT, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, CORRECTED, ARCHIVED`), regla dura: *"no se permite modificar una versión ya enviada — cualquier cambio genera una nueva versión"* (`WritingVersion`).

### 7.2 Entidades documentadas — relacionadas transversalmente

- **Competencias (§13.8):** `Competency, SubCompetency, StudentCompetency, CompetencyAssessment` — las competencias iniciales (`TaskAchievement, Coherence, Cohesion, Vocabulary, Grammar, Morphosyntax, Spelling, Register, Argumentation, TextStructure, Revision, Autonomy`) son evaluadas por producción (`CompetencyAssessment.writing_submission_id`) — Academia es, junto con Laboratorio y Simulador, generador de las `WritingSubmission` que alimentan este modelo.
- **Coach/Memoria (§13.7):** `CoachObservation.writing_submission_id`, `CoachContext.last_submission_id` — el Coach IA registra observaciones ligadas directamente a producciones de Academia.
- **Gamificación (§11.4, referida desde 13.9):** `Reward, RewardClaim` (tipos `BADGE, AVATAR, THEME, CERTIFICATE, BONUS`) — Academia es fuente de eventos de finalización que dispararían recompensas (patrón ya implementado por Mi Plan: `EXTERNAL_ACTIVITY_COMPLETED` → `XPTransaction`, según `docs/modules/mi-plan.md`).
- **Plan de Aprendizaje (§13.4):** `LearningTask.source` ya incluye el valor `ACADEMY` en el enum (`SELF_DIRECTED, ACADEMY, LABORATORY, DAILY_TRAINING, SIMULATOR`) — contrato de integración ya construido desde el lado de Mi Plan, pendiente de ser consumido desde Academia.

### 7.3 Entidades NO documentadas explícitamente pero implícitas en la especificación funcional

Ninguna fuente define una entidad "Unidad de Academia" (`AcademyUnit`/similar) distinta de `WritingTask`, ni entidades para representar el estado de desbloqueo progresivo (paso 11: "Desbloquear"), la separación entre las dos partes de Academia ("Academia DELF B2" teórica vs. "Academia de Escritura" práctica), ni el catálogo teórico del examen (criterios oficiales, rúbricas, estrategias, consejos del examinador — contenido de la parte 1 de §6.4) — el modelo de datos de §13.5/13.6 solo cubre producción/evaluación de texto, no contenido editorial teórico. Ver Vacío 14.2.

### 7.4 Estado real del esquema físico (verificado en esta investigación)

`prisma/schema.prisma` contiene actualmente solo 6 de las ~20 entidades documentadas en §13.5/§13.6: `WritingSubmission`, `WritingDraft`, `ExamAttempt`, `EvaluationResult`, `CoachRecommendation`, `CoachContext` — todas ellas incorporadas como fuentes de **solo lectura** para el Dashboard (migración `202607161000_dashboard_read_schema`), no como modelo de escritura de un ecosistema propio. No existe ninguna migración `06_writing` ni `07_delf_evaluation` (el orden de migraciones iniciales previsto en §13.14 sí las nombra: *"01_initial_schema → 02_authentication → 03_profiles → 04_academic_structure → 05_learning_plan → 06_writing → 07_delf_evaluation → ..."* — las migraciones 01-05 y sus RLS ya existen para Dashboard/Mi Plan; 06 y 07 no existen). Ver Hallazgo 13.4.

---

## 8. Reglas de negocio

Reglas MUST explícitas y directamente aplicables a Academia, consolidadas de las fuentes indicadas:

1. **Secuencia fija e inalterable de 11 pasos** (§6.4): *"Ninguna unidad podrá omitir etapas esenciales ni alterar el orden general del recorrido."*
2. **Planificación antes que escritura** (§7.2): *"La unidad comenzará siempre con una fase de planificación, nunca con la escritura directa."*
3. **Verificación de comprensión antes de escribir** (§7.2): *"El Coach IA verificará primero la comprensión de la consigna antes de permitir que el estudiante escriba."*
4. **Retroalimentación macrotextual antes que microtextual** (§7.2, §9.5): jerarquía de 10 categorías, *"nunca comienza por la gramática"*.
5. **La IA nunca completa la tarea** (§4.4): *"La IA 'nunca' completa la tarea de escritura por el estudiante"*; *"En ningún caso generará la respuesta completa ni redactará el texto por el estudiante"* (§8.5).
6. **No se permite modificar una versión ya enviada** (§13.5) — cualquier cambio genera `WritingVersion` nueva.
7. **Cada entrega pertenece a un único estudiante y a una única tarea; una entrega puede tener múltiples versiones; el borrador se autoguarda** (§13.5).
8. **`WritingTask.delf_level` es `ENUM A1-C2`, con `B2` como único valor operativo del MVP** (18.17).
9. **Tono prohibido, aplicable a toda retroalimentación dentro de Academia** (§8.6): *"Claude evitará utilizar expresiones categóricas como 'incorrecto', 'fallaste' o 'respuesta equivocada'."*
10. **Ningún ecosistema, incluido Academia, se comunica directamente con otro** (§5.7) — toda integración pasa por eventos/Motor de Orquestación.
11. **Ningún módulo se comunica directamente con proveedores de IA** (§9.4) — exclusivamente vía AI Orchestrator.
12. **Todo texto de interfaz vive en `messages/fr.json`/`es.json`, nunca como literal en componente** (18.19) — única excepción: contenido pedagógico generado dinámicamente por el Coach IA/AI Orchestrator.
13. **El contenido priorizado de Academia lo decide el Motor Pedagógico Adaptativo, no el propio módulo ni la IA** (§9.7): *"La IA puede explicar decisiones, nunca decidirlas."*

---

## 9. Dependencias

| Dependencia | Naturaleza | Dirección | Fuente |
|---|---|---|---|
| **Mi Plan** | Consume finalización de tareas de Academia (`LearningTask.source = ACADEMY`) vía evento `EXTERNAL_ACTIVITY_COMPLETED` | Academia → Mi Plan (unidireccional, por evento) | §13.4, `docs/modules/mi-plan.md` L93, L213, L283, L288 |
| **Motor Pedagógico Adaptativo** | Selecciona contenido prioritario dentro de Academia | Motor → Academia (unidireccional) | §9.7 |
| **AI Orchestrator / Feedback Engine / Recommendation Engine / Prompt Engine** | Retroalimentación del paso 8, contenido de "Actividades IA" del paso 7, recomendaciones | Academia → AI Orchestrator (solicitud) → Academia (respuesta validada) | §9.4, §9.6 |
| **Coach IA / Memoria (`CoachMemory`, `CoachContext`, `CoachObservation`)** | El Coach acompaña cada unidad; registra observaciones ligadas a `writing_submission_id` | Bidireccional (Academia genera evento de producción; Coach lee memoria antes de responder) | §8.5, §13.7 |
| **Competencias / Learning Analytics (§13.8)** | Cada `WritingSubmission` de Academia genera `CompetencyAssessment` | Academia → Competencias (productor) | §13.8 |
| **Gamificación** | Finalización de unidades es fuente de eventos de recompensa/XP | Academia → Gamificación (vía evento, patrón ya usado por Mi Plan) | §11.4, `docs/modules/mi-plan.md` L99 |
| **Dashboard** | Consume estado resumido ("Continúa donde te quedaste", "Acceso a los ecosistemas") — nunca al revés | Academia → Dashboard (lectura, nunca llamada directa: *"el Dashboard no consultará directamente la Academia"*, §5.7) | §6.3, §5.7 |
| **Auth/RBAC** | Todo acceso a Academia requiere sesión autenticada vía Clerk y verificación de propiedad del recurso (patrón `StudentId` ya usado por Mi Plan) | Academia depende de (no invierte) | §12, 18.24 (patrón arquitectónico análogo) |
| **Biblioteca de Modelos** | Recurso de consulta, posiblemente compartido con Laboratorio (ver Hallazgo 13.6) | Ambigua | §6.5, §6.6 |

---

## 10. Integración con otros módulos

**Con Dashboard:** unidireccional, solo lectura resumida por parte del Dashboard (bloque 7, "Acceso a los ecosistemas"; bloque 4, "Continúa donde te quedaste" puede referenciar la última unidad de Academia estudiada). Regla dura: el Dashboard nunca consulta Academia directamente (§5.7) — debe pasar por un servicio compartido, exactamente como ya lo hace con Mi Plan (`docs/modules/dashboard.md` L158-160).

**Con Mi Plan:** contrato de integración **ya construido e implementado desde el lado de Mi Plan** (Sprints 3.3.1-3.3.4.2): el enum `LearningTask.source` ya incluye `ACADEMY`; el evento de dominio `EXTERNAL_ACTIVITY_COMPLETED` es el mecanismo formal y único por el cual Academia debe notificar finalización de una `LearningTask` asociada (`docs/modules/mi-plan.md`: *"ningún ecosistema escribe directamente en tablas de Mi Plan"*). Academia, cuando se implemente, deberá **emitir** este evento — actualmente no existe ningún emisor real (Academia no tiene código de producto), por lo que este contrato está definido pero no ejercitado.

**Con IA (AI Orchestrator, Coach IA, Feedback Engine, Recommendation Engine, Motor Pedagógico Adaptativo):** ya detallado en las secciones 6 y 9 de este documento. Academia es, junto con Laboratorio y Simulador, uno de los tres ecosistemas que generan `WritingSubmission` — el dato primario que consumen Feedback Engine, Evaluation Engine (parcialmente, ver más abajo) y Competency Assessment.

**Con DELF (Evaluación/Certificación, §10):** relación indirecta y no unificada explícitamente (18.12): Academia usa las 10 categorías formativas del Coach IA durante el aprendizaje (macro→micro, §9.5); el Simulador/Evaluación Final usa la rúbrica oficial de 5+1 criterios DELF (`RespectConsigne, Coherence, Lexique, Morphosyntaxe, Orthographe` + `RichesseLinguistique`). La tabla de mapeo de 18.12 es la única traducción autorizada entre ambos marcos, pero ninguna fuente indica si la "mini evaluación" del paso 8 de Academia usa el marco formativo, el sumativo, o ambos — ver Pregunta abierta 15.1.

**Con Gamificación:** vía eventos de finalización (patrón ya implementado por Mi Plan), no directamente — sin especificación propia para Academia, se infiere por analogía metodológica, no por evidencia textual directa referida a Academia.

**Con Laboratorio:** relación de secuencia pedagógica, no de dependencia técnica declarada — Academia "construye el conocimiento", Laboratorio "permite experimentar y consolidar" (§8.11) — se infiere un orden lógico (Academia antes de práctica libre en Laboratorio) pero ninguna fuente lo declara como restricción de negocio obligatoria (a diferencia de la secuencia interna de 11 pasos, que sí es obligatoria).

---

## 11. Flujos funcionales

**Flujo de una unidad de Academia (11 pasos, §6.4, obligatorio y sin excepciones):**

Contextualizar → Definir objetivos → Comprender → Observar → Analizar → Practicar → Producir → Recibir retroalimentación → Reescribir → Reflexionar → Desbloquear (siguiente unidad).

**Flujo de retroalimentación dentro del paso 8 (§9.4, Flujo de procesamiento del sistema de IA):** Estudiante produce texto → Solicitud → AI Orchestrator → Construcción del contexto (perfil pedagógico, historial reciente, objetivo de la actividad, nivel DELF, memoria del Coach) → Selección del servicio especializado (Feedback Engine) → Modelo de IA → Validación de la respuesta (no resuelve la actividad, mantiene tono, favorece reflexión) → Respuesta al estudiante → Actualización de la memoria pedagógica.

**Flujo de comportamiento del Coach frente al error (§8.6, aplicable dentro del paso 8/9):** 1) reconoce el esfuerzo, 2) explica el aspecto que requiere atención, 3) ofrece explicación adaptada al nivel, 4) propone una acción concreta de mejora.

**Flujo de cierre de sesión (§8.9, aplicable al completar una unidad de Academia):** 1) resumen del aprendizaje, 2) evidencias de progreso, 3) reflexión metacognitiva, 4) próximo paso (el Dashboard actualiza el plan), 5) despedida del Coach IA. *"El estudiante nunca abandonará la plataforma sin conocer cuál es la actividad que le permitirá continuar avanzando."*

**Flujo de integración con Mi Plan (inferido por el contrato ya definido desde el lado de Mi Plan):** finalización de la unidad → Academia emite `EXTERNAL_ACTIVITY_COMPLETED` (con `student_id`, `learning_task_id` si aplica, tipo de actividad) → Mi Plan actualiza `LearningTask.status = COMPLETED` (regla 18.21: solo si `source != SELF_DIRECTED`, exclusivamente por este evento) → Mi Plan recalcula `LearningProgress`/`DailyPlan`/`WeeklyPlan` → Dashboard refleja el nuevo estado en su siguiente lectura.

**Flujo de priorización de contenido (§9.7, regla "si-entonces"):** competencia bajo el umbral detectada (vía Learning Analytics, §13.8) → Motor Pedagógico Adaptativo prioriza actividades relacionadas → Academia (junto con Laboratorio y Centro de Entrenamiento) recibe la recomendación → se refleja en el mapa de unidades del estudiante.

---

## 12. Riesgos

1. **Riesgo de arrancar el Sprint 4.1 (Modelo de Datos) sin una auditoría funcional/de implementabilidad previa**, a diferencia de Mi Plan, que sí tuvo ambas antes de tocar el esquema (`mi-plan-functional-audit-2026-07-17.md`, `mi-plan-implementability-audit-2026-07-17.md`). Este documento cubre la reconstrucción de especificación exigida por el brief de Sprint 4.0, pero **no sustituye** ese doble ciclo de auditoría — ver Veredicto (sección 17).
2. **Riesgo de romper el contrato de solo-lectura del Dashboard sobre `WritingSubmission`/`WritingDraft`/`ExamAttempt`/`EvaluationResult`/`CoachRecommendation`/`CoachContext`** si el Sprint 4.1 modifica estas 6 tablas ya existentes sin coordinar con las políticas RLS y GRANT ya migradas para el Dashboard (`202607161000_dashboard_read_schema`, `202607170900_dashboard_rls_policies`) — patrón de riesgo idéntico al que motivó la resolución 18.24 en Mi Plan.
3. **Riesgo de ambigüedad de alcance entre Academia y Laboratorio** (§17.2, no completamente resuelta por 18.6 en el nivel de "Biblioteca de Modelos" vs. "Biblioteca temática" — ver Hallazgo 13.6) — podría llevar a duplicar funcionalidad o a un diseño de Domain Layer con solapamiento de responsabilidades entre dos features distintas.
4. **Riesgo de discrepancia entre la secuencia de 11 pasos (§6.4) y el ciclo pedagógico genérico de 9 etapas (§7.2)** si se modelan como flujos de estado independientes sin una única máquina de estados — ningún documento fuente los unifica.
5. **Riesgo de deuda técnica análoga a la de Mi Plan** (GRANT/RLS incompletos, campos declarados en el documento consolidado pero nunca migrados) si el Sprint 4.1 no incluye, desde el inicio, la matriz completa GRANT/RLS para las ~14 tablas nuevas de Producción Escrita + Evaluación DELF que aún no existen en el esquema físico.
6. **Riesgo de aplicar el patrón `UnitOfWork.execute(work, studentId?)` de 18.24 de forma mecánica sin volver a evaluar la matriz de permisos real de las nuevas tablas** — el patrón es reutilizable arquitectónicamente, pero la resolución 18.24 fue explícita en que su alcance eran únicamente las tablas de Mi Plan ya cubiertas por GRANT/RLS existente; extenderlo a Academia requiere su propia verificación de matriz, no una copia automática.

---

## 13. Hallazgos

**13.1 — Ausencia total de auditoría funcional/de implementabilidad previa para Academia.** A diferencia de Mi Plan (que tuvo 2 auditorías dedicadas antes de cualquier código), Academia no tiene ningún artefacto en `docs/audits/` que le corresponda. *Fuente: verificación directa de `docs/audits/` en este documento (sección 8, "Current Work" del historial de esta investigación).*

**13.2 — El esquema físico real (`prisma/schema.prisma`) contiene solo 6 de las ~20 entidades documentadas en §13.5/§13.6, todas ellas modeladas como fuente de solo lectura del Dashboard, no como modelo de escritura propio de ningún ecosistema.** *Fuente: `grep -n "^model Writing\|^model Exam\|^model Coach\|^model CriterionScore\|^model Evaluat" prisma/schema.prisma`, verificado en esta investigación; migración `202607161000_dashboard_read_schema`.*

**13.3 — `features/academy/` y `features/laboratory/` existen como scaffolding vacío idéntico** (mismas 9 subcarpetas con `.gitkeep`, mismo README genérico, misma frase *"Sin lógica de producto todavía — pendiente de desarrollo"*), confirmando que no hay ningún código, tipo o lógica preexistente que deba reconciliarse con esta especificación. *Fuente: verificación directa en esta investigación.*

**13.4 — Ninguna migración `06_writing` ni `07_delf_evaluation` existe todavía**, pese a estar nombradas explícitamente en el orden de migraciones iniciales previsto (§13.14). Las únicas migraciones existentes son `01` (dashboard read schema, parcial), `02`/renombrado de constraints, y las de Mi Plan (`05_learning_plan` equivalente). *Fuente: `ls prisma/migrations/`, verificado en esta investigación.*

**13.5 — El nombre de ruta/carpeta ya está resuelto y aplicado (`academy`), pero el nombre de "espacio de navegación" completo tiene tres variantes activas simultáneamente en el propio documento consolidado sin que 18.6 las unifique del todo:** "Academia (de Escritura)" (18.6, tabla de nomenclatura oficial), "Academia DELF B2" (§6.4, título de sección), y "Academia" a secas (§8.3, arquitectura de navegación de 9 espacios; §6.16, columna "Doc 6/Doc 8"). 18.6 solo resuelve cuál nombre prevalece frente a versiones descartadas de fuentes distintas, no fija una única cadena de texto de interfaz a usar en `messages/fr.json`. *Fuente: §6.4, §6.16, §8.3, 18.6 — contraste directo.*

**13.6 — Posible solapamiento no resuelto entre "Biblioteca de Modelos" (§6.5, dentro de la sección de Academia del documento consolidado, entre 6.4 y 6.6) y "Biblioteca temática" (§6.6, explícitamente uno de los "cuatro espacios" del Laboratorio).** Ambas describen un catálogo de textos auténticos/modelo con análisis — ninguna fuente aclara si son la misma entidad compartida, dos catálogos distintos, o si "Biblioteca de Modelos" (§6.5) pertenece realmente a Academia o es una sección históricamente huérfana del Libro Maestro (Doc 1) que Product Architecture (Doc 3) redistribuyó dentro de Laboratorio sin que el documento consolidado lo declare explícitamente. La resolución 18.16 sí menciona conjuntamente "recursos de la Academia y Biblioteca de Modelos" como módulos impactados por la decisión de almacenamiento, lo que sugiere (sin confirmarlo) que Biblioteca de Modelos se considera parte de Academia a efectos de esa resolución. *Fuente: §6.5, §6.6, 18.16 — contraste directo, sin resolución explícita en 18.6.*

**13.7 — La secuencia de 11 pasos de Academia (§6.4) y el ciclo pedagógico genérico de 9 etapas (§7.2) nunca se declaran formalmente equivalentes ni se mapean paso a paso**, pese a compartir núcleo conceptual (comprender/observar/analizar/practicar/retroalimentación/reescribir/reflexionar). *Fuente: comparación directa §6.4 vs. §7.2.*

**13.8 — La jerarquía de 10 categorías de corrección del Coach IA (§9.5) y la rúbrica oficial DELF de 5+1 criterios (§10.2/§13.6) coexisten sin unificación explícita** — reconocido por el propio documento fuente como nota de consolidación en §9.5 (*"no están explícitamente unificados en una única tabla de mapeo en ninguno de los documentos fuente"*) y parcialmente cerrado por 18.12 (tabla de traducción autorizada), pero 18.12 no especifica **cuál** marco usa la "mini evaluación" del paso 8 de Academia — ver Pregunta abierta 15.1.

---

## 14. Vacíos detectados

**14.1 — Condición de desbloqueo de la siguiente unidad no está especificada.** Ninguna fuente indica el criterio exacto (¿aprobar la mini evaluación con un umbral mínimo?, ¿completar todos los 11 pasos sin importar el resultado?, ¿requiere revisión del profesor?) que determina cuándo el paso 11 ("Desbloquear") se activa.

**14.2 — No existe una entidad de dominio documentada para representar "unidad de Academia" ni su relación con `WritingTask`.** El modelo de §13.5 modela producciones (`WritingSubmission`) y tareas de escritura (`WritingTask`), pero no el contenido editorial teórico de la parte 1 ("Academia DELF B2": estructura del examen, rúbricas, estrategias, consejos del examinador) ni el concepto de "unidad" con estado de progreso/desbloqueo por estudiante.

**14.3 — No existe especificación de permisos/roles específica para Academia** (más allá de las reglas genéricas de RBAC de §12 y del patrón ya usado por Mi Plan) — en particular, no se especifica si el Profesor puede asignar unidades concretas de Academia a un grupo, ni si el Administrador edita el contenido de Academia mediante el mismo mecanismo que usa para Laboratorio/Simulador o uno propio.

**14.4 — No existe matriz GRANT/RLS documentada para ninguna de las ~14 tablas nuevas de Producción Escrita/Evaluación DELF** que Academia necesitaría escribir (a diferencia de Mi Plan, que sí tuvo su matriz diseñada explícitamente en el Sprint previo a la implementación del Domain Layer, según el historial de tareas de este proyecto).

**14.5 — No existe ningún prompt específico de Academia en el Prompt Repository** (`prompts/academy/index.ts` no existe; las categorías actuales son `grammar, simulation, feedback, recommendations, coach, evaluation, writing`) — no está claro si Academia reutiliza `writing`/`feedback`/`coach` sin categoría propia, o si falta crear una categoría dedicada, dado que Academia tiene un tipo de interacción propio (retroalimentación formativa dentro de una secuencia de 11 pasos fija) distinto del de Laboratorio (práctica libre) o Simulador (evaluación bajo condiciones de examen).

---

## 15. Preguntas abiertas

**15.1 — ¿La "mini evaluación" del paso 8 de la secuencia de Academia usa la jerarquía de 10 categorías del Coach IA (§9.5, formativa) o la rúbrica oficial DELF de 5+1 criterios (§10.2, sumativa), o ambas?** 18.12 fija la tabla de traducción entre ambos marcos, pero no asigna cuál se usa dentro de Academia específicamente (solo aclara que la rúbrica oficial es "de uso sumativo en Evaluación Final y Simulador").

**15.2 — ¿"Biblioteca de Modelos" (§6.5) es una entidad/pantalla propia de Academia, un componente compartido con "Biblioteca temática" de Laboratorio (§6.6), o dos catálogos distintos?** Ver Hallazgo 13.6.

**15.3 — ¿Qué nivel de control tiene el Profesor sobre el contenido/progreso de Academia de sus estudiantes?** §6.14 solo menciona "asignar actividades" y "ver las producciones escritas" de forma genérica, sin especificar si esto incluye asignar/desbloquear unidades concretas de Academia.

**15.4 — ¿Cuál es el criterio exacto de desbloqueo progresivo entre unidades?** Ver Vacío 14.1.

**15.5 — ¿La "Academia DELF B2" (parte teórica, contenido sobre estructura/criterios del examen) y "Conoce el DELF / Introducción al DELF B2" (18.6, ecosistema #3 de la tabla de nomenclatura oficial, distinto de Academia #4) son el mismo contenido, contenido parcialmente superpuesto, o dos cosas completamente distintas?** 18.6 los declara como dos ecosistemas oficiales *diferentes* (#3 y #4 de la tabla), pero §6.4 describe "Academia DELF B2" (mencionado literalmente en el título de la sección de Academia) con contenido que suena idéntico al de "Conoce el DELF": *"¿Cómo funciona la producción escrita del DELF B2?; criterios oficiales de evaluación; ... estrategias para el examen"*. Esta es la contradicción de mayor severidad detectada en esta investigación, porque afecta directamente el alcance/arquitectura del módulo — ver Veredicto.

**15.6 — ¿Debe Academia emitir `EXTERNAL_ACTIVITY_COMPLETED` por cada paso de la secuencia de 11 pasos, o solo al completar la unidad completa (paso 11, "Desbloquear")?** El contrato de Mi Plan (`docs/modules/mi-plan.md`) especifica el evento pero no el nivel de granularidad que debe emitir un ecosistema productor como Academia.

---

## 16. Recomendaciones

1. **No iniciar el Sprint 4.1 (Modelo de Datos) directamente.** Seguir la misma metodología ya probada exitosamente en Mi Plan: (a) auditoría funcional dedicada de Academia (equivalente a `mi-plan-functional-audit-2026-07-17.md`), (b) auditoría de implementabilidad (equivalente a `mi-plan-implementability-audit-2026-07-17.md`), (c) recién entonces diseño del Domain Layer.
2. **Emitir al menos una resolución arquitectónica (18.25 o la que corresponda) que resuelva explícitamente la Pregunta abierta 15.5** (relación exacta entre "Academia DELF B2"/§6.4 y "Conoce el DELF"/18.6-#3) antes de definir el alcance final de `features/academy/`, dado que la respuesta determina si parte del contenido hoy descrito bajo "Academia" en §6.4 pertenece en realidad a un ecosistema distinto (`about-delf`, según la ruta ya reservada en 18.19) que aún no tiene ningún desarrollo ni especificación propia.
3. **Resolver el Hallazgo 13.6 (Biblioteca de Modelos vs. Biblioteca temática) antes de modelar cualquier entidad de catálogo de textos**, para evitar construir dos veces la misma capacidad en dos features distintas.
4. **Diseñar la matriz GRANT/RLS completa de las tablas de Producción Escrita/Evaluación DELF antes de escribir cualquier migración**, replicando el proceso ya usado en Mi Plan (matriz de roles/GRANT diseñada como tarea explícita antes de tocar `schema.prisma`), para no repetir la deuda que motivó la resolución 18.24.
5. **Definir explícitamente la relación entre la secuencia de 11 pasos de Academia y el ciclo pedagógico de 9 etapas** como parte de la auditoría funcional recomendada en el punto 1, para que el Domain Layer modele un único flujo de estados, no dos superpuestos.
6. **Aclarar, en la misma auditoría funcional, si Academia necesita categoría propia en el Prompt Repository** (Vacío 14.5) antes de implementar cualquier Server Action que invoque el AI Orchestrator desde `features/academy/actions/`.

---

## 17. Veredicto

**🟡 La especificación de Academia, tal como existe hoy en la documentación consolidada, NO está lista para iniciar el Sprint 4.1 (Modelo de Datos) sin antes emitir nuevas resoluciones arquitectónicas y completar el ciclo de auditoría que Mi Plan sí completó antes de su propio Sprint de datos.**

Justificación, en los mismos términos que el propio corpus exige para autorizar el inicio de un sprint de datos (ver precedente directo: Mi Plan no avanzó a su Domain Layer hasta después de `mi-plan-functional-audit-2026-07-17.md` → `mi-plan-implementability-audit-2026-07-17.md` → resoluciones 18.20-18.23):

- Existe una contradicción de alcance no resuelta y de severidad alta (Pregunta abierta 15.5) entre "Academia DELF B2" (§6.4, título literal de la sección) y "Conoce el DELF / Introducción al DELF B2" (18.6, ecosistema oficial #3, explícitamente distinto de Academia #4) — ambos describen, con las mismas palabras, contenido teórico sobre el examen. Diseñar el modelo de datos sin resolver esto arriesga construir el ecosistema equivocado o duplicar contenido entre dos features.
- El modelo de datos físico real cubre menos del 30% de las entidades documentadas para Producción Escrita/Evaluación DELF (Hallazgo 13.2), y no existe matriz GRANT/RLS diseñada para el resto (Vacío 14.4) — el mismo tipo de vacío que, sin resolverse antes del Sprint de datos, generó la deuda técnica que después motivó la resolución 18.24 en Mi Plan.
- Existen al menos dos ambigüedades de modelo conceptual sin resolver (Hallazgos 13.6 y 13.7) que afectan directamente qué entidades/agregados debe definir el Domain Layer.

**Condición de salida hacia 🟢:** completar los puntos 1-4 de la sección 16 (Recomendaciones) — como mínimo, una auditoría funcional dedicada y una resolución que cierre la Pregunta abierta 15.5 — antes de autorizar el Sprint 4.1.
