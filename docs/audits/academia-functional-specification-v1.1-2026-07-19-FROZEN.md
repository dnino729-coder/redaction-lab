# ACADEMIA — ESPECIFICACIÓN FUNCIONAL

**Versión:** 1.1
**Fecha:** 2026-07-19
**Estado:** FROZEN
**Documentos dependientes:** `academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10), `academia-domain-model-v1.1-2026-07-19.md` (Frozen), `academia-application-model-v1.0-2026-07-19.md`, `academia-domain-vs-application-audit-2026-07-19.md` (Change Proposal CH-01), `academia-arb-resoluciones-pendientes-2026-07-19.md` (Resolución ARB de los cinco pendientes funcionales).

**Historial de cambios**

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-07-19 | Versión inicial. Cinco puntos marcados PENDIENTE DE DECISIÓN FUNCIONAL (CU-11 "asignar", integración "Editor", tiempos de espera de retroalimentación IA, bloqueo docente en sesión activa, accesibilidad). |
| 1.1 | 2026-07-19 | Integradas las cinco decisiones aprobadas por el Architecture Review Board (`academia-arb-resoluciones-pendientes-2026-07-19.md`). Eliminadas todas las marcas PENDIENTE DE DECISIÓN FUNCIONAL. Actualizadas Secciones 2, 6, 7 (CU-11), 8, 9, 11, 14, 16 y 17. Ninguna regla funcional previa fue alterada; ninguna funcionalidad nueva fue añadida. Documento congelado (FROZEN). |

**Fuentes (ninguna modificada):** `02_Conocimiento_Consolidado_Resuelto.md`, `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10), `docs/audits/academia-domain-model-v1.1-2026-07-19.md` (Frozen), `docs/audits/academia-application-model-v1.0-2026-07-19.md`, `docs/audits/academia-domain-vs-application-audit-2026-07-19.md` (Change Proposal CH-01), `docs/audits/academia-arb-resoluciones-pendientes-2026-07-19.md`.

**Nota de trazabilidad (heredada de v1.0):** el Domain Model ratificado vigente es **v1.1 (Frozen)**; **CH-01** (tipificación de `TeacherId`) es una propuesta aprobable, de efecto puramente de tipo, aún no incorporada a un documento v1.2 formal. Ninguna de las cinco decisiones de este documento requirió modificar el Domain Model ni el Application Model — condición explícita del ARB que las emitió.

**Alcance de este documento:** especificación funcional/de producto, no técnica. No contiene código, TypeScript, Prisma, APIs, endpoints, DTOs ni componentes. No modifica el Domain Model, el Application Model ni ninguna resolución A-01–A-10.

---

## 1. Objetivo del módulo

**Qué problema resuelve.** Antes de que el estudiante practique libremente (Laboratorio) o se examine en condiciones reales (Simulador), necesita construir de forma guiada y secuencial las competencias de producción escrita propias de cada tipo de texto DELF B2. Academia resuelve ese vacío: es el ecosistema que "construye el conocimiento" (§8.11) mediante unidades de práctica estructurada, con retroalimentación formativa continua.

**Qué valor aporta.** Traduce el principio pedagógico central del proyecto — *"escribir es el mecanismo mediante el cual se construye el aprendizaje"* (§7.1) — en un recorrido operable: cada unidad seguirá exactamente la secuencia oficial de 11 pasos (A-02: Contextualizar → Definir objetivos → Comprender → Observar → Analizar → Practicar → Producir → Recibir retroalimentación → Reescribir → Reflexionar → Desbloquear), con progresión controlada (A-03) y retroalimentación exclusivamente formativa, nunca sumativa (A-05).

**Qué NO hace (límites ya resueltos, vinculantes — A-01, A-04, A-05, A-06):**
- No enseña la teoría/estructura del examen ni sus criterios oficiales — eso pertenece íntegramente a **Conoce el DELF**, un ecosistema distinto.
- No ofrece práctica libre sin guía — eso pertenece a **Laboratorio**.
- No evalúa de forma oficial/sumativa ni certifica — eso pertenece a **Evaluación Final/Simulador**.
- No es un "Corrector Inteligente" independiente — la corrección es una capacidad transversal del Coach IA/Feedback Engine, que Academia consume, no posee.
- No decide qué contenido priorizar para un estudiante — esa autoridad es del Motor Pedagógico Adaptativo.

---

## 2. Usuarios

