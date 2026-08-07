# RÉDACTION LAB — PLATFORM CORE FOUNDATION v1.1

**Estado:** FROZEN
**Fecha:** 2026-07-31 (v1.0 original: 2026-07-19)
**Autor:** Principal Enterprise Software Architect, Rédaction Lab
**Origen v1.0:** este documento nace de un bloqueo concreto detectado durante el IRB de Academia (`academia-irb-resoluciones-infraestructura-2026-07-19.md`, Pendiente 6 — NotificationEvent), que reveló la ausencia de un componente transversal gobernado formalmente. El análisis de esa ausencia se generalizó al resto de la plataforma, siguiendo evidencia ya documentada en los módulos existentes.

**Historial de cambios**

| Versión | Fecha | ACP relacionado | Cambio |
|---|---|---|---|
| 1.0 | 2026-07-19 | — (versión fundacional) | Inventario inicial de 16 componentes del Platform Core; Notification Catalog diseñado en detalle completo; confirmación de que Academia podía declararse FROZEN. |
| 1.1 | 2026-07-31 | ACP-005 | **Corrección editorial de precisión:** el campo "Estado" de este encabezado retenía la etiqueta `DRAFT` desde su redacción original, pese a que este documento fue certificado formalmente como `Frozen` el mismo día de su emisión (`academia-architecture-certification-2026-07-19.md`, línea 5; `academia-architecture-coverage-audit-2026-07-19.md`, línea 5) y tratado como tal, sin excepción, por todos los documentos posteriores del proyecto — se corrige aquí, en la primera reapertura formal habilitada por un ACP, sin que esto constituya un cambio de estado real (ya era operativamente Frozen), solo la corrección de un residuo editorial nunca actualizado. **Cambio sustantivo:** incorporación del componente **Bounded Context Query Gateway** (Sección 10, nueva) — patrón oficial de integración síncrona entre Bounded Contexts DDD completos, autorizado por ACP-005 (tipo Platform Core, clasificación Alto, cambio aditivo — versión Minor, Estándar §8). Actualizadas las Secciones 3 (Inventario) y 5 (Relaciones) para reflejar el nuevo componente. Ninguna otra sección fue modificada. |

**Documentos Frozen respetados sin modificación:** Product Blueprint, Arquitectura General, Domain Model, Application Model, Academia Functional Specification, Academia Infrastructure Model, Academia API Contract, Academia Blueprint (Frontend Implementation), Organization Management (Domain Model, Application Model, Infrastructure Model, API Contract — la totalidad de sus documentos), Product Architecture, ADR-001, Organization Strategy, Project Structure Specification, Architecture Change Management Standard.

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

*(Sin cambios respecto a v1.0.)*

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
| **Notification Catalog** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Domain Event Catalog** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Error Catalog** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Permission Catalog** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Feature Flag Registry** | **SÍ, con alcance acotado** | *(sin cambios respecto a v1.0)* |
| **Audit Catalog (`AuditLog`)** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Telemetry Catalog** | **SÍ, con límite explícito** | *(sin cambios respecto a v1.0)* |
| **Logging** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Configuration** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Secrets** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Observability** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **File Storage** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **AI Provider (Gateway/estrategia de integración)** | **SÍ, como estándar de contrato, no como vendor** | *(sin cambios respecto a v1.0)* |
| **Background Jobs (patrón de cola)** | **SÍ, como patrón, no como servicio nuevo** | *(sin cambios respecto a v1.0)* |
| **Scheduler (disparadores por tiempo/cron)** | **NO, por ahora** | *(sin cambios respecto a v1.0)* |
| **Health Checks** | **SÍ, como contrato/convención, no como servicio** | *(sin cambios respecto a v1.0)* |
| **Row-Level Security + Unit of Work (patrón multi-tenant por estudiante)** | **SÍ** | *(sin cambios respecto a v1.0)* |
| **Bounded Context Query Gateway (patrón)** *(nuevo — ACP-005)* | **SÍ, como patrón, no como servicio nuevo — con una salvedad honesta** | Evidencia directa: Academia necesita consultar Organization Management de forma síncrona (`VerifyAuthority`/`EnumerateAuthority`) para operar P-12/P-13/P-15 — ningún patrón existente lo cubre (ver Sección 10 para el análisis completo). **Salvedad, criterio 1:** hoy existe un único consumidor concreto evidenciado (Academia↔Organization Management), no un segundo módulo ya operando el patrón — el criterio se sostiene por la cláusula "lo necesitará con alta certeza" (cualquier futuro Bounded Context DDD con Aggregates propios enfrentará la misma necesidad de comunicación síncrona, dado que el patrón de eventos y el de módulo agregador ya demostraron no cubrir este caso), no por evidencia de un segundo consumidor ya materializado — se declara así, sin ocultarlo. Diseñado completo en la Sección 10. |

**Nota metodológica:** *(sin cambios respecto a v1.0)* en varios componentes (Feature Flag Registry, Telemetry Catalog, AI Provider, Background Jobs, Health Checks, **y ahora Bounded Context Query Gateway**) el Core no absorbe una implementación completa — absorbe únicamente el *contrato, la convención o el patrón*.

