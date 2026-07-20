# Módulo Mi Plan — Fase 3.2: Cierre arquitectónico previo a implementación

**Rol:** Arquitecto Principal del proyecto. **Fecha:** 2026-07-17.
**Insumo:** `docs/audits/mi-plan-functional-audit-2026-07-17.md` (Fase 3.1 — auditoría funcional, veredicto ⚠️ REQUIERE ACLARACIONES, 10 vacíos de documentación) y `02_Conocimiento_Consolidado_Resuelto.md` completo.
**Objetivo de esta fase:** cerrar los 10 vacíos detectados con decisiones arquitectónicas consistentes con el resto del proyecto, y dejar una Arquitectura Definitiva lista para la Fase 3.3 (implementación). **No contiene código ni diseño visual.**
**Estado al cierre de esta fase:** ✅ Vacíos de la Fase 3.1 cerrados — ver resolución 18.20 en el documento consolidado. **Actualización posterior:** la auditoría de implementabilidad (`docs/audits/mi-plan-implementability-audit-2026-07-17.md`) detectó 3 omisiones de especificación adicionales, cerradas en la resolución 18.21 — ver Parte 4 (Adenda) al final de este documento. **Segunda actualización:** la auditoría DDD del Domain Layer (Sprint 3.3.2) señaló dos decisiones interpretativas del implementador que debían formalizarse, cerradas en la resolución 18.22 — ver Parte 5 (Adenda) al final de este documento. **Tercera actualización:** la auditoría funcional del Sprint 3.3.3 detectó una contradicción documental sobre el flujo de reprogramación del plan (si `LearningPlan` se modifica, dónde vive la fecha de examen, y cuáles son sus disparadores oficiales), cerrada en la resolución **18.23** — ver Parte 6 (Adenda) al final de este documento.

---

## Parte 1 — Cierre de los 10 vacíos detectados

### Vacío 1 — Especificación de pantalla(s) de Mi Plan

**1. Problema.** A diferencia del Dashboard (6.3, 7 bloques numerados) o la Evaluación Final (10.2, arquitectura de 8 partes), Mi Plan solo tenía un párrafo funcional (6.12) sin desglose de bloques de información ni jerarquía de navegación interna.

**2. Solución arquitectónica.** Se define Mi Plan como **una única ruta** (`/my-plan`, ya reservada) organizada en **5 bloques de información**, en este orden:
1. **Resumen general** — cuenta regresiva al examen, objetivo (nivel actual → nivel objetivo), horas estudiadas vs. recomendadas, % de avance del plan.
2. **Calendario de entrenamiento** — vista de `DailyPlan`/`WeeklyPlan` (la misma fuente que ya resume el Dashboard, ampliada a rango completo).
3. **Objetivos y metas** — `LearningGoal` (con prioridad) y sus `LearningObjective`.
4. **Fases y tareas** — `LearningPhase` en orden temporal, con sus `LearningTask` y, dentro de cada tarea, su historial de `StudySession`.
5. **Configuración del plan** — `StudySchedule` (días/semana, sesiones/día, minutos/sesión, recordatorio) y punto de entrada a la reprogramación (Vacío 2).

**3. Justificación.** Los 5 bloques son una traducción directa y sin inferencia de las 10 entidades ya definidas en 13.4 (no se inventa contenido: cada bloque corresponde 1:1 a un subconjunto de entidades ya documentadas). Se mantiene como **una sola ruta** en vez de crear subrutas (`/my-plan/calendar`, `/my-plan/goals`, etc.) porque la resolución 18.6 ya fijó los 9 espacios de navegación de primer nivel como cerrados, y porque la regla de continuidad (6.3: "acceso mediante un único clic") favorece una vista consolidada sobre una navegación profunda.

**4. Ventajas / desventajas.** Ventajas: cero impacto en `config/navigation.ts`/`config/routes.ts` (ya cerrados); reutiliza literalmente los datos ya expuestos al Dashboard sin transformación adicional. Desventajas: una única página con 5 bloques puede volverse pesada de cargar si no se pagina/virtualiza el historial de `StudySession` — riesgo de rendimiento a anticipar en Fase 3.3, no de arquitectura de datos.

**5. Impacto.** BD: ninguno (solo lectura de entidades ya definidas). Arquitectura: ninguno (una ruta, ya reservada). IA: ninguno. Dashboard: ninguno (su "vista resumida" ya es un subconjunto correcto de estos mismos bloques). Laboratorio: ninguno. Gamificación: ninguno. APIs: define el agrupamiento lógico de los endpoints de lectura (uno por bloque es razonable, decisión de Fase 3.3).

**6. ¿Modifica el documento consolidado?** Sí — se formaliza en la resolución 18.20 (sección 6.12 queda complementada, no contradicha).

**7. ¿Afecta módulos ya implementados?** No.

---

### Vacío 2 — Mecanismo de reprogramación del plan

**1. Problema.** 6.12 menciona la posibilidad de reprogramar el plan sin especificar si es edición directa, un asistente guiado, o una solicitud mediada por IA con confirmación.

**2. Solución arquitectónica.** Flujo de **dos pasos con confirmación explícita**: (a) el estudiante modifica un dato disparador (fecha del examen o disponibilidad, vía `StudySchedule`); (b) el sistema invoca al Learning Planner (Vacío 8) para generar una **propuesta** de recalendarización; (c) la propuesta se presenta al estudiante antes de aplicarse; (d) solo tras confirmación explícita, el Motor Pedagógico Adaptativo persiste los cambios en `DailyPlan`/`WeeklyPlan`/`LearningPhase`/`LearningTask`.

**3. Justificación.** Es la única lectura compatible con el principio explícito 8.8: *"el estudiante conserva el control; las recomendaciones son sugerencias, no obligaciones"* y con 9.7 (*"la IA puede explicar decisiones, nunca decidirlas"*). Una reprogramación que se aplicara automáticamente sin confirmación violaría ambas reglas MUST.

**4. Ventajas / desventajas.** Ventajas: coherente con la autonomía del estudiante (8.10); evita que una fecha mal escrita reorganice el plan sin posibilidad de deshacer. Desventajas: un paso adicional de confirmación introduce fricción — aceptable dado que es una operación poco frecuente, no el flujo diario del estudiante.

**5. Impacto.** BD: escritura en `DailyPlan`/`WeeklyPlan`/`LearningPhase`/`LearningTask` (requiere las políticas RLS de escritura ya señaladas como pendientes en la auditoría); `StudySchedule` se escribe como causa del disparador de disponibilidad, antes de la reprogramación en sí, no como parte de ella; `LearningPlan` **no** se escribe — corrección formalizada en la resolución 18.23, que cierra una imprecisión de esta lista original. Arquitectura: introduce el primer flujo de escritura real de Mi Plan orquestado con IA. IA: primer punto de invocación real del Learning Planner. Dashboard: debe reflejar el plan recalculado en su siguiente lectura, sin cambios de código (ya lee por `student_id`, no por snapshot). Laboratorio/Gamificación: sin impacto directo. APIs: requiere un endpoint de "previsualizar reprogramación" distinto del de "aplicar reprogramación" (dos operaciones, no una).

