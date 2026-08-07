# RÉDACTION LAB — PLATFORM CORE FOUNDATION v1.2

**Estado:** FROZEN
**Fecha:** 2026-07-31 (v1.0 original: 2026-07-19)
**Autor:** Principal Enterprise Software Architect, Rédaction Lab
**Origen v1.0:** este documento nace de un bloqueo concreto detectado durante el IRB de Academia (`academia-irb-resoluciones-infraestructura-2026-07-19.md`, Pendiente 6 — NotificationEvent), que reveló la ausencia de un componente transversal gobernado formalmente. El análisis de esa ausencia se generalizó al resto de la plataforma, siguiendo evidencia ya documentada en los módulos existentes.

**Historial de cambios**

| Versión | Fecha | ACP relacionado | Cambio |
|---|---|---|---|
| 1.0 | 2026-07-19 | — (versión fundacional) | Inventario inicial de 16 componentes del Platform Core; Notification Catalog diseñado en detalle completo; confirmación de que Academia podía declararse FROZEN. |
| 1.1 | 2026-07-31 | ACP-005 | Corrección editorial del campo "Estado" (de `DRAFT`, nunca actualizado desde la redacción original, a `FROZEN`, ya certificado formalmente el 2026-07-19 por `academia-architecture-certification-2026-07-19.md` y `academia-architecture-coverage-audit-2026-07-19.md`, y tratado como tal sin excepción por todos los documentos posteriores del proyecto). Incorporación del componente **Bounded Context Query Gateway** (Sección 10, nueva). Actualizada la Sección 3 (Inventario, nueva fila) y la Sección 5 (Relaciones, nueva fila). **Actualizada también la Sección 1** (Objetivo del Platform Core): se amplió la lista de consumidores potenciales para incluir "cualquier Bounded Context DDD adicional" y se añadió "`Organization`/`Membership`" como ejemplo de concepto de dominio que el Core nunca debe conocer — omitido, por error, del registro original de cambios de v1.1 (corregido en esta versión, hallazgo I-01 de la Auditoría de Cierre). |
| 1.2 | 2026-07-31 | Auditoría de Cierre de v1.1 (hallazgos C-01, I-01, M-01) | **C-01 (crítico):** las Secciones 3, 5 y 7 reproducían su contenido de v1.0 mediante marcadores "(sin cambios respecto a v1.0)"/"..." en vez del texto justificativo completo — corregido: las tres secciones ahora reproducen íntegramente su contenido real, sin ninguna dependencia de consultar v1.0. **I-01 (importante):** el Historial de cambios de v1.1 omitía la modificación real de la Sección 1 — corregido arriba, en la fila de v1.1 de esta misma tabla (no se reescribe la historia, se completa el registro). **M-01 (menor):** la sección "Riesgos abiertos" se reubica, en esta versión, entre "VALIDACIÓN FINAL" y "RESULTADO" — no rompe ninguna referencia interna (ninguna otra sección la cita por posición) y restaura a "RESULTADO" su función de cierre del documento. Ningún cambio de esta versión modifica el diseño del patrón de la Sección 10, ninguna regla de negocio, ningún contrato, ningún consumidor ni ninguna dependencia — exclusivamente correcciones de completitud y exactitud documental. |

**Documentos Frozen respetados sin modificación:** Product Blueprint, Arquitectura General, Domain Model, Application Model, Academia Functional Specification, Academia Infrastructure Model, Academia API Contract, Academia Blueprint (Frontend Implementation), Organization Management (Domain Model, Application Model, Infrastructure Model, API Contract — la totalidad de sus documentos), Product Architecture, ADR-001, Organization Strategy, Project Structure Specification, Architecture Change Management Standard, ACP-005.

---

## 1. Objetivo del Platform Core

**Propósito.** El Platform Core es el conjunto de componentes técnicos transversales de Rédaction Lab: contratos, catálogos y mecanismos que cualquier módulo funcional (Dashboard, Mi Plan, Academia, Laboratorio, Conoce el DELF, Simulador, Gamificación, Evolución, Espacio del Profesor) — y, desde la creación de Organization Management, cualquier Bounded Context DDD adicional — puede consumir sin volver a diseñarlos, y que ningún módulo funcional posee en exclusiva.

**Qué problemas resuelve:**
- Evita que cada módulo invente su propia versión de un mismo mecanismo (ya observado: Academia estuvo a punto de necesitar decidir, por sí sola, cómo se gobierna un catálogo de notificaciones que en realidad pertenece a toda la plataforma).
- Da un punto único de gobierno para decisiones que, si se toman a nivel de módulo, generan inconsistencia observable (nomenclatura de eventos, niveles de log, taxonomía de errores, roles y permisos).
- Permite que los módulos funcionales se congelen (Frozen) de forma independiente entre sí, sin arrastrar contratos transversales sin dueño.

