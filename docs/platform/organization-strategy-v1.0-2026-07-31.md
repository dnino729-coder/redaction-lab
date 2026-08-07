# RÉDACTION LAB — ORGANIZATION STRATEGY v1.0

**Estado:** DRAFT (autoridad arquitectónica del futuro módulo **Organization Management** — precede a su Functional Specification/Domain Model/Application Model/Infrastructure Model/API Contract)
**Fecha:** 2026-07-31
**Autor:** Enterprise Architect / Product Architect / DDD Expert / Software Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Domain Model, Application Model, Infrastructure Model, Functional Specification, API Contract y Blueprint de Academia (versiones vigentes); ACP-001 a ACP-004; Platform Core Foundation v1.0; Project Structure Specification v1.0; Mi Plan (`docs/modules/mi-plan.md`) y Dashboard (`docs/modules/dashboard.md`).
**Alcance:** este documento no diseña entidades, Aggregates, Value Objects, Commands, Queries, endpoints ni tablas. Es exclusivamente estrategia arquitectónica del módulo.

**Nota metodológica sobre el nombre:** el gap ya identificado en la investigación previa de esta sesión se nombraba "Organización Académica" (acoplado a Academia). El encargo de este documento lo renombra deliberadamente **"Organization Management"**, reflejando la exigencia explícita de esta fase: no asumir únicamente instituciones educativas. Este documento no decide todavía si ambos nombres describen el mismo Bounded Context o si "Organization Management" es una generalización que absorbe al primero — esa es, precisamente, una de las decisiones que la Sección 11 marca como pendiente de congelar, no una que este documento resuelva por sí solo.

---

## FASE 0 — Evidencia releída

Releídos completos en esta sesión (turnos previos de esta misma investigación, y releídos de nuevo en este turno donde se cita explícitamente): Product Architecture v1.0 (recién escrito, releído íntegro); Domain Model v1.1; Application Model v1.5; Infrastructure Model v1.2; Functional Specification v1.3; API Contract v1.4; Blueprint v1.1.1; ACP-001 a ACP-004; Platform Core Foundation v1.0; Project Structure Specification v1.0; `docs/modules/mi-plan.md`; `docs/modules/dashboard.md`. Búsqueda adicional en esta ronda: ningún documento del módulo Coach IA existe como archivo propio — Coach IA se documenta únicamente como capacidad transversal referenciada desde Dashboard/Mi Plan/Academia (AI Orchestrator, §9.4/§9.7 del documento consolidado citado por ambos módulos).

**Hallazgo transversal nuevo de esta ronda, confirmado en 3 módulos independientes:** el único patrón de aislamiento de datos documentado en todo el producto es **por estudiante** (`student_id`/`StudentId`), nunca por institución — confirmado literalmente en Mi Plan (`UnitOfWork.execute(work, studentId?)`, resolución 18.24), en Dashboard ("RLS... el estudiante solo podrá acceder a su propia información", §10/§16) y en Academia (Infrastructure Model, `withStudentContext`). Ningún módulo, sin excepción, modela hoy un concepto de "organización" como frontera de datos.

---

## 1. Propósito del módulo

**Qué problema resuelve:** proveer la fuente de verdad de "quién pertenece a qué organización, con qué rol, bajo la autoridad de quién" — hoy completamente ausente en el producto (confirmado en la investigación previa: 0 coincidencias de `roster`/`enrollment`/`cohort`/`class`/`course`/`group`/`assignment` y sus equivalentes en español, en los 10 documentos autoritativos de Academia). Es, en su forma mínima ya documentada como dependencia real, la capacidad de enumerar y verificar la relación docente-estudiante que Academia ya invoca (`TeacherStudentRelationshipPort`) pero no puede resolver por sí sola.

**Qué problema NO resuelve** (por exclusión ya documentada, Product Architecture v1.0 §6): ninguna regla pedagógica, de progreso, de contenido o de recompensa — esas permanecen en Academia/Mi Plan/Evolución/Gamificación, sin excepción. Tampoco resuelve, salvo que se decida explícitamente lo contrario (Sección 11): facturación, suscripciones, licenciamiento — ninguno de estos conceptos existe en ningún documento del producto (confirmado, búsqueda de "suscripción"/"licencia"/"multi-tenant" en Product Architecture v1.0 §8: solo "multi-tenant por estudiante" existe, nunca institucional).