**6. ¿Modifica el documento consolidado?** Sí — 18.20.

**7. ¿Afecta módulos ya implementados?** No directamente, pero es el primer caso que exige habilitar escritura estudiante→BD sobre tablas hoy solo-lectura del Dashboard — ver Vacío 5 y Arquitectura Definitiva, sección de impacto en RLS.

---

### Vacío 3 — Umbral numérico de inactividad

**1. Problema.** 5.6/9.7 disparan una reorganización automática si el estudiante "abandona varios días", sin definir el número.

**2. Solución arquitectónica.** Se fija el umbral en **3 días consecutivos sin ninguna sesión de estudio válida** (`StudySession.completed = true` en ninguna tarea del plan activo), como constante de configuración de negocio (no como columna de base de datos, no personalizable en esta fase).

**3. Justificación.** Se elige un valor deliberadamente distinto y más tolerante que el umbral de `Streak` (que se reinicia tras **un solo** día sin actividad, 11.4) porque son mecanismos de naturaleza distinta: `Streak` es una señal motivacional de bajo costo que puede reiniciarse con frecuencia sin consecuencia real; la reorganización de Mi Plan es una operación de mayor costo (recálculo de calendario, posible invocación al Learning Planner) y su disparo prematuro tras un solo día contradiría el principio explícito de no generar presión o culpa (8.7: *"en ningún caso [el Coach IA] utilizará mensajes que generen culpa"*) por una interrupción trivial.

**4. Ventajas / desventajas.** Ventajas: evita recalcular el plan por una única mala noche de sueño del estudiante; consistente con el tono no punitivo de la plataforma. Desventajas: es un valor no derivado literalmente del documento fuente — se declara explícitamente como parámetro de configuración de negocio, ajustable en el futuro sin migración (no es un valor estructural).

**5. Impacto.** BD: ninguno (constante de aplicación, no de esquema). Arquitectura: define un job/trigger de verificación de inactividad (recurrente, servidor). IA: dispara una invocación del Learning Planner en modo "reactivación", distinta del modo "reprogramación" del Vacío 2. Dashboard: consumirá el plan ya reorganizado sin cambios propios. Gamificación: el disparo de este umbral es independiente del reinicio de `Streak` (que ya ocurre a 1 día) — no se modifica la regla de `Streak` existente. APIs: ninguno expuesto al cliente (proceso interno).

**6. ¿Modifica el documento consolidado?** Sí — se añade como parámetro explícito en 18.20 (no existía ningún valor previamente, no se contradice nada).

**7. ¿Afecta módulos ya implementados?** No.

---

### Vacío 4 — Estado "sin plan activo" en la vista completa

**1. Problema.** El Dashboard ya contempla el mensaje `plan.noPlan`, pero el documento no explica cuándo ocurre ni qué debería mostrar/ofrecer la vista completa de Mi Plan en ese caso.

**2. Solución arquitectónica.** Se redefine la transición de estado del plan como **atómica**: cuando un `LearningPlan` pasa a `COMPLETED` o `CANCELLED`, la creación del siguiente plan `ACTIVE` ocurre en la **misma operación** (reutilizando el mismo servicio de creación automática usado en el onboarding, Vacío 9 del flujo de registro, 12.4), de forma que el estudiante nunca queda, en el uso normal de la plataforma, sin un plan activo. El estado "sin plan activo" se conserva únicamente como **estado defensivo** de la interfaz (no como flujo de producto diseñado) para cubrir casos excepcionales (fallo de la transacción atómica, migración de datos, cuenta recién creada antes de completar el onboarding) — en ese caso, la vista completa de Mi Plan muestra un mensaje equivalente al ya existente en el Dashboard, sin ninguna acción manual de "crear plan" expuesta al estudiante (crear un plan nunca es una acción manual en toda la plataforma, 12.4).

**3. Justificación.** Evita diseñar un flujo de producto nuevo ("crear plan manualmente") que no está mencionado en ninguna parte del documento y que contradiría el principio ya establecido de creación 100% automática (12.4: "el usuario nunca lo ejecuta manualmente"). Tratar el estado vacío como defensivo, no como funcionalidad, es la lectura más conservadora y más consistente con el resto de la especificación.

**4. Ventajas / desventajas.** Ventajas: no se inventa una funcionalidad de producto no solicitada; el estudiante nunca ve una pantalla que le pida decisiones de planificación que no sabe tomar (coherente con 8.7, "objetivos alcanzables... la plataforma orienta sin imponer"). Desventajas: exige que la transición de cierre de plan y creación del siguiente se implemente con garantías transaccionales reales (si falla a medias, sí se puede llegar al estado vacío) — requisito no trivial para Fase 3.3.

**5. Impacto.** BD: la transacción de cierre+creación debe ejecutarse dentro de una única transacción de base de datos. Arquitectura: reutiliza el servicio de creación automática de planes como un componente compartido (no exclusivo del onboarding). IA: si la creación del siguiente plan requiere una nueva propuesta del Learning Planner (por ejemplo, tras completar el plan hacia un nuevo objetivo), se invoca igual que en el onboarding. Dashboard: mensaje `plan.noPlan` se conserva sin cambios, ahora documentado como estado defensivo, no como flujo esperado. Laboratorio/Gamificación: sin impacto. APIs: ninguna nueva; la de creación de plan se reutiliza.

**6. ¿Modifica el documento consolidado?** Sí — 18.20.

**7. ¿Afecta módulos ya implementados?** No modifica el Dashboard, pero **confirma y formaliza** el uso correcto del mensaje `plan.noPlan` ya existente en `messages/fr.json`/`es.json`.

---

### Vacío 5 — Origen de la finalización de una `LearningTask`

**1. Problema.** No se especifica si una tarea se completa manualmente dentro de Mi Plan, automáticamente por un evento de otro ecosistema, o ambas rutas.

**2. Solución arquitectónica.** Se introduce una distinción explícita en `LearningTask`, mediante un nuevo campo `source` (valores: `SELF_DIRECTED`, `ACADEMY`, `LABORATORY`, `DAILY_TRAINING`, `SIMULATOR`; por defecto `SELF_DIRECTED`), no contemplado literalmente en 13.4: (a) las tareas `SELF_DIRECTED` (estudio libre, sin actividad externa asociada) se completan manualmente por el estudiante dentro de Mi Plan; (b) las tareas con cualquier otro valor de `source` se completan **exclusivamente** de forma automática, cuando el ecosistema correspondiente emite un evento de "actividad completada" con una referencia a la tarea — el estudiante nunca las marca manualmente.