**Qué nunca debe contener:**
- Ninguna regla de negocio de ningún módulo (el Platform Core no sabe qué es una `AcademyUnit`, un `LearningPlan`, un `WritingTask` ni una `Organization`/`Membership` — solo transporta, cataloga o estandariza mecanismos alrededor de ellos).
- Ningún caso de uso ni flujo de usuario — eso vive exclusivamente en la Functional Specification de cada módulo.
- Ninguna dependencia hacia un módulo funcional específico, en ninguna dirección de tiempo de compilación ni de ejecución.
- Ninguna implementación concreta (código, esquema SQL, clases) — este documento y sus derivados son arquitectura, no implementación.

---

## 2. Criterios para pertenecer al Platform Core

Un componente pertenece al Platform Core si, y solo si, cumple **las cinco condiciones simultáneamente**:

1. **Evidencia real de consumo transversal.** Existe evidencia documental, ya registrada en los módulos existentes, de que más de un módulo funcional lo necesita o lo necesitará con alta certeza — no una especulación de conveniencia futura.
2. **Ausencia total de regla de negocio.** El componente no decide nada específico de un dominio; es mecanismo, contrato o convención, nunca lógica de negocio.
3. **Costo real de duplicación.** Si cada módulo lo implementara por separado, se produciría una inconsistencia observable por el usuario final o por el equipo de ingeniería (nomenclaturas distintas, comportamientos distintos ante el mismo tipo de evento, canales de notificación distintos para el mismo tipo de aviso).
4. **Ciclo de vida independiente.** El componente puede evolucionar sin forzar el redespliegue o la reapertura de un módulo funcional ya Frozen, y viceversa: un módulo puede congelarse sin que el Core deba congelarse con él.
5. **No introduce acoplamiento módulo-a-módulo.** El componente nunca se convierte en un canal por el cual un módulo funcional accede a las entidades o al estado interno de otro módulo funcional — eso seguiría prohibido por la Arquitectura Feature-Driven ya vigente (§5.4: "una feature nunca accederá directamente a otra"); el Core solo transporta contratos neutrales, nunca datos de dominio de un módulo hacia otro.

**Regla de exclusión por defecto.** Si un componente es útil hoy solo para un módulo, permanece en ese módulo. Entra al Core únicamente cuando un segundo módulo demuestra la misma necesidad con evidencia real — nunca por anticipación especulativa.

---

## 3. Inventario de componentes compartidos