**Por qué existe:** porque el producto, en su Modo Institucional (Contexto del producto, Escenario B), ya diseñó capacidades que presuponen su existencia (CU-09 a CU-12 de Academia) sin que ningún documento la haya modelado nunca — es una dependencia real, no especulativa, ya bloqueando P-12/P-13/P-15 de Academia hoy mismo.

---

## 2. Principios arquitectónicos

1. **Independencia del Modo Individual.** Organization Management nunca debe ser una precondición de arranque de ningún módulo Core Platform u Optional Module. **Justificación (evidencia, no diseño nuevo):** ya verificado en el código real que las 11 pantallas de Estudiante de Academia (P-01–P-11) no importan `TeacherStudentRelationshipPort` en ninguna de sus Commands/Queries (Product Architecture v1.0 §3) — el principio ya se cumple hoy y este documento lo congela como invariante hacia adelante, no lo introduce.

2. **Desacoplamiento entre módulos.** Ningún módulo existente (Academia, Mi Plan, Dashboard, Coach IA, etc.) debe importar entidades internas de Organization Management, y viceversa — mismo principio ya vigente de Feature-Driven Architecture ("una feature nunca accederá directamente a otra", Platform Core Foundation §2, criterio 5) y del Domain Model de Academia ("Academia nunca escribe directamente sobre datos de otro Bounded Context", §1). **Justificación:** es el único principio ya demostrado, en 3 módulos distintos (Academia, Mi Plan, Dashboard — todos comunicándose exclusivamente vía eventos de dominio o Read Ports), como sostenible en este producto.

3. **Configuración por organización, no por código.** Cada organización debe poder definir su propia estructura interna (jerarquías, unidades, roles) sin que ese cambio requiera desplegar código nuevo. **Justificación:** exigencia explícita del encargo ("cada organización podrá definir su propia estructura interna"; "la arquitectura NO debe asumir que todas funcionan igual") — no hay evidencia documental previa de este principio en ningún módulo existente (es genuinamente nuevo, no una extensión de un patrón ya usado), lo cual se señala como riesgo en la Sección 10.

4. **Separación entre pedagogía y estructura organizacional.** Organization Management nunca debe decidir ni conocer contenido pedagógico (unidades, intentos, planes, competencias); Academia/Mi Plan/Evolución nunca deben decidir ni conocer estructura organizacional (jerarquías, roles institucionales, membresía). **Justificación:** aplicación directa, en la dirección inversa, del mismo principio ya congelado para Academia→Organización Académica (PND-04: "Academia no debe, ni necesita, poseer datos de membresía de grupo") — la separación debe ser simétrica para ser real.

5. **Consumo mediante contratos, nunca acceso directo.** Todo módulo que necesite información organizacional la consume exclusivamente mediante un contrato de lectura expuesto por Organization Management (mismo patrón ya usado por Academia: `TeacherStudentRelationshipPort`, un puerto, no una tabla compartida). **Justificación:** es el único patrón de integración cross-módulo ya demostrado en todo el producto (eventos de dominio para escritura/notificación asíncrona — `PLAN_TASK_COMPLETED`, `EXTERNAL_ACTIVITY_COMPLETED`, Mi Plan §2.9; puertos de lectura síncrona para verificación — `TeacherStudentRelationshipPort`, Academia) — no se propone un mecanismo nuevo, se reutiliza el ya validado.

6. **Escalabilidad futura sin reabrir el dominio.** El modelo interno de Organization Management debe poder incorporar tipos de organización no anticipados (Empresas, redes de colegios, franquicias) sin migrar su forma central. **Justificación:** exigido explícitamente por el encargo (Sección 9) y ya señalado como riesgo/decisión pendiente en Product Architecture v1.0 (§8, §10, decisión 6) — este documento no resuelve la decisión, pero congela el principio de que debe ser posible, dejando el "cómo" para el Domain Model.