**3. Justificación.** Es la única forma de conciliar dos reglas MUST que, sin esta distinción, entrarían en conflicto: "el progreso se calcula automáticamente... nunca se edita manualmente" (13.4) exige que las tareas vinculadas a actividades externas no dependan de una acción manual redundante; pero Mi Plan también necesita soportar bloques de estudio autónomo (lectura libre, repaso) que ningún otro ecosistema reporta. Separar por `source` resuelve ambos casos sin contradicción.

**4. Ventajas / desventajas.** Ventajas: cierra el vacío sin inventar un mecanismo de sincronización complejo; el campo es un ENUM simple, evolución compatible (13.15: agregar columnas/ENUM está permitido). Desventajas: es una **extensión real del esquema de 13.4**, no prevista literalmente en el documento fuente — debe declararse explícitamente como tal (no se oculta como si ya existiera).

**5. Impacto.** BD: nueva columna `source` en `LearningTask` (tabla aún no implementada, por lo que no es una migración incompatible — se define correctamente desde el primer `CREATE TABLE`). Arquitectura: es el mecanismo formal de comunicación entre ecosistemas y Mi Plan vía eventos (ver Vacío 8/Arquitectura Definitiva), respetando la regla de no comunicación directa (5.7). IA: sin impacto directo. Dashboard: sin impacto. Laboratorio: pasa a ser, junto con Academia/Entrenamiento/Simulador, un emisor potencial del evento "actividad completada" referenciando una `LearningTask`. Gamificación: el mismo evento de finalización es la fuente natural de `XPTransaction` (ver Vacío 10). APIs: se necesita un endpoint interno de recepción de este evento (servidor-a-servidor), no expuesto al estudiante.

**6. ¿Modifica el documento consolidado?** Sí — 18.20 amplía formalmente la ficha de `LearningTask` de 13.4.

**7. ¿Afecta módulos ya implementados?** No — `LearningTask` no existe aún; ningún módulo publicado depende de su forma actual.

---

### Vacío 6 — Relación entre `LearningPreference` (13.2) y `StudySchedule` (13.4)

**1. Problema.** Ambas tablas modelan disponibilidad/objetivos de estudio con campos casi equivalentes, sin que el documento aclare cuál es la fuente de verdad.

**2. Solución arquitectónica.** Se delimita el alcance de cada una, sin fusionarlas ni eliminar ninguna: `LearningPreference` (dominio Perfil, 13.2) queda como **preferencia general por defecto del usuario**, usada exclusivamente para **prellenar** `StudySchedule` en el momento de crear un plan nuevo (copia unidireccional, una sola vez). `StudySchedule` (dominio Mi Plan, 13.4) es la **única fuente de verdad operativa** mientras el plan está activo — toda lectura de disponibilidad para calendarizar, para el Learning Planner, o para el propio Mi Plan, se hace exclusivamente contra `StudySchedule`, nunca contra `LearningPreference` directamente.

**3. Justificación.** Preserva el propósito original de cada tabla según su capítulo (13.2 es configuración general del usuario, aplicable incluso antes de tener un plan; 13.4 es configuración específica del plan activo) sin crear una dependencia de sincronización en caliente entre dos módulos distintos (Perfil y Mi Plan), lo que violaría la regla de comunicación mediada entre ecosistemas (5.7) si se implementara como sincronización bidireccional automática.

**4. Ventajas / desventajas.** Ventajas: cero ambigüedad de fuente de verdad; cero necesidad de mantener ambas tablas sincronizadas en el tiempo. Desventajas: si el estudiante cambia su `LearningPreference` general después de tener un plan activo, ese cambio **no** se refleja automáticamente en `StudySchedule` — debe reflejarse mediante el flujo de reprogramación (Vacío 2), no de forma implícita. Se declara esto como comportamiento esperado, no como limitación oculta.

**5. Impacto.** BD: ninguna migración, solo una regla de uso (ambas tablas ya están documentadas en 13.2/13.4 tal cual). Arquitectura: fija el punto exacto de lectura de `LearningPreference` (una sola vez, al crear el plan) dentro del servicio de creación de planes. IA: el Learning Planner lee `StudySchedule`, nunca `LearningPreference`, evitando ambigüedad de insumo. Dashboard/Laboratorio/Gamificación: sin impacto. APIs: ninguna nueva.

**6. ¿Modifica el documento consolidado?** Sí — 18.20 (aclaración, no contradicción de 13.2 ni 13.4).

**7. ¿Afecta módulos ya implementados?** No.

---

### Vacío 7 — Ciclo de vida de metas/fases/tareas al cerrar o cancelar un plan

**1. Problema.** No se especifica si `LearningGoal`/`LearningPhase`/`LearningTask` se archivan, eliminan, o quedan en un estado terminal al pasar el plan a `COMPLETED`/`CANCELLED`.

**2. Solución arquitectónica.** **Archivado implícito, sin eliminación y sin campo de estado adicional en las entidades hijas.** El estado de `LearningPlan` (padre) es la única fuente de verdad del ciclo de vida: cuando `LearningPlan.status ∈ {COMPLETED, CANCELLED}`, todas sus `LearningGoal`/`LearningPhase`/`LearningTask`/`StudySchedule`/`StudySession` permanecen en la base de datos de forma permanente e inmutable, simplemente dejan de aparecer en las consultas de "plan activo" (que siempre filtran por `LearningPlan.status = ACTIVE` vía la relación, no por un campo propio de cada hija).

**3. Justificación.** Es la aplicación directa de la restricción MUST ya vigente para todo el proyecto (13.15: *"nunca eliminar información sin migración previa"*, y el patrón ya usado en `CoachMemory`: "no se permite eliminar... solo marcarla como inactiva"). No añadir un campo de estado redundante en cada entidad hija evita duplicar la fuente de verdad del ciclo de vida (13.4 ya restringe: "evitar duplicación de información").

**4. Ventajas / desventajas.** Ventajas: cero columnas nuevas, cero riesgo de que el estado del padre y el de las hijas queden inconsistentes entre sí. Desventajas: cualquier consulta de "tareas activas" debe hacer join contra `LearningPlan.status` en vez de filtrar directamente sobre la tabla hija — coste de consulta ligeramente mayor, aceptable dado el volumen de datos por estudiante.

**5. Impacto.** BD: ninguna columna nueva. Arquitectura: fija la regla de consulta (siempre vía `status` del plan padre) como convención obligatoria para todos los repositorios de Mi Plan. IA/Dashboard/Laboratorio/Gamificación: sin impacto. APIs: todo endpoint de lectura de metas/fases/tareas debe excluir por diseño los planes no `ACTIVE`, salvo un endpoint explícito de "historial" (fuera de alcance funcional de esta fase, no solicitado por la auditoría).