| Usuario | Permisos sobre Academia |
|---|---|
| **Estudiante** | Iniciar una unidad desbloqueada; producir, recibir retroalimentación, reescribir y reflexionar dentro de ella; repetir una unidad ya completada, sin límite; consultar su propio mapa de unidades, historial e intentos; consultar la Biblioteca de Modelos. No puede editar contenido editorial ni ver el progreso de otros estudiantes. |
| **Profesor** | Observar el progreso agregado de sus estudiantes/grupos en Academia; revisar todas las producciones, versiones e historial de retroalimentación de sus estudiantes; forzar el bloqueo de una unidad ya desbloqueada; autorizar/forzar el reinicio de una unidad completada; **recomendar** unidades específicas a un estudiante o grupo (acción exclusivamente informativa: no modifica `UnitState` ni desbloquea unidades — ver CU-11). No puede editar el contenido editorial de las unidades ni de la Biblioteca de Modelos — eso es exclusivo del Administrador. |
| **Administrador** | Crear, editar y retirar contenido de la Biblioteca de Modelos (`ModelExample`); gestionar el contenido editorial de las unidades (lecciones, actividades, ejemplos, rúbricas formativas — §6.15), sin necesidad de modificar código. No interviene en el progreso de ningún estudiante ni en las anulaciones docentes (facultad exclusiva del Profesor). |

---

## 3. Objetivos pedagógicos

**Relación con el CECRL.** El alcance vigente del MVP es exclusivamente DELF B2 (§4.1, §7.7), pero el modelo de nivel ya está preparado para el marco completo A1–C2 (resolución 18.17: `WritingTask.delf_level` generalizado, con B2 como único valor operativo durante el MVP), habilitando sin migración incompatible la extensión futura a otros niveles DELF y a DALF C1/C2 (§4.6).

**Progresión del estudiante — fundamento pedagógico (§7.1–§7.2, ya vinculante, formalizado por Academia como la secuencia oficial de 11 pasos, A-02):** el estudiante nunca comienza escribiendo directamente — primero contextualiza y define objetivos, luego comprende la consigna (con verificación explícita antes de poder producir texto), observa múltiples modelos auténticos, analiza su organización, practica en pequeño formato, produce su primera versión, recibe retroalimentación jerarquizada (macro antes que micro), reescribe al menos una vez, y cierra con reflexión metacognitiva antes de desbloquear la siguiente unidad.

**Competencias objetivo (§7.4, ya vinculante):** `TaskAchievement, Coherence, Cohesion, Vocabulary, Grammar, Morphosyntax, Spelling, Register, Argumentation, TextStructure, Revision, Autonomy` — cada unidad de Academia contribuye evidencia sobre estas competencias a través de su ciclo de retroalimentación.

**Neuroaprendizaje.** Academia aplica los 8 principios NeuroUX (§8.1: reducir carga cognitiva extrínseca, favorecer atención sostenida, estimular recuperación activa, promover práctica deliberada, fortalecer metacognición, construir hábitos, incrementar autoeficacia, favorecer autonomía) y el principio de andamiaje decreciente (§8.10: ayuda intensa al inicio, cada vez más discreta a medida que el estudiante domina un tipo de texto). La repetición sin límite de una unidad (A-09) y el criterio de `MASTERED` (A-07: evidencia sostenida de competencia en al menos dos encuentros independientes) operacionalizan la práctica espaciada y la recuperación activa (§7.3) dentro del marco ya aprobado.

---

## 4. Estructura funcional

**Unidades.** La unidad mínima de trabajo dentro de Academia. Existe una por combinación (Estudiante, Tipo de Texto, posición en la progresión). Tipos de texto vigentes: carta (`LETTER`), artículo (`ARTICLE`), ensayo (`ESSAY`), correo (`EMAIL`), informe (`REPORT`) — §13.5, ya vinculante.

**Tarjetas/mapa de unidades.** Cada estudiante ve, por tipo de texto, el conjunto de unidades con su estado visible (bloqueada, desbloqueada, en curso, completada, dominada), incluyendo la marca visual de las unidades recomendadas por su Profesor cuando corresponda (ver CU-11).

**Estados de una unidad (A-07, exactos, sin variación):** `LOCKED` (bloqueada) → `UNLOCKED` (desbloqueada, no iniciada) → `IN_PROGRESS` (en curso) → `AWAITING_FEEDBACK` (esperando retroalimentación) → `REVISION` (reescribiendo) → `REFLECTION` (reflexionando) → `COMPLETED` (completada) → `MASTERED` (dominada).

**Actividades internas de una unidad.** Los 11 pasos oficiales (A-02), ejecutados en orden estricto, sin omisión.

**Progreso.** A nivel de unidad: posición dentro de los 11 pasos. A nivel de módulo: conteo de unidades por estado, por tipo de texto, expuesto al propio estudiante y, de forma agregada, al Profesor (A-10).

**Bloqueos y desbloqueos.** Una unidad se desbloquea únicamente cuando la unidad predecesora de la misma progresión alcanza `COMPLETED` — sin umbral de puntuación (A-03). Única excepción: anulación manual del Profesor (A-10). La recomendación docente (CU-11) no constituye una excepción de desbloqueo.

**Recomendaciones.** El Motor Pedagógico Adaptativo prioriza qué unidades destacar para un estudiante según sus competencias débiles/fuertes (§9.7) — esto afecta únicamente el orden de presentación/énfasis, nunca el estado de bloqueo de una unidad (A-03 excluye explícitamente al Motor Pedagógico de la capacidad de desbloquear). La recomendación del Profesor (CU-11) opera bajo el mismo principio: prioriza/destaca, nunca desbloquea.