---

## 3. Alcance funcional

**Pertenece a Organization Management** (responsabilidades, no entidades):
- Determinar qué organizaciones existen y su identidad básica.
- Determinar qué usuarios pertenecen a qué organización.
- Determinar qué rol(es) ejerce un usuario dentro de una organización específica (p. ej. "profesor de X", "administrador de Y") — nótese: esto es distinto del rol de plataforma ya existente (`TEACHER`/`ADMIN`/`STUDENT`, Permission Catalog), que sigue siendo responsabilidad del Platform Core; Organization Management responde "¿profesor de quién, dentro de qué organización?", no "¿es profesor?".
- Determinar la estructura interna que cada organización define para sí misma (Sección 5).
- Exponer, a cualquier módulo autorizado, un contrato de consulta sobre estas relaciones (p. ej., responder la pregunta ya congelada de Academia: "¿tiene este profesor autoridad sobre este estudiante?", y su generalización, "¿cuáles son los estudiantes de este profesor?").

**NO pertenece a Organization Management** (por el principio 4 de la Sección 2):
- Ninguna regla, estado o dato de progreso pedagógico de ningún módulo (Academia, Mi Plan, Evolución, Gamificación).
- Ninguna decisión de contenido, corrección o recomendación (Coach IA).
- La identidad personal del usuario más allá de su pertenencia organizacional (eso permanece en Perfil).
- NO DOCUMENTADO, y explícitamente fuera de alcance salvo decisión futura: facturación, licenciamiento, gestión de pagos — ningún documento del producto los menciona en absoluto; incluirlos aquí sería una invención, no una responsabilidad ya evidenciada.

---

## 4. Tipos de organizaciones

**Pregunta del encargo:** ¿debe el producto soportar organizaciones genéricas, no solo universidades?

**Evidencia relevante, sin inferir una respuesta:** el propio Contexto del producto de esta sesión enumera explícitamente ocho tipos distintos (Universidad, Colegio, Instituto, Academia de idiomas, Centro de formación, Empresa, Organización pública, Organización privada) como escenarios igualmente válidos del Escenario B — y exige literalmente "la arquitectura NO debe asumir que todas funcionan igual". Ningún documento previo al Contexto de esta sesión mencionaba más de un tipo de organización (los documentos de Academia solo hablaban de "Profesor"/"Estudiante", sin nombrar nunca "universidad" ni ningún otro tipo).

**Análisis (sin diseñar el dominio):** modelar Organization Management asumiendo un único tipo fijo de organización ("Universidad") contradiría directamente la exigencia explícita del encargo y reintroduciría exactamente el riesgo ya señalado en Product Architecture v1.0 (§8, riesgo 1: acoplar el diseño a "profesor de escuela" limita la reutilización para Empresas/Marketplace de docentes). Modelar organizaciones de forma completamente genérica desde el inicio, sin ningún tipo predefinido, es consistente con el principio 6 de la Sección 2 (escalabilidad sin reabrir el dominio), pero introduce una pregunta que ningún documento resuelve todavía: **si "tipo de organización" debe ser una dimensión de configuración (dato) o si distintos tipos exigen comportamientos funcionales distintos** (p. ej., ¿una Empresa tiene "estudiantes" y "profesores" en el mismo sentido que un Colegio?) — eso es, en sí mismo, una decisión de producto que ningún documento leído responde, ni este documento debe inventar.

**Conclusión de esta sección (sin decidir el diseño):** existe evidencia suficiente para requerir que la arquitectura **permita** múltiples tipos de organización sin modificar el resto del sistema al incorporar uno nuevo — eso se congela como principio (Sección 11). Lo que NO está documentado, y debe congelarse antes del Domain Model, es si esos tipos comparten un único modelo de comportamiento o si existen variaciones funcionales reales entre tipos.

---

## 5. Configuración organizacional

**Pregunta del encargo:** ¿cómo debe entenderse "estructura" (niveles, jerarquías, unidades, áreas, programas, departamentos, facultades, grados, cursos)? ¿Configurable o fija?