**6. ¿Modifica el documento consolidado?** Sí — 18.20.

**7. ¿Afecta módulos ya implementados?** No.

---

### Vacío 8 — Contrato de servicio del Learning Planner

**1. Problema.** No se especifica si es invocable de forma independiente, con qué frecuencia, ni qué formato de propuesta entrega.

**2. Solución arquitectónica.** El Learning Planner se define como un **servicio invocado únicamente en tres puntos de disparo cerrados** (nunca en cada visita a Mi Plan/Dashboard, por costo y consistencia): (a) creación automática del plan inicial (onboarding, 12.4); (b) solicitud explícita de reprogramación por el estudiante (Vacío 2); (c) reorganización automática por inactividad (Vacío 3) o por un evento externo relevante (p. ej. simulación que revela una dificultad significativa, 5.6). En los tres casos, el Learning Planner **entrega una propuesta estructurada** (calendario candidato: fases, tareas, distribución diaria/semanal) que nunca se persiste directamente — el Motor Pedagógico Adaptativo la valida contra sus reglas "si-entonces" (9.7) antes de aplicarla, y en el caso (b) además requiere confirmación del estudiante.

**3. Justificación.** Aplica literalmente la separación de autoridad ya declarada como regla MUST (9.7: *"la autoridad pedagógica recae en el Motor Pedagógico"*, la IA "nunca decide"). Limitar la invocación a tres disparos concretos (en vez de "cada vez que se abre Mi Plan") es consistente con el principio general de optimización de contexto/costo de IA (9.6: *"maximizar calidad con el menor consumo posible de tokens"*), aplicado aquí a frecuencia de invocación, no solo a tamaño de contexto.

**4. Ventajas / desventajas.** Ventajas: costo de IA acotado y predecible; el estudiante nunca ve un plan que cambió sin razón rastreable (todo cambio tiene un disparador nombrado). Desventajas: si el estudiante quisiera "recalcular" el plan sin ninguno de los tres disparadores, no hay una vía — se considera aceptable porque no está solicitado en ninguna parte del documento fuente.

**5. Impacto.** BD: ninguno directo (el resultado de la propuesta se persiste solo tras validación/confirmación, ya contemplado en los Vacíos 2/3/4). Arquitectura: formaliza el Learning Planner como un servicio del AI Orchestrator con contrato de entrada/salida explícito, coordinado — nunca invocado directamente por el cliente (9.4: *"el AI Orchestrator es el único componente autorizado para comunicarse directamente con los modelos de lenguaje"*). IA: es la definición central de este vacío. Dashboard: consumidor pasivo del resultado final, sin invocar nunca al Learning Planner por sí mismo. Laboratorio/Gamificación: pueden ser origen del disparador (c) si generan un evento relevante, pero no invocan al Learning Planner directamente — el disparo pasa por el mismo mecanismo de eventos del Vacío 5. APIs: ninguna expuesta al cliente para invocar al Learning Planner directamente; toda invocación es interna, server-side.

**6. ¿Modifica el documento consolidado?** Sí — 18.20 (formaliza contrato no descrito antes; no contradice 9.4/9.7, los precisa).

**7. ¿Afecta módulos ya implementados?** No — el Learning Planner no tiene ninguna implementación previa en el proyecto.

---

### Vacío 9 — "Mentor" (16.2) vs. "Learning Planner" (9.4)

**1. Problema.** Dos nombres para, aparentemente, el mismo rol de IA ("diseñar planes de estudio"), sin que ninguna resolución de la sección 18 lo aclare.

**2. Solución arquitectónica.** Se adopta **"Learning Planner"** como nombre oficial único (identificador de código, arquitectura y documentación futura). "Mentor" (16.2, cronograma de fases) se documenta como **etiqueta descriptiva de roadmap, superada**, mapeada 1:1 a Learning Planner.

**3. Justificación.** Misma lógica ya aplicada en la resolución 18.6 para nomenclatura de ecosistemas: cuando dos fuentes nombran el mismo concepto de forma distinta, se adopta el nombre de la fuente más detallada y arquitectónicamente integrada. "Learning Planner" tiene arquitectura propia (9.4: posición exacta en el diagrama del AI Orchestrator, entradas/salidas descritas) mientras que "Mentor" (16.2) es solo una palabra suelta en una tabla de fases de alto nivel, sin desarrollo adicional en ninguna otra parte del documento.

**4. Ventajas / desventajas.** Ventajas: elimina la última inconsistencia de nomenclatura pendiente relacionada con Mi Plan; sigue un precedente ya validado por el proyecto. Desventajas: ninguna identificada — es una corrección de documentación pura, sin superficie de código afectada todavía.

**5. Impacto.** BD/Arquitectura/Dashboard/Laboratorio/Gamificación/APIs: ninguno. IA: fija el nombre que usarán todos los futuros identificadores de código (`services/coach` o equivalente, a decidir en Fase 3.3) que implementen este rol.

**6. ¿Modifica el documento consolidado?** Sí — 18.20.

**7. ¿Afecta módulos ya implementados?** No.

---

### Vacío 10 — Vínculo entre sesiones/tareas de Mi Plan y Gamificación

**1. Problema.** No hay una regla tabla-a-tabla que conecte `StudySession`/`LearningTask` con `XPTransaction`/`Streak`.

**2. Solución arquitectónica.** Se define un **evento de dominio único**, `PLAN_TASK_COMPLETED`, emitido por Mi Plan cada vez que una `LearningTask` pasa a completada (por cualquiera de las dos vías del Vacío 5). El Servicio de Gamificación (ya definido arquitectónicamente en 5.7) consume ese evento y decide, con sus propias reglas (no definidas en esta fase, por no ser responsabilidad de Mi Plan): si genera una `XPTransaction` (`source = ACTIVITY`) y si cuenta como actividad válida para actualizar `Streak`. Mi Plan **emite el evento**; Mi Plan **no calcula** puntos de XP ni decide la racha — esa lógica pertenece íntegramente al módulo de Gamificación, respetando la separación de responsabilidades ya vigente (5.7: "Servicio de gamificación — calcula experiencia... rachas").

**3. Justificación.** Evita que Mi Plan duplique o invente reglas de puntuación que no le corresponden (13.4: "no crear tablas/lógica sin una responsabilidad claramente definida"), y respeta la arquitectura de servicios desacoplados por eventos ya declarada como principio general (5.7: "ejecución orientada a eventos... responsabilidad única por servicio").