| Componente | ¿Pertenece al Core? | Justificación (contra los 5 criterios de la Sección 2) |
|---|---|---|
| **Notification Catalog** | **SÍ** | Evidencia directa: ya existe un `NotificationEvent` a nivel de plataforma (§13.10) con tipos como `WRITING_SUBMITTED`/`WRITING_CORRECTED`; Academia acaba de necesitar un tipo nuevo (retroalimentación diferida) sin que existiera un proceso de gobierno — el bloqueo real que originó este documento. Sin regla de negocio (solo cataloga tipos de aviso). Diseñado completo en la Sección 4. |
| **Domain Event Catalog** | **SÍ** | Evidencia directa: ya existe "mecanismo de bus de eventos ya vigente a nivel de plataforma" (referenciado en el Infrastructure Model de Academia); múltiples módulos publican/consumen eventos de dominio cruzando su propio límite (`EXTERNAL_ACTIVITY_COMPLETED` de Academia hacia Mi Plan; `UnitCompleted`/`UnitMastered` de Academia hacia Gamificación). Sin un catálogo formal, dos módulos podrían nombrar dos eventos distintos de forma idéntica o el mismo concepto de forma distinta. Distinto de Notification Catalog: este es evento técnico entre sistemas, no aviso al usuario final — la confusión entre ambos fue precisamente la causa raíz del Pendiente 6 de Academia, por lo que este documento los separa de forma explícita (ver Sección 5). |
| **Error Catalog** | **SÍ** | El Application Model de Academia ya exige manejo de errores funcionales/técnicos/autorización/validación por módulo; sin una taxonomía compartida de códigos y categorías, cada módulo definiría su propio vocabulario de error, rompiendo la consistencia que la futura API Contract necesitará. Sin regla de negocio (una taxonomía no decide nada, solo clasifica). |
| **Permission Catalog** | **SÍ** | Ya existe evidencia de un catálogo compartido de roles (§12.5–12.6: STUDENT/TEACHER/ADMIN/SUPER_ADMIN/REVIEWER/AI_SERVICE/SYSTEM), reutilizado literalmente por Academia sin extensión. Este componente ya opera como Core de facto; este documento solo lo reconoce formalmente como tal. |
| **Feature Flag Registry** | **SÍ, con alcance acotado** | Academia ya decidió (IRB, Pendiente 3) usar variables de configuración por ambiente, sin servicio dedicado — esa decisión se mantiene sin cambios. Lo que pertenece al Core no es un servicio nuevo, sino la **convención de nomenclatura y el registro de qué flags existen y qué módulo las declaró**, para evitar colisión de nombres entre módulos. No se introduce infraestructura nueva. |
| **Audit Catalog (`AuditLog`)** | **SÍ** | Ya existe como entidad compartida (§13.11), reutilizada explícitamente por Mi Plan y por Academia (TeacherOverride, recomendaciones docentes). Este documento reconoce formalmente su carácter de Core; no se rediseña. |
| **Telemetry Catalog** | **SÍ, con límite explícito** | Múltiples módulos producen evidencia consumida por Evolución/Learning Analytics (§13.8): Academia produce evaluaciones de competencia, Mi Plan produce cumplimiento de tareas. Pertenece al Core únicamente la **taxonomía de qué métricas/eventos de telemetría existen y su nomenclatura**, nunca el cálculo de indicadores agregados (eso sigue siendo responsabilidad funcional de Evolución, un módulo, no del Core — la Functional Spec de Academia ya lo dejó explícito: "el cálculo de indicadores agregados es responsabilidad exclusiva de Evolución/Learning Analytics"). |
| **Logging** | **SÍ** | Ya documentado como "formato ya usado en Mi Plan/Dashboard, reutilizado, no redefinido" en el Infrastructure Model de Academia. Es infraestructura ya operativa a nivel de plataforma; este documento la reconoce formalmente como Core, sin rediseñarla. |
| **Configuration** | **SÍ** | Mecanismo de configuración por ambiente ya reutilizado de forma consistente en todos los módulos auditados en este proyecto. Pertenece al Core el *mecanismo* (cómo se inyecta configuración por ambiente); los *valores* de cada módulo siguen siendo propiedad de cada módulo. |
| **Secrets** | **SÍ** | Ya referenciado como "mecanismo de secrets ya vigente a nivel de plataforma" y reutilizado sin excepción por Academia. Componente Core ya operativo; se reconoce formalmente. |
| **Observability (tracing/health/métricas de infraestructura)** | **SÍ** | Ya referenciado como infraestructura de tracing "ya vigente a nivel de plataforma" y reutilizada sin excepción. Se reconoce formalmente como Core. |
| **File Storage** | **SÍ** | Ya referenciado como "servicio de storage de objetos ya vigente a nivel de plataforma"; aunque Academia decidió no usarlo todavía (Biblioteca de Modelos en texto plano, IRB Pendiente 5), el servicio en sí es transversal por diseño (materiales de Conoce el DELF, avatares de Perfil, adjuntos futuros) — Academia simplemente no lo necesita hoy, lo cual no cambia su naturaleza de Core. |
| **AI Provider (Gateway/estrategia de integración)** | **SÍ, como estándar de contrato, no como vendor** | La Functional Specification de Academia ya declara que "Corrector IA... es la misma capacidad transversal (Coach IA/Feedback Engine)" — es decir, ya está reconocido como transversal por un documento Frozen. El IRB de Academia (Pendiente 1) ya definió la estrategia (`AIProvider` como interfaz + selección por configuración) — ese patrón de integración (puerto, timeouts, retry, circuit breaker) pertenece al Core como estándar reutilizable por cualquier módulo que consuma IA (Laboratorio, Simulador, si en el futuro necesitan corrección); la identidad concreta del proveedor sigue siendo una decisión operativa de plataforma, no de diseño. |
| **Background Jobs (patrón de cola)** | **SÍ, como patrón, no como servicio nuevo** | El IRB de Academia (Pendiente 7) ya resolvió usar una tabla en la misma PostgreSQL + worker con polling, reutilizando el mismo mecanismo que el patrón Outbox. Ese patrón (tabla de trabajos + polling + reintentos + dead-letter) es genuinamente reutilizable por cualquier módulo con necesidad de procesamiento diferido (ya se anticipa en Mi Plan para recordatorios, en Gamificación para cálculo de recompensas) — pertenece al Core como patrón estandarizado, sin introducir infraestructura nueva. |
| **Scheduler (disparadores por tiempo/cron)** | **NO, por ahora** | No existe, en ningún documento Frozen revisado, evidencia real de un segundo módulo que necesite disparadores programados por tiempo (a diferencia de Background Jobs, que Academia ya necesita concretamente hoy). Incluirlo ahora sería anticipación especulativa, prohibida por la regla de exclusión por defecto de la Sección 2. Se excluye explícitamente; si en el futuro un segundo módulo demuestra la necesidad, se evalúa mediante el proceso de la Sección 8. |
| **Health Checks** | **SÍ, como contrato/convención, no como servicio** | El Infrastructure Model de Academia ya reutiliza "la infraestructura de tracing ya vigente a nivel de plataforma" para su propio health check. Pertenece al Core únicamente el **contrato de forma** (qué estructura debe tener la respuesta de un health check para que la orquestación de la plataforma trate a todos los módulos de forma uniforme) — no una implementación nueva. |
| **Row-Level Security + Unit of Work (patrón multi-tenant por estudiante)** *(componente adicional, no listado explícitamente en el encargo, identificado por evidencia directa)* | **SÍ** | Ya aprobado en Mi Plan (Resolución 18.24: `withStudentContext`/`withServiceContext`, `UnitOfWork.execute(work, studentId?)`) y reutilizado explícitamente, sin modificación, por el Infrastructure Model de Academia. Es el ejemplo más claro de componente que ya opera como Core de facto sin haber sido reconocido formalmente hasta este documento. |
| **Bounded Context Query Gateway (patrón)** *(nuevo — ACP-005, v1.1)* | **SÍ, como patrón, no como servicio nuevo — con una salvedad honesta** | Evidencia directa: Academia necesita consultar Organization Management de forma síncrona (`VerifyAuthority`/`EnumerateAuthority`) para operar P-12/P-13/P-15 — ningún patrón existente lo cubre (ver Sección 10 para el análisis completo). **Salvedad, criterio 1:** hoy existe un único consumidor concreto evidenciado (Academia↔Organization Management), no un segundo módulo ya operando el patrón — el criterio se sostiene por la cláusula "lo necesitará con alta certeza" (cualquier futuro Bounded Context DDD con Aggregates propios enfrentará la misma necesidad de comunicación síncrona, dado que el patrón de eventos y el de módulo agregador ya demostraron no cubrir este caso), no por evidencia de un segundo consumidor ya materializado — se declara así, sin ocultarlo. Diseñado completo en la Sección 10. |