**Evidencia:** NO DOCUMENTADO en ningún documento del producto — ninguno de estos términos (`departamento`, `facultad`, `programa`, `curso`, `grado`, `jerarquía organizacional`) aparece en ningún documento de Academia, Mi Plan, Dashboard, Platform Core Foundation o Project Structure Specification (verificado por búsqueda exhaustiva en la investigación previa de esta sesión, con 0 coincidencias). Este es territorio completamente nuevo, sin precedente documental en el producto.

**Análisis estratégico (sin crear entidades):** el propio encargo, al listar ocho tipos de organización heterogéneos (una Universidad tiene facultades/programas; una Empresa tiene departamentos/equipos; un Centro de formación puede no tener ninguna subdivisión), sugiere que una jerarquía fija y universal (p. ej. "Institución → Facultad → Programa → Curso", pensada solo para universidades) **no cubriría** a una Empresa o a un Centro de formación sin subdivisiones — contradiciendo el principio 3 (configuración por organización) recién congelado. La alternativa —una estructura completamente configurable, sin niveles predefinidos por el sistema— es la única lectura consistente con la exigencia explícita del encargo ("cada organización podrá definir su propia estructura interna"), pero es una decisión de mayor complejidad de dominio que debe congelarse explícitamente, no asumirse por defecto.

**Conclusión de esta sección:** la "estructura" debe entenderse, a nivel estratégico, como **configurable por organización, no como una jerarquía fija impuesta por el sistema** — esto se congela como principio (Sección 11). El **nivel exacto de flexibilidad** (¿cuántos niveles de jerarquía se permiten? ¿es una jerarquía estrictamente arbórea o puede una unidad pertenecer a más de una unidad padre?) queda explícitamente **NO DOCUMENTADO y pendiente de decisión** antes del Domain Model — no se inventa aquí.

---

## 6. Relación con los demás módulos

| Módulo | Qué consume de Organization Management | Qué nunca debe consumir | Grado de dependencia permitido |
|---|---|---|---|
| **Academia** | El contrato de verificación/enumeración de relación docente-estudiante (ya previsto: `TeacherStudentRelationshipPort`) — únicamente para las 4 piezas ya identificadas (`ApplyTeacherOverride`, `AssignUnitToStudent`, `GetStudentProgressSummary`, `GetTeacherOverrideHistory`). | La estructura interna completa de la organización (jerarquías, unidades) — Academia solo necesita "¿autoridad sobre quién?", nunca "¿en qué departamento?". | **Opcional, ya aislado a nivel de Application** (Product Architecture v1.0 §3) — las 11 pantallas de Estudiante, cero dependencia. |
| **Coach IA** | NO DOCUMENTADO ninguna necesidad — ningún documento de Coach IA menciona estructura organizacional. | Cualquier dato organizacional — Coach IA opera sobre el estudiante individual, sin conocer su organización (mismo principio ya vigente: "el Core nunca conoce reglas de negocio de un módulo", aplicable simétricamente). | **Ninguna** — no hay evidencia de necesidad real (mismo criterio de exclusión por defecto de Platform Core Foundation §2: "si es útil hoy solo para un módulo... entra solo con evidencia real"). |
| **Dashboard** | Potencialmente, en Modo Institucional, un indicador de pertenencia organizacional para personalizar el saludo/contexto — NO DOCUMENTADO como necesidad real hoy (Dashboard, §1-16, nunca menciona organización). | Cualquier lógica de autorización organizacional — Dashboard "nunca llama directamente a otro ecosistema" (Dashboard §7, regla ya vigente), principio extensible a Organization Management. | **Ninguna hoy, especulativa a futuro** — no se documenta como necesidad real. |
| **Mi Plan** | NO DOCUMENTADO ninguna necesidad — Mi Plan es exclusivamente individual por diseño ya Frozen (resoluciones 18.20-18.24, ningún concepto organizacional). | Cualquier dato organizacional. | **Ninguna.** |
| **Laboratorio, Centro de Entrenamiento, Simulador DELF, Evolución, Gamificación** | NO DOCUMENTADO — todos son "Placeholder" (Project Structure Specification §6), sin ninguna especificación que mencione estructura organizacional. | Cualquier dato organizacional, hasta que exista evidencia real de necesidad (mismo criterio de exclusión por defecto). | **Ninguna, hoy.** |