**Biblioteca de Modelos.** Colección de producciones ejemplares (completas, con análisis comparativo de por qué unas puntúan mejor que otras), propiedad exclusiva de Academia (A-04), consumida durante los pasos Observar/Analizar. Distinta de la Biblioteca temática de Laboratorio, sin superposición.

**Editor de Escritura.** Funcionalidad interna exclusiva de Academia: el mecanismo de borrador, versión y envío (`Draft`/`Version`, entidades del agregado `Attempt` en el Domain Model) que sostiene el paso "Producir" y los ciclos de reescritura. No es un módulo independiente ni se comparte con otros ecosistemas.

**Continuidad ("Continúa donde te quedaste").** Al reingresar, el estudiante retoma exactamente la unidad, el paso y el contenido en curso donde lo dejó — sin expiración por abandono (A-06).

---

## 5. Flujo completo del estudiante

1. Entra a la plataforma; el Dashboard le ofrece acceso a Academia (bloque "Acceso a los ecosistemas") o continuidad directa si tenía una unidad en curso (bloque "Continúa donde te quedaste", §6.3).
2. Ve el mapa de unidades de Academia, organizado por tipo de texto, con su estado visible y, si aplica, la marca de unidades recomendadas por su Profesor.
3. Selecciona una unidad desbloqueada e inicia el recorrido.
4. Recorre, en orden estricto y sin poder omitir pasos: Contextualizar → Definir objetivos → Comprender (con verificación de comprensión antes de poder continuar) → Observar (modelos auténticos, incluida la Biblioteca de Modelos) → Analizar → Practicar → Producir su propio texto.
5. Envía su producción; recibe retroalimentación formativa jerarquizada (macro antes que micro, nunca la rúbrica oficial DELF), en tono no punitivo (§8.6), dentro de la ventana de espera definida en la Sección 11.
6. Reescribe al menos una vez, pudiendo repetir el ciclo producir-retroalimentar-reescribir tantas veces como desee.
7. Reflexiona (preguntas metacognitivas) y cierra la unidad (resumen del aprendizaje, evidencias de progreso, próximo paso, despedida del Coach IA — §8.9).
8. La unidad queda `COMPLETED`; si corresponde, se notifica la finalización a Mi Plan y se desbloquea la siguiente unidad de la progresión.
9. El estudiante regresa de forma natural al Dashboard u otra actividad recomendada — nunca al menú principal sin orientación (§6.3).
10. En cualquier momento posterior, puede repetir una unidad ya completada (sin límite) o, si demuestra dominio sostenido en encuentros independientes, la unidad pasa a `MASTERED`.

---

## 6. Flujo completo del profesor

1. Accede al Espacio del Profesor y consulta el progreso agregado de Academia de un estudiante o grupo (unidades bloqueadas/desbloqueadas/en curso/completadas/dominadas).
2. Revisa las producciones de un estudiante: todas las versiones enviadas y toda la retroalimentación recibida en cada una.
3. Si lo considera necesario, fuerza el bloqueo de una unidad ya desbloqueada, o autoriza el reinicio de una unidad ya completada, dejando registro de la acción, autor y motivo. Si el estudiante tiene una sesión activa en la unidad bloqueada, aplica el comportamiento definido en la Sección 14 (el estado cambia de inmediato; el trabajo en curso se conserva; el estudiante recibe el aviso en su siguiente interacción).
4. Puede recomendar unidades específicas a un estudiante o grupo: esta acción registra una prioridad visible para el estudiante, sin modificar el estado de ninguna unidad ni desbloquearla (ver CU-11).

**Restricciones:** el Profesor no puede editar el contenido de las unidades ni de la Biblioteca de Modelos (exclusivo del Administrador); no puede alterar el criterio general de desbloqueo para todos los estudiantes, solo aplicarlo/revertirlo caso por caso; no puede ver ni intervenir sobre estudiantes fuera de su relación docente establecida (verificación de esa relación: fuera del alcance de Academia, pertenece a Organización Académica).

---

## 7. Casos de uso

**CU-01 — Iniciar una unidad**
- Objetivo: comenzar el recorrido guiado de un tipo de texto.
- Actor: Estudiante.
- Precondiciones: unidad en estado `UNLOCKED`; sin unidad en curso simultánea para esa misma instancia.
- Flujo principal: el estudiante selecciona la unidad; el sistema presenta el paso "Contextualizar".
- Excepciones: unidad bloqueada (no se puede iniciar); ya existe un intento activo para esa unidad (se ofrece continuar, no iniciar de nuevo).
- Resultado: unidad en `IN_PROGRESS`, primer paso activo.