---

## 4. Notification Catalog

*(Sin cambios respecto a v1.0 — sección completa preservada íntegramente.)*

**Objetivo.** Proveer un catálogo único, gobernado y versionado de tipos de notificación dirigidos al usuario final (Estudiante, Profesor, Administrador), que cualquier módulo funcional puede invocar por identificador simbólico, sin definir su propio mecanismo de notificación ni su propio canal de entrega.

**Ownership.** El catálogo es propiedad del Platform Core — no de ningún módulo funcional. Ningún módulo puede crear un tipo de notificación unilateralmente dentro de su propio código; todo tipo nuevo se incorpora exclusivamente mediante el proceso de extensión descrito más abajo.

**Categorías.** Cada tipo de `NotificationEvent` se clasifica en exactamente una combinación de:
- **Audiencia:** `STUDENT`, `TEACHER`, `ADMIN`.
- **Naturaleza:** `PROGRESS`, `ACTION_REQUIRED`, `REMINDER`, `SOCIAL`.
- **Módulo de origen:** metadato informativo, nunca propietario del tipo.

**Nomenclatura.** `<MÓDULO>_<EVENTO>_<CALIFICADOR opcional>`, mayúsculas con guion bajo. Ejemplos: `ACADEMY_FEEDBACK_READY`, `MIPLAN_TASK_DUE_SOON`, `GAMIFICATION_REWARD_UNLOCKED`.

**Versionado.** Cada tipo, una vez publicado, es inmutable en su semántica.

**Extensibilidad.** Proceso formal de tres pasos (solicitud → evaluación de cobertura semántica → alta versionada).

**Compatibilidad.** Consumo exclusivamente por identificador simbólico.

**Integración con módulos.** Cada módulo declara su propio adaptador de salida.

**Primera aplicación del proceso — cierre del Pendiente 6 de Academia:** `ACADEMY_FEEDBACK_READY` (Audiencia `STUDENT`, Naturaleza `ACTION_REQUIRED`, Módulo de origen Academia, Changelog: alta v1.0).

---

## 5. Relaciones

| Componente Core | Módulos que lo consumen (evidencia real) | Módulos que nunca deben depender de él directamente |
|---|---|---|
| Notification Catalog | Academia, Mi Plan, Gamificación | *(sin cambios respecto a v1.0)* |
| Domain Event Catalog | Academia, Mi Plan, Gamificación | *(sin cambios respecto a v1.0)* |
| Error Catalog | Todos los módulos con Application Layer | *(sin cambios respecto a v1.0)* |
| Permission Catalog | Todos los módulos con control de acceso | *(sin cambios respecto a v1.0)* |
| Feature Flag Registry | Academia | *(sin cambios respecto a v1.0)* |
| Audit Catalog (`AuditLog`) | Mi Plan, Academia | *(sin cambios respecto a v1.0)* |
| Telemetry Catalog | Academia, Mi Plan; Evolución (consumidor de taxonomía) | *(sin cambios respecto a v1.0)* |
| Logging / Configuration / Secrets / Observability | Todos los módulos | *(sin cambios respecto a v1.0)* |
| File Storage | Módulos con contenido de archivo | *(sin cambios respecto a v1.0)* |
| AI Provider (estándar de Gateway) | Academia; candidatos futuros: Laboratorio, Simulador | *(sin cambios respecto a v1.0)* |
| Background Jobs (patrón) | Academia; candidatos futuros: Mi Plan, Gamificación | *(sin cambios respecto a v1.0)* |
| Health Checks (contrato) | Todos los módulos desplegables de forma independiente | *(sin cambios respecto a v1.0)* |
| **Bounded Context Query Gateway (patrón)** *(nuevo)* | **Ninguno todavía** — su primera aplicación anticipada (Academia ↔ Organization Management) requiere un ACP propio, no autorizado por este documento (ver Sección 10) | Ningún Bounded Context debe implementar un mecanismo alternativo de consulta síncrona cruzada (HTTP interno ad-hoc, import directo de `features/*`) sin pasar por este patrón, una vez que exista un ACP que autorice su adopción concreta. |

---

## 6. Dependencias

*(Sin cambios respecto a v1.0.)*

**Permitidas:**
- Módulo funcional → Core (consumo de cualquier catálogo, patrón o contrato ya definido).
- Application de un módulo → Error Catalog / Domain Event Catalog / Notification Catalog.
- Infrastructure de un módulo → Logging / Configuration / Secrets / Observability / File Storage / AI Provider / Background Jobs.

**Prohibidas:**
- Core → cualquier módulo funcional, en cualquier dirección y en cualquier capa.
- Módulo funcional A → módulo funcional B de forma directa, incluso si ambos consumen el mismo componente del Core.
- Un componente del Core dependiendo de la implementación interna de otro componente del Core.

---

## 7. Riesgos