**Patrón general (sin excepciones detectadas):** la única dependencia real y documentada, en todo el producto, hacia Organization Management es la de Academia — y está ya circunscrita a un subconjunto mínimo de su capa de Application, nunca a su Domain. Ningún otro módulo tiene, hoy, evidencia de necesidad real.

---

## 7. Contratos de integración

Sin diseñar APIs, puertos ni interfaces — únicamente qué clases de información deberían cruzar.

**Qué debería ofrecer Organization Management al resto del producto:**
- Una respuesta de verificación de autoridad (booleano o equivalente) entre dos identidades, dado un rol organizacional — generalización del contrato ya existente en Academia.
- Una respuesta de enumeración (colección de identidades bajo la autoridad de otra) — la capacidad hoy ausente que originó toda esta investigación.
- Un indicador de pertenencia organizacional de un usuario (para personalización, no para autorización) — de utilidad especulativa para Dashboard, sin evidencia real todavía (Sección 6).

**Qué nunca debería exponer:**
- Ninguna entidad interna completa de su propio modelo de estructura (jerarquías, unidades) — por el mismo principio de "transportar solo contratos neutrales, nunca entidades de dominio" ya vigente para el Platform Core (Platform Core Foundation §6).
- Ningún dato de otro módulo que fluya *a través* de Organization Management — igual que el Platform Core "nunca actúa como puente de datos de dominio entre dos módulos" (Platform Core Foundation §6), Organization Management tampoco debería hacerlo entre, por ejemplo, Academia y un futuro módulo de Empresas.

---

## 8. Modos de operación

**Cómo cambia el comportamiento entre Modo Individual y Modo Institucional** (retomando y precisando Product Architecture v1.0 §4, sin contradecirlo):

- **Módulos que cambian:** únicamente Academia — sus capacidades de Profesor/Administrador (P-12/P-13/P-15) pasan de "bloqueadas, sin datos reales" (Modo Individual, donde no aplican en absoluto) a "operables" (Modo Institucional, una vez Organization Management exista y provea el contrato).
- **Módulos que permanecen idénticos:** Perfil, Dashboard, Platform Core, Coach IA, y las 11 pantallas de Estudiante de Academia — ya confirmado por evidencia de código que ninguno de ellos varía su comportamiento según el modo (Product Architecture v1.0 §3).
- **Qué debe activarse automáticamente:** NO DOCUMENTADO — ningún documento define el mecanismo de activación del Modo Institucional para un usuario o para toda una organización (ver Sección 10, riesgo).
- **Qué nunca debe modificarse:** el comportamiento del Modo Individual no debe degradarse ni requerir configuración adicional cuando el producto opera en Modo Institucional para otros usuarios — principio ya congelado en Product Architecture v1.0 (decisión 4: "el Modo Institucional es un superconjunto, nunca una versión restringida").

---

## 9. Escenarios futuros

Evaluación exclusivamente arquitectónica (sin solución), retomando y extendiendo Product Architecture v1.0 §8 con los escenarios adicionales de este encargo:

