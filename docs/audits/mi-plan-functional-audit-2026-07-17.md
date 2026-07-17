# Auditoría funcional del módulo "Mi Plan" — previa a desarrollo

**Rol:** Arquitecto de Software Senior / Product Owner Técnico / Auditor de Sistemas. **Fecha:** 2026-07-17.
**Fuente única de verdad:** `02_Conocimiento_Consolidado_Resuelto.md` (secciones 4.3, 5.5–5.7, 6.2–6.3, 6.12, 8.7–8.11, 9.4, 9.7, 11.4, 12.2–12.4, 13.2, 13.4, 13.9–13.10, 13.13–13.15, 14, 16, 17, 18) y artefactos ya construidos del proyecto (`prisma/schema.prisma`, `docs/modules/dashboard.md`, `ARCHITECTURE.md`, `config/navigation.ts`, `config/routes.ts`, `messages/fr.json`/`es.json`, `features/my-plan/` — actualmente vacío).
**Alcance de este documento:** exclusivamente análisis y auditoría. No contiene código, diseño de interfaz ni propuestas de solución.

---

# 1. Objetivo del módulo

**Propósito pedagógico.** El documento fuente lo describe sin ambigüedad: *"Este módulo no existía en nuestra primera propuesta, pero ahora creo que es imprescindible. Será el 'GPS' del estudiante"* (sección 6.12, Doc 3). Su función es traducir un objetivo abstracto ("aprobar el DELF B2") en una ruta concreta, temporal y medible: fecha del examen, tiempo restante, horas recomendadas, calendario de entrenamiento y metas semanales. No enseña contenido pedagógico por sí mismo (eso corresponde a Academia/Laboratorio/Entrenamiento) — organiza *cuándo* y *cuánto* debe entrenar el estudiante para llegar preparado a la fecha del examen.

**Propósito funcional.** Es la única fuente de verdad sobre la planificación temporal del estudiante. Section 6.12 lo declara explícitamente: *"El Dashboard tomará la información de aquí para decidir qué mostrar cada día."* Esto establece una relación de dependencia unidireccional clara: Mi Plan produce el calendario/objetivos: Dashboard los consume y resume (ya implementado como "vista resumida", bloque 3 del Dashboard — sección 6.3).

**Contribución al entrenamiento de Producción Escrita DELF B2.** Mi Plan no evalúa ni corrige texto (eso es Evaluación DELF / Coach IA / Laboratorio); su contribución es indirecta pero estructural: distribuye en el tiempo la carga de trabajo necesaria para llegar al nivel objetivo, y se reorganiza automáticamente cuando la realidad del estudiante diverge del plan (interrupciones, cambios de fecha, cambios de disponibilidad — secciones 5.6, 8.8, 9.7). Sin Mi Plan, el resto de ecosistemas (Academia, Laboratorio, Entrenamiento, Simulador) no tendrían un criterio temporal de priorización.

**Papel en el ecosistema Redaction Lab.** La síntesis integradora del propio documento (sección 8.11) lo resume así: *"El Dashboard organiza el recorrido del estudiante. Mi Plan estructura el entrenamiento a largo plazo."* Es uno de los 8 dominios de información transversales del perfil pedagógico unificado (sección 5.6: Academia, Laboratorio, Entrenamiento, Simulación, Evolución, **Mi Plan**, Dashboard, Coach IA) y aparece en la cadena conceptual de relaciones de toda la plataforma (sección 5.5): *"...retroalimentaciones alimentan la memoria del Coach → memoria modifica Mi Plan → Mi Plan genera nuevos entrenamientos."* Es, junto con el Dashboard, uno de los dos únicos ecosistemas que se crean automáticamente durante el registro, antes de que el estudiante realice ninguna acción manual (sección 12.4, paso 5).

---

# 2. Funcionalidades identificadas