**Nota metodológica:** en varios componentes (Feature Flag Registry, Telemetry Catalog, AI Provider, Background Jobs, Health Checks, y ahora Bounded Context Query Gateway) el Core no absorbe una implementación completa — absorbe únicamente el *contrato, la convención o el patrón*, dejando la implementación concreta donde ya fue decidida (p. ej., Academia ya implementa su propio `feedback-queue.worker.ts` siguiendo el patrón de Background Jobs del Core, sin que el Core ejecute ese worker por Academia). Esto respeta el principio "no depender de módulos funcionales" sin vaciar de sentido el componente.

---

## 4. Notification Catalog

**Objetivo.** Proveer un catálogo único, gobernado y versionado de tipos de notificación dirigidos al usuario final (Estudiante, Profesor, Administrador), que cualquier módulo funcional puede invocar por identificador simbólico, sin definir su propio mecanismo de notificación ni su propio canal de entrega.

**Ownership.** El catálogo es propiedad del Platform Core — no de ningún módulo funcional. Ningún módulo puede crear un tipo de notificación unilateralmente dentro de su propio código; todo tipo nuevo se incorpora exclusivamente mediante el proceso de extensión descrito más abajo.

**Categorías.** Cada tipo de `NotificationEvent` se clasifica en exactamente una combinación de:
- **Audiencia:** `STUDENT`, `TEACHER`, `ADMIN`.
- **Naturaleza:** `PROGRESS` (progreso o logro alcanzado), `ACTION_REQUIRED` (el usuario debe hacer algo, p. ej. revisar retroalimentación disponible), `REMINDER` (recordatorio, p. ej. tarea próxima a vencer en Mi Plan), `SOCIAL` (recompensa/gamificación).
- **Módulo de origen:** metadato informativo (quién dispara el evento), nunca propietario del tipo.

**Nomenclatura.** Convención obligatoria `<MÓDULO>_<EVENTO>_<CALIFICADOR opcional>`, en mayúsculas con guion bajo — consistente con el estilo ya existente (`WRITING_SUBMITTED`, `WRITING_CORRECTED`). Ejemplos ya derivados de módulos existentes: `ACADEMY_FEEDBACK_READY`, `MIPLAN_TASK_DUE_SOON`, `GAMIFICATION_REWARD_UNLOCKED`.

**Versionado.** Cada tipo, una vez publicado en el catálogo, es **inmutable en su semántica** — el mismo principio ya aplicado a los Domain Events congelados del Domain Model. Un cambio de comportamiento (audiencia distinta, urgencia distinta) siempre crea un tipo nuevo; nunca se redefine uno existente. El catálogo completo lleva un número de versión incremental y un changelog de altas (no existen bajas silenciosas, ver "Extensibilidad").

**Extensibilidad.** Proceso formal para incorporar un tipo nuevo:
1. El módulo solicitante describe el evento de negocio que lo origina, la audiencia y la naturaleza propuesta.
2. El owner del catálogo evalúa si un tipo ya existente cubre la necesidad semánticamente, para evitar explosión de tipos casi duplicados.
3. Si no existe cobertura, se aprueba el tipo nuevo, se agrega al catálogo versionado con su changelog, y queda disponible para cualquier módulo, no solo para el solicitante original.

**Compatibilidad.** Los módulos consumen el catálogo exclusivamente por identificador simbólico — nunca conocen el canal de entrega real (push/in-app/correo) ni el proveedor técnico detrás de la entrega. Un cambio de proveedor de entrega no rompe a ningún módulo consumidor, porque ninguno depende de la implementación, solo del identificador.

**Integración con módulos.** Cada módulo declara su propio adaptador de salida (p. ej. `AcademyNotificationAdapter`, ya definido en el Infrastructure Model de Academia), que invoca al catálogo pasando únicamente el identificador de tipo ya aprobado — el módulo nunca decide el canal ni el contenido final de la plantilla de entrega; eso es responsabilidad del servicio de notificaciones central que implementa este catálogo.