| Escenario | ¿La estrategia aquí definida lo permitiría sin rediseñar? | Razonamiento |
|---|---|---|
| **Marketplace de docentes** | Depende de la decisión pendiente de la Sección 4 (tipos genéricos vs. específicos) — si "profesor" se modela como un rol organizacional entre otros, sí; si se modela como un concepto fijo y exclusivo de instituciones educativas, no. | Ya señalado como riesgo 1 en Product Architecture v1.0. |
| **Franquicias** | Compatible con el principio 3 (configuración por organización) **solo si** el modelo permite relaciones organización-a-organización (una franquicia como organización "hija" de una matriz) — NO DOCUMENTADO si ese tipo de relación se contempla. | Requiere decisión explícita, no asumida aquí. |
| **Redes de colegios** | Mismo razonamiento que Franquicias — exige que una organización pueda tener sub-organizaciones o unidades con su propia estructura. | Mismo riesgo. |
| **Varias sedes** | Compatible con el principio 5 (configuración organizacional), si "sede" se modela como una unidad configurable dentro de la estructura de una organización (Sección 5) — coherente con la conclusión ya alcanzada allí. | Consistente con lo ya congelado. |
| **Multi-tenant institucional** | **No cubierto por ningún patrón de infraestructura existente** — el único patrón de aislamiento de datos documentado en todo el producto es por estudiante (Sección "FASE 0", hallazgo transversal), nunca por institución. Este documento no resuelve esta brecha (es de Infrastructure, fuera de alcance de una estrategia funcional), pero la señala como riesgo crítico (Sección 10). | Mismo riesgo 2 de Product Architecture v1.0, confirmado ahora en 3 módulos, no solo en Academia. |
| **Empresas** | Igual que Marketplace de docentes: depende de si el modelo de "organización con miembros y roles" es genérico o específico de educación. | Decisión pendiente, Sección 4. |
| **Centros de idiomas** | Ya cubierto explícitamente por el propio Contexto del producto de esta sesión ("Academia de idiomas" es uno de los ocho tipos ya enumerados) — compatible por diseño, siempre que la decisión de la Sección 4 favorezca tipos genéricos. | — |
| **Certificaciones internacionales** | NO DOCUMENTADO ninguna relación con Organization Management — ya señalado en Product Architecture v1.0 (§8) que Certificaciones, de existir, sería un módulo aparte, nunca parte de Academia; su relación con Organization Management (si una organización certifica a sus miembros) es un escenario nuevo, no evaluado en ningún documento. | Fuera de evidencia, no resuelto aquí. |
| **Organizaciones gubernamentales** | Mismo razonamiento que Empresas/Centros de idiomas — depende enteramente de la decisión genérico-vs-específico de la Sección 4; el propio Contexto de esta sesión ya las incluye explícitamente como tipo válido. | Decisión pendiente, Sección 4. |

**Conclusión (sin proponer solución):** de los nueve escenarios evaluados, siete dependen directamente de una única decisión no tomada (Sección 4: modelo genérico vs. específico de "organización"); uno (Varias sedes) ya es compatible con lo aquí congelado; uno (Multi-tenant institucional) es un riesgo de infraestructura real, no resuelto por ninguna estrategia funcional, que debe escalarse explícitamente antes de construir el Domain Model.

---

## 10. Riesgos

| # | Riesgo | Impacto |
|---|---|---|
| 1 | La decisión "genérico vs. específico" (Sección 4) condiciona 7 de los 9 escenarios futuros evaluados (Sección 9) — no tomarla explícitamente antes del Domain Model reintroduce el mismo riesgo ya señalado en Product Architecture v1.0. | **Crítico.** |
| 2 | Ausencia total de un patrón de multi-tenancy institucional en la infraestructura del producto — confirmado ahora en 3 módulos (Academia, Mi Plan, Dashboard), todos aislados exclusivamente por estudiante. | **Crítico.** |
| 3 | NO DOCUMENTADO ningún mecanismo de activación/transición entre Modo Individual y Modo Institucional, ni de creación de una organización en sí — sin esto, Organization Management no tiene un punto de entrada funcional definido. | **Crítico.** |
| 4 | El nivel de flexibilidad de la "estructura organizacional" (Sección 5) — jerarquía arbórea estricta vs. estructura libre — no está decidido; diseñar el Domain Model sin esta decisión obliga a asumir una respuesta no verificada. | **Importante.** |
| 5 | El propio nombre y alcance del módulo ("Organización Académica" vs. "Organization Management") no está unificado entre esta sesión y la investigación previa — riesgo de que documentos futuros hereden ambigüedad de identidad del propio Bounded Context. | **Importante.** |
| 6 | Inconsistencias terminológicas ya identificadas en la investigación previa (`hasRelationship()` vs. `.exists()`; terminología `Group*` obsoleta) podrían propagarse a los nuevos documentos de Organization Management si no se resuelven antes. | **Importante.** |
| 7 | Ningún documento define el "propietario" (owner) organizacional/de gobierno de Organization Management — a diferencia de Platform Core, que sí tiene un proceso de gobierno explícito. | **Deseable de resolver, no bloqueante para diseñar el dominio.** |
| 8 | Los escenarios de Empresas/Certificaciones internacionales/Organizaciones gubernamentales no tienen ninguna evidencia documental de requisitos reales — cualquier diseño que los anticipe en detalle sería especulación, no evidencia. | **Deseable — riesgo de sobre-diseño, no de sub-diseño.** |

