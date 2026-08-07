# Demo Script Final — Redaction Lab
### Presentación institucional — ~20 minutos

Guion palabra por palabra. Los bloques **[ACCIÓN]** indican qué pantalla abrir o qué botón pulsar. Los bloques **DECIR** son texto literal a pronunciar. Los bloques **NO DECIR** son advertencias explícitas de qué evitar. Los tiempos son acumulados desde el inicio.

---

## Apertura (0:00 – 1:30)

**[ACCIÓN]** No abrir ninguna pantalla todavía. Estar de pie, sin laptop de por medio si es posible.

**DECIR:**

> "Buenos días. Antes de mostrarles nada, quiero contarles un problema que probablemente ya conocen de primera mano.
>
> Cada semestre, el programa de francés prepara a decenas de estudiantes para el examen DELF B2 — y una cuarta parte de esa nota depende de la producción escrita. El problema nunca ha sido la falta de compromiso de los profesores. Es aritmética simple: un profesor con cuarenta estudiantes, cada uno escribiendo dos o tres versiones de un texto por semana, no puede devolver una corrección detallada y a tiempo a cada uno. El resultado es el mismo todos los años: los estudiantes practican poco, reciben retroalimentación tarde, y llegan al examen sin haber escrito lo suficiente.
>
> Lo que van a ver hoy no es una lista de funciones. Es lo que viviría un estudiante real un martes por la noche, y lo que vería su profesora al día siguiente."

**NO DECIR:** nombres de tecnologías (Next.js, Prisma, Clerk, TypeScript) en esta apertura — el público académico no necesita ni quiere ese vocabulario todavía.

**Pausa:** 2 segundos antes de continuar, dejar que la frase de cierre respire.

---

## Bloque 1 — Login y Dashboard (1:30 – 4:30)

**[ACCIÓN]** Abrir `/sign-in`. Iniciar sesión con la cuenta de **Mateo Vargas** (estudiante demo).

**DECIR:**

> "Este es Mateo, un estudiante de tercer semestre en preparación DELF B2. Cada estudiante tiene su propia cuenta — nada de accesos compartidos ni datos mezclados entre ellos."

**[ACCIÓN]** Esperar el redirect automático a `/dashboard`. Señalar con el cursor (sin clic) el encabezado de bienvenida, el objetivo del semestre, el plan de la semana y el bloque "Continúa donde te quedaste".

**DECIR:**

> "Este es su panel principal. No es solo 'aquí está tu próxima tarea' — es un resumen de todo su semestre: su objetivo de nivel, su plan semanal, y un acceso directo a retomar exactamente donde lo dejó."

**Pregunta que se puede hacer al público aquí (opcional, si el tiempo lo permite):**
> "¿Cuántos de ustedes reciben hoy este tipo de vista consolidada del avance de un estudiante, antes de que llegue el examen?"

**Cómo responder si alguien interrumpe con "¿y esto ya lo usan estudiantes reales?":**
> "Todavía no — hoy están viendo la plataforma ya construida y validada técnicamente; el piloto con estudiantes reales es exactamente la conversación que quiero tener con ustedes después de esto."

---

## Bloque 2 — Academia: el mapa de unidades (4:30 – 6:00)

**[ACCIÓN]** Clic en el ecosistema "Academia" desde el Dashboard (o en el link directo). Esperar a que cargue `/academy`.

**DECIR:**

> "Aquí están las unidades del curso, cada una con su propio estado — bloqueada, disponible, en progreso, completada. Mateo ya avanzó en la primera; hoy va a trabajar la Unidad 1: una carta formal de reclamo."

**[ACCIÓN]** Clic en la Unidad 1 ("Lettre formelle").

**NO DECIR:** no listar los 11 pasos internos del recorrido uno por uno — es información de diseño interno, no de valor para el público.

---

## Bloque 3 — El recorrido guiado (6:00 – 7:30)

**[ACCIÓN]** Avanzar rápidamente por los pasos de contextualización, comprensión, observación y práctica (P-04 a P-07), sin detenerse en cada pantalla más de unos segundos.

**DECIR:**

> "Antes de escribir, el estudiante contextualiza el ejercicio y practica brevemente — no llega en blanco frente a la hoja. Voy a avanzar rápido por esta parte para llegar a lo más importante."

**Pausa:** ninguna — este bloque debe sentirse ágil, casi acelerado, para contrastar con el siguiente.

---

## Bloque 4 — Writing Editor (7:30 – 10:30)

**[ACCIÓN]** Abrir el editor de escritura (P-08). Mostrar el texto ya preparado de Mateo (ya cargado o pegado previamente — ver nota de preparación al final). Señalar el contador de palabras y el indicador de autoguardado. Pulsar "Enviar".

**DECIR:**

> "Este es el momento central: Mateo escribe su carta directamente aquí. Mientras escribe, el sistema guarda automáticamente cada pocos segundos — nunca pierde su trabajo, incluso si se le cae la conexión a mitad de una frase.
>
> Su texto ya está listo. Voy a enviarlo."

**[ACCIÓN]** Pulsar el botón de envío. Esperar la confirmación visual.

**NO DECIR:** no explicar en este momento los detalles técnicos del debounce o la cola de reintentos — mencionar solo "guarda automáticamente" es suficiente y correcto.