**4. Ventajas / desventajas.** Ventajas: bajo acoplamiento; Gamificación puede cambiar sus reglas de puntuación sin tocar Mi Plan. Desventajas: introduce una dependencia de infraestructura de eventos (aunque sea ligera) que hoy no existe como componente genérico reutilizable — ver Arquitectura Definitiva, nota sobre el Motor de Orquestación.

**5. Impacto.** BD: ninguna tabla nueva de Mi Plan; Gamificación decide si escribe en `XPTransaction`/`Streak`, ya existentes. Arquitectura: primer caso formalmente documentado de un evento emitido por Mi Plan y consumido por otro servicio. IA: sin impacto directo. Dashboard: puede reflejar el efecto (XP/racha) sin cambios, ya que lee de las tablas de Gamificación de forma independiente. Laboratorio: si también emite `PLAN_TASK_COMPLETED` (para tareas `source ≠ SELF_DIRECTED`), es el mismo contrato de evento, no uno nuevo por ecosistema. Gamificación: consumidor del evento, dueño de la lógica de puntuación. APIs: ninguna expuesta al cliente (evento interno).

**6. ¿Modifica el documento consolidado?** Sí — 18.20.

**7. ¿Afecta módulos ya implementados?** No afecta al servicio de Gamificación ya existente (`services/gamification`) en su forma actual, pero será su primer consumidor real de un evento externo — a evaluar en Fase 3.3 si su interfaz actual ya lo soporta o necesita ampliarse (evaluación, no implementación, en esta fase).

---

## Parte 2 — Arquitectura Definitiva del módulo Mi Plan

### 2.1 Responsabilidades del módulo

Mi Plan es responsable de: (1) mantener el plan de entrenamiento vigente de cada estudiante como fuente única de verdad temporal; (2) calcular y exponer el progreso agregado del plan; (3) reaccionar — nunca iniciar por sí mismo sin disparador — a inactividad, cambios de disponibilidad/fecha de examen y eventos de finalización de actividad de otros ecosistemas; (4) coordinar con el Learning Planner/Motor Pedagógico Adaptativo la generación de propuestas de calendario, sin decidir nunca por sí mismo el contenido pedagógico; (5) emitir el evento de finalización de tarea que otros servicios (Gamificación) consumen. Mi Plan **no** es responsable de: evaluar producciones escritas, decidir contenido pedagógico específico (Academia/Laboratorio), ni calcular XP/rachas.

### 2.2 Entidades definitivas

10 entidades de 13.4, con una extensión formalizada en esta fase (`LearningTask.source`):

| Entidad | Estado | Notas de esta fase |
|---|---|---|
| `LearningPlan` | Existente (solo lectura hoy) | Requiere RLS de escritura — ver 2.9 |
| `LearningGoal` | Nueva | Sin cambios respecto a 13.4 |
| `LearningObjective` | Nueva | Sin cambios respecto a 13.4 |
| `LearningPhase` | Nueva | Sin cambios respecto a 13.4 |
| `LearningTask` | Nueva | **+ columna `source`** (ENUM: `SELF_DIRECTED`, `ACADEMY`, `LABORATORY`, `DAILY_TRAINING`, `SIMULATOR`; default `SELF_DIRECTED` — Vacío 5) |
| `StudySchedule` | Nueva | Fuente de verdad operativa de disponibilidad (Vacío 6) |
| `StudySession` | Nueva | Sin cambios respecto a 13.4 |
| `LearningProgress` | Existente (solo lectura hoy) | Requiere RLS de escritura — ver 2.9 |
| `DailyPlan` | Existente (solo lectura hoy) | Requiere RLS de escritura — ver 2.9 |
| `WeeklyPlan` | Existente (solo lectura hoy) | Requiere RLS de escritura — ver 2.9 |

### 2.3 Relaciones

Sin cambios respecto a las ya documentadas en 13.4: User 1:N LearningPlan; LearningPlan 1:N LearningGoal; LearningGoal 1:N LearningObjective; LearningPlan 1:N LearningPhase; LearningPhase 1:N LearningTask; LearningPlan 1:1 StudySchedule; LearningPlan 1:N DailyPlan; LearningPlan 1:N WeeklyPlan; LearningPlan 1:1 LearningProgress; LearningTask 1:N StudySession; User 1:N StudySession. Se añade la relación conceptual (no de clave foránea nueva): `LearningTask.source` determina el emisor autorizado del evento `PLAN_TASK_COMPLETED` para esa tarea.

### 2.4 Servicios

- **Servicio de creación de planes** — crea el plan inicial (onboarding) y el plan sucesor tras cierre/cancelación (transacción atómica, Vacío 4). Lee `LearningPreference` una única vez para prellenar `StudySchedule` (Vacío 6).
- **Servicio de consulta de plan** — expone los 5 bloques de información (2.1 del Vacío 1) al Dashboard y a Mi Plan.
- **Servicio de reprogramación** — orquesta el flujo de dos pasos (propuesta → confirmación) del Vacío 2.
- **Servicio de reorganización automática** — job que evalúa el umbral de inactividad (Vacío 3) y reacciona a eventos externos relevantes.
- **Servicio de finalización de tareas** — aplica la regla de origen (`source`, Vacío 5) y emite `PLAN_TASK_COMPLETED`.
- **Learning Planner** — servicio de IA, invocado únicamente por los tres disparadores del Vacío 8, coordinado por el AI Orchestrator; nunca invocado directamente por el cliente ni por otros servicios sin pasar por él.
- **Motor Pedagógico Adaptativo** — valida/decide sobre toda propuesta del Learning Planner antes de persistirla (autoridad final, 9.7).

### 2.5 Flujo completo (síntesis)

```
Onboarding / cierre de plan anterior
  → Servicio de creación de planes
     → (lee StudySchedule por defecto desde LearningPreference, una vez)
     → Learning Planner (propuesta inicial)
     → Motor Pedagógico Adaptativo (valida y persiste)
  → LearningPlan (ACTIVE) + LearningGoal/Phase/Task/StudySchedule creados

Uso normal
  → Estudiante o evento externo completa una LearningTask
     → Servicio de finalización de tareas (valida `source`)
     → LearningProgress recalculado automáticamente
     → Evento PLAN_TASK_COMPLETED → Servicio de Gamificación

Disparadores de recalendarización
  → (a) Solicitud de reprogramación del estudiante
  → (b) Umbral de inactividad (3 días) alcanzado
  → (c) Evento externo relevante (simulación revela dificultad, etc.)
     → Learning Planner (propuesta) → Motor Pedagógico (valida)
     → (a) requiere confirmación del estudiante; (b)/(c) se aplican
       directamente por ser reacciones del sistema, no ediciones del usuario
  → DailyPlan/WeeklyPlan/LearningPhase/LearningTask actualizados
  → Dashboard refleja el cambio en su siguiente lectura (sin acción propia)
```

