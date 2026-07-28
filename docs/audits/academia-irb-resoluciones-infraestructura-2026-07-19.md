# Infrastructure Review Board — Resolución de Pendientes de Infraestructura — Módulo Academia

**Comité:** IRB, Rédaction Lab. **Documento auditado:** `academia-infrastructure-model-v1.0-2026-07-19.md`. **Fecha:** 2026-07-19. **Alcance:** exclusivamente los siete PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA detectados en dicho documento. No se abren temas nuevos. No se modifica el resto del Infrastructure Model, ni el Domain Model, ni el Application Model, ni la Functional Specification.

---

## PENDIENTE 1 — Proveedor de IA

### Estado
RESUELTO (estrategia de integración) — con una acotación de alcance explícita, ver Impacto/Riesgo.

### Decisión
Se adopta la estrategia de **interfaz `AIProvider` (ya modelada como puerto `FeedbackGateway` en el Infrastructure Model) con una única implementación activa, seleccionada por configuración de ambiente**. No se adopta selección dinámica entre múltiples proveedores en producción, ni una estrategia híbrida — ninguna de las dos fue solicitada por ningún documento Frozen y ambas introducirían complejidad no aprobada.

### Justificación técnica
El puerto `FeedbackGateway` ya garantiza desacoplamiento total: Application y Domain nunca conocen al proveedor concreto. Bajo ese puerto, una única implementación activa seleccionada por variable de configuración (`ACADEMY_AI_PROVIDER_ENDPOINT` / `ACADEMY_AI_PROVIDER_API_KEY`, ya previstas en la Sección 9) es la opción de menor complejidad operativa que preserva la portabilidad: cambiar de proveedor exige modificar únicamente el adaptador concreto y la configuración, nunca el puerto ni ningún consumidor. Una interfaz con múltiples implementaciones simultáneas activas exigiría lógica de enrutamiento entre proveedores no solicitada por ningún caso de uso; un proveedor hardcodeado sin interfaz violaría Dependency Inversion, ya obligatorio.

### Impacto
Medio. Resuelve la estrategia de integración (necesaria para construir el `FeedbackProviderAdapter`), pero la **identidad concreta del proveedor** (qué servicio de IA específico se contrata) sigue sin definirse en este documento — no porque falte análisis, sino porque Coach IA es una capacidad transversal (ya establecido en la Functional Specification, Sección 1) potencialmente ya decidida o por decidir a nivel de plataforma, fuera de la autoridad de este IRB, que audita exclusivamente Infrastructure de Academia.

### Riesgo
Si el proveedor de IA de plataforma cambia en el futuro, el impacto queda contenido al adaptador concreto gracias al puerto ya definido — riesgo bajo de propagación, alto si se hubiera hardcodeado sin interfaz.

### Compatibilidad con la arquitectura existente
Total. No introduce tecnología nueva; formaliza el uso del puerto ya declarado en la Sección 6 del Infrastructure Model.

### Cambios necesarios en Infrastructure Model
Sección 6 ("Integración IA — Proveedor"): reemplazar la marca de pendiente por esta decisión de estrategia, dejando constancia de que la identidad del proveedor concreto se resuelve a nivel de plataforma (Coach IA), no de Academia, y que el adaptador se activa mediante las variables ya listadas en la Sección 9.

---

## PENDIENTE 2 — Circuit Breaker

### Estado
RESUELTO

### Decisión
- **Estrategia:** Circuit Breaker basado en tasa de fallos sobre ventana móvil.
- **Criterios de apertura:** 5 fallos consecutivos, **o** tasa de error superior al 50% sobre las últimas 10 solicitudes — lo que ocurra primero.
- **Tiempo de recuperación (cool-down antes de pasar a half-open):** 30 segundos, con backoff exponencial en aperturas sucesivas hasta un máximo de 5 minutos entre intentos.
- **Estado half-open:** admite una única solicitud de prueba.
- **Criterios de cierre:** 3 éxitos consecutivos en half-open cierran el circuito; un fallo en half-open reabre el circuito y reinicia el cool-down.

### Justificación técnica
Los umbrales son parámetros estándar de la industria para este patrón (equivalentes a los usados en implementaciones de referencia tipo Hystrix/resilience libraries), sin introducir un patrón adicional al ya aprobado. El cool-down inicial de 30 segundos, combinado con el máximo de 3 reintentos ya definido en la Sección 6, garantiza que el circuito se abra con margen suficiente antes de agotar el techo de 3 minutos ya congelado en la Functional Specification v1.1 — protege tanto la experiencia del estudiante (fallback más rápido que el techo máximo) como al proveedor de IA (evita saturarlo durante una degradación).

### Impacto
Alto. Desbloquea directamente la construcción del `FeedbackGateway`.