**CU-02 — Recorrer los pasos previos a la producción**
- Objetivo: preparar al estudiante antes de escribir (Contextualizar, Definir objetivos, Comprender, Observar, Analizar, Practicar).
- Actor: Estudiante.
- Precondiciones: unidad en `IN_PROGRESS`.
- Flujo principal: el estudiante avanza paso a paso, sin poder saltar ninguno; el paso "Comprender" exige verificación explícita antes de continuar.
- Excepciones: intento de saltar directamente a "Producir" sin comprensión verificada — rechazado.
- Resultado: estudiante habilitado para el paso "Producir".

**CU-03 — Producir y enviar la primera versión**
- Objetivo: registrar la primera producción escrita del estudiante para la unidad.
- Actor: Estudiante.
- Precondiciones: comprensión verificada.
- Flujo principal: el estudiante escribe (con autoguardado continuo, A-06); al finalizar, envía su producción.
- Excepciones: producción vacía o incompleta — rechazada, no se permite el envío.
- Resultado: unidad en `AWAITING_FEEDBACK`.

**CU-04 — Recibir retroalimentación**
- Objetivo: obtener evaluación formativa sobre la producción enviada.
- Actor: Estudiante (receptor), Coach IA (emisor, vía contrato con Academia).
- Precondiciones: producción enviada, unidad en `AWAITING_FEEDBACK`.
- Flujo principal: se genera retroalimentación jerarquizada macro→micro (10 categorías: comprensión, intención comunicativa, estructura, coherencia, cohesión, argumentación, registro, vocabulario, gramática, ortografía), en tono no punitivo, mediante el modelo híbrido de entrega definido en la Sección 11 (respuesta inmediata cuando es posible; en caso contrario, procesamiento asíncrono con notificación automática al finalizar); se entrega al estudiante.
- Excepciones: la generación excede el máximo de 3 minutos — el sistema notifica al estudiante que la retroalimentación seguirá disponible cuando esté lista, sin bloquear su sesión.
- Resultado: unidad en `REVISION`.

**CU-05 — Reescribir**
- Objetivo: mejorar la producción aplicando la retroalimentación recibida.
- Actor: Estudiante.
- Precondiciones: retroalimentación entregada.
- Flujo principal: el estudiante reescribe; puede volver a enviar para una nueva ronda de retroalimentación tantas veces como desee, sin límite.
- Excepciones: ninguna — la reescritura es siempre posible mientras la unidad esté en curso.
- Resultado: al menos un ciclo completo de reescritura antes de poder avanzar a Reflexionar.

**CU-06 — Reflexionar y completar la unidad**
- Objetivo: cerrar el ciclo de aprendizaje de la unidad.
- Actor: Estudiante.
- Precondiciones: al menos un ciclo de reescritura completado.
- Flujo principal: el estudiante responde preguntas metacognitivas; el sistema presenta el cierre (resumen, evidencias de progreso, próximo paso, despedida del Coach IA).
- Excepciones: ninguna.
- Resultado: unidad `COMPLETED`; posible notificación a Mi Plan; posible desbloqueo de la siguiente unidad.

**CU-07 — Repetir una unidad completada**
- Objetivo: volver a practicar un tipo de texto ya dominado o completado.
- Actor: Estudiante.
- Precondiciones: unidad en `COMPLETED` o `MASTERED`.
- Flujo principal: el estudiante inicia un nuevo recorrido completo desde el paso 1, sin afectar el logro ya obtenido.
- Excepciones: unidad no elegible (no está `COMPLETED`/`MASTERED`) — rechazado.
- Resultado: nuevo recorrido en curso; el estado de logro de la unidad no cambia.

**CU-08 — Consultar la Biblioteca de Modelos**
- Objetivo: observar y analizar producciones ejemplares durante los pasos correspondientes.
- Actor: Estudiante.
- Precondiciones: ninguna más allá de estar en los pasos Observar/Analizar.
- Flujo principal: el estudiante consulta ejemplos del tipo de texto correspondiente, con comentario comparativo de la IA.
- Excepciones: ejemplo no disponible (retirado por el Administrador) — se omite sin bloquear el flujo.
- Resultado: el estudiante continúa su recorrido con mayor comprensión del criterio de calidad.

**CU-09 — Revisar progreso agregado (Profesor)**
- Objetivo: visibilidad del avance de un estudiante/grupo.
- Actor: Profesor.
- Precondiciones: relación docente establecida con el estudiante/grupo.
- Flujo principal: el Profesor consulta el resumen de unidades por estado.
- Excepciones: sin relación docente establecida — acceso denegado.
- Resultado: vista de progreso agregado.

**CU-10 — Forzar bloqueo o reinicio (Profesor)**
- Objetivo: aplicar una excepción manual justificada sobre el progreso de un estudiante.
- Actor: Profesor.
- Precondiciones: relación docente establecida; la unidad se encuentra en un estado elegible para la acción solicitada (bloqueo: cualquier estado activo salvo ya bloqueada; reinicio: solo desde completada/dominada).
- Flujo principal: el Profesor selecciona la unidad y la acción, indica un motivo; el sistema registra la acción con autor y fecha. Si el bloqueo se aplica sobre una unidad con sesión activa del estudiante, el estado cambia de inmediato; el contenido en curso del estudiante se conserva (autoguardado, A-06); el estudiante recibe el aviso, en tono no punitivo, en su siguiente interacción con la unidad.
- Excepciones: acción no válida para el estado actual — rechazada.
- Resultado: unidad ajustada según la acción; registro de auditoría creado; ninguna pérdida de información del estudiante.