| # | Funcionalidad | Objetivo | Descripción | Prioridad | Dependencias | Módulo relacionado |
|---|---|---|---|---|---|---|
| 1 | Creación automática del plan inicial | Garantizar que todo estudiante tenga un plan desde el primer segundo | Al finalizar el onboarding (diagnóstico inicial), se crea automáticamente `LearningPlan` con fecha de examen, objetivo (25/25), entrenamiento recomendado diario y horas estimadas (ejemplo dado: 35 min/día, 95h totales — sección 6.2, 12.4) | Alta (MUST, flujo de registro obligatorio) | Perfil pedagógico inicial, Memoria del Coach ya inicializada | Autenticación/Onboarding (12.4), Coach IA |
| 2 | Cuenta regresiva al examen | Dar urgencia y contexto temporal | Días restantes hasta `target_exam_date`, recalculado en cada visualización | Alta | `StudentProfile.target_exam_date` (ya existe en schema) | Dashboard (consume el dato) |
| 3 | Horas estudiadas vs. horas recomendadas | Medir cumplimiento real vs. plan | Comparación entre tiempo efectivamente entrenado y el estimado por el plan | Alta | `DailyPlan`/`WeeklyPlan` (completed_minutes vs estimated_minutes) | Evolución, Gamificación (XP) |
| 4 | Calendario de entrenamiento (vista completa) | Mostrar la distribución temporal completa del plan, no solo el resumen | Vista de calendario/timeline con sesiones planificadas — más allá de la "vista resumida" ya embebida en el Dashboard (sección 6.3, bloque 3) | Alta | `DailyPlan`, `WeeklyPlan`, `StudySchedule` (no implementada aún) | Dashboard (ya consume un subconjunto) |
| 5 | Porcentaje de avance del plan | Responder "¿cómo voy?" | % calculado automáticamente a partir de tareas completadas (`LearningProgress`, regla MUST 13.4) | Alta | `LearningTask.status`, `LearningPhase` (no implementadas aún) | Dashboard, Evolución |
| 6 | Metas semanales | Fraccionar el objetivo global en unidades manejables | Objetivo semanal de sesiones/minutos (`WeeklyPlan`) | Alta | `LearningPlan` | Gamificación (rachas/misiones semanales) |
| 7 | Objetivos personalizados (Goals/Objectives) | Estructurar el plan en metas concretas con prioridad | `LearningGoal` (con prioridad LOW/MEDIUM/HIGH/CRITICAL) y `LearningObjective` (ordenados) por plan — entidades documentadas en 13.4 pero no implementadas | Alta (regla MUST: "cada plan debe contener al menos un objetivo") | `LearningPlan` | Coach IA (recomendaciones), Competencias |
| 8 | Fases y tareas del plan | Desglosar el entrenamiento en unidades ejecutables y fechadas | `LearningPhase` (con orden y fechas) → `LearningTask` (con dificultad, minutos estimados, fecha límite) — no implementadas | Alta (base del cálculo de `LearningProgress`) | `LearningPlan` | Academia/Laboratorio/Entrenamiento (posible origen de tareas, no especificado) |
| 9 | Configuración del horario de estudio | Capturar disponibilidad para poder planificar | `StudySchedule`: días/semana, sesiones/día, minutos/sesión, hora de recordatorio — 1:1 con `LearningPlan`, no implementada | Media-Alta | `LearningPlan` | Notificaciones (`reminder_time` → evento `PLAN_REMINDER`) |
| 10 | Registro de sesiones de estudio | Trazabilidad real del tiempo invertido por tarea | `StudySession` (inicio, fin, duración, completada) asociada a una `LearningTask` — no implementada | Media | `LearningTask` | Gamificación (fuente de XP `ACTIVITY`), Evolución |
| 11 | Reprogramación manual del plan | Permitir que el estudiante ajuste el plan si cambia la fecha del examen o su disponibilidad | Mencionada explícitamente ("posibilidad de reprogramar el plan si cambian las fechas", 6.12) sin especificar si es una acción manual del usuario, una llamada al Learning Planner, o ambas | Media (ambigua, ver sección 11) | Motor Pedagógico Adaptativo | Coach IA / Learning Planner |
| 12 | Reorganización automática por inactividad | Recuperar el ritmo tras abandono | Si el estudiante no entrena varios días, Mi Plan reorganiza el calendario automáticamente y el Coach IA ofrece estrategias de reactivación (secciones 5.6, 8.8) | Alta (regla "si-entonces" explícita, 9.7) | Motor Pedagógico Adaptativo, Coach IA | Coach IA, Notificaciones |
| 13 | Generación adaptativa del calendario (Learning Planner) | Producir propuestas de entrenamiento ajustadas al estudiante | El servicio IA "Learning Planner" analiza disponibilidad, progreso, fecha de examen y prioridades, y "colabora con Mi Plan" generando propuestas — la decisión final la toma el Motor Pedagógico Adaptativo, no la IA (9.4, 9.7) | Alta | AI Orchestrator, Motor Pedagógico Adaptativo | Coach IA (Learning Planner) |
| 14 | Vista resumida en el Dashboard | Responder "¿qué debo hacer hoy?" sin salir del Dashboard | **Ya implementada.** Bloque 3 del Dashboard: horas recomendadas semanales, sesiones completadas/pendientes, objetivo diario, progreso semanal (sección 6.3; `features/dashboard`, namespace `dashboard.plan`) | Alta (ya en producción) | `LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress` (ya leídos vía RLS) | Dashboard |
| 15 | Estado "sin plan activo" | Cubrir el caso borde de cero planes `ACTIVE` | El propio Dashboard ya define el mensaje `plan.noPlan` ("No hay un plan activo por el momento"), lo que implica que la regla "solo un plan activo" (13.4) permite, al menos transitoriamente, tener cero planes activos (p. ej. entre un plan `COMPLETED` y la generación del siguiente) | Media (comportamiento no explicado en el documento fuente, ver sección 11) | `LearningPlan.status` | Dashboard |

---

# 3. Flujo completo del usuario

1. **Creación (fuera del control directo del usuario).** Durante el registro (12.4, paso 5) o al finalizar el diagnóstico inicial del onboarding (6.2, paso 3), se crea automáticamente el primer `LearningPlan` con estado `ACTIVE`. El estudiante nunca ejecuta manualmente este paso.
2. **Entrada al módulo.** El estudiante llega a Mi Plan de dos formas: (a) navegación directa desde el menú principal (uno de los 9 espacios — sección 8.3/`config/navigation.ts`), o (b) clic desde el bloque 3 del Dashboard ("Mi Plan — vista resumida", sección 6.3). No hay una tercera vía documentada (p. ej. desde una notificación de recordatorio — plausible pero no especificado).
3. **Estado de carga.** No documentado explícitamente para Mi Plan (a diferencia del Dashboard, que sí define un estado `skeleton` — `dashboard.skeleton.loading`). Por el patrón ya establecido en Dashboard, se asume un estado equivalente, pero no está declarado como requisito para este módulo.
4. **Pantalla principal — decisión de estado:**
   - **Con plan activo:** se muestra fecha del examen, cuenta regresiva, horas estudiadas/recomendadas, calendario de entrenamiento, % de avance, metas semanales, objetivos personalizados (6.12).
   - **Sin plan activo** (estado ya anticipado por el mensaje `plan.noPlan` del Dashboard): comportamiento no descrito por el documento fuente para la vista completa de Mi Plan — vacío de documentación (ver sección 12).
5. **Navegación interna (no especificada en detalle).** El documento no numera "bloques" o pantallas internas de Mi Plan como sí lo hace para el Dashboard (6.3) o la Evaluación Final (10.2). Se infiere, a partir de las entidades de 13.4, que la información se organiza en al menos: resumen general (plan/cuenta regresiva), calendario (Daily/WeeklyPlan), objetivos (Goals/Objectives), fases/tareas (Phases/Tasks) y configuración de horario (StudySchedule) — pero el documento no confirma si son pantallas separadas, tabs, o una única vista con scroll.
6. **Decisión: reprogramar el plan.** El estudiante puede iniciar una reprogramación (6.12: "posibilidad de reprogramar el plan si cambian las fechas"). No se especifica el flujo exacto (¿formulario? ¿confirmación? ¿quién recalcula: el estudiante edita datos y el Motor Pedagógico recalcula, o el estudiante edita directamente el calendario?).
7. **Reacción automática sin intervención del usuario.** Independientemente de si el estudiante abre el módulo, el sistema puede reorganizar el plan por eventos externos: interrupción de varios días (5.6, 9.7), finalización de una actividad en otro ecosistema (5.6: "Mi Plan reorganiza las siguientes sesiones"), o evaluación de una producción escrita (5.7: la actualización de Mi Plan es un paso obligatorio de la secuencia "Entrega del texto → ... → Actualización de Mi Plan → Actualización del Dashboard...").
8. **Persistencia.** Todo cambio de estado (tarea completada, sesión de estudio, reprogramación) se persiste inmediatamente en base de datos (no hay mención de estado "borrador" o "sin guardar" para Mi Plan, a diferencia de `WritingDraft` en Producción Escrita). El % de avance (`LearningProgress`) se recalcula automáticamente, nunca se edita manualmente (regla MUST 13.4).
9. **Salida del módulo / cierre de sesión de trabajo.** El documento define un patrón general de cierre de sesión (8.9, "Cierre y continuidad del aprendizaje") que incluye como paso 4 "Dashboard actualiza el plan y muestra la siguiente recomendación" — es decir, el punto de salida "natural" documentado no es Mi Plan mismo, sino que el flujo devuelve al estudiante hacia el Dashboard con la siguiente acción recomendada (regla de continuidad, 6.3: "la plataforma no regresará automáticamente al menú principal").