---

## 11. Decisiones que deben congelarse

**Críticas** (bloquean el inicio responsable del Domain Model si no se resuelven):
1. **Organization Management modela "organización" de forma genérica (organización → miembros → roles configurables), no específica de instituciones educativas** — o la decisión explícita en contrario. Sin esta decisión, 7 de 9 escenarios futuros (Sección 9) quedan indeterminados.
2. **La estructura interna de cada organización es configurable por la propia organización, no una jerarquía fija impuesta por el sistema** — ya justificado en la Sección 5 como la única lectura consistente con el encargo, pero el **nivel exacto** de esa flexibilidad queda pendiente de una decisión adicional, explícita, antes del Domain Model.
3. **Debe definirse el mecanismo de activación del Modo Institucional** (cómo se crea una organización, cómo un usuario se asocia a ella) antes de que Organization Management tenga un punto de entrada funcional real — hoy NO DOCUMENTADO en ningún documento del producto.
4. **El aislamiento de datos por institución (multi-tenancy) requiere una decisión de Infrastructure separada** de esta estrategia funcional — se congela aquí únicamente el reconocimiento de que el patrón actual (por estudiante) no lo resuelve, no la solución misma.

**Importantes** (deben resolverse antes de que el Domain Model se considere completo, pero no bloquean su inicio):
5. **Unificación de nombre**: decidir si "Organización Académica" (investigación previa) y "Organization Management" (este documento) son el mismo Bounded Context con un nombre corregido, o dos conceptos distintos — debe resolverse antes de escribir la Functional Specification, para evitar dos identidades documentales del mismo dominio.
6. **Organization Management nunca reside dentro de `features/academy`**, ni de ningún otro módulo funcional existente — coherente con Project Structure Specification §6 y con el principio 2 de la Sección 2 de este documento.
7. **Resolución de las inconsistencias terminológicas ya heredadas** (`hasRelationship()`/`.exists()`; terminología `Group*` obsoleta) antes de que cualquier documento nuevo las adopte sin corregirlas.

**Deseables** (mejoran la gobernanza, no bloquean ningún nivel de diseño):
8. **Definir un proceso de gobierno para Organization Management** equivalente al ya existente para Platform Core (Sección 8 de ese documento) — hoy no existe ninguno.
9. **No diseñar en detalle, todavía, los escenarios sin evidencia real** (Empresas, Certificaciones internacionales, Organizaciones gubernamentales) — mantenerlos como principios de escalabilidad (Sección 2, principio 6), no como requisitos concretos, hasta que exista evidencia real de un segundo consumidor (mismo criterio de exclusión por defecto ya usado en todo el producto, Platform Core Foundation §2).

---

## RESULTADO

Este documento no diseña Organization Management. Establece su propósito, sus principios no negociables, su alcance funcional por responsabilidad (no por entidad), su relación con los 9 módulos existentes (una sola dependencia real hoy: Academia, ya aislada correctamente), y dos hallazgos transversales nuevos de esta ronda: (a) el aislamiento de datos por estudiante, nunca por institución, es un patrón confirmado en 3 módulos distintos, no solo en Academia — riesgo crítico de infraestructura para cualquier multi-tenancy institucional futura; (b) la decisión de modelar "organización" de forma genérica o específica condiciona 7 de 9 escenarios de escalabilidad evaluados y debe congelarse antes de iniciar el Domain Model, no durante su diseño. Persisten 4 decisiones críticas, 3 importantes y 2 deseables sin congelar — ninguna resuelta por invención de este documento.