**CU-11 — Recomendar unidad a estudiante/grupo (Profesor)**
- Objetivo: destacar/priorizar una unidad específica para un estudiante o grupo, como orientación pedagógica.
- Actor: Profesor.
- Precondiciones: relación docente establecida con el estudiante/grupo.
- Flujo principal: el Profesor selecciona la unidad y el estudiante o grupo destinatario; el sistema registra la recomendación como metadato asociado al estudiante, sin invocar ninguna transición de `UnitState`.
- Excepciones: sin relación docente establecida — acceso denegado. La unidad recomendada puede encontrarse en cualquier estado (incluido `LOCKED`); la recomendación no altera ese estado.
- Resultado: la unidad aparece destacada/priorizada en el mapa de unidades del estudiante (p. ej., "Recomendada por tu profesor"), distinguible visualmente de las unidades efectivamente desbloqueadas; el estado real de la unidad permanece sin cambios.

---

## 8. Reglas funcionales (visibles para el usuario — no se repiten las reglas internas ya protegidas por el Domain Model)

1. La secuencia de una unidad tiene siempre 11 pasos fijos; ninguna unidad los omite ni los reordena.
2. No se puede escribir sin antes demostrar comprensión de la consigna.
3. Toda retroalimentación es formativa; nunca se muestra una puntuación de certificación DELF dentro de Academia.
4. Toda producción enviada genera una nueva versión; ninguna versión anterior se modifica ni se pierde.
5. Es obligatorio reescribir al menos una vez antes de poder reflexionar y cerrar la unidad.
6. El desbloqueo de la siguiente unidad depende únicamente de completar la actual — nunca de una calificación mínima ni de una recomendación docente.
7. Una unidad completada o dominada puede repetirse sin límite de veces, sin perder el logro ya obtenido.
8. El Profesor puede forzar el bloqueo o el reinicio de una unidad, dejando siempre constancia de quién y por qué.
9. Ningún texto de retroalimentación usa expresiones categóricas de fracaso ("incorrecto", "fallaste").
10. El trabajo en curso del estudiante nunca se pierde por abandono — se restaura exactamente donde se dejó.
11. Solo el Administrador edita el contenido editorial (unidades, Biblioteca de Modelos); el Profesor solo puede recomendar/bloquear/reiniciar, nunca editar contenido.
12. La recomendación docente de una unidad (CU-11) es exclusivamente informativa: nunca modifica el estado de la unidad ni sustituye el criterio de desbloqueo de la Regla 6.
13. Si el Profesor bloquea una unidad con una sesión activa del estudiante, el cambio de estado es inmediato, el trabajo en curso se conserva íntegramente, y el aviso al estudiante se presenta en su siguiente interacción, nunca como interrupción abrupta de la sesión.

---

## 9. Integraciones

| Módulo | Relación con Academia |
|---|---|
| **Mi Plan** | Academia notifica la finalización de una unidad únicamente si esa unidad corresponde a una tarea ya planificada en Mi Plan — un único aviso por unidad, nunca en repeticiones. Mi Plan nunca escribe sobre Academia. |
| **Laboratorio** | Sin integración funcional directa. Ambos son ecosistemas hermanos con propósitos distintos (Academia construye conocimiento guiado; Laboratorio permite práctica libre) — comparten únicamente el principio de secuencia pedagógica general (§8.11), no datos ni estado. |
| **Editor** | Funcionalidad interna exclusiva de Academia (ver Sección 4). No constituye un módulo independiente ni reutilizable por otros ecosistemas. Si Laboratorio o Simulador requieren en el futuro una superficie de escritura equivalente, deberán implementar su propio mecanismo dentro de su propio alcance, sin dependencia funcional de Academia. |
| **Corrector IA** | No es un módulo con el que Academia "se integra" en sentido estricto — es la misma capacidad transversal (Coach IA/Feedback Engine) que Academia consume directamente para generar la retroalimentación de cada unidad, bajo el modelo híbrido de entrega definido en la Sección 11. |
| **Evolución** | Academia es productora, no consumidora: cada producción evaluada aporta evidencia de competencia que Evolución/Analíticas de Aprendizaje agrega y presenta al estudiante. Academia no consulta ni depende de Evolución para su propio funcionamiento. |
| **Gamificación** | Academia publica la finalización y el dominio de una unidad como eventos; Gamificación decide, de forma completamente independiente, si y qué recompensa otorgar. Academia nunca calcula, otorga ni revoca recompensas — ni siquiera al repetir una unidad. |
| **Panel docente (Espacio del Profesor)** | Consume el progreso agregado y el historial de producciones de Academia (solo lectura), y ejerce las facultades ya descritas en la Sección 6 (bloqueo/reinicio/recomendación) directamente sobre Academia. |
| **Perfil** | Academia referencia la identidad del estudiante (nivel, idioma nativo, preferencias) sin poseerla ni modificarla — toda esa información pertenece al módulo de Perfiles. |

