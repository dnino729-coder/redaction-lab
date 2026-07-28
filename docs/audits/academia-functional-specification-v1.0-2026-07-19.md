# Especificación Funcional del Módulo Academia v1.0

**Fuentes (ninguna modificada):** `02_Conocimiento_Consolidado_Resuelto.md`, `docs/audits/academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10), `docs/audits/academia-domain-model-v1.1-2026-07-19.md` (Frozen), `docs/audits/academia-application-model-v1.0-2026-07-19.md`, `docs/audits/academia-domain-vs-application-audit-2026-07-19.md` (Change Proposal CH-01). **Fecha:** 2026-07-19.

**Nota de trazabilidad:** el encargo refiere "Domain Model v1.2 (Frozen)". Formalmente, en este momento solo existe el **Domain Model v1.1 (Frozen)** más una **propuesta de cambio aprobable, CH-01** (tipificar `TeacherId`, sin efecto en comportamiento) — v1.2 como documento ratificado aún no fue generado. Esta especificación funcional se apoya en v1.1, cuyo comportamiento es idéntico al que tendría v1.2 una vez cerrado CH-01 (cambio puramente de tipo, sin efecto funcional). Se señala por trazabilidad, sin bloquear este documento.

**Alcance de este documento:** especificación funcional/de producto, no técnica. No contiene código, TypeScript, Prisma, APIs, endpoints, DTOs ni componentes. No modifica el Domain Model, el Application Model ni ninguna resolución A-01–A-10. Toda ambigüedad detectada se marca **PENDIENTE DE DECISIÓN FUNCIONAL**, sin inventar respuesta.

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
| **Profesor** | Observar el progreso agregado de sus estudiantes/grupos en Academia; revisar todas las producciones, versiones e historial de retroalimentación de sus estudiantes; forzar el bloqueo de una unidad ya desbloqueada; autorizar/forzar el reinicio de una unidad completada; asignar unidades específicas a un estudiante o grupo (**alcance exacto de "asignar": PENDIENTE DE DECISIÓN FUNCIONAL**, ver Sección 7, CU-11). No puede editar el contenido editorial de las unidades ni de la Biblioteca de Modelos — eso es exclusivo del Administrador. |
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

**Tarjetas/mapa de unidades.** Cada estudiante ve, por tipo de texto, el conjunto de unidades con su estado visible (bloqueada, desbloqueada, en curso, completada, dominada).

**Estados de una unidad (A-07, exactos, sin variación):** `LOCKED` (bloqueada) → `UNLOCKED` (desbloqueada, no iniciada) → `IN_PROGRESS` (en curso) → `AWAITING_FEEDBACK` (esperando retroalimentación) → `REVISION` (reescribiendo) → `REFLECTION` (reflexionando) → `COMPLETED` (completada) → `MASTERED` (dominada).

**Actividades internas de una unidad.** Los 11 pasos oficiales (A-02), ejecutados en orden estricto, sin omisión.

**Progreso.** A nivel de unidad: posición dentro de los 11 pasos. A nivel de módulo: conteo de unidades por estado, por tipo de texto, expuesto al propio estudiante y, de forma agregada, al Profesor (A-10).

**Bloqueos y desbloqueos.** Una unidad se desbloquea únicamente cuando la unidad predecesora de la misma progresión alcanza `COMPLETED` — sin umbral de puntuación (A-03). Única excepción: anulación manual del Profesor (A-10).

**Recomendaciones.** El Motor Pedagógico Adaptativo prioriza qué unidades destacar para un estudiante según sus competencias débiles/fuertes (§9.7) — esto afecta únicamente el orden de presentación/énfasis, nunca el estado de bloqueo de una unidad (A-03 excluye explícitamente al Motor Pedagógico de la capacidad de desbloquear).

**Biblioteca de Modelos.** Colección de producciones ejemplares (completas, con análisis comparativo de por qué unas puntúan mejor que otras), propiedad exclusiva de Academia (A-04), consumida durante los pasos Observar/Analizar. Distinta de la Biblioteca temática de Laboratorio, sin superposición.

**Continuidad ("Continúa donde te quedaste").** Al reingresar, el estudiante retoma exactamente la unidad, el paso y el contenido en curso donde lo dejó — sin expiración por abandono (A-06).

---

## 5. Flujo completo del estudiante

1. Entra a la plataforma; el Dashboard le ofrece acceso a Academia (bloque "Acceso a los ecosistemas") o continuidad directa si tenía una unidad en curso (bloque "Continúa donde te quedaste", §6.3).
2. Ve el mapa de unidades de Academia, organizado por tipo de texto, con su estado visible.
3. Selecciona una unidad desbloqueada e inicia el recorrido.
4. Recorre, en orden estricto y sin poder omitir pasos: Contextualizar → Definir objetivos → Comprender (con verificación de comprensión antes de poder continuar) → Observar (modelos auténticos, incluida la Biblioteca de Modelos) → Analizar → Practicar → Producir su propio texto.
5. Envía su producción; recibe retroalimentación formativa jerarquizada (macro antes que micro, nunca la rúbrica oficial DELF), en tono no punitivo (§8.6).
6. Reescribe al menos una vez, pudiendo repetir el ciclo producir-retroalimentar-reescribir tantas veces como desee.
7. Reflexiona (preguntas metacognitivas) y cierra la unidad (resumen del aprendizaje, evidencias de progreso, próximo paso, despedida del Coach IA — §8.9).
8. La unidad queda `COMPLETED`; si corresponde, se notifica la finalización a Mi Plan y se desbloquea la siguiente unidad de la progresión.
9. El estudiante regresa de forma natural al Dashboard u otra actividad recomendada — nunca al menú principal sin orientación (§6.3).
10. En cualquier momento posterior, puede repetir una unidad ya completada (sin límite) o, si demuestra dominio sostenido en encuentros independientes, la unidad pasa a `MASTERED`.

---

## 6. Flujo completo del profesor

1. Accede al Espacio del Profesor y consulta el progreso agregado de Academia de un estudiante o grupo (unidades bloqueadas/desbloqueadas/en curso/completadas/dominadas).
2. Revisa las producciones de un estudiante: todas las versiones enviadas y toda la retroalimentación recibida en cada una.
3. Si lo considera necesario, fuerza el bloqueo de una unidad ya desbloqueada, o autoriza el reinicio de una unidad ya completada, dejando registro de la acción, autor y motivo.
4. Puede asignar unidades específicas a un estudiante o grupo (**PENDIENTE DE DECISIÓN FUNCIONAL** el efecto exacto de esta acción — ver CU-11).

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
- Flujo principal: se genera retroalimentación jerarquizada macro→micro (10 categorías: comprensión, intención comunicativa, estructura, coherencia, cohesión, argumentación, registro, vocabulario, gramática, ortografía), en tono no punitivo; se entrega al estudiante.
- Excepciones: retroalimentación no disponible en el tiempo esperado (**PENDIENTE DE DECISIÓN FUNCIONAL**, ver Sección 11).
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
- Flujo principal: el Profesor selecciona la unidad y la acción, indica un motivo; el sistema registra la acción con autor y fecha.
- Excepciones: acción no válida para el estado actual — rechazada.
- Resultado: unidad ajustada según la acción; registro de auditoría creado.

**CU-11 — Asignar unidad a estudiante/grupo (Profesor)** — **PENDIENTE DE DECISIÓN FUNCIONAL**
- Objetivo declarado por la resolución vigente: "asignar unidades específicas de Academia a un estudiante o a un grupo completo."
- No es posible completar los campos "flujo principal" y "resultado" de este caso de uso sin inventar comportamiento: no existe, en ninguna fuente vigente, una definición de si "asignar" (a) es una recomendación/anotación sin efecto sobre el estado de la unidad, o (b) hace accesible una unidad fuera del orden natural de desbloqueo. Ambas lecturas son documentalmente posibles y mutuamente excluyentes en su implementación. **Pregunta pendiente:** ¿"asignar" cambia el estado de una unidad (equivalente a un desbloqueo anticipado) o es exclusivamente una anotación informativa que no toca `UnitState`?

---

## 8. Reglas funcionales (visibles para el usuario — no se repiten las reglas internas ya protegidas por el Domain Model)

1. La secuencia de una unidad tiene siempre 11 pasos fijos; ninguna unidad los omite ni los reordena.
2. No se puede escribir sin antes demostrar comprensión de la consigna.
3. Toda retroalimentación es formativa; nunca se muestra una puntuación de certificación DELF dentro de Academia.
4. Toda producción enviada genera una nueva versión; ninguna versión anterior se modifica ni se pierde.
5. Es obligatorio reescribir al menos una vez antes de poder reflexionar y cerrar la unidad.
6. El desbloqueo de la siguiente unidad depende únicamente de completar la actual — nunca de una calificación mínima.
7. Una unidad completada o dominada puede repetirse sin límite de veces, sin perder el logro ya obtenido.
8. El Profesor puede forzar el bloqueo o el reinicio de una unidad, dejando siempre constancia de quién y por qué.
9. Ningún texto de retroalimentación usa expresiones categóricas de fracaso ("incorrecto", "fallaste").
10. El trabajo en curso del estudiante nunca se pierde por abandono — se restaura exactamente donde se dejó.
11. Solo el Administrador edita el contenido editorial (unidades, Biblioteca de Modelos); el Profesor solo puede asignar/bloquear/reiniciar, nunca editar contenido.

---

## 9. Integraciones

| Módulo | Relación con Academia |
|---|---|
| **Mi Plan** | Academia notifica la finalización de una unidad únicamente si esa unidad corresponde a una tarea ya planificada en Mi Plan — un único aviso por unidad, nunca en repeticiones. Mi Plan nunca escribe sobre Academia. |
| **Laboratorio** | Sin integración funcional directa. Ambos son ecosistemas hermanos con propósitos distintos (Academia construye conocimiento guiado; Laboratorio permite práctica libre) — comparten únicamente el principio de secuencia pedagógica general (§8.11), no datos ni estado. |
| **Editor** | No existe, en la documentación vigente, un módulo "Editor" independiente y separado de Academia — el mecanismo de escritura (borrador, versión, envío) es parte interna del propio recorrido de una unidad. **PENDIENTE DE DECISIÓN FUNCIONAL:** si Academia, Laboratorio y Simulador deben compartir un componente de edición de texto común (un "Editor" transversal) o si cada ecosistema mantiene su propio mecanismo de escritura de forma independiente — ninguna fuente lo resuelve. |
| **Corrector IA** | No es un módulo con el que Academia "se integra" en sentido estricto — es la misma capacidad transversal (Coach IA/Feedback Engine) que Academia consume directamente para generar la retroalimentación de cada unidad. |
| **Evolución** | Academia es productora, no consumidora: cada producción evaluada aporta evidencia de competencia que Evolución/Analíticas de Aprendizaje agrega y presenta al estudiante. Academia no consulta ni depende de Evolución para su propio funcionamiento. |
| **Gamificación** | Academia publica la finalización y el dominio de una unidad como eventos; Gamificación decide, de forma completamente independiente, si y qué recompensa otorgar. Academia nunca calcula, otorga ni revoca recompensas — ni siquiera al repetir una unidad. |
| **Panel docente (Espacio del Profesor)** | Consume el progreso agregado y el historial de producciones de Academia (solo lectura), y ejerce las facultades ya descritas en la Sección 6 (bloqueo/reinicio/asignación) directamente sobre Academia. |
| **Perfil** | Academia referencia la identidad del estudiante (nivel, idioma nativo, preferencias) sin poseerla ni modificarla — toda esa información pertenece al módulo de Perfiles. |

---

## 10. IA

**Qué decisiones toma la IA dentro de Academia:**
- Genera la retroalimentación formativa de cada producción, siguiendo estrictamente las 10 categorías jerarquizadas (macro antes que micro).
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

**Accesibilidad:** Academia hereda los estándares de accesibilidad ya establecidos a nivel de todo el proyecto (Design System, §14.9) — este documento no añade ni identifica ningún requisito de accesibilidad específico y distinto para Academia; si existiera uno (p. ej., tiempo extendido para estudiantes con necesidades documentadas), **queda como PENDIENTE DE DECISIÓN FUNCIONAL**, por no estar mencionado en ninguna fuente revisada.

**Motivación:** aplicación directa de los 6 principios de motivación ya establecidos (§8.7: propósito visible, progreso visible, objetivos alcanzables, autonomía, reconocimiento del esfuerzo, formación de hábitos) — sin mensajes de comparación entre estudiantes ni presión por rendimiento.

**Microinteracciones:** transiciones de pantalla limitadas a 400 ms como máximo (resolución 18.8, ya vinculante para todo el proyecto, aplicable sin excepción a Academia).

**Tiempos de espera:** **PENDIENTE DE DECISIÓN FUNCIONAL.** Ninguna fuente revisada define un tiempo máximo aceptable de espera para la retroalimentación de IA (CU-04), ni el comportamiento esperado de la interfaz si ese tiempo se excede (mensaje de espera, reintento automático, notificación diferida). Es una decisión de producto pendiente, no solo técnica, porque afecta directamente la experiencia de continuidad ya prometida (§6.3, A-06).

---

## 12. Gamificación

**Cómo se integra:** Academia no implementa gamificación por sí misma — es únicamente fuente de eventos (finalización de unidad, dominio sostenido) que Gamificación consume de forma independiente para decidir recompensas, siguiendo el modelo ya definido (§11.4: `Reward`, `RewardClaim`, tipos `BADGE, AVATAR, THEME, CERTIFICATE, BONUS`).

**Qué recompensas existen:** las ya documentadas a nivel de plataforma (insignias, avatares, temas, certificados, bonos) — Academia no define tipos de recompensa propios ni exclusivos.

**Qué desbloquea:** Academia misma no desbloquea recompensas — solo desbloquea la siguiente unidad de su propia progresión (Sección 4). Cualquier recompensa asociada a completar/dominar una unidad es decisión y cálculo exclusivo de Gamificación.

**Qué nunca modifica:** Academia nunca otorga, calcula ni revoca una recompensa — ni siquiera al repetir una unidad ya recompensada (A-09 ya establece que la repetición no revoca recompensas previamente otorgadas, precisamente porque Academia nunca tuvo autoridad sobre ellas).

---

## 13. Analítica

**Qué métricas genera (de forma indirecta, como productora de eventos/evidencia, no como consumidora de sus propios indicadores):** finalización de unidades por tipo de texto, número de ciclos de reescritura por producción, tiempo entre pasos, unidades dominadas por competencia.

**Qué eventos registra:** inicio de unidad, envío de producción, entrega de retroalimentación, finalización de unidad, repetición de unidad, dominio alcanzado, anulación docente aplicada — cada uno con su marca de tiempo.

**Qué indicadores calcula:** ninguno directamente — Academia produce evidencia (eventos y evaluaciones de competencia por producción), pero el cálculo de indicadores agregados (índices de productividad, consistencia, progresión) es responsabilidad exclusiva de Evolución/Learning Analytics (§13.8), consistente con la regla ya vinculante de que ningún módulo duplica información ya derivable de otro.

---

## 14. Riesgos

**Errores funcionales:** intentar iniciar una unidad bloqueada; intentar producir sin comprensión verificada; intentar reflexionar sin al menos un ciclo de reescritura; intentar repetir una unidad que no está completada ni dominada; el Profesor intentando una acción no válida para el estado actual de la unidad.

**Errores pedagógicos:** retroalimentación que, por error de generación de IA, comienza por aspectos gramaticales en vez de macrotextuales (violación de la jerarquía ya establecida, §9.5); retroalimentación con lenguaje de fracaso (violación de §8.6); secuencia de pasos alterada por un defecto de implementación (violación de A-02).

**Errores de UX:** pérdida de continuidad si el autoguardado falla silenciosamente (riesgo directo sobre la promesa de A-06); tiempo de espera de retroalimentación no acotado, generando abandono de sesión (ver Sección 11, pendiente); confusión del estudiante ante el bloqueo manual de una unidad en la que estaba trabajando activamente, sin ningún flujo de aviso definido — **PENDIENTE DE DECISIÓN FUNCIONAL** (ninguna fuente especifica qué debe ver el estudiante si el Profesor lo bloquea mientras tiene una sesión activa).

**Errores de IA:** la IA redactando o completando parcialmente la producción del estudiante (violación directa de §4.4/§8.5); la IA aplicando la rúbrica oficial DELF dentro de Academia (violación directa de A-05); recomendaciones de contenido que contradicen la priorización real del Motor Pedagógico (violación de la relación Conformist ya establecida).

---

## 15. Dependencias

**Qué necesita Academia de otros módulos:** identidad y perfil del estudiante (Perfil); confirmación de si una unidad corresponde a una tarea planificada (Mi Plan, solo para decidir si notifica finalización); capacidad de generación de retroalimentación (Coach IA); señal de priorización de contenido (Motor Pedagógico); resolución de la relación docente-estudiante y de membresía de grupo (Organización Académica) — necesaria para autorizar las acciones del Profesor descritas en la Sección 6.

**Qué módulos dependen de Academia:** Mi Plan (recibe la notificación de finalización de tareas vinculadas a Academia); Gamificación (recibe los eventos de finalización/dominio que disparan su propia lógica de recompensa); Dashboard (consume el resumen de estado de Academia para "Continúa donde te quedaste" y el bloque de ecosistemas); Evolución (consume la evidencia de competencia generada por cada producción evaluada).

---

## 16. Criterios de aceptación

1. Ninguna unidad puede iniciarse si su estado no es `UNLOCKED`.
2. Ninguna unidad permite avanzar al paso "Producir" sin verificación de comprensión previa.
3. Toda retroalimentación mostrada al estudiante usa exclusivamente las 10 categorías formativas, nunca la rúbrica oficial DELF.
4. Ninguna unidad permite avanzar a "Reflexionar" sin al menos un ciclo de reescritura completado.
5. El desbloqueo de la siguiente unidad ocurre únicamente cuando la actual llega a `COMPLETED`, sin excepción basada en puntuación.
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

---

## 17. Checklist de implementación (previo a Infrastructure Model)

- [ ] Cerrar el Change Proposal CH-01 (tipificación de `TeacherId`) — Domain Model pasa formalmente a v1.2.
- [ ] Resolver la fuente/contrato de evidencia de competencia para el criterio `MASTERED` (dependencia con Learning Analytics, ya señalada como riesgo en el Domain Model).
- [ ] Resolver el mecanismo de verificación de la relación docente-estudiante y de membresía de grupo (contrato con Organización Académica).
- [ ] Resolver **PENDIENTE DE DECISIÓN FUNCIONAL — CU-11:** el efecto exacto de "asignar" una unidad (Sección 7).
- [ ] Resolver **PENDIENTE DE DECISIÓN FUNCIONAL — Sección 9:** si existe un componente "Editor" transversal compartido entre ecosistemas o si cada uno mantiene el suyo.
- [ ] Resolver **PENDIENTE DE DECISIÓN FUNCIONAL — Sección 11:** tiempos de espera aceptables para la retroalimentación de IA y comportamiento de interfaz ante demoras.
- [ ] Resolver **PENDIENTE DE DECISIÓN FUNCIONAL — Sección 14:** experiencia del estudiante cuando el Profesor bloquea una unidad con sesión activa.
- [ ] Confirmar si Academia requiere algún requisito de accesibilidad adicional a los ya vigentes a nivel de proyecto (Sección 11) o si hereda los existentes sin modificación.
- [ ] Definir el contenido editorial inicial disponible (unidades por tipo de texto, ejemplos de la Biblioteca de Modelos) antes de cualquier prueba funcional end-to-end.
- [ ] Confirmar la reutilización (o no) de patrones ya resueltos en Mi Plan (RLS, `UnitOfWork`, `AuditLog`) — decisiones ya clasificadas como Infrastructure en la auditoría previa, pendientes de una decisión explícita antes de construir el Infrastructure Model.

---

## Evaluación final

**El módulo Academia NO queda listo, todavía, para pasar directamente a la fase de diseño técnico (Infrastructure Model)**, por la combinación de: (a) un cambio de Domain Model pendiente de cierre formal (CH-01, de bajo riesgo pero no cerrado), y (b) cinco preguntas marcadas **PENDIENTE DE DECISIÓN FUNCIONAL** en este documento (CU-11/asignación, integración de "Editor", tiempos de espera de IA, experiencia ante bloqueo docente en sesión activa, y accesibilidad específica), ninguna de las cuales puede resolverse por diseño técnico sin antes fijar la decisión de producto correspondiente — hacerlo en Infrastructure Model equivaldría a inventar comportamiento no aprobado.

Ninguna de estas cinco preguntas es estructuralmente compleja ni pone en riesgo el trabajo ya realizado (Domain Model, Application Model, resoluciones A-01–A-10 permanecen enteramente válidos y no requieren revisión); son cierres puntuales de alcance. Una vez resueltas explícitamente (no asumidas), el módulo Academia queda completamente especificado y en condiciones de iniciar el Infrastructure Model sin reabrir ninguna decisión funcional durante la construcción técnica.