**Nota de reconstrucción:** los pasos 1, 2, 4 (estado "con plan"), 7 y 8 están directamente respaldados por texto explícito del documento. Los pasos 3, 4 (estado "sin plan"), 5 y 6 son inferencias razonables a partir de patrones ya usados en otros módulos (Dashboard) o de las entidades de datos — se marcan como tales y se listan como vacíos de documentación en la sección 12.

---

# 4. Componentes de interfaz

Identificados únicamente (sin diseñar), agrupados por función. Se marca con **(Dashboard)** los que ya existen como componente real en `features/dashboard` y serían candidatos a reutilización, no a reconstrucción.

**Resumen y estado general**
- Card de cuenta regresiva (fecha de examen + días restantes)
- Card/indicador de objetivo (nivel actual → nivel objetivo, ej. "25/25")
- Barra o anillo de progreso general del plan (% de avance)
- Indicador de horas estudiadas vs. horas recomendadas

**Planificación temporal**
- Calendario de entrenamiento (vista mensual/semanal)
- Timeline de fases del plan (`LearningPhase`)
- Lista/tablero de tareas por fase (`LearningTask`), con indicador de dificultad y estado
- Indicador de meta semanal (sesiones/minutos) — **(Dashboard, ya existe como resumen: `plan.weeklyGoal`, `plan.minutesCompleted`)**
- Indicador de objetivo diario — **(Dashboard: `plan.dailyGoal`)**

**Objetivos**
- Lista de objetivos personalizados (`LearningGoal`) con etiqueta de prioridad (Baja/Media/Alta/Crítica)
- Sub-lista de objetivos específicos por meta (`LearningObjective`), con indicador de orden/checkbox de completado

**Configuración del plan**
- Panel/formulario de configuración de horario de estudio (días por semana, sesiones por día, minutos por sesión)
- Selector de hora de recordatorio (time picker)
- Botón/flujo de reprogramación del plan (cambio de fecha de examen o disponibilidad)

**Sesiones de estudio**
- Historial de sesiones de estudio (fecha, duración, tarea asociada, completada/no completada)
- Indicador de sesión en curso (si aplica — no especificado si Mi Plan soporta "sesión activa" en tiempo real o solo registro posterior)

**Estados del sistema**
- Estado vacío ("sin plan activo")
- Estado de carga (skeleton, por analogía con Dashboard)
- Estado de error (por analogía con Dashboard: `dashboard.error.*`)
- Alerta/aviso de reorganización automática (notificar al estudiante que el plan cambió sin su intervención — necesaria por transparencia, dado el principio 8.8: "la plataforma explica transparentemente por qué recomienda algo", aunque no está explícitamente pedida para Mi Plan)

**Navegación interna**
- Tabs o navegación secundaria (si el módulo se organiza en secciones — resumen / calendario / objetivos / configuración), no confirmado por el documento

**Botones y acciones**
- CTA "Comenzar entrenamiento" / continuar sesión (patrón ya usado en Dashboard, `PrimaryTrainingCTA`)
- Botón de reprogramar plan
- Botón de guardar configuración de horario

**Modales/diálogos**
- Modal de confirmación de reprogramación (implícito, no especificado si existe confirmación antes de aplicar cambios)

---

# 5. Reglas de negocio

Extraídas literalmente o derivadas directamente de reglas MUST del documento (13.4, 5.6, 9.7, 11.4, 8.8), sin interpretación libre:

1. **Un estudiante puede tener múltiples planes, pero solo uno activo** (`LearningPlan.status = ACTIVE`, regla MUST 13.4). Implica que planes previos pueden quedar en `PAUSED`, `COMPLETED` o `CANCELLED`.
2. **Todo plan debe contener al menos un objetivo** (`LearningGoal`) — un plan sin metas no es válido (13.4, MUST).
3. **Jerarquía de pertenencia estricta, sin excepciones:** cada objetivo pertenece a un único plan; cada fase pertenece a un único plan; cada tarea pertenece a una única fase; cada sesión de estudio se asocia a una única tarea (13.4, MUST).
4. **El progreso se calcula automáticamente, nunca se edita manualmente:** "el progreso se calcula automáticamente a partir de las tareas completadas" (13.4). No existe, en ninguna parte del documento, una operación de "editar % de avance" por el estudiante.
5. **El % de avance se mantiene siempre entre 0 y 100** (13.4, MUST — coincide con la restricción CHECK ya aplicada a `LearningProgress.completion_percentage`, `DailyPlan.completion_percentage` y `WeeklyPlan.completion_percentage` en el esquema físico existente).
6. **Reorganización automática por inactividad:** "si el estudiante abandona varios días → reorganizar Mi Plan + sesión de reactivación" (regla "si-entonces" explícita, 9.7). El disparador es temporal (ausencia de actividad), no una acción del usuario.
7. **Reorganización automática por eventos de otros ecosistemas:** al finalizar una actividad en la Academia, "Mi Plan reorganiza las siguientes sesiones" (5.6) — el plan reacciona a eventos externos, no solo a su propio calendario.
8. **Adaptación ante cambios de fecha/disponibilidad:** "Mi Plan se reorganiza automáticamente ante cambios de fecha/disponibilidad" (8.8, nivel 1 de personalización).
9. **La decisión final del calendario no la toma la IA:** el Learning Planner (servicio de IA) *propone*; la autoridad pedagógica final recae en el Motor Pedagógico Adaptativo, que es "completamente independiente del modelo de IA" (9.7). "La IA puede explicar decisiones, nunca decidirlas."
10. **Toda decisión debe ser explicable y trazable; ninguna decisión depende del azar** (9.7, regla general del Motor Pedagógico, aplicable a las decisiones que genera para Mi Plan).
11. **Mi Plan no accede directamente a otros ecosistemas.** "La Academia no modificará Mi Plan; Mi Plan no actualizará la memoria del Coach IA" — toda comunicación pasa por el Motor de Orquestación o servicios compartidos (5.7, regla arquitectónica MUST).
12. **Orden obligatorio en el flujo de producción escrita:** la actualización de Mi Plan ocurre después del Motor Pedagógico y antes de la actualización del Dashboard, dentro de la secuencia obligatoria de evaluación de una producción (5.7).
13. **Las recomendaciones de reorganización son sugerencias, no imposiciones:** "el estudiante conserva el control; las recomendaciones son sugerencias, no obligaciones" (8.8) — implica que toda reorganización automática debería poder revisarse/ajustarse por el estudiante, aunque el mecanismo concreto no está especificado (ver sección 12).
14. **Restricciones generales de esquema aplicables (13.4, sección de restricciones del Cap. 4):** no almacenar información redundante; no eliminar historiales pedagógicos relevantes; no acoplar el modelo a un proveedor de IA específico.
15. **Gamificación asociada (11.4, MUST, aplicable indirectamente vía sesiones/tareas completadas):** toda experiencia (XP) debe registrarse en `XPTransaction`; la racha (`Streak`) se actualiza automáticamente al completar actividades válidas y se reinicia si transcurre un día sin actividad — Mi Plan es la fuente natural de qué cuenta como "actividad válida" del día (sesión de estudio / tarea completada), pero el documento no lo vincula explícitamente tabla-a-tabla.

