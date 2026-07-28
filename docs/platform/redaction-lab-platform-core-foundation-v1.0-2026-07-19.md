# RÉDACTION LAB — PLATFORM CORE FOUNDATION v1.0

**Estado:** DRAFT (fundacional — primer documento del Platform Core del proyecto)
**Fecha:** 2026-07-19
**Autor:** Principal Enterprise Software Architect, Rédaction Lab
**Origen:** este documento nace de un bloqueo concreto detectado durante el IRB de Academia (`academia-irb-resoluciones-infraestructura-2026-07-19.md`, Pendiente 6 — NotificationEvent), que reveló la ausencia de un componente transversal gobernado formalmente. El análisis de esa ausencia se generalizó al resto de la plataforma, siguiendo evidencia ya documentada en los módulos existentes.

**Documentos Frozen respetados sin modificación:** Product Blueprint, Arquitectura General, Domain Model, Application Model, Academia Functional Specification v1.1, Academia Infrastructure Model v1.0 (pendiente únicamente de las seis actualizaciones editoriales ya aprobadas por el IRB).

---

## 1. Objetivo del Platform Core

**Propósito.** El Platform Core es el conjunto de componentes técnicos transversales de Rédaction Lab: contratos, catálogos y mecanismos que cualquier módulo funcional (Dashboard, Mi Plan, Academia, Laboratorio, Conoce el DELF, Simulador, Gamificación, Evolución, Espacio del Profesor) puede consumir sin volver a diseñarlos, y que ningún módulo funcional posee en exclusiva.

**Qué problemas resuelve:**
- Evita que cada módulo invente su propia versión de un mismo mecanismo (ya observado: Academia estuvo a punto de necesitar decidir, por sí sola, cómo se gobierna un catálogo de notificaciones que en realidad pertenece a toda la plataforma).
- Da un punto único de gobierno para decisiones que, si se toman a nivel de módulo, generan inconsistencia observable (nomenclatura de eventos, niveles de log, taxonomía de errores, roles y permisos).
- Permite que los módulos funcionales se congelen (Frozen) de forma independiente entre sí, sin arrastrar contratos transversales sin dueño.

**Qué nunca debe contener:**
- Ninguna regla de negocio de ningún módulo (el Platform Core no sabe qué es una `AcademyUnit`, un `LearningPlan` ni un `WritingTask` — solo transporta, cataloga o estandariza mecanismos alrededor de ellos).
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

**Nota metodológica:** en varios componentes (Feature Flag Registry, Telemetry Catalog, AI Provider, Background Jobs, Health Checks) el Core no absorbe una implementación completa — absorbe únicamente el *contrato, la convención o el patrón*, dejando la implementación concreta donde ya fue decidida (p. ej., Academia ya implementa su propio `feedback-queue.worker.ts` siguiendo el patrón de Background Jobs del Core, sin que el Core ejecute ese worker por Academia). Esto respeta el principio "no depender de módulos funcionales" sin vaciar de sentido el componente.

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

Con esta aprobación, el Pendiente 6 del Infrastructure Model de Academia queda **resuelto** (ver Validación Final y Recomendación).

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
4. Se incorpora al inventario de la Sección 3 en la siguiente revisión de este documento.

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

## VALIDACIÓN FINAL — Auditoría automática

| Verificación | Resultado |
|---|---|
| ✓ Ningún componente funcional fue movido incorrectamente al Core | **Cumple.** Cada componente incluido pasó los cinco criterios de la Sección 2 con evidencia citada; `Scheduler` fue explícitamente excluido por falta de evidencia transversal real, demostrando que el criterio de exclusión se aplicó activamente, no solo se declaró. |
| ✓ No se alteró ningún documento Frozen | **Cumple.** Ninguna sección de este documento redefine reglas del Domain Model, del Application Model o de la Functional Specification de Academia; el Infrastructure Model de Academia se referencia, no se modifica directamente por este documento (su actualización sigue siendo responsabilidad de su propio ciclo editorial, ya aprobado por el IRB). |
| ✓ Notification Catalog queda completamente definido | **Cumple.** Objetivo, ownership, categorías, nomenclatura, versionado, extensibilidad, compatibilidad e integración con módulos están definidos en la Sección 4, incluyendo la primera aplicación real del proceso (`ACADEMY_FEEDBACK_READY`). |
| ✓ Los módulos pueden reutilizar el Core sin dependencias circulares | **Cumple.** La Sección 6 prohíbe explícitamente cualquier dependencia del Core hacia un módulo funcional, en cualquier capa; la dirección de dependencia es siempre módulo → Core, nunca la inversa. |

---

## RESULTADO

**1. Platform Core Foundation queda listo**, como documento fundacional v1.0. Establece el inventario, los criterios de pertenencia y el gobierno general — no diseña en detalle cada componente incluido (ese nivel de detalle se reserva a documentos individuales, punto 2).

**2. Componentes que deberán convertirse en documentos individuales futuros** (siguiendo el mismo proceso y nivel de detalle aplicado aquí al Notification Catalog):
- Domain Event Catalog
- Error Catalog
- Permission Catalog (formalización del ya existente §12.5–12.6 como documento de Core)
- Feature Flag Registry (alcance acotado a convención/registro, sin nuevo servicio)
- Telemetry Catalog (alcance acotado a taxonomía, sin absorber a Evolución)
- AI Provider Gateway Standard (formalización del patrón ya usado por Academia como estándar reutilizable)
- Background Jobs Pattern (formalización del patrón tabla+worker ya usado por Academia)
- Health Check Contract (formato de respuesta estándar)
- Row-Level Security + Unit of Work Pattern (formalización de la Resolución 18.24 como estándar de Core, no exclusivo de Mi Plan)

Los componentes **Audit Catalog, Logging, Configuration, Secrets, Observability y File Storage** ya operan como infraestructura de plataforma existente y reutilizada sin fricción — no requieren un documento de diseño nuevo, solo quedan formalmente reconocidos como Core en el inventario de la Sección 3.

**3. Academia — confirmación de estado FROZEN.** Antes de este documento, el Infrastructure Model de Academia tenía siete pendientes: seis ya resueltos editorialmente por el IRB, y el séptimo (NotificationEvent) bloqueado por depender de un componente de plataforma sin dueño formal. Ese componente (Notification Catalog) queda definido en este mismo documento, y la solicitud específica de Academia queda resuelta como su primera aplicación real (`ACADEMY_FEEDBACK_READY`, Sección 4).

**En consecuencia: sí, Academia puede declararse oficialmente FROZEN** una vez se apliquen, en una sola pasada editorial, las siete actualizaciones a su Infrastructure Model: las seis ya aprobadas por el IRB (Secciones 5, 6, 9, 11, 13, 15) más la séptima, ahora también resuelta (Sección 14, reemplazando la marca de pendiente por la referencia al tipo `ACADEMY_FEEDBACK_READY` ya aprobado en este Platform Core Foundation). Ninguna de las siete actualizaciones exige reabrir el Domain Model, el Application Model ni la Functional Specification — son, en su totalidad, actualizaciones editoriales sobre el Infrastructure Model.