---

## 10. IA

**Qué decisiones toma la IA dentro de Academia:**
- Genera la retroalimentación formativa de cada producción, siguiendo estrictamente las 10 categorías jerarquizadas (macro antes que micro), bajo el modelo híbrido de entrega (Sección 11).
- Verifica si la comprensión de la consigna, expresada por el estudiante, es suficiente para continuar al paso de producción.
- Genera contenido de apoyo dentro de las "Actividades IA" del recorrido (ejercicios cortos de práctica antes de la producción completa).
- Genera comentario comparativo dentro de la Biblioteca de Modelos (por qué una producción puntúa mejor que otra).

**Qué la IA nunca decide dentro de Academia:**
- Nunca decide el flujo pedagógico ni el orden de prioridad de las unidades — esa autoridad es exclusiva del Motor Pedagógico Adaptativo.
- Nunca redacta ni completa la producción escrita del estudiante.
- Nunca decide si una unidad se desbloquea, se completa o se considera dominada — esas son reglas automáticas del propio módulo, no decisiones discrecionales de la IA.
- Nunca aplica la rúbrica oficial DELF ni otorga una puntuación de certificación.
- Nunca decide, por sí misma, recompensas de gamificación.

**Qué información consume:** la producción enviada por el estudiante, su perfil pedagógico, su historial reciente dentro de la unidad, la memoria pedagógica del Coach IA acumulada de sesiones anteriores, y el objetivo/tipo de intervención del paso actual (§9.4, ya vinculante).

**Qué información produce:** el conjunto de observaciones de retroalimentación (una por cada categoría aplicable, con explicación y sugerencia de mejora), la validación/rechazo de la comprensión declarada, y contenido de práctica corta contextual.

---

## 11. Experiencia de usuario

**Navegación:** estrictamente secuencial dentro de una unidad (no se puede saltar pasos); libre entre unidades ya desbloqueadas dentro del mapa; nunca regresa automáticamente al menú principal al cerrar una actividad — siempre ofrece una transición hacia el siguiente paso natural (§6.3).

**Retroalimentación:** siempre sigue la secuencia de cuatro pasos ya establecida (reconocer el esfuerzo, explicar el aspecto a mejorar, ofrecer una explicación adaptada, proponer una acción concreta — §8.6), nunca usa lenguaje de fracaso.

**Carga cognitiva:** aplicación directa de los 8 principios NeuroUX (Sección 3) — en particular, ninguna unidad presenta más de un objetivo principal por pantalla/paso (principio de segmentación, §7.3).

**Accesibilidad:** Academia adopta como requisito mínimo obligatorio **WCAG 2.1 nivel AA**, aplicado explícitamente a: contraste (mínimo 4.5:1 texto normal, 3:1 texto grande, en todo el recorrido y en la retroalimentación); teclado (los 11 pasos, la producción de texto y la navegación del mapa de unidades completamente operables sin mouse); lectores de pantalla (estructura semántica navegable por paso, con estados anunciados al cambiar); navegación (orden de foco alineado a la secuencia de 11 pasos, sin trampas de foco); responsive (heredado del estándar de plataforma, sin excepción); neurodiversidad (sin límites de tiempo forzados dentro de una unidad, ya garantizado por A-06 y por el tono no punitivo de §8.6). Este nivel es un piso para Academia y no sustituye ni reduce ningún estándar igual o superior que el Design System general del proyecto (§14.9) ya establezca.

**Motivación:** aplicación directa de los 6 principios de motivación ya establecidos (§8.7: propósito visible, progreso visible, objetivos alcanzables, autonomía, reconocimiento del esfuerzo, formación de hábitos) — sin mensajes de comparación entre estudiantes ni presión por rendimiento.

**Microinteracciones:** transiciones de pantalla limitadas a 400 ms como máximo (resolución 18.8, ya vinculante para todo el proyecto, aplicable sin excepción a Academia).

**Tiempos de espera de retroalimentación IA:** modelo **híbrido**. Cuando es posible, se ofrece respuesta inmediata; en caso contrario, el sistema procesa la retroalimentación de forma asíncrona. Ventana objetivo: 60 segundos. Máximo aceptable: 3 minutos. Si se alcanza el máximo, el sistema notifica automáticamente al estudiante cuando la retroalimentación esté lista, sin obligarlo a permanecer esperando ni a perder su sesión (continuidad garantizada por A-06).

---

## 12. Gamificación

**Cómo se integra:** Academia no implementa gamificación por sí misma — es únicamente fuente de eventos (finalización de unidad, dominio sostenido) que Gamificación consume de forma independiente para decidir recompensas, siguiendo el modelo ya definido (§11.4: `Reward`, `RewardClaim`, tipos `BADGE, AVATAR, THEME, CERTIFICATE, BONUS`).