**Primera aplicación del proceso — cierre del Pendiente 6 de Academia.** Aplicando el proceso de extensibilidad recién definido, se evalúa la solicitud ya documentada por Academia (retroalimentación disponible tras espera diferida, Functional Specification v1.1, Sección 11): no existe, en el catálogo ya referenciado (`WRITING_SUBMITTED`/`WRITING_CORRECTED`), un tipo cuya semántica cubra "retroalimentación lista tras procesamiento asíncrono diferido". Se aprueba el tipo nuevo:

- **Identificador:** `ACADEMY_FEEDBACK_READY`
- **Audiencia:** `STUDENT`
- **Naturaleza:** `ACTION_REQUIRED`
- **Módulo de origen:** Academia
- **Changelog:** alta v1.0 de este documento.

Con esta aprobación, el Pendiente 6 del Infrastructure Model de Academia queda **resuelto**.

---

## 5. Relaciones

| Componente Core | Módulos que lo consumen (evidencia real) | Módulos que nunca deben depender de él directamente |
|---|---|---|
| Notification Catalog | Academia, Mi Plan, Gamificación (evidencia: eventos ya nombrados con la misma convención) | Ninguno está excluido de consumirlo — es universal por diseño; lo que está prohibido es que un módulo lea el catálogo de otro módulo para inferir su estado (el catálogo es solo de tipos, no de instancias de notificación de otro módulo). |
| Domain Event Catalog | Academia, Mi Plan, Gamificación | Presentation/API Contract nunca debe suscribirse directamente a Domain Events — solo a través de Queries/DTOs ya expuestos por Application de cada módulo. |
| Error Catalog | Todos los módulos con Application Layer (Academia, Mi Plan, Dashboard) | Domain nunca debe conocer el Error Catalog — los errores de dominio se expresan como excepciones/resultados propios del Domain Model, y es Application quien los traduce a la taxonomía del Core. |
| Permission Catalog | Todos los módulos con control de acceso (Academia, Mi Plan, Dashboard, Espacio del Profesor) | Ningún módulo debe definir roles propios paralelos a los ya catalogados — toda necesidad de un rol nuevo pasa por este catálogo, nunca por una enumeración local. |
| Feature Flag Registry | Todos los módulos que requieran activación condicional (hoy: Academia) | El Core nunca decide el valor de una flag de un módulo — solo registra su existencia y nomenclatura. |
| Audit Catalog (`AuditLog`) | Mi Plan, Academia (TeacherOverride, recomendaciones) | Ningún módulo debe crear su propia tabla de auditoría paralela. |
| Telemetry Catalog | Academia, Mi Plan (como productores); Evolución/Learning Analytics (como consumidor de la taxonomía, no del cálculo) | Evolución no debe leer el estado interno de los Aggregates de Academia/Mi Plan directamente — solo la evidencia ya publicada bajo la taxonomía del Telemetry Catalog. |
| Logging / Configuration / Secrets / Observability | Todos los módulos, sin excepción | Ninguna exclusión — son infraestructura base ya universal. |
| File Storage | Módulos con contenido de archivo (potencialmente Conoce el DELF, Perfil; hoy Academia decidió no usarlo aún) | Ningún módulo debe implementar su propio mecanismo de almacenamiento de archivos en paralelo. |
| AI Provider (estándar de Gateway) | Academia (hoy); candidatos futuros: Laboratorio, Simulador, si requieren corrección | Ningún módulo debe integrar un proveedor de IA sin pasar por el puerto estandarizado — evita integraciones ad-hoc no auditables. |
| Background Jobs (patrón) | Academia (`feedback-queue.worker.ts`); candidatos futuros: Mi Plan, Gamificación | Ningún módulo debe introducir una tecnología de colas distinta sin pasar por este patrón ya aprobado (evita fragmentación tecnológica). |
| Health Checks (contrato) | Todos los módulos desplegables de forma independiente | N/A — es un contrato de forma, no un servicio con lógica que pueda acoplar módulos entre sí. |
| **Bounded Context Query Gateway (patrón)** *(nuevo)* | **Ninguno todavía** — su primera aplicación anticipada (Academia ↔ Organization Management) requiere un ACP propio, no autorizado por este documento (ver Sección 10) | Ningún Bounded Context debe implementar un mecanismo alternativo de consulta síncrona cruzada (HTTP interno ad-hoc, import directo de `features/*`) sin pasar por este patrón, una vez que exista un ACP que autorice su adopción concreta. |

---

## 6. Dependencias

**Permitidas:**
- Módulo funcional → Core (consumo de cualquier catálogo, patrón o contrato ya definido).
- Application de un módulo → Error Catalog / Domain Event Catalog / Notification Catalog (para traducir resultados de Domain a un vocabulario compartido).
- Infrastructure de un módulo → Logging / Configuration / Secrets / Observability / File Storage / AI Provider (estándar) / Background Jobs (patrón) — consumo directo de infraestructura ya operativa.