---

# 6. Modelo de datos

**Entidades documentadas (13.4, capítulo 4 — autoritativo por resolución 18.3):** `LearningPlan, LearningGoal, LearningObjective, LearningPhase, LearningTask, StudySchedule, StudySession, LearningProgress, DailyPlan, WeeklyPlan`.

| Entidad | Propósito | Relaciones | Estado en `schema.prisma` | Dependencias |
|---|---|---|---|---|
| `LearningPlan` | Plan raíz del estudiante; contenedor de todo lo demás | User 1:N LearningPlan | **Existe** (subconjunto de columnas: id, student_id, name, description, target_level, start_date, end_date, status, timestamps) — creado para el Dashboard (solo lectura, RLS `SELECT`) | `User` |
| `LearningGoal` | Metas del plan, con prioridad | LearningPlan 1:N LearningGoal; LearningGoal 1:N LearningObjective | **No existe** | `LearningPlan` |
| `LearningObjective` | Objetivos específicos de una meta, ordenados | LearningGoal 1:N LearningObjective | **No existe** | `LearningGoal` |
| `LearningPhase` | Fases temporales del plan | LearningPlan 1:N LearningPhase; LearningPhase 1:N LearningTask | **No existe** | `LearningPlan` |
| `LearningTask` | Tareas concretas, con dificultad y fecha límite | LearningPhase 1:N LearningTask; LearningTask 1:N StudySession | **No existe** | `LearningPhase` |
| `StudySchedule` | Configuración de disponibilidad/horario | LearningPlan 1:1 StudySchedule | **No existe** | `LearningPlan` |
| `StudySession` | Registro de sesiones de estudio reales | LearningTask 1:N StudySession; User 1:N StudySession | **No existe** | `LearningTask`, `User` |
| `LearningProgress` | Progreso agregado y calculado del plan | LearningPlan 1:1 LearningProgress | **Existe** (solo lectura, ya usado por Dashboard) | `LearningPlan` |
| `DailyPlan` | Distribución diaria del plan | LearningPlan 1:N DailyPlan | **Existe** (solo lectura, ya usado por Dashboard) | `LearningPlan` |
| `WeeklyPlan` | Distribución semanal del plan | LearningPlan 1:N WeeklyPlan | **Existe** (solo lectura, ya usado por Dashboard) | `LearningPlan` |

**Veredicto de suficiencia: la estructura existente NO es suficiente.** De las 10 entidades que 13.4 define como el modelo completo del módulo, solo 4 (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`) existen físicamente, y las 4 fueron creadas exclusivamente como **subconjunto de solo lectura** para alimentar el widget resumido del Dashboard (`docs/modules/dashboard.md`, sección 10: "el Dashboard solo lee, nunca escribe"). Ninguna de las 4 tiene, hoy, una vía de escritura desde la aplicación (no hay `services/`, `repositories` de escritura, ni Server Actions para ellas). Las 6 entidades restantes (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`, `StudySchedule`, `StudySession`) — que son precisamente las que sostienen objetivos personalizados, fases, tareas, horario y sesiones — **no existen en ninguna forma** en el proyecto actual.

**Consecuencia de versionado (13.14):** el orden canónico de migraciones sitúa `05_learning_plan` inmediatamente después de `04_academic_structure`. Las tablas ya existentes se crearon fuera de ese orden, de forma deliberada y ya documentada (`docs/modules/dashboard.md`: "se adelantan estas tablas fuera del orden estricto... porque el Dashboard... no puede funcionar de forma realista sin ellas"). La implementación de Mi Plan deberá **añadir** las 6 tablas faltantes mediante una migración nueva y compatible (13.15: "evolución de columnas... permitido agregar relaciones opcionales"), sin modificar ni renombrar las 4 tablas ya publicadas — cualquier alteración de sus columnas/relaciones actuales sería un cambio incompatible prohibido por 13.14/13.15 salvo versión MAJOR.

**Hallazgo de solapamiento no resuelto (ver también sección 11):** la sección 12.2 ubica "disponibilidad semanal" dentro del dominio "Perfil pedagógico", y la tabla `LearningPreference` (13.2) ya contiene `daily_goal_minutes` y `weekly_goal_sessions` — campos conceptualmente idénticos a los de `StudySchedule` (13.4: `days_per_week, sessions_per_day, minutes_per_session`). El documento nunca aclara si `StudySchedule` es la fuente de verdad de la disponibilidad y `LearningPreference` es solo un valor por defecto de configuración general, o si son dos conceptos independientes que podrían desincronizarse.

---

# 7. Dependencias con otros módulos