### 2.6 Componentes lógicos (no visuales)

Agrupación lógica de responsabilidades, sin nombres de archivo ni diseño de interfaz: proveedor de resumen del plan (bloque 1); proveedor de calendario (bloque 2); proveedor de objetivos/metas (bloque 3); proveedor de fases/tareas (bloque 4); proveedor de configuración de horario (bloque 5); coordinador de reprogramación (Vacío 2); receptor de eventos de finalización de actividad externa (Vacío 5); emisor del evento `PLAN_TASK_COMPLETED` (Vacío 10).

### 2.7 Integración con IA

Confirmada y precisada en el Vacío 8: el Learning Planner es un servicio del AI Orchestrator (9.4), invocado en 3 disparadores cerrados, que **propone** (nunca decide) calendarios candidatos. El Motor Pedagógico Adaptativo, independiente del modelo de IA, valida cada propuesta contra sus reglas "si-entonces" (9.7) antes de que se persista o se ofrezca al estudiante para confirmación. Ninguna escritura en `LearningPlan` y entidades relacionadas ocurre como resultado directo de una respuesta de IA sin pasar por esta validación.

### 2.8 Reglas de negocio (consolidado, incluye las ya vigentes de 13.4 más las de esta fase)

De 13.4 (sin cambios): un estudiante puede tener múltiples planes pero solo uno activo; todo plan requiere ≥1 objetivo; jerarquía de pertenencia estricta (objetivo→plan, fase→plan, tarea→fase, sesión→tarea); progreso calculado automáticamente, nunca editado manualmente; % siempre entre 0-100.

De esta fase (nuevas, formalizadas en 18.20): la transición de cierre de un plan y creación del siguiente es atómica (Vacío 4); una `LearningTask` con `source = SELF_DIRECTED` se completa manualmente, cualquier otro valor se completa exclusivamente por evento externo (Vacío 5); `StudySchedule` es la única fuente de verdad operativa de disponibilidad mientras el plan está activo, `LearningPreference` solo prellena al crear el plan (Vacío 6); las entidades hijas de un plan cerrado/cancelado nunca se eliminan ni requieren campo de estado propio (Vacío 7); el Learning Planner solo se invoca en 3 disparadores nombrados, nunca en cada visita (Vacío 8); toda reprogramación solicitada por el estudiante requiere confirmación explícita antes de aplicarse (Vacío 2); toda reorganización automática (inactividad/evento externo) se aplica sin confirmación, por ser reacción del sistema, no edición del usuario (Vacío 8).

### 2.9 Eventos del sistema

| Evento | Emisor | Consumidor(es) | Payload conceptual |
|---|---|---|---|
| `PLAN_CREATED` | Servicio de creación de planes | Dashboard (indirecto, vía lectura), Notificaciones | `student_id`, `learning_plan_id` |
| `PLAN_TASK_COMPLETED` | Servicio de finalización de tareas | Gamificación, Evolución (indirecto) | `student_id`, `learning_task_id`, `source` |
| `PLAN_REORGANIZATION_REQUESTED` | Servicio de reprogramación (Vacío 2) | Learning Planner | `student_id`, `learning_plan_id`, motivo (fecha/disponibilidad) |
| `PLAN_INACTIVITY_THRESHOLD_REACHED` | Servicio de reorganización automática (job, Vacío 3) | Learning Planner, Coach IA (mensaje de reactivación) | `student_id`, `days_inactive` |
| `EXTERNAL_ACTIVITY_COMPLETED` | Academia / Laboratorio / Entrenamiento / Simulador | Servicio de finalización de tareas | `student_id`, `learning_task_id` (si aplica), tipo de actividad |

### 2.10 Contratos entre módulos

- **Mi Plan → Dashboard:** contrato de solo lectura ya vigente y sin cambios (RLS `SELECT` sobre `LearningPlan`/`DailyPlan`/`WeeklyPlan`/`LearningProgress`). Dashboard nunca invoca servicios de escritura de Mi Plan.
- **Academia/Laboratorio/Entrenamiento/Simulador → Mi Plan:** exclusivamente vía el evento `EXTERNAL_ACTIVITY_COMPLETED` (Vacío 5/10) — ningún ecosistema escribe directamente en tablas de Mi Plan, respetando 5.7.
- **Mi Plan → Gamificación:** exclusivamente vía el evento `PLAN_TASK_COMPLETED` — Mi Plan nunca escribe en `XPTransaction`/`Streak`.
- **Mi Plan ↔ Coach IA/Learning Planner:** exclusivamente vía el AI Orchestrator, con los 3 disparadores cerrados del Vacío 8 — Mi Plan nunca invoca modelos de lenguaje directamente.
- **Mi Plan → Perfil:** dos patrones de lectura distintos, formalizados en la resolución 18.23 — `LearningPreference`: lectura única, copiada a `StudySchedule` en el momento de creación del plan, sin sincronización posterior (Vacío 6); `StudentProfile.target_exam_date`: lectura en vivo en cada render del bloque 1 (Resumen general, cuenta regresiva al examen), nunca copiada a ninguna tabla de Mi Plan.
- **Mi Plan → Notificaciones:** `StudySchedule.reminder_time` es el disparador conceptual del evento `PLAN_REMINDER` ya definido en 13.10 — el contrato exacto (payload, frecuencia) se deja para Fase 3.3 por no ser parte de los 10 vacíos de la Fase 3.1.

---

## Parte 3 — Decisiones Arquitectónicas de la Fase 3