### Riesgo
Umbrales fijos podrían no ser óptimos para el volumen real de producción; se recomienda revisión empírica tras el primer mes de operación (mismo criterio ya aplicado a otros umbrales operativos de este módulo, sin que ello invalide la decisión actual como punto de partida).

### Compatibilidad con la arquitectura existente
Total. Es la especificación concreta de un mecanismo que el Infrastructure Model ya exigía como obligatorio (Sección 6), sin tecnología nueva.

### Cambios necesarios en Infrastructure Model
Sección 6 ("Integración IA — Circuit Breaker"): reemplazar la marca de pendiente por los criterios y umbrales exactos arriba definidos. Sección 11 (Observabilidad): añadir métrica de estado del circuito (abierto/cerrado/half-open) como derivada directa de esta decisión.

---

## PENDIENTE 3 — Feature Flags

### Estado
RESUELTO

### Decisión
- **Mecanismo:** flags basadas en variables de configuración por ambiente (mismo mecanismo ya usado para el resto de configuración del módulo, Sección 9) — no se introduce un servicio dedicado de feature flags.
- **Persistencia:** en la configuración de despliegue (no en base de datos, no en runtime mutable).
- **Activación:** por cambio de configuración/despliegue del ambiente correspondiente.
- **Auditoría:** mediante el control de versiones ya vigente sobre la configuración de despliegue de la plataforma — no se introduce un sistema de auditoría de flags dedicado.
- **Ambientes:** valor independiente por ambiente (desarrollo/staging/producción), consistente con el resto de variables ya documentadas en la Sección 9.

### Justificación técnica
El número de flags identificado como necesario (activación independiente de la evaluación de `MASTERED`; alternancia temprana entre modo síncrono-preferente e íntegramente asíncrono) es bajo y no exige activación en caliente sin despliegue. Introducir un servicio dedicado de feature flags sería una tecnología nueva no solicitada por ningún documento Frozen y contradiría la regla de no introducir tecnologías adicionales sin necesidad demostrada.

### Impacto
Bajo. No bloquea ningún otro componente del Infrastructure Model.

### Riesgo
Si el número de flags creciera significativamente en el futuro, este mecanismo simple podría volverse insuficiente — riesgo aceptado, revisitable si ocurre, sin comprometer la decisión actual.

### Compatibilidad con la arquitectura existente
Total. Reutiliza exactamente el mecanismo de configuración por ambiente ya definido en la Sección 9.

### Cambios necesarios en Infrastructure Model
Sección 9 ("Feature Flags"): reemplazar la marca de pendiente por esta decisión, listando explícitamente las dos flags identificadas y su alcance.

---

## PENDIENTE 4 — Outbox Monitoring

### Estado
RESUELTO

### Decisión
- **Métricas:** tamaño del backlog de Outbox (eventos no publicados); antigüedad del evento no publicado más antiguo; tasa de publicación exitosa vs. fallida.
- **Umbrales:** alerta de advertencia si el backlog supera 100 eventos no publicados o si el evento más antiguo supera 5 minutos sin publicarse; alerta crítica si supera 500 eventos o 30 minutos, respectivamente.
- **Alertas:** enviadas al canal de observabilidad de infraestructura ya vigente a nivel de plataforma (reutilizado, no nuevo).
- **Recuperación:** reintento automático del publicador con backoff exponencial (ya definido en la Sección 7); tras agotar reintentos por evento individual, el evento se mueve a la cola de eventos fallidos (dead-letter, ya definida) sin bloquear la publicación del resto del backlog.
- **Observabilidad:** estas métricas se exponen mediante el sistema de métricas ya definido en la Sección 11, como extensión directa de lo ya previsto allí.

### Justificación técnica
Los umbrales fijados son coherentes con el volumen esperado del módulo (eventos por unidad completada/dominada/bloqueada, no eventos por cada interacción de escritura) y con el objetivo ya congelado de propagación oportuna de la consistencia eventual Attempt→AcademyUnit. No se introduce infraestructura de monitoreo nueva — se reutiliza el sistema de métricas y alertas ya declarado en la Sección 11.

### Impacto
Medio. Cierra un vacío operativo identificado en la Sección 11 original (umbral de alerta de backlog, antes sin definir).

### Riesgo
Igual que en el Pendiente 2: umbrales de partida, sujetos a ajuste empírico tras observar el volumen real — no invalida la decisión, solo exige revisión programada.

### Compatibilidad con la arquitectura existente
Total. Extiende el patrón Outbox y el sistema de observabilidad ya aprobados, sin tecnología nueva.

### Cambios necesarios en Infrastructure Model
Sección 11 ("Observabilidad — Alertas"): reemplazar la marca de pendiente por los umbrales exactos arriba definidos.