- **Dashboard:** relación de consumo unidireccional ya implementada. Dashboard lee `LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress` en modo solo lectura (RLS `SELECT`, sin `INSERT`/`UPDATE`) para su bloque 3 ("vista resumida"). Mi Plan es la fuente; Dashboard nunca escribe en estas tablas (docs/modules/dashboard.md, sección 10). Regla explícita: "El Dashboard tomará la información de aquí para decidir qué mostrar cada día" (6.12).
- **Laboratorio:** sin relación directa documentada explícitamente distinta de la regla general de orquestación (5.7: Mi Plan reacciona a eventos generados en otros ecosistemas, pero nunca los consulta directamente). No hay tabla ni evento específico que vincule `LearningTask` con actividades del Laboratorio.
- **Mentor IA / Coach IA:** relación bidireccional pero mediada, nunca directa (regla explícita 5.7: "Mi Plan no actualizará la memoria del Coach IA"). El Coach IA (vía el servicio "Learning Planner", parte del AI Orchestrator) analiza disponibilidad/progreso/fecha de examen/prioridades y genera *propuestas* de calendario; la aplicación de esas propuestas al plan real pasa por el Motor Pedagógico Adaptativo, no por una llamada directa Coach→Mi Plan (9.4, 9.7). `CoachContext.current_plan_id` (13.7, ya implementado en `schema.prisma`) es el único enlace físico documentado entre Coach IA y Mi Plan.
- **Evaluación (DELF/Producción Escrita):** dependencia de evento explícita y ordenada (5.7): al evaluarse una producción escrita, la secuencia obligatoria incluye "Actualización de Mi Plan" como paso posterior al Motor Pedagógico y anterior a la actualización del Dashboard. El mecanismo exacto (¿qué cambia en el plan tras una evaluación? ¿se marca una tarea como completada automáticamente?) no está especificado.
- **Gamificación:** dependencia funcional plausible pero no formalizada tabla-a-tabla. Las sesiones de estudio/tareas completadas de Mi Plan son candidatas naturales a generar `XPTransaction` (fuente `ACTIVITY`) y a alimentar `Streak`, pero 11.4 no menciona `StudySession`/`LearningTask` como disparadores explícitos — es una inferencia razonable, no una regla documentada.
- **Perfil:** relación de lectura de datos base. `StudentProfile.target_exam_date` (ya en schema, añadido durante la implementación del Dashboard para cerrar una omisión de 13.2 frente a 12.2) es insumo directo de la cuenta regresiva de Mi Plan. Posible solapamiento con `LearningPreference` (ver sección 6, hallazgo de solapamiento).
- **Configuración:** sin dependencia documentada explícita más allá de las preferencias generales de notificaciones (`NotificationPreference`, 13.2/13.10), relevantes si `StudySchedule.reminder_time` dispara notificaciones.
- **Panel Docente:** sin relación documentada. El Panel Docente (6.14) "sigue el progreso de cada estudiante" y "consulta estadísticas", pero el documento no especifica si eso incluye visibilidad sobre el plan individual del estudiante o solo agregados de Evolución/Analíticas.
- **Base de datos:** ver sección 6 — 4 de 10 tablas existen (solo lectura), 6 no existen.
- **APIs/Servicios:** por regla arquitectónica general (5.7), Mi Plan no debe exponer lógica directamente en componentes; toda comunicación con Coach IA/Motor Pedagógico pasa por el Motor de Orquestación. No existe hoy ningún servicio (`services/`) ni acción de escritura para las entidades de Mi Plan.

---

# 8. Integración con IA

**Rol exacto de la IA:** el servicio "Learning Planner" (parte del AI Orchestrator, sección 9.4) *"colabora con Mi Plan; analiza disponibilidad, progreso, fecha del examen, prioridades; genera propuestas adaptativas"* (9.4, 9.7 tabla de integración: "Mi Plan | Genera automáticamente el calendario de entrenamiento").

**Qué decisiones toma la IA — y cuáles NO toma.** Esto es una distinción explícita y crítica del documento (9.7): *"No es un modelo de IA ni un sistema de recomendación basado solo en estadísticas: es un sistema de toma de decisiones educativas"* — refiriéndose al **Motor Pedagógico Adaptativo**, que es *"completamente independiente del modelo de IA"* y en quien *"recae la autoridad pedagógica"*. El Coach IA/Learning Planner *"no decide el recorrido, solo lo explica, motiva y contextualiza"*. Es decir: la IA **propone** calendarios/prioridades; el Motor Pedagógico (basado en reglas "si-entonces" explícitas, no en el modelo de lenguaje) **decide** qué se aplica realmente al plan.

**Información que necesita (contexto de entrada, 9.4/9.7):** perfil pedagógico, disponibilidad, progreso actual, fecha del examen, prioridades del estudiante, competencias alcanzadas y prioritarias, historial de actividades, resultados de simulaciones, errores frecuentes, tiempo disponible, regularidad del entrenamiento, memoria pedagógica, objetivos personales, indicadores de Evolución. Regla general aplicable: *"las consultas nunca deberán realizarse utilizando únicamente el último mensaje del usuario"* — el contexto siempre debe reconstruirse completo antes de cada propuesta.

**Información que produce:** propuestas de calendario de entrenamiento adaptado; reorganizaciones sugeridas ante interrupciones o cambios de disponibilidad; (indirectamente, vía Recommendation Engine) recomendaciones de actividades relacionadas con el plan.

**Servicios que consume/con los que colabora:** AI Orchestrator (único componente autorizado a hablar con los modelos de lenguaje — 9.4); Memory Engine (memoria pedagógica); Motor Pedagógico Adaptativo (autoridad final); indirectamente, Recommendation Engine (para las actividades que rellenan el calendario). El documento **no especifica** si "Learning Planner" es un servicio separado invocable de forma independiente o una función interna del Coach IA — se lista como uno de los "servicios especializados" coordinados por el AI Orchestrator, al mismo nivel que Feedback Engine/Evaluation Engine, pero sin arquitectura propia detallada (a diferencia de, por ejemplo, el Feedback Engine, que sí tiene un flujo de 12 pasos documentado en 9.3).

**Restricciones aplicables (9.4, transversales a toda IA de la plataforma):** las claves de proveedor de IA nunca se exponen en cliente; toda respuesta se valida antes de mostrarse (responde a la solicitud, no resuelve completamente la actividad por el estudiante, mantiene el tono del Coach); toda decisión debe ser explicable y trazable, y ninguna depende del azar (9.7).

---

# 9. APIs necesarias

Identificadas únicamente a partir de las funcionalidades de la sección 2 y la arquitectura de servicios (5.7) — sin implementarlas ni definir contratos:

1. Obtener plan activo del estudiante (con datos agregados: cuenta regresiva, % avance, horas).
2. Listar planes históricos del estudiante (no activos).
3. Obtener calendario de entrenamiento (Daily/WeeklyPlan) de un rango de fechas.
4. Obtener objetivos y metas del plan (`LearningGoal`/`LearningObjective`).
5. Obtener fases y tareas del plan (`LearningPhase`/`LearningTask`).
6. Marcar una tarea como completada (dispara recálculo de `LearningProgress` — automático, nunca manual sobre el %).
7. Registrar una sesión de estudio (`StudySession`: inicio/fin/duración/tarea asociada).
8. Obtener/actualizar la configuración de horario de estudio (`StudySchedule`).
9. Solicitar reprogramación del plan (cambio de fecha de examen o disponibilidad) — endpoint que probablemente invoca al Motor Pedagógico/Learning Planner, no una simple actualización de columnas.
10. Endpoint interno (servidor-a-servidor, vía Motor de Orquestación) para que el evento "producción escrita evaluada" dispare la actualización de Mi Plan (5.7) — no expuesto al cliente.
11. Endpoint interno para la reorganización automática por inactividad (probablemente un job programado, no una API síncrona invocada por el usuario).
12. Endpoint de creación automática del plan inicial, invocado por el flujo de registro/onboarding (12.4) — no expuesto directamente al usuario final como acción manual.

No se especifica en el documento si estas operaciones se implementan como Route Handlers REST, Server Actions, o una combinación (la arquitectura general del proyecto ya usa ambos patrones para otros módulos) — decisión de implementación fuera del alcance de esta auditoría.

---

# 10. Casos de uso

**CU-01 — Consultar el plan activo**
- **Actor:** Estudiante autenticado.
- **Objetivo:** Ver el estado actual de su plan de entrenamiento.
- **Precondiciones:** Sesión autenticada (Clerk); el estudiante tiene un perfil pedagógico creado.
- **Flujo principal:** 1) el estudiante navega a Mi Plan (menú o desde el Dashboard); 2) el sistema recupera el `LearningPlan` con `status = ACTIVE`; 3) se muestran cuenta regresiva, horas, calendario, % de avance, metas y objetivos.
- **Flujos alternativos:** 3a) no existe plan `ACTIVE` → se muestra el estado "sin plan activo" (comportamiento exacto no documentado, ver sección 12); 3b) error de carga → estado de error, patrón ya usado en Dashboard.
- **Resultado:** el estudiante tiene visión completa de su planificación.

**CU-02 — Completar una tarea del plan**
- **Actor:** Estudiante autenticado.
- **Objetivo:** Registrar el avance en una tarea concreta.
- **Precondiciones:** Existe un `LearningTask` asignado, perteneciente a una fase del plan activo.
- **Flujo principal:** 1) el estudiante marca la tarea como completada (desde Mi Plan o, más probablemente, tras completar la actividad correspondiente en Academia/Laboratorio/Entrenamiento — no especificado quién dispara el evento); 2) el sistema recalcula automáticamente `LearningProgress`; 3) se actualiza el % de avance del plan y, si corresponde, de la fase.
- **Flujos alternativos:** 2a) la tarea ya estaba completada → operación idempotente (no especificado explícitamente, pero coherente con "no se permite eliminar/duplicar" del resto del documento).
- **Resultado:** progreso actualizado, visible en Mi Plan, Dashboard y Evolución.

**CU-03 — Reorganización automática por inactividad**
- **Actor:** Sistema (Motor Pedagógico Adaptativo), sin intervención directa del estudiante.
- **Objetivo:** Recuperar el ritmo de entrenamiento tras un período de inactividad.
- **Precondiciones:** El estudiante no ha registrado actividad válida durante "varios días" (umbral exacto no especificado).
- **Flujo principal:** 1) el sistema detecta la inactividad; 2) el Motor Pedagógico reorganiza el calendario (`DailyPlan`/`WeeklyPlan` recalculados); 3) el Coach IA genera una recomendación/mensaje de reactivación; 4) el estudiante ve el plan actualizado y el mensaje en su siguiente visita.
- **Flujos alternativos:** ninguno documentado (no se especifica si el estudiante puede rechazar la reorganización).
- **Resultado:** plan realista respecto al nuevo punto de partida del estudiante.

**CU-04 — Reprogramar el plan manualmente**
- **Actor:** Estudiante autenticado.
- **Objetivo:** Ajustar el plan ante un cambio de fecha de examen o disponibilidad.
- **Precondiciones:** Existe un plan activo.
- **Flujo principal:** 1) el estudiante accede a la opción de reprogramar; 2) modifica fecha de examen y/o disponibilidad; 3) el sistema (vía Motor Pedagógico/Learning Planner) recalcula el calendario completo; 4) se muestra el plan actualizado.
- **Flujos alternativos:** no documentados — el propio mecanismo de confirmación/vista previa antes de aplicar cambios no está especificado (vacío de documentación, sección 12).
- **Resultado:** plan realineado con la nueva fecha/disponibilidad.

**CU-05 — Creación automática del plan inicial (onboarding)**
- **Actor:** Sistema, disparado por el flujo de registro.
- **Objetivo:** Garantizar que el estudiante nunca vea la plataforma sin un plan.
- **Precondiciones:** El estudiante completó identidad (Clerk), perfil, perfil pedagógico y diagnóstico inicial.
- **Flujo principal:** 1) tras el diagnóstico inicial, el sistema calcula fecha de examen, objetivo, tiempo restante, entrenamiento recomendado y horas estimadas; 2) crea el `LearningPlan` (`status = ACTIVE`) junto con su estructura inicial (fases/tareas/horario — no detallado si se generan todas en este paso o progresivamente); 3) el Dashboard se crea a continuación, ya con datos del plan disponibles.
- **Flujos alternativos:** ninguno documentado (es un paso secuencial obligatorio, "el usuario nunca lo ejecuta manualmente").
- **Resultado:** plan inicial disponible antes de que el estudiante vea el Dashboard por primera vez.

**CU-06 — Registrar una sesión de estudio**
- **Actor:** Estudiante autenticado (o el sistema, automáticamente, al completar una actividad en otro ecosistema).
- **Objetivo:** Dejar constancia del tiempo real invertido en una tarea.
- **Precondiciones:** Existe una `LearningTask` activa a la que asociar la sesión.
- **Flujo principal:** 1) se inicia una sesión (marca de tiempo `started_at`); 2) el estudiante trabaja en la tarea; 3) se finaliza la sesión (`finished_at`, `duration_minutes`, `completed`); 4) se persiste `StudySession`.
- **Flujos alternativos:** sesión abandonada sin finalizar explícitamente (no especificado cómo se resuelve: ¿timeout? ¿se descarta?).
- **Resultado:** historial de estudio disponible para Evolución/Gamificación.