**Qué recompensas existen:** las ya documentadas a nivel de plataforma (insignias, avatares, temas, certificados, bonos) — Academia no define tipos de recompensa propios ni exclusivos.

**Qué desbloquea:** Academia misma no desbloquea recompensas — solo desbloquea la siguiente unidad de su propia progresión (Sección 4). Cualquier recompensa asociada a completar/dominar una unidad es decisión y cálculo exclusivo de Gamificación.

**Qué nunca modifica:** Academia nunca otorga, calcula ni revoca una recompensa — ni siquiera al repetir una unidad ya recompensada (A-09 ya establece que la repetición no revoca recompensas previamente otorgadas, precisamente porque Academia nunca tuvo autoridad sobre ellas).

---

## 13. Analítica

**Qué métricas genera (de forma indirecta, como productora de eventos/evidencia, no como consumidora de sus propios indicadores):** finalización de unidades por tipo de texto, número de ciclos de reescritura por producción, tiempo entre pasos, unidades dominadas por competencia.

**Qué eventos registra:** inicio de unidad, envío de producción, entrega de retroalimentación, finalización de unidad, repetición de unidad, dominio alcanzado, anulación docente aplicada, recomendación docente registrada — cada uno con su marca de tiempo.

**Qué indicadores calcula:** ninguno directamente — Academia produce evidencia (eventos y evaluaciones de competencia por producción), pero el cálculo de indicadores agregados (índices de productividad, consistencia, progresión) es responsabilidad exclusiva de Evolución/Learning Analytics (§13.8), consistente con la regla ya vinculante de que ningún módulo duplica información ya derivable de otro.

---

## 14. Riesgos

**Errores funcionales:** intentar iniciar una unidad bloqueada; intentar producir sin comprensión verificada; intentar reflexionar sin al menos un ciclo de reescritura; intentar repetir una unidad que no está completada ni dominada; el Profesor intentando una acción no válida para el estado actual de la unidad.

**Errores pedagógicos:** retroalimentación que, por error de generación de IA, comienza por aspectos gramaticales en vez de macrotextuales (violación de la jerarquía ya establecida, §9.5); retroalimentación con lenguaje de fracaso (violación de §8.6); secuencia de pasos alterada por un defecto de implementación (violación de A-02).

**Errores de UX:** pérdida de continuidad si el autoguardado falla silenciosamente (riesgo directo sobre la promesa de A-06); incumplimiento del techo de 3 minutos de espera de retroalimentación sin la notificación correspondiente (violación de la Sección 11); si un bloqueo docente ocurre exactamente en el instante entre una pulsación de teclado y el autoguardado, el estudiante podría percibir pérdida de trabajo — riesgo de implementación del autoguardado, no de la regla funcional (Sección 8, Regla 13), que ya garantiza conservación del trabajo y aviso no abrupto.

**Errores de IA:** la IA redactando o completando parcialmente la producción del estudiante (violación directa de §4.4/§8.5); la IA aplicando la rúbrica oficial DELF dentro de Academia (violación directa de A-05); recomendaciones de contenido que contradicen la priorización real del Motor Pedagógico (violación de la relación Conformist ya establecida).

---

## 15. Dependencias

**Qué necesita Academia de otros módulos:** identidad y perfil del estudiante (Perfil); confirmación de si una unidad corresponde a una tarea planificada (Mi Plan, solo para decidir si notifica finalización); capacidad de generación de retroalimentación (Coach IA); señal de priorización de contenido (Motor Pedagógico); resolución de la relación docente-estudiante y de membresía de grupo (Organización Académica) — necesaria para autorizar las acciones del Profesor descritas en la Sección 6; sistema de notificaciones (para el aviso automático al finalizar retroalimentación diferida, Sección 11).

**Qué módulos dependen de Academia:** Mi Plan (recibe la notificación de finalización de tareas vinculadas a Academia); Gamificación (recibe los eventos de finalización/dominio que disparan su propia lógica de recompensa); Dashboard (consume el resumen de estado de Academia para "Continúa donde te quedaste" y el bloque de ecosistemas); Evolución (consume la evidencia de competencia generada por cada producción evaluada).

---

## 16. Criterios de aceptación