*(Sin cambios respecto a v1.0 — la tabla de riesgos generales del Core permanece igual; los riesgos específicos del nuevo componente se documentan en su propia Sección 10, no aquí, siguiendo el mismo patrón ya usado para Notification Catalog.)*

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Centralización excesiva** | ... | Checklist de la Sección 9 antes de aceptar cualquier componente nuevo. |
| **Acoplamiento por versión** | ... | Versionado semántico obligatorio. |
| **Crecimiento descontrolado del inventario** | ... | Revisión de Arquitectura de Plataforma obligatoria (Sección 8). |
| **Ambigüedad entre catálogos similares** | ... | Límites explícitos por componente (Sección 5). |
| **Cuello de botella organizacional** | ... | Proceso de extensión acotado (Sección 8). |

---

## 8. Estrategia de evolución

*(Sin cambios respecto a v1.0.)*

**Cómo agregar un componente nuevo al Core:** 1) identificar necesidad transversal con evidencia real; 2) evaluar contra los cinco criterios (Sección 2) y el checklist (Sección 9); 3) documentar como componente individual con el mismo nivel de detalle que Notification Catalog; 4) incorporar al inventario (Sección 3) — **exactamente el proceso seguido por ACP-005 para incorporar el Bounded Context Query Gateway en esta misma revisión.**

**Cómo versionarlos:** versionado semántico independiente por componente.

**Cómo desaprobar componentes:** marca `DEPRECATED` cuando existe reemplazo o ya no hay necesidad transversal, con ruta de migración documentada para todos los consumidores.

---

## 9. Checklist

*(Sin cambios respecto a v1.0 — el nuevo componente se evalúa contra este mismo checklist en la Sección 10.)*

- [ ] ¿Existe evidencia documental de que al menos dos módulos funcionales ya necesitan, o inminentemente necesitarán, este componente?
- [ ] ¿El componente está completamente libre de reglas de negocio específicas de un dominio?
- [ ] ¿La duplicación de este componente en cada módulo produciría una inconsistencia real?
- [ ] ¿Puede este componente evolucionar sin forzar la reapertura de ningún módulo ya Frozen?
- [ ] ¿Es imposible que este componente se convierta en un canal de acceso directo de un módulo funcional hacia el estado interno de otro?
- [ ] ¿Se ha evitado deliberadamente incluir aquí una implementación completa?

---

## 10. Bounded Context Query Gateway *(sección nueva — ACP-005)*

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
| ✓ Ningún componente funcional fue movido incorrectamente al Core | **Cumple**, incluido el nuevo componente (Bounded Context Query Gateway), verificado contra el Checklist de la Sección 9 en su propia Sección 10. |
| ✓ No se alteró ningún documento Frozen | **Cumple** — Academia y Organization Management permanecen exactamente como estaban; ningún Aggregate, Command, Query ni endpoint de ninguno de los dos fue tocado. |
| ✓ Notification Catalog y Bounded Context Query Gateway quedan completamente definidos | **Cumple** para ambos, con el mismo nivel de detalle (objetivo, ownership, contrato, nomenclatura, versionado, extensibilidad, compatibilidad, integración). |
| ✓ Los módulos pueden reutilizar el Core sin dependencias circulares | **Cumple** — la Sección 6 prohíbe explícitamente cualquier dependencia del Core hacia un módulo funcional. |

---

## RESULTADO

**1. Platform Core Foundation v1.1 queda actualizado**, incorporando el Bounded Context Query Gateway como componente formal de su inventario, sin alterar ninguno de los 16 componentes ya reconocidos en v1.0.

**2. Componentes que deberán convertirse en documentos individuales futuros:** sin cambios respecto a v1.0 (lista preservada íntegra) — se añade, a esa misma lista de candidatos a documento individual futuro, el propio **Bounded Context Query Gateway**, si su primera aplicación real (Academia ↔ Organization Management) demuestra la necesidad de un nivel de detalle mayor al ya provisto en la Sección 10.

**3. Academia y Organization Management — sin cambio de estado.** Ambos permanecen exactamente en el estado en que se encontraban antes de este documento (Academia: FROZEN, con P-12/P-13/P-15 todavía bloqueados operativamente hasta su propio ACP de adopción del nuevo patrón; Organization Management: FROZEN, sin defecto arquitectónico). **Este documento no autoriza, por sí mismo, que Academia consume el nuevo patrón** — esa autorización requiere un ACP propio y posterior.

---

## Riesgos abiertos (heredados de ACP-005, no resueltos por este documento)

- El criterio de pertenencia al Core (evidencia de un segundo consumidor) se sostiene, para este componente, en "alta certeza" de necesidad futura, no en un segundo caso ya materializado — riesgo ya declarado, no oculto.
- El mecanismo exacto por el cual `services/organizationManagement.ts` invocaría el Application Layer de Organization Management (composition root, wiring de dependencias) no se diseña aquí — queda para el ACP de adopción concreta por parte de Academia.
- La política de `Authority` tras retirar una `Membership` (Organization Management) y el mecanismo de autorización 401/403 de sus Commands permanecen sin definir — ajenos al alcance de este documento.

Detenido tras Platform Core Foundation v1.1. No se avanza a Academia ni a Organization Management.