---

# 11. Riesgos

**Contradicciones:**
- Ninguna contradicción directa y explícita sobre Mi Plan está documentada como tal en la sección 17 del consolidado (a diferencia de, por ejemplo, autenticación o roles). Sin embargo, se detecta una **inconsistencia de nomenclatura no resuelta por ninguna resolución de la sección 18**: el rol de IA que planifica el estudio se llama "Learning Planner" en la arquitectura de IA (sección 9.4) y "Mentor" en el cronograma de fases de implementación (16.2, FASE 5: *"Mentor (diseñar planes de estudio)"*). Ningún resolutivo 18.x lo aclara — es un caso análogo a otras variaciones de nomenclatura ya resueltas (18.6), pero este caso específico no fue detectado ni cerrado.

**Ambigüedades:**
- **Solapamiento `LearningPreference` (13.2) vs. `StudySchedule` (13.4):** ambas tablas modelan disponibilidad/objetivos de estudio con campos casi equivalentes (`daily_goal_minutes`/`weekly_goal_sessions` vs. `days_per_week`/`sessions_per_day`/`minutes_per_session`), sin que el documento aclare cuál es la fuente de verdad ni cómo se sincronizan.
- **Mecanismo exacto de "reprogramar el plan"** (6.12): no se especifica si es una acción 100% manual del estudiante, una función que delega en el Learning Planner, o híbrida (el estudiante cambia un dato y el sistema recalcula).
- **Umbral de "varios días" de inactividad** (5.6, 9.7) que dispara la reorganización automática: no se define un número concreto.
- **Estado "sin plan activo":** el propio Dashboard ya contempla este estado (`plan.noPlan`), pero el documento nunca explica cuándo ni cómo un estudiante llega a tener cero planes activos, ni qué debería mostrar/ofrecer la vista completa de Mi Plan en ese caso.
- **¿Quién marca una `LearningTask` como completada?** No se especifica si es una acción manual del estudiante dentro de Mi Plan, un efecto automático de completar la actividad correspondiente en otro ecosistema (Academia/Laboratorio/Entrenamiento), o ambas rutas simultáneas.

**Dependencias ocultas:**
- La regla arquitectónica "los ecosistemas no deben comunicarse directamente entre sí" (5.7) implica que Mi Plan necesita, como prerrequisito de implementación, un Motor de Orquestación (o al menos servicios compartidos equivalentes) capaz de mediar sus eventos con Academia/Laboratorio/Entrenamiento/Coach IA — pieza de infraestructura que hoy no está confirmada como implementada de forma genérica en el proyecto (solo existe el patrón puntual `services/database`, `services/gamification`, `services/analytics`, `services/auth` construido para el Dashboard).
- La secuencia obligatoria del flujo de producción escrita (5.7) hace de Mi Plan un paso intermedio obligatorio cada vez que se evalúa una redacción — es decir, el módulo de Producción Escrita/Evaluación DELF **no puede considerarse completo** sin que Mi Plan exista y exponga el punto de integración correspondiente, aunque Mi Plan no sea, en sí, un prerrequisito de UI para ese módulo.

**Reglas incompletas:**
- No existe una regla explícita sobre qué ocurre con `LearningGoal`/`LearningPhase`/`LearningTask` de un plan cuando este pasa a `CANCELLED` o `COMPLETED` (¿se archivan? ¿se eliminan? — 13.15 prohíbe eliminar información con historial pedagógico relevante, lo que sugiere archivado, pero no está dicho para este caso específico).
- No hay regla sobre generación de un nuevo plan tras completar/cancelar el anterior (¿automática, como en el onboarding, o manual?).

**Decisiones pendientes:**
- Si "Learning Planner" es un servicio de IA invocable independientemente o una sub-función del Coach IA general.
- Si la reprogramación del plan requiere confirmación explícita del estudiante antes de aplicarse, dado el principio "el estudiante conserva el control" (8.8).
- Qué panel/sección exacta de navegación interna tiene Mi Plan (a diferencia del Dashboard, no hay una lista numerada de "bloques" oficiales).