1. Ninguna unidad puede iniciarse si su estado no es `UNLOCKED`.
2. Ninguna unidad permite avanzar al paso "Producir" sin verificación de comprensión previa.
3. Toda retroalimentación mostrada al estudiante usa exclusivamente las 10 categorías formativas, nunca la rúbrica oficial DELF.
4. Ninguna unidad permite avanzar a "Reflexionar" sin al menos un ciclo de reescritura completado.
5. El desbloqueo de la siguiente unidad ocurre únicamente cuando la actual llega a `COMPLETED`, sin excepción basada en puntuación ni en recomendación docente.
6. Una unidad `COMPLETED`/`MASTERED` puede repetirse un número ilimitado de veces sin alterar su estado de logro.
7. Ninguna versión enviada por el estudiante se sobrescribe; toda reescritura genera una versión nueva y conserva las anteriores.
8. El sistema restaura exactamente la unidad, el paso y el contenido en curso tras cualquier abandono, sin límite de tiempo.
9. El Profesor solo puede forzar bloqueo/reinicio bajo las condiciones de estado ya definidas, y toda acción queda registrada con autor, motivo y fecha.
10. Ningún texto de retroalimentación generado por IA contiene expresiones de fracaso categórico.
11. Academia nunca escribe directamente sobre datos de Mi Plan, Gamificación, Laboratorio, Conoce el DELF o Dashboard — toda comunicación saliente ocurre mediante los eventos ya definidos.
12. La notificación de finalización hacia Mi Plan ocurre como máximo una vez por unidad, únicamente en la primera finalización, nunca en repeticiones.
13. El Administrador es el único actor capaz de crear/editar/retirar contenido de la Biblioteca de Modelos; el Profesor no tiene esa capacidad.
14. La Biblioteca de Modelos y la Biblioteca temática de Laboratorio permanecen como catálogos completamente independientes, sin datos compartidos ni referencias cruzadas.
15. Ninguna transición de estado de una unidad ocurre fuera de la máquina de estados oficial de 8 estados.
16. La recomendación docente de una unidad (CU-11) nunca produce, por sí sola, una transición de `UnitState`.
17. La retroalimentación se entrega dentro de la ventana objetivo de 60 segundos en el caso típico, y en ningún caso el estudiante permanece sin información más allá de 3 minutos sin recibir la notificación de espera extendida.
18. Si el Profesor bloquea una unidad con sesión activa, el estudiante nunca pierde contenido, y el aviso se presenta en su siguiente interacción, nunca como interrupción forzada de la sesión en curso.
19. Toda pantalla del recorrido de una unidad cumple, como mínimo, WCAG 2.1 nivel AA en contraste, operabilidad por teclado y compatibilidad con lectores de pantalla.

---

## 17. Checklist de implementación (previo a Infrastructure Model)

- [ ] Cerrar el Change Proposal CH-01 (tipificación de `TeacherId`) — Domain Model pasa formalmente a v1.2.
- [ ] Resolver la fuente/contrato de evidencia de competencia para el criterio `MASTERED` (dependencia con Learning Analytics, ya señalada como riesgo en el Domain Model).
- [ ] Resolver el mecanismo de verificación de la relación docente-estudiante y de membresía de grupo (contrato con Organización Académica).
- [ ] Definir el contenido editorial inicial disponible (unidades por tipo de texto, ejemplos de la Biblioteca de Modelos) antes de cualquier prueba funcional end-to-end.
- [ ] Confirmar la reutilización (o no) de patrones ya resueltos en Mi Plan (RLS, `UnitOfWork`, `AuditLog`) — decisiones ya clasificadas como Infrastructure en la auditoría previa, pendientes de una decisión explícita antes de construir el Infrastructure Model.
- [ ] Verificar que el nivel WCAG 2.1 AA adoptado en la Sección 11 es consistente con el nivel ya establecido en el Design System general del proyecto (§14.9), y documentar cualquier ajuste necesario.
- [ ] Trasladar el umbral de retroalimentación (objetivo 60s / máximo 3min) al Infrastructure Model como requisito no funcional de la integración con Coach IA.

---

## Evaluación final

Los cinco puntos que impedían la congelación funcional del módulo (CU-11/recomendación, integración de "Editor", tiempos de espera de retroalimentación IA, comportamiento ante bloqueo docente en sesión activa, y nivel de accesibilidad) quedaron resueltos de forma definitiva por el Architecture Review Board, sin modificar el Domain Model, el Application Model ni ninguna resolución A-01–A-10.

En consecuencia, la **Especificación Funcional del módulo Academia queda oficialmente congelada en su versión 1.1**. Los elementos que aún restan (cierre de CH-01, contrato de evidencia para `MASTERED`, verificación de relación docente-estudiante, contenido editorial inicial, reutilización de patrones de Infrastructure ya resueltos en Mi Plan, y verificación de consistencia del nivel WCAG con el Design System general) son tareas de cierre técnico u operativo — ninguna requiere una nueva decisión funcional — y se gestionan a través del checklist de la Sección 17, sin bloquear el inicio del Infrastructure Model.

---

## CERTIFICADO DE CONGELACIÓN

Se certifica que el presente documento, **Academia — Especificación Funcional v1.1**, constituye el **contrato funcional oficial** del módulo Academia para todas las fases posteriores del proyecto Rédaction Lab, incluyendo:

- Infrastructure Model
- API Contract
- Frontend Contract
- Implementación

Ninguna modificación posterior a este documento podrá realizarse sin la emisión previa de un **Change Proposal** formalmente aprobado.

**Estado:** FROZEN
**Versión congelada:** 1.1
**Fecha de congelación:** 2026-07-19