---

## PENDIENTE 5 — Biblioteca de Modelos

### Estado
RESUELTO

### Decisión
- **Estrategia de almacenamiento:** contenido almacenado como texto enriquecido directamente en PostgreSQL (mismo motor ya usado por el resto de Academia) — no se introduce un servicio de storage de objetos mientras el contenido no incluya archivos multimedia.
- **Versionado:** cada `ModelExample` mantiene una única versión activa por vez (a diferencia de las `Version` del estudiante); las actualizaciones del Administrador sobrescriben el contenido con registro de auditoría (autor, fecha) vía `AuditLog`, ya existente.
- **Metadatos:** tipo de texto (`TextType`), nivel de dificultad, fecha de creación/última actualización, autor, estado (activo/retirado).
- **Compatibilidad futura:** si se requiere contenido multimedia, la migración al storage de objetos ya vigente a nivel de plataforma queda aislada al `ModelExampleStorageAdapter` (ya definido como adaptador independiente en las Secciones 3 y 4), sin impacto en Domain ni en Application.

### Justificación técnica
El Domain Model no exige ni excluye ningún formato físico para `ModelExample` — la decisión es puramente de infraestructura. Texto enriquecido en la misma base de datos ya usada es la opción de menor complejidad operativa suficiente para el alcance actual (producciones ejemplares con comentario comparativo, ambos son texto). El adaptador de storage ya estaba diseñado como componente aislado precisamente para absorber sin fricción una eventual migración a multimedia.

### Impacto
Bajo. No bloquea ningún otro componente; cierra una ambigüedad de diseño de persistencia.

### Riesgo
Ninguno significativo — la estrategia de aislamiento en un adaptador dedicado ya mitigaba de antemano el riesgo de una migración futura costosa.

### Compatibilidad con la arquitectura existente
Total. No introduce tecnología nueva; usa el mismo motor de persistencia ya aprobado para el resto del módulo.

### Cambios necesarios en Infrastructure Model
Sección 13 ("Archivos — Storage"): reemplazar la marca de pendiente por esta decisión. Sección 5 (Persistencia): agregar nota breve indicando que `ModelExample` no requiere `Mapper` de archivos, solo de texto enriquecido, consistente con esta decisión.

---

## PENDIENTE 6 — NotificationEvent

### Estado
**REQUIERE DECISIÓN EXTERNA**

### Decisión
No se emite una decisión de infraestructura de Academia para este punto.

### Justificación técnica
El catálogo de `NotificationEvent` (§13.10) es propiedad del sistema de notificaciones a nivel de plataforma, no de Academia. Resolver si Academia reutiliza un tipo de evento ya existente cuya semántica cubra "retroalimentación disponible tras espera diferida", o si se requiere extender el catálogo con un tipo nuevo, exige conocer el contenido exacto de ese catálogo y su proceso de gobierno de cambios — información no documentada en ningún documento Frozen ni disponible dentro del alcance de auditoría de este IRB, que revisa exclusivamente Infrastructure de Academia.

### Impacto
Medio. Bloquea la construcción exacta de `AcademyNotificationAdapter`, aunque no bloquea el resto del Infrastructure Model (el adaptador puede construirse contra una interfaz interna estable mientras se resuelve el mapeo externo).

### Riesgo
Si se asume por error un tipo de `NotificationEvent` sin confirmar su semántica real, se generaría acoplamiento incorrecto con el sistema de notificaciones — razón directa por la que este IRB decide no resolverlo por inferencia.

### Compatibilidad con la arquitectura existente
No evaluable hasta contar con la respuesta externa; el adaptador ya está diseñado como componente aislado (Sección 4), por lo que cualquier resolución futura no debería exigir cambios fuera de `AcademyNotificationAdapter`.

### Cambios necesarios en Infrastructure Model
Sección 14 ("Integraciones externas — Notificaciones"): la marca de pendiente se mantiene, mas se reclasifica explícitamente de "pendiente de decisión de infraestructura" a "bloqueado por decisión externa (owner: sistema de notificaciones de plataforma)", dejando constancia de que Academia ya hizo su parte del análisis y que la resolución no depende de este módulo.

---

## PENDIENTE 7 — Tecnología de cola

### Estado
RESUELTO

### Decisión
**Cola de trabajos basada en una tabla dentro de la misma base PostgreSQL ya usada por Academia, procesada por un worker con polling** (`feedback-queue.worker.ts`) — mismo motor y mismo patrón ya adoptado para el Outbox de eventos (Sección 7). No se adopta un servicio de mensajería/broker dedicado.