**Problemas arquitectónicos:**
- Las 4 tablas ya creadas (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`) tienen hoy política RLS de **solo lectura** (`GRANT SELECT` a `dashboard_app_role`) — la implementación de Mi Plan requerirá una migración de RLS adicional que otorgue escritura real al estudiante sobre su propio plan (con las mismas garantías de aislamiento por fila ya validadas para el Dashboard), sin heredar por descuido el modelo de "el estudiante nunca escribe" que hoy rige esas tablas.
- Migración fuera de orden ya asumida como deuda documentada: cualquier tabla nueva de Mi Plan (`05_learning_plan`, según 13.14) deberá coexistir con las 4 tablas que ya se adelantaron desde esa misma fase — riesgo de que la nueva migración deba declararse como continuación de una fase que, en la práctica, ya está parcialmente aplicada.

**Supuestos no documentados (usados en esta auditoría, marcados explícitamente como tales):**
- Que la "vista completa" de Mi Plan reutiliza los mismos datos que la "vista resumida" del Dashboard, ampliados — es razonable pero no está dicho explícitamente en ningún punto del documento.
- Que las 6 entidades faltantes deben implementarse todas para considerar el módulo "funcionalmente completo" frente al Domain Modeling — el documento no da una versión mínima/parcial aceptable para un primer lanzamiento del módulo.

---

# 12. Vacíos de documentación

Información que falta para implementar sin improvisar (sin inventar respuestas):

1. **Especificación de pantalla(s) de Mi Plan.** A diferencia del Dashboard (6.3, lista numerada de 7 bloques) o la Evaluación Final (10.2, arquitectura de 8 partes con wireframes textuales detallados), Mi Plan solo tiene un párrafo funcional (6.12). No hay wireframe, lista de bloques, ni jerarquía de pantallas/tabs.
2. **Mecanismo de reprogramación.** Falta definir si es edición directa de campos, un asistente guiado, o una solicitud al Learning Planner con vista previa antes de confirmar.
3. **Umbral numérico de inactividad** que dispara la reorganización automática.
4. **Comportamiento del estado "sin plan activo"** en la vista completa (más allá del texto ya definido para el resumen del Dashboard).
5. **Origen exacto de la finalización de una `LearningTask`**: ¿acción manual en Mi Plan, efecto colateral de otro ecosistema, o ambas?
6. **Relación exacta entre `LearningPreference` (13.2) y `StudySchedule` (13.4)** — cuál es la fuente de verdad de la disponibilidad semanal.
7. **Ciclo de vida de metas/fases/tareas al cerrar o cancelar un plan** (archivado vs. eliminación vs. estado terminal).
8. **Contrato de servicio del "Learning Planner"**: si es invocable de forma independiente, con qué frecuencia se ejecuta (¿bajo demanda, en cada visita, programado?), y qué formato de propuesta entrega al Motor Pedagógico.
9. **Confirmación de que "Mentor" (16.2, FASE 5) y "Learning Planner" (9.4) son el mismo componente** — no aclarado por ninguna resolución de la sección 18.
10. **Vínculo formal entre sesiones/tareas de Mi Plan y el sistema de gamificación** (qué acciones generan `XPTransaction`, cuáles actualizan `Streak`) — hoy es una inferencia razonable, no una regla escrita.

---

# 13. Checklist de implementación

Orden cronológico propuesto como hoja de ruta técnica (no incluye diseño de UI ni código; solo la secuencia de trabajo):

1. **Resolver los vacíos de documentación críticos** (sección 12, ítems 1, 2, 5, 6, 7, 8) con el stakeholder antes de tocar código — son decisiones que, tomadas de forma implícita durante el desarrollo, generarían el mismo tipo de deuda ya identificado y corregido en el módulo Dashboard (omisiones de 13.2 frente a 12.2, nomenclatura de constraints, etc.).
2. **Diseñar y documentar la migración `05_learning_plan` (continuación)**: las 6 entidades faltantes (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`, `StudySchedule`, `StudySession`), como migración nueva, compatible, sin tocar las 4 tablas ya publicadas.
3. **Diseñar la política RLS de escritura** para las 4 tablas existentes (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`) — hoy son solo-lectura para el rol de aplicación; Mi Plan necesita que el propio estudiante pueda generar/actualizar su plan dentro de los límites de su propia fila (aislamiento ya validado para lectura, pendiente de extender a escritura).
4. **Definir el contrato del evento "producción evaluada → actualiza Mi Plan"** (5.7) y el mecanismo de comunicación con el Motor de Orquestación / servicios compartidos, respetando la regla de no comunicación directa entre ecosistemas.
5. **Definir el contrato mínimo del Learning Planner** (entrada/salida, frecuencia de invocación) — aunque el motor de decisión final (Motor Pedagógico Adaptativo) pueda implementarse en una fase posterior con reglas simplificadas si así se decide explícitamente con el stakeholder.
6. **Implementar la capa de datos** (`database/queries`, `database/repositories`) para las 6 entidades nuevas, siguiendo el mismo patrón de capas ya usado (`database/queries → repositories → services`).
7. **Implementar servicios de escritura** (`services/`) para creación automática del plan inicial (integración con el flujo de onboarding, 12.4) y para la reorganización automática (inactividad, eventos externos).
8. **Implementar `features/my-plan`** (types, schemas, constants, services de feature, actions, hooks) siguiendo la Feature-Driven Architecture ya establecida — la carpeta ya existe como esqueleto vacío.
9. **Construir los componentes de interfaz** identificados en la sección 4, respetando el catálogo de componentes UI ya existente (`components/ui`) antes de crear nuevos.
10. **Conectar la ruta** `app/[locale]/(app)/my-plan/page.tsx` (ya existe como placeholder) con la página real de la feature.
11. **Añadir las claves de traducción** necesarias en `messages/fr.json`/`es.json` (namespace `myPlan` o equivalente), en francés primero (regla 18.18), evitando cualquier texto hardcodeado en componentes.
12. **Verificar la integración con el Dashboard**: confirmar que el bloque 3 ya implementado sigue funcionando sin cambios (no debe romperse por la ampliación del modelo de datos — 13.15, compatibilidad hacia atrás).
13. **Pruebas**: unitarias de reglas de negocio (cálculo automático de progreso, límites 0-100, un solo plan activo), y de integración de la política RLS de escritura (aislamiento por estudiante, igual que se validó para el Dashboard).
14. **Auditoría de cierre del módulo** (mismo patrón ya aplicado a Dashboard: revisión de errores, duplicaciones, código muerto, SOLID, dependencias circulares, rendimiento, seguridad, accesibilidad, escalabilidad) antes de dar el módulo por listo para producción.

---

# 14. Veredicto

## ⚠️ REQUIERE ACLARACIONES

**Justificación técnica.** El módulo tiene un propósito, unas reglas de negocio centrales y un modelo de datos claramente identificables y bien fundamentados en el documento consolidado (secciones 6.12, 13.4, 9.7, 5.6-5.7) — no se trata de un vacío total de información, por lo que el veredicto **no** es "❌ NO EXISTE INFORMACIÓN SUFICIENTE". Sin embargo, tampoco puede iniciarse la implementación con seguridad absoluta ("✅ LISTO PARA IMPLEMENTAR") porque:

1. El modelo de datos real está **60% sin implementar** (6 de 10 entidades documentadas no existen en el proyecto), y las 4 que sí existen fueron construidas con un propósito distinto (solo lectura para el Dashboard), lo que exige una decisión explícita de cómo extender su acceso sin comprometer la seguridad ya validada.
2. Existen **vacíos de documentación concretos y accionables** (sección 12) que, de no resolverse antes de codificar, obligarían a improvisar decisiones de producto — exactamente el patrón que ya generó deuda técnica documentada en el módulo Dashboard (omisiones de esquema, nomenclatura, RLS).
3. Hay una **ambigüedad de nomenclatura no resuelta** (Learning Planner vs. Mentor) y un **solapamiento de datos no aclarado** (`LearningPreference` vs. `StudySchedule`) que deberían cerrarse con una resolución explícita (siguiendo el patrón ya usado en la sección 18 del propio documento) antes de fijar el esquema físico definitivo, dado que 13.14 prohíbe modificar la nomenclatura/estructura una vez publicada una migración.

En síntesis: la documentación permite **comprender el módulo con precisión** y **diseñar su arquitectura**, pero no permite **codificarlo de extremo a extremo sin tomar decisiones de producto no escritas**. Las aclaraciones necesarias (sección 12, priorizadas en el checklist punto 1) son acotadas y específicas, no una reconstrucción completa del módulo — no se requiere volver a los documentos fuente, sino decisiones puntuales del stakeholder sobre los 10 puntos listados.