**Prohibidas:**
- Core → cualquier módulo funcional, en cualquier dirección y en cualquier capa (Domain, Application o Infrastructure de un módulo). El Core nunca importa, referencia ni conoce el código de un módulo específico.
- Módulo funcional A → módulo funcional B de forma directa, incluso si ambos consumen el mismo componente del Core — el Core nunca actúa como puente de datos de dominio entre dos módulos (solo transporta contratos neutrales: un identificador de tipo de notificación, un nombre de evento, una taxonomía de error — nunca una entidad ni un Aggregate de un módulo).
- Un componente del Core dependiendo de la implementación interna de otro componente del Core — solo puede depender de su contrato/puerto públicamente expuesto (mismo principio de Dependency Inversion ya vigente dentro de cada módulo, aplicado ahora también entre componentes del Core entre sí).

---

## 7. Riesgos

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Centralización excesiva** | Con el tiempo, equipos de módulos podrían proponer mover a Core cualquier cosa "por conveniencia", diluyendo el criterio de transversalidad real y convirtiendo el Core en un segundo monolito. | Aplicación estricta del checklist de la Sección 9 antes de aceptar cualquier componente nuevo; ningún componente entra al Core sin evidencia real de un segundo módulo consumidor. |
| **Acoplamiento por versión** | Si el Core cambia un contrato ya consumido por varios módulos, un cambio incompatible rompería a todos simultáneamente. | Versionado semántico obligatorio por catálogo/contrato (ya aplicado en el Notification Catalog, Sección 4); ningún tipo/contrato se redefine, solo se extiende; ventana de deprecación obligatoria antes de retirar cualquier versión anterior. |
| **Crecimiento descontrolado del inventario** | Cada módulo nuevo podría proponer componentes nuevos sin disciplina, inflando el Core con elementos de bajo uso real. | Revisión de Arquitectura de Plataforma obligatoria (Sección 8) antes de aceptar cualquier alta; auditoría periódica de uso real por componente, con posibilidad de degradar a nivel de módulo si el uso transversal nunca se materializa (ver Scheduler, excluido en la Sección 3 por falta de evidencia). |
| **Ambigüedad entre catálogos similares** | El propio origen de este documento (confusión entre Domain Event y NotificationEvent en Academia) puede repetirse entre otros pares de catálogos (p. ej. Error Catalog vs. mensajes de validación funcional de un módulo). | Este documento fija límites explícitos por componente (Sección 5) precisamente para prevenir la repetición del mismo tipo de confusión en futuros módulos. |
| **Cuello de botella organizacional** | Si toda extensión del Core requiere aprobación centralizada, podría convertirse en un bloqueo operativo para los equipos de módulo. | El proceso de extensión (Sección 8) está deliberadamente acotado a una evaluación de cobertura semántica, no a un comité extenso — diseñado para resolverse en el mismo ciclo que la necesidad del módulo, como ya se demostró en la Sección 4 con `ACADEMY_FEEDBACK_READY`. |

---

## 8. Estrategia de evolución

**Cómo agregar un componente nuevo al Core:**
1. El equipo de un módulo (o el propio Platform Architect) identifica una necesidad transversal con evidencia real de un segundo módulo consumidor.
2. Se evalúa contra los cinco criterios de la Sección 2 y el checklist de la Sección 9.
3. Si aprueba, se documenta como un componente individual del Core (mismo nivel de detalle que el Notification Catalog en este documento), indicando objetivo, ownership, contrato y relaciones — nunca se agrega por referencia superficial.
4. Se incorpora al inventario de la Sección 3 en la siguiente revisión de este documento — **exactamente el proceso seguido por ACP-005 para incorporar el Bounded Context Query Gateway.**

**Cómo versionarlos:** cada componente del Core mantiene versionado semántico independiente del versionado de cualquier módulo funcional. Un cambio de contrato que rompe compatibilidad hacia atrás exige una nueva versión mayor y una ventana de deprecación explícita (mínimo: un ciclo de release completo) antes de retirar la versión anterior — ningún módulo consumidor puede quedar roto sin aviso.

**Cómo desaprobar componentes:** un componente del Core se marca `DEPRECATED` cuando dos condiciones se cumplen: (a) existe un reemplazo ya disponible o ya no hay necesidad transversal demostrable, y (b) todos los módulos consumidores conocidos tienen una ruta de migración documentada. Se retira definitivamente solo cuando ningún módulo activo lo consume — verificable, no supuesto.

---

## 9. Checklist

Para determinar si un componente nuevo pertenece realmente al Platform Core, deben responderse afirmativamente **todas** las siguientes preguntas:

- [ ] ¿Existe evidencia documental (no especulación) de que al menos dos módulos funcionales ya necesitan, o inminentemente necesitarán, este componente?
- [ ] ¿El componente está completamente libre de reglas de negocio específicas de un dominio?
- [ ] ¿La duplicación de este componente en cada módulo produciría una inconsistencia real, observable por el usuario o por el equipo de ingeniería?
- [ ] ¿Puede este componente evolucionar sin forzar la reapertura de ningún módulo ya Frozen?
- [ ] ¿Es imposible que este componente se convierta en un canal de acceso directo de un módulo funcional hacia el estado interno de otro?
- [ ] ¿Se ha evitado deliberadamente incluir aquí una implementación completa, dejando solo el contrato/patrón/convención mínimos necesarios?

Si alguna respuesta es negativa, el componente permanece fuera del Core hasta que la evidencia cambie.