---

## Bloque 5 — Feedback de IA (10:30 – 14:30) — **el momento decisivo**

**[ACCIÓN]** Navegar a la pantalla de retroalimentación (P-09). Si la respuesta tarda en aparecer, no quedarse en silencio.

**DECIR (mientras carga):**

> "En unos segundos va a aparecer la retroalimentación — no en una semana, como pasaría hoy con una corrección manual, sino ahora mismo, mientras el ejercicio todavía está fresco en la cabeza del estudiante."

**[ACCIÓN]** Cuando aparezca la retroalimentación, señalar 2-3 observaciones concretas (no las siete — elegir una fortaleza y dos áreas de mejora).

**DECIR:**

> "Miren esto: primero le dice lo que hizo bien — que su reclamo se entiende con total claridad, que es exactamente lo que un lector real necesitaría para actuar. Después, dos observaciones concretas: aquí, un problema de registro — mezcló una expresión coloquial en medio de una carta formal — y aquí, un problema de gramática muy típico del francés en este nivel, la confusión entre 'malgré' y 'bien que'.
>
> No es una lista genérica de errores. Está organizada exactamente sobre las mismas categorías que evalúa el examen DELF: registro, cohesión, gramática, argumentación."

**Pausa:** 3 segundos después de leer la observación de registro — es la que más suele generar una reacción visible en el público (reconocen el error).

**Cómo responder si preguntan "¿y si la IA se equivoca?" en este momento:**
> "El profesor ve exactamente el mismo texto y las mismas observaciones — nada se oculta ni se reemplaza; lo van a ver en un momento desde su panel."

---

## Bloque 6 — Reflexión de cierre (14:30 – 15:30)

**[ACCIÓN]** Avanzar a la pantalla de reflexión (P-10). Mostrar las respuestas ya preparadas de Mateo.

**DECIR:**

> "Antes de cerrar el intento, Mateo tiene que responder tres preguntas con sus propias palabras: qué aprendió, qué error cree que podría repetir, y qué va a hacer diferente. No es un paso decorativo — es lo que convierte una corrección en aprendizaje."

**[ACCIÓN]** Cerrar sesión de Mateo.

---

## Bloque 7 — Cambio de rol: la profesora (15:30 – 18:30)

**[ACCIÓN]** Iniciar sesión con la cuenta de **Camille Laurent** (profesora demo). Esperar el redirect automático a `/academy/teacher`.

**DECIR:**

> "Misma plataforma — vista completamente distinta. Esta es Camille, coordinadora del curso. Ya tiene en seguimiento a sus estudiantes, entre ellos a Mateo y a Sofía."

**[ACCIÓN]** Señalar las dos tarjetas de resumen (Sofía y Mateo).

**DECIR:**

> "De un vistazo, sin leer un solo texto todavía, Camille ya sabe algo importante: Sofía viene avanzando de forma sostenida — no necesita atención esta semana. Mateo, en cambio, acaba de terminar un intento con retroalimentación nueva."

**[ACCIÓN]** Clic en el detalle de Mateo (P-13), luego consultar el historial de la Unidad 1 (P-15).

**DECIR:**

> "Aquí Camille ve exactamente lo que escribió Mateo, y exactamente la misma retroalimentación que él vio. No tiene que releer la carta completa para saber qué pasó — el patrón ya está identificado: registro y esa confusión gramatical específica. Puede dedicarle cinco minutos de conversación dirigida a exactamente eso, en vez de media hora corrigiendo desde cero."

**Pregunta que se puede hacer al público:**
> "¿Cuánto tiempo le tomaría hoy a uno de sus profesores llegar a esta misma conclusión, para un solo estudiante?"

---

## Cierre (18:30 – 20:00)

**[ACCIÓN]** Regresar al Dashboard (del estudiante, si el tiempo lo permite, o quedarse en el Panel de Profesor).

**DECIR:**

> "Una sola plataforma, dos experiencias — la del estudiante que practica y recibe retroalimentación al instante, y la del profesor que supervisa a todos sus estudiantes sin perder ni ganar trabajo manual de corrección.
>
> Lo que acaban de ver es exactamente lo que existe hoy, funcionando, no una maqueta ni un mockup. Lo que sigue es una conversación distinta: con qué grupo, en qué semestre, y con qué alcance les gustaría probarlo primero."

**[ACCIÓN]** Detenerse aquí. No seguir hablando — dejar espacio para preguntas.

**NO DECIR:** no ofrecer un precio ni un cronograma cerrado en esta frase de cierre — eso se responde solo si preguntan (ver `06-preguntas-directivos.md`, preguntas 25 y 31).

---

## Notas de preparación (no se dicen en voz alta)

- El texto de Mateo debe estar ya escrito y listo para pegar/enviar en segundos — no escribirlo en vivo letra por letra, consume tiempo y no aporta nada a la narrativa.
- Tener ya iniciada sesión en una segunda pestaña/perfil de navegador con la cuenta de Camille, para el cambio de rol sea instantáneo (cerrar sesión + volver a iniciar sesión en vivo consume 30-60 segundos reales).
- Practicar el tiempo de espera de la respuesta de IA al menos una vez antes del día de la demo, para calibrar cuánto hay que hablar mientras carga.