1. Mi Plan se implementa como una única ruta (`/my-plan`) con 5 bloques de información (Resumen, Calendario, Objetivos y metas, Fases y tareas, Configuración), sin subrutas nuevas.
2. Toda reprogramación solicitada por el estudiante sigue un flujo de propuesta + confirmación explícita antes de aplicarse; nunca se aplica de forma directa.
3. El umbral de inactividad que dispara la reorganización automática del plan se fija en 3 días consecutivos sin sesión de estudio válida, como constante de configuración de negocio, distinto e independiente del umbral de 1 día de `Streak`.
4. El cierre de un plan (`COMPLETED`/`CANCELLED`) y la creación de su plan sucesor son una operación atómica; el estado "sin plan activo" se trata como estado defensivo de interfaz, nunca como flujo de producto.
5. `LearningTask` incorpora un campo `source` (`SELF_DIRECTED` por defecto, o el ecosistema de origen) que determina si la tarea se completa manualmente o exclusivamente por evento externo — extensión formal de la ficha de 13.4.
6. `StudySchedule` es la única fuente de verdad operativa de disponibilidad de un plan activo; `LearningPreference` (13.2) solo prellena `StudySchedule` al crear un plan nuevo, sin sincronización posterior.
7. Las entidades hijas de un plan (`LearningGoal`, `LearningPhase`, `LearningTask`, `StudySchedule`, `StudySession`) nunca se eliminan al cerrar/cancelar el plan y no incorporan campo de estado propio; su vigencia se deriva siempre de `LearningPlan.status`.
8. El Learning Planner se invoca únicamente en tres disparadores cerrados (creación de plan, reprogramación solicitada, reorganización automática) y siempre entrega una propuesta que el Motor Pedagógico Adaptativo valida antes de persistir — nunca escribe directamente en base de datos.
9. Se adopta "Learning Planner" como nombre oficial único del rol de IA de planificación; "Mentor" (16.2) queda documentado como etiqueta de roadmap superada, mapeada 1:1.
10. Toda comunicación entre Mi Plan y otros ecosistemas (Academia, Laboratorio, Entrenamiento, Simulador, Gamificación, Coach IA) ocurre exclusivamente mediante los eventos de dominio definidos en la sección 2.9 de este documento (`PLAN_CREATED`, `PLAN_TASK_COMPLETED`, `PLAN_REORGANIZATION_REQUESTED`, `PLAN_INACTIVITY_THRESHOLD_REACHED`, `EXTERNAL_ACTIVITY_COMPLETED`) — nunca mediante llamadas directas entre servicios de ecosistemas distintos.
11. Las 4 tablas ya existentes (`LearningPlan`, `DailyPlan`, `WeeklyPlan`, `LearningProgress`), hoy solo-lectura para el Dashboard, requerirán una migración de RLS que habilite escritura real del propio estudiante sobre su fila, preservando el aislamiento por estudiante ya validado — a ejecutar en Fase 3.3, no en esta fase.
12. Las 6 entidades nuevas (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`, `StudySchedule`, `StudySession`) se crearán siguiendo la convención de nomenclatura de constraints ya vigente (`pk_`/`fk_`/`uq_`/`idx_`/`ck_`, sección 13.13) desde su primera migración, sin deuda técnica de nomenclatura pendiente.

**Estado de la Fase 3.2:** cerrada. Los 10 vacíos detectados en la Fase 3.1 quedan resueltos arquitectónicamente. Ninguna decisión de esta fase contradice una regla MUST previamente vigente; todas son extensiones o precisiones sobre información incompleta o ambigua. La Fase 3.3 (implementación) puede iniciarse sin improvisar decisiones de producto no documentadas.

---

## Parte 4 — Adenda: cierre de omisiones de especificación (resolución 18.21)

La auditoría de implementabilidad posterior a esta fase (`docs/audits/mi-plan-implementability-audit-2026-07-17.md`) detectó 3 omisiones de especificación —no decisiones arquitectónicas nuevas— que se cierran en la resolución **18.21** del documento consolidado. Se referencian aquí sin reabrir ni reescribir las Partes 1-3 anteriores.

**1. ENUM `status` de `LearningGoal`/`LearningObjective`/`LearningPhase`/`LearningTask`:** `NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED` — idéntico para las 4 entidades, reutilizando vocabulario ya existente en el proyecto (`ExamAttemptStatus`, 13.6; `LearningPlanStatus`, 13.4). Detalle y justificación completa de cada valor: 18.21, punto 1.

**2. Invariante `status`/`completed_at`:** `completed_at IS NOT NULL` si y solo si `status = COMPLETED`, asignado siempre automáticamente por el servidor. `LearningTask` (si `source = SELF_DIRECTED`) y `LearningObjective` se completan manualmente; `LearningPhase` y `LearningGoal` se calculan automáticamente a partir de sus hijas, nunca se editan manualmente — misma filosofía que ya rige `LearningProgress` (13.4), extendida aquí a los 4 `status`. `CANCELLED` es terminal, sin reactivación. Detalle completo de transiciones válidas/prohibidas: 18.21, punto 2.

**3. `LearningTask.source` en 13.4:** la ficha de 13.4 fue editada para incluir literalmente el campo `source` (ya decidido en 18.20.5) y los 4 ENUM de `status` de este punto. A partir de esta adenda, 13.4, 18.20, 18.21 y este documento describen exactamente el mismo modelo — sin diferencias entre fuentes.

**Entidades definitivas (Parte 2.2), corrección de forma:** la fila de `LearningTask` de la tabla de la sección 2.2 ya anticipaba correctamente el campo `source`; se confirma aquí que además incorpora el ENUM `status` completo. Las filas de `LearningGoal`, `LearningObjective` y `LearningPhase` de esa misma tabla quedan también con su `status` completamente definido — sin cambios en la tabla misma, solo cierre del campo que quedaba pendiente.


---

## Parte 5 — Adenda: formalización de decisiones interpretativas del Domain Layer (resolución 18.22)

La auditoría DDD del Domain Layer de Mi Plan (Sprint 3.3.2, `features/my-plan/domain/`) aprobó la implementación con estado 🟡 REQUIERE AJUSTES, señalando que dos decisiones tomadas dentro del código eran inferencias razonadas del implementador, no texto literal de ninguna resolución previa. Se cierran en la resolución **18.22** del documento consolidado, sin modificar ningún comportamiento ya implementado. Se referencian aquí sin reabrir ni reescribir las Partes 1-4 anteriores.

**1. Transiciones de `LearningPlan.status`:** 13.4 nunca definió una tabla de transiciones válidas para `LearningPlan` (a diferencia de los 4 ENUM de 18.21). Se formaliza el grafo ya implementado: `ACTIVE ⇄ PAUSED`; `ACTIVE|PAUSED → COMPLETED`; `ACTIVE|PAUSED → CANCELLED`; `COMPLETED`/`CANCELLED` terminales. El disparador de negocio de `pause()` (cuándo y por qué se pausa un plan) queda explícitamente fuera de alcance — no definido en ningún documento, pendiente de un caso de uso concreto. Detalle completo: 18.22, punto 1.

**2. `cancel()` en `LearningGoal`/`LearningPhase`:** se formaliza que `CANCELLED` es una transición de naturaleza distinta a `NOT_STARTED`/`IN_PROGRESS`/`COMPLETED` en las 4 entidades de 18.21 — estas últimas se determinan siempre por cálculo, mientras que `CANCELLED` es siempre una decisión externa explícita (p. ej. una reprogramación, 18.20.2), nunca un valor calculado. La frase de 18.21 "nunca se editan manualmente" se formaliza como referida específicamente al cálculo de `COMPLETED`/`IN_PROGRESS`/`NOT_STARTED`, no a la transición `CANCELLED`. Detalle completo: 18.22, punto 2.

**Consolidación documental:** ambas decisiones ya estaban implementadas y probadas antes de esta resolución (55 pruebas unitarias, Sprint 3.3.2); esta adenda cierra la dependencia de interpretación, sin generar ningún cambio de código.

---

## Parte 6 — Adenda: resolución del flujo de reprogramación del Learning Plan (resolución 18.23)

La auditoría funcional del Sprint 3.3.3 (`features/my-plan/application/`) detectó una contradicción entre el propio Vacío 2 de este documento (mecanismo descrito vs. su párrafo de "Impacto") y la sección 2.10 (patrón de lectura de `StudentProfile.target_exam_date`, campo no declarado en 13.2). Se cierra en la resolución **18.23** del documento consolidado. Se referencia aquí sin reabrir ni reescribir las Partes 1-5 anteriores; los dos únicos ajustes puntuales (Vacío 2, punto 5; sección 2.10) ya quedaron corregidos directamente en su lugar de origen, arriba en este mismo documento, por ser correcciones de precisión, no decisiones nuevas.

**1. `LearningPlan` no se modifica durante una reprogramación.** Persiste exclusivamente en `LearningPhase`/`LearningTask`/`DailyPlan`/`WeeklyPlan`; `StudySchedule` se escribe como causa del disparador de disponibilidad, no como parte de la reprogramación misma. Justificación DDD/Clean Architecture completa: 18.23, punto 1.

**2. La fecha objetivo del examen vive en `StudentProfile.target_exam_date` (13.2, campo formalizado en esta resolución)** — nunca en `LearningPlan` ni en `StudySchedule`. Mi Plan la lee en vivo en cada render del bloque 1 (Resumen general), sin copiarla a ninguna tabla propia — patrón distinto al de `LearningPreference` (que sí se copia una única vez a `StudySchedule` al crear el plan, Vacío 6, sin cambios). Detalle completo: 18.23, punto 2.

**3. Cuatro disparadores oficiales de reprogramación:** cambio de disponibilidad, cambio de fecha del examen (ambos vía solicitud explícita del estudiante, `PLAN_REORGANIZATION_REQUESTED`), umbral de inactividad y evento externo relevante (ambos automáticos, sin confirmación). "Cambio de objetivo" e "intervención docente" quedan explícitamente fuera por no tener respaldo documental en ninguna fuente revisada. Detalle completo: 18.23, punto 3.

**4. `UpdateLearningPlan` no debe implementarse** — ningún documento describe una pantalla o flujo donde el estudiante edite directamente `name`/`description`/`targetLevel`/`endDate` de su plan; las únicas mutaciones válidas de `LearningPlan` son las transiciones de ciclo de vida ya cubiertas por `Pause`/`Resume`/`Cancel` (Sprint 3.3.3) y `complete()` (dominio, sin Handler propio todavía — riesgo señalado en 18.23). Detalle completo: 18.23, punto 6.

**Consolidación documental:** esta adenda, junto con las correcciones puntuales al Vacío 2 y a la sección 2.10 ya aplicadas en este documento, y la edición de la ficha de `StudentProfile` en 13.2, dejan la especificación del flujo de reprogramación sin contradicciones conocidas. La implementación de infraestructura (Learning Planner, Motor Pedagógico Adaptativo, Handler de aplicación de la propuesta confirmada) queda pendiente para un sprint futuro, no incluido en el alcance de esta resolución.

---

## Parte 7 — Adenda: alineación de Infrastructure con la matriz de RLS ya aprobada (resolución 18.24)

La auditoría técnica del Sprint 3.3.4 (`features/my-plan/infrastructure/`) detectó que todas las operaciones de Mi Plan usaban `withServiceContext` (BYPASSRLS), contradiciendo la matriz de RLS ya migrada y verificada (`202607171400_my_plan_rls_policies`, Sprint 3.3.1) que otorga a `dashboard_app_role` escritura/lectura directa sobre varias tablas de Mi Plan. Se cierra en la resolución **18.24** del documento consolidado. Se referencia aquí sin reabrir ni reescribir las Partes 1-6 anteriores.

**1. `UnitOfWork.execute()` transporta ahora un `studentId` opcional.** Cuando el Handler llamante lo provee, Infrastructure ejecuta la operación bajo `withStudentContext` (RLS real, rol `dashboard_app_role`); cuando se omite, conserva `withServiceContext` (BYPASSRLS, rol `dashboard_service_role`). No se introduce ningún dato ni concepto nuevo: es el mismo `StudentId` que Application ya poseía en cada Handler. Detalle completo: 18.24, Decisión 1.

**2. Solo pasan `studentId` los Handlers cuyas escrituras (o lecturas) están íntegramente cubiertas por la matriz de `GRANT`/políticas ya migrada:** las 5 consultas (`GetActiveLearningPlan`, `GetDailyPlan`, `GetWeeklyPlan`, `GetLearningProgress`, `GetStudySchedule`), `CreateStudySession` (única tabla: `study_session`) y `UpdateStudySchedule` (única tabla: `study_schedule`) — más `RequestPlanReorganization` (única operación: lectura de `learning_plan`), incorporado en el cierre de esta misma resolución (Sprint 3.3.4.2). Los Handlers que crean o modifican `learning_plan`/`learning_goal`/`learning_phase` (`CreateLearningPlan`, `Pause/Resume/CancelLearningPlan`) o que mezclan una tabla de escritura estudiante con una de escritura exclusiva de servicio en la misma transacción (`CompleteLearningTask`, `UpdateLearningObjective`) permanecen en `withServiceContext`, por ausencia real de `GRANT` para `dashboard_app_role`, no por decisión arbitraria. Detalle completo: 18.24, Decisión 2.

**3. `OwnershipVerificationService` complementa RLS, no lo sustituye.** Ambos mecanismos operan como capas independientes de defensa en profundidad — la verificación de propiedad en Application Layer se mantiene activa en todos los Handlers, incluidos los que ya usan `withStudentContext`. Detalle completo: 18.24, Restricciones.

**4. Deuda reconocida, no cerrada por esta resolución:** `learning_plan` (y por extensión `learning_goal`/`learning_phase`) carecen de `GRANT` de escritura para `dashboard_app_role` — la migración de RLS que 18.20 prometió para `learning_plan` nunca se ejecutó. Cerrar esa deuda requiere una migración nueva, fuera de alcance de 18.24. Detalle completo: 18.24, "Deuda reconocida".

**Consolidación documental:** esta adenda, junto con el cierre del Handler `RequestPlanReorganization` (Sprint 3.3.4.2, ya incorporado en el punto 2 de esta misma Parte), deja la aplicación de RLS en Infrastructure sin contradicciones conocidas frente a la matriz de `GRANT`/políticas ya migrada. La deuda de `learning_plan`/`learning_goal`/`learning_phase` (punto 4) queda pendiente para una resolución y migración futuras, no incluidas en el alcance de 18.24.