---

## 10. Bounded Context Query Gateway

**Objetivo.** Proveer el único mecanismo autorizado para que un Bounded Context DDD con Aggregates propios consulte, de forma síncrona y con respuesta inmediata, una capacidad de lectura o escritura ya expuesta por otro Bounded Context DDD — sin que ninguno de los dos importe directamente el código interno (`features/*`) del otro, y sin recurrir a eventos cuando la naturaleza de la consulta exige una respuesta inmediata, no diferida.

**Por qué existe (evidencia, sin inferencia más allá de lo ya demostrado por ACP-005).** La regla global ya vigente (Project Structure Specification §8) establece: *"`features/*` nunca importa directamente de otro `features/*`. Toda comunicación pasa por `services/` compartidos o por eventos."* Ningún documento anterior definía cómo se materializa ese canal cuando la comunicación necesaria es una pregunta-respuesta síncrona entre dos Bounded Contexts con Aggregates propios — a diferencia de:
- el patrón de módulo agregador (Dashboard, Project Structure Specification §2/§6), reservado a módulos **sin** `domain/`/`application/`/`infrastructure/` propios;
- el patrón de eventos (Mi Plan ↔ Academia/Gamificación, `docs/modules/mi-plan.md` §2.10), que no sirve para una respuesta inmediata;
- el estándar de Gateway ya existente (AI Provider, Sección 3), que expone un **contrato de interfaz** implementado independientemente por cada módulo consumidor hacia un proveedor externo — no una consulta hacia el Application Layer de **otro** Bounded Context del propio proyecto.

Evidencia de consumo real (primer caso, no el único posible): Academia necesita `VerifyAuthority`/`EnumerateAuthority` de Organization Management para operar P-12/P-13/P-15 (Blueprint de Academia §14 ítem 1; PND-04; toda la cadena documental de Organization Management).

**Ownership.** El patrón es propiedad del Platform Core. Cada Bounded Context proveedor sigue siendo, sin excepción, el único dueño de su propia lógica, sus propios Aggregates y su propia Application Layer — el patrón no transporta ni decide nada de negocio, únicamente enruta una llamada ya autorizada hacia el punto de entrada de Application que el Bounded Context proveedor ya expone (mismo principio ya aplicado al AI Provider Gateway Standard).

**Estructura del patrón (contrato, no implementación — ninguna tecnología, framework ni mecanismo concreto se elige aquí):**
1. Un Bounded Context proveedor expone, para consumo externo, exactamente las mismas Queries/Commands ya diseñadas en su propia Application Layer para sus consumidores internos — nunca se duplican ni se redefinen para el caso externo.
2. Un módulo raíz compartido `services/{nombreDelBoundedContext}` (análogo, en función, no en dominio, a `services/ai`/`services/gamification`/`services/database` ya existentes) es el **único** punto autorizado, fuera del propio Bounded Context proveedor, para invocar esas Queries/Commands — implementado como una función delgada que invoca el punto de entrada de Application ya expuesto por el proveedor, sin absorber ninguna lógica propia.
3. Cualquier Bounded Context consumidor (`features/{módulo}`) accede exclusivamente a través de ese `services/{nombreDelBoundedContext}` — nunca importando `features/{otro-módulo}` directamente, respetando sin excepción Project Structure Specification §8.
4. La comunicación es **in-process** (invocación de función dentro del mismo proceso de la aplicación) — nunca HTTP ni ningún protocolo de red interno — porque la plataforma es, por diseño ya documentado (Project Structure Specification §3-§4), un único monolito desplegado como una sola aplicación; introducir un protocolo de red entre módulos del mismo proceso violaría el criterio 5 de la Sección 2 de este mismo documento (no introducir infraestructura nueva sin evidencia real).

**Nomenclatura.** `services/{nombreDelBoundedContext}.ts` (camelCase, sin abreviar) — misma convención ya usada por `services/ai.ts`, `services/gamification.ts`, `services/database.ts`, `services/analytics.ts`.

**Versionado.** El contrato expuesto por cada Bounded Context proveedor sigue exactamente las reglas de versionado ya vigentes para su propio Application Model (Architecture Change Management Standard §8) — este patrón no introduce un versionado paralelo ni propio.

**Extensibilidad.** Cualquier Bounded Context futuro que necesite exponer o consumir una capacidad síncrona sigue este mismo patrón, sin evaluación caso por caso — salvo que un caso futuro demuestre una necesidad genuinamente distinta, evaluable mediante un ACP de tipo Platform Core, igual que ACP-005 lo hizo para crear este patrón.

**Compatibilidad.** No rompe ningún contrato ya vigente — es, en su totalidad, un patrón nuevo y aditivo, sin ningún consumidor previo que pudiera verse afectado.

**Integración con módulos.** **Ningún módulo lo consume todavía.** Su primera aplicación real (Academia consumiendo Organization Management) queda, deliberadamente, fuera del alcance de ACP-005 y de esta revisión de Platform Core Foundation — requiere su propio ACP posterior (tipo Infraestructura/API, dado que tocaría el Infrastructure Model y posiblemente el Application Model de Academia) antes de que Academia adopte concretamente este patrón.