### Justificación técnica
- **Rendimiento:** suficiente para el volumen esperado — la cola solo procesa la fracción de solicitudes de retroalimentación que exceden la ventana de respuesta inmediata (60s), no el volumen total de producciones enviadas.
- **Simplicidad:** máxima — reutiliza el mismo motor de datos y el mismo patrón operativo (tabla + polling + reintentos + dead-letter) ya validado para el Outbox, sin curva de aprendizaje ni operación adicional para el equipo.
- **Mantenimiento:** bajo — un único motor de datos que operar y respaldar, sin componente de infraestructura adicional que parchear, actualizar o monitorear por separado.
- **Escalabilidad:** suficiente para el alcance actual del módulo; si el volumen futuro lo exige, la migración a un broker dedicado queda aislada al `feedback-queue.worker.ts`, sin impacto en Domain, Application ni en el resto de Infrastructure.
- **Integración:** directa — no añade nuevas credenciales, nuevos puntos de fallo de red, ni una nueva tecnología a operar, cumpliendo estrictamente la restricción de "no introducir tecnologías que contradigan la arquitectura ya aprobada".

Se descarta un broker dedicado (p. ej. cola gestionada externa) en esta fase precisamente porque introduciría una tecnología nueva sin necesidad demostrada, violando esa misma restricción.

### Impacto
Alto. Desbloquea la construcción del `feedback-queue.worker.ts`, ya referenciado en la Sección 3.

### Riesgo
Si el volumen de retroalimentación diferida crece de forma sostenida, una tabla con polling puede degradar bajo alta concurrencia — riesgo aceptado y mitigado por el aislamiento ya mencionado (migración futura contenida a un solo componente).

### Compatibilidad con la arquitectura existente
Total. Es la misma tecnología y el mismo patrón (PostgreSQL + Outbox-like polling) ya aprobados en este documento para eventos de dominio — no se introduce nada nuevo.

### Cambios necesarios en Infrastructure Model
Sección 15 ("Dependencias técnicas — Mecanismo de colas"): reemplazar la marca de pendiente por esta decisión. Sección 3 (estructura de carpetas): sin cambios, `feedback-queue.worker.ts` ya estaba previsto; se confirma su mecanismo interno.

---

## AUDITORÍA FINAL

| Verificación | Resultado |
|---|---|
| ✓ No se modificó el Domain Model | Cumple — ninguna decisión toca Aggregates, Entities, Value Objects, Enums, Invariantes, Máquina de estados, Domain Events, Domain Services, Factories, Policies o Specifications. |
| ✓ No se modificó el Application Model | Cumple — ningún Command, Query ni el patrón de sincronización Attempt→AcademyUnit fue alterado. |
| ✓ No se modificó la Functional Specification | Cumple — los umbrales de 60s/3min y el resto de reglas funcionales se citan sin variación. |
| ✓ No se agregaron funcionalidades | Cumple — todas las decisiones son de mecanismo técnico (umbrales, formato de persistencia, estrategia de configuración), ninguna introduce un caso de uso, comando o comportamiento visible nuevo. |
| ✓ No se alteró la arquitectura aprobada | Cumple — ninguna decisión introduce un patrón o tecnología adicional a los ya aprobados (PostgreSQL, Prisma, RLS, Outbox, Circuit Breaker ya exigido); PENDIENTE 7 descarta explícitamente una tecnología nueva por esta misma razón. |
| ✓ Todas las decisiones pertenecen exclusivamente a Infrastructure | Cumple, con una excepción reconocida y correctamente escalada: PENDIENTE 6 pertenece al sistema de notificaciones de plataforma, no a Academia — motivo por el cual se marcó REQUIERE DECISIÓN EXTERNA en lugar de resolverse por inferencia. |

---

## DICTAMEN FINAL

**2. Infrastructure Model requiere una revisión menor.**

**Justificación:** seis de los siete pendientes quedan resueltos de forma definitiva y ejecutable, sin modificar ningún documento Frozen, sin introducir tecnología nueva y sin exceder la autoridad de este IRB. El documento `academia-infrastructure-model-v1.0-2026-07-19.md` requiere una actualización mecánica — incorporar estas seis decisiones en las Secciones 5, 6, 9, 11, 13 y 15 exactamente como se indica en cada "Cambios necesarios en Infrastructure Model" — antes de poder declararse FROZEN en su totalidad. El séptimo punto (NotificationEvent, Sección 14) no puede cerrarse dentro de esta revisión por depender de información y gobierno que pertenecen al sistema de notificaciones de plataforma, ajeno a Academia; se reclasifica de "pendiente de decisión de infraestructura" a "bloqueado por decisión externa", lo cual no impide congelar el resto del documento una vez aplicada la actualización menor, siempre que ese único punto permanezca explícitamente señalado como abierto hasta recibir respuesta del equipo propietario del catálogo de notificaciones.