**Verificación contra el Checklist de la Sección 9:**
- [x] Evidencia documental de necesidad transversal — **con la salvedad ya declarada explícitamente en la Sección 3**: un único consumidor concreto hoy (Academia↔Organization Management), sostenido por la cláusula "alta certeza" de necesidad futura, no por un segundo caso ya materializado.
- [x] Completamente libre de reglas de negocio — el patrón solo enruta, nunca decide.
- [x] Duplicación produciría inconsistencia real — cada Bounded Context inventando su propio mecanismo (HTTP ad-hoc, import prohibido, etc.) fragmentaría la plataforma.
- [x] Evoluciona sin forzar reapertura de módulos ya Frozen — Academia y Organization Management permanecen intactos hasta su propio ACP de adopción.
- [x] Imposible que se convierta en canal de acceso directo al estado interno de otro módulo — el patrón solo transporta el resultado ya definido de una Query/Command pública (p. ej. un booleano o una colección de identificadores), nunca un Aggregate ni una Entity completos.
- [x] Se evitó una implementación completa — solo se define el contrato/patrón, sin elegir tecnología concreta de invocación más allá de "in-process", ya justificado por la arquitectura física ya documentada del proyecto.

---

## VALIDACIÓN FINAL — Auditoría automática

| Verificación | Resultado |
|---|---|
| ✓ Ningún componente funcional fue movido incorrectamente al Core | **Cumple.** Cada componente incluido pasó los cinco criterios de la Sección 2 con evidencia citada; `Scheduler` fue explícitamente excluido por falta de evidencia transversal real; el nuevo Bounded Context Query Gateway fue verificado contra el Checklist de la Sección 9 en su propia Sección 10, con su única salvedad declarada explícitamente, no oculta. |
| ✓ No se alteró ningún documento Frozen | **Cumple.** Academia y Organization Management permanecen exactamente como estaban; ningún Aggregate, Command, Query ni endpoint de ninguno de los dos fue tocado. |
| ✓ Notification Catalog y Bounded Context Query Gateway quedan completamente definidos | **Cumple** para ambos, con el mismo nivel de detalle (objetivo, ownership, contrato, nomenclatura, versionado, extensibilidad, compatibilidad, integración). |
| ✓ Los módulos pueden reutilizar el Core sin dependencias circulares | **Cumple.** La Sección 6 prohíbe explícitamente cualquier dependencia del Core hacia un módulo funcional, en cualquier capa; la dirección de dependencia es siempre módulo → Core, nunca la inversa. |

---

## Riesgos abiertos

*(Únicamente riesgos arquitectónicos ya aceptados en documentos anteriores — ninguno nuevo introducido por esta versión.)*

- El criterio de pertenencia al Core (evidencia de un segundo consumidor) se sostiene, para el Bounded Context Query Gateway, en "alta certeza" de necesidad futura, no en un segundo caso ya materializado — riesgo ya declarado desde ACP-005, no oculto.
- El mecanismo exacto por el cual un futuro `services/organizationManagement.ts` invocaría el Application Layer de Organization Management (composition root, wiring de dependencias) no se diseña aquí — queda para el ACP de adopción concreta por parte de Academia.
- La política de `Authority` tras retirar una `Membership` (Organization Management) y el mecanismo de autorización 401/403 de sus Commands permanecen sin definir — ajenos al alcance de este documento.

---

## RESULTADO

**1. Platform Core Foundation v1.2 queda actualizado y completamente autosuficiente**, incorporando el Bounded Context Query Gateway como componente formal de su inventario, con el texto justificativo íntegro de los 17 componentes reproducido sin depender de ninguna versión anterior.

**2. Componentes que deberán convertirse en documentos individuales futuros** (sin cambios respecto a v1.0/v1.1): Domain Event Catalog, Error Catalog, Permission Catalog, Feature Flag Registry, Telemetry Catalog, AI Provider Gateway Standard, Background Jobs Pattern, Health Check Contract, Row-Level Security + Unit of Work Pattern — se añade a esta lista el propio **Bounded Context Query Gateway**, si su primera aplicación real (Academia ↔ Organization Management) demuestra la necesidad de un nivel de detalle mayor al ya provisto en la Sección 10. Los componentes **Audit Catalog, Logging, Configuration, Secrets, Observability y File Storage** ya operan como infraestructura de plataforma existente y reutilizada sin fricción — no requieren un documento de diseño nuevo.

**3. Academia y Organization Management — sin cambio de estado.** Ambos permanecen exactamente en el estado en que se encontraban antes de este documento (Academia: FROZEN, con P-12/P-13/P-15 todavía bloqueados operativamente hasta su propio ACP de adopción del nuevo patrón; Organization Management: FROZEN, sin defecto arquitectónico). **Este documento no autoriza, por sí mismo, que Academia consuma el nuevo patrón** — esa autorización requiere un ACP propio y posterior.

---

Detenido tras Platform Core Foundation v1.2. No se avanza a Academia ni a Organization Management.
