# ORGANIZATION MANAGEMENT — INFRASTRUCTURE MODEL v1.1

**Fecha:** 2026-07-31
**Autor:** Software Architect / Infrastructure Architect, Rédaction Lab
**Versión anterior:** v1.0 (2026-07-31, conservada sin modificar por trazabilidad histórica — `organization-management-infrastructure-model-v1.0-2026-07-31.md`), corregida en respuesta a `organization-management-infrastructure-model-audit-v1.0-2026-07-31.md` (dictamen: B, aprobado con observaciones).
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Domain Model Audit v1.1; Organization Management Application Model v1.1; Organization Management Application Model Audit v1.1; Infrastructure Model v1.2, API Contract v1.4 (Academia, releído solo para estilo).
**Alcance de esta revisión:** responde exclusivamente a las observaciones I-01 e I-02 de la auditoría v1.0 — mismos Repositories, Adaptadores, métodos, Unit of Work, Domain Events, exclusiones y dependencias; ningún rediseño ni ampliación de alcance.

---

## Repositories

*(Sin cambios respecto a v1.0 — no es consecuencia de I-01/I-02.)*

**Derivados exclusivamente de Domain Model v1.1 y Application Model v1.1 — ningún método nuevo.**

### `OrganizationRepository`
| Método | Consumidor (Application Model v1.1) |
|---|---|
| `findById(organizationId)` | `AddMembershipHandler` |
| `save(organization)` | `RegisterOrganizationHandler` |

### `MembershipRepository`
| Método | Consumidor (Application Model v1.1) |
|---|---|
| `findById(membershipId)` | `RemoveMembershipHandler` |
| `save(membership)` | `AddMembershipHandler`, `RemoveMembershipHandler` |
| `findByMemberId(memberId)` | `AddMembershipHandler`, `VerifyAuthorityHandler`, `EnumerateAuthorityHandler` |
| `findByOrganizationId(organizationId)` | `EnumerateAuthorityHandler` |

**Verificado: ningún método "por si acaso"** — los seis ya existían en Application Model v1.1, con consumidor identificado; este documento no añade ninguno.

---

## Adaptadores

*(Sin cambios respecto a v1.0.)*

**Únicamente los necesarios para implementar los Repository ya definidos y los Output Ports ya identificados en Application Model v1.1 — ninguna tecnología asumida.**

- **Adaptador de persistencia de `Organization`** — implementa `OrganizationRepository`. Responsabilidad: traducir el Aggregate `Organization` hacia y desde el mecanismo de persistencia real, sin decidir su forma aquí.
- **Adaptador de persistencia de `Membership`** — implementa `MembershipRepository`. Misma responsabilidad, para el Aggregate `Membership`.
- **Adaptador de `UuidGenerator`** — ya existe como componente transversal del Platform Core (reutilizado, no nuevo, mismo patrón que Academia ya usa sin excepción).
- **Adaptador de `DomainEventPublisher`/Outbox** — ya existe como patrón transversal del Platform Core ("Background Jobs (patrón)", Platform Core Foundation §3) — Organization Management lo reutiliza, no diseña uno propio.
- **Adaptador de `Logger`** — mismo criterio, componente transversal ya operativo.

**No se diseña ningún adaptador para el consumo por parte de Academia** — esa responsabilidad recae en el propio adaptador ya existente de Academia (`TeacherStudentRelationshipAdapter`), que deberá invocar `VerifyAuthority`/`EnumerateAuthority` en su implementación futura — fuera del alcance de este documento, que pertenece a Organization Management, no a Academia.

**No se diseña ningún adaptador hacia Perfil** — ver Integraciones externas: Organization Management no invoca ningún servicio de Perfil, solo referencia `MemberId` como identificador opaco.

---

## Unit of Work

*(Sin cambios respecto a v1.0.)*

| Command | ¿Requiere Unit of Work? | Justificación |
|---|---|---|
| `RegisterOrganization` | No | Escritura única sobre un Aggregate nuevo, sin lectura previa que coordinar (Application Model v1.1 §8). |
| `AddMembership` | **Sí** | La secuencia "leer `findByMemberId` → crear y guardar `Membership`" debe ejecutarse como unidad — ya establecido en Application Model v1.1 §8, con la precisión ya documentada allí de que la transacción, por sí sola, no basta bajo concurrencia (ver Consistencia, abajo). |
| `RemoveMembership` | No | Lectura y escritura únicas sobre el mismo Aggregate ya identificado por `membershipId`, sin condición de unicidad que proteger. |
| `VerifyAuthority` / `EnumerateAuthority` | No | Operaciones de solo lectura. |

---

## Eventos

**Domain Events que deben poder salir del dominio (sin diseñar broker, cola ni mensajería):** `OrganizationRegistered`, `MemberAdded`, `MemberRemoved` (Domain Model v1.1 §10).

**Corrección I-01 (reemplaza la afirmación de v1.0 sobre un consumidor especulativo):** ningún documento de esta cadena (Functional Specification v1.0, Scope v1.0, Platform Core Foundation) evidencia, hoy, **ningún consumidor** para estos tres eventos — Academia consume Organization Management exclusivamente vía consulta síncrona (`VerifyAuthority`/`EnumerateAuthority`), nunca vía suscripción a eventos. En consecuencia:

- **Actualmente no existe ningún consumidor documentado** para `OrganizationRegistered`, `MemberAdded` ni `MemberRemoved`.
- **Infrastructure únicamente preserva la capacidad de publicación** (mediante el adaptador de `DomainEventPublisher`/Outbox ya reutilizado del Platform Core, Sección Adaptadores) — no se diseña ningún mecanismo de transporte externo (broker, cola, mensajería) porque no hay, hoy, ningún consumidor que lo requiera.
- **Cualquier consumidor futuro deberá documentarse cuando exista evidencia real** de esa necesidad — no se nombra ni se anticipa ningún candidato en este documento.

---

## Consistencia

*(Sin cambios respecto a v1.0 — no es consecuencia de I-01/I-02.)*

- **Operaciones transaccionales:** únicamente `AddMembership` (Unit of Work, arriba).
- **Operaciones de solo lectura:** `VerifyAuthority`, `EnumerateAuthority`.
- **Dependencias entre Aggregates:** `Membership` referencia `OrganizationId` por identidad (Domain Model v1.1 §13) — la verificación de que la `Organization` referenciada exista (Invariante 3) ocurre mediante una lectura previa (`OrganizationRepository.findById`) dentro de la misma transacción de `AddMembership`, no mediante una transacción distribuida entre dos Aggregates. Dado que ningún documento define un mecanismo de eliminación física de `Organization` (Domain Model v1.1 §12: sin estado de desactivación), no existe riesgo de referencia colgante una vez verificada la existencia en el momento de creación.
- **Restricción de unicidad pendiente, ahora formalmente reconocida como responsabilidad de este documento (Application Model v1.1 §8 la remitió aquí):** la Aplicación por sí sola, incluso con Unit of Work, no impide que dos invocaciones concurrentes de `AddMembership` para el mismo par `(Organization, Member)` pasen ambas la verificación antes de escribir. Este Infrastructure Model **reconoce la necesidad de una restricción de unicidad a nivel de infraestructura** sobre la combinación `(OrganizationId, MemberId)` entre `Membership` activas — **sin especificar su forma concreta** (no se diseña un índice, una tabla ni una sintaxis SQL, tal como exige el encargo). Esta restricción es la única pieza de consistencia que este documento reconoce como necesaria pero deliberadamente no resuelta en detalle técnico.

---

## Integraciones externas

*(Sin cambios respecto a v1.0.)*

- **Perfil (`MemberId`):** Organization Management **no integra activamente con Perfil** — `MemberId` se trata, en todo momento, como un identificador externo opaco (Domain Model v1.1 §6, §14), sin verificación de existencia ni consulta alguna hacia Perfil/Authentication. **Contrato esperado:** ninguno más allá de que el identificador recibido sea estable en el tiempo — no se diseña ningún mecanismo de verificación.
- **Academia (consumidor):** **Contrato esperado** (ya definido en Application Model v1.1, no rediseñado aquí): Academia invocará `VerifyAuthority(memberIdA, role, memberIdB)` → booleano, y `EnumerateAuthority(memberIdA, role)` → colección de `MemberId`, sustituyendo el adaptador fail-closed hoy existente (`TeacherStudentRelationshipAdapter`). No se diseña el mecanismo de invocación (síncrono en proceso, HTTP interno, etc.) — eso pertenece, si acaso, a un futuro API Contract, explícitamente fuera de alcance de este documento.

---

## Persistencia

*(Sin cambios respecto a v1.0.)*

**Qué necesita persistirse (derivado exclusivamente del Domain Model v1.1) — sin tablas, índices, motores, SQL ni ORM:**
- **`Organization`:** su identidad y los datos mínimos de identificación aún no especificados por ningún documento (Domain Model v1.1 §6 ya señaló esto como pendiente, no inventado aquí tampoco).
- **`Membership`:** su identidad, la referencia a `OrganizationId`, la referencia a `MemberId`, su `Role`, y su estado de lifecycle (activa/Removida, Domain Model v1.1 §12) — nunca una eliminación física, consistente con el principio ya vigente en todo el proyecto.

---

## Errores

*(Sin cambios respecto a v1.0.)*

**Categorías de infraestructura posibles (sin diseñar excepciones concretas):**
- Indisponibilidad temporal del mecanismo de persistencia (fallo de conectividad).
- Violación de la restricción de unicidad reconocida en la sección de Consistencia (si se implementa como tal) — de infraestructura, a traducir por Application, no diseñada aquí.
- Conflicto de concurrencia optimista (posible, no diseñado) al guardar una `Membership`/`Organization` ya modificada por otra operación concurrente.

---

## Escalabilidad

**Corrección I-02 (separa dos riesgos que v1.0 conflactaba en una sola fila):**

| Escenario | Evaluación (sin proponer optimizaciones) |
|---|---|
| Organizaciones pequeñas | Sin ningún riesgo — volumen de `Membership` trivial. |
| **Universidades, Empresas — riesgo de escritura** | **Ya mitigado** a nivel de Domain Model (Domain Model v1.1, corrección de C-01): `Membership` como Aggregate propio evita cargar una colección completa durante operaciones de **escritura** (crear/retirar una `Membership`) — el Infrastructure Model hereda ese beneficio sin necesitar una decisión adicional propia. Esto permanece correcto y no se modifica. |
| **Universidades, Empresas — riesgo de lectura** | **Riesgo que continúa abierto, distinto del anterior:** las consultas que recuperan `Membership` de una `Organization` grande (en particular `findByOrganizationId`, consumida por `EnumerateAuthorityHandler`) pueden devolver volúmenes elevados para una Organización con muchos `Member`. Este Infrastructure Model **no diseña paginación, streaming ni límites** para esa consulta — se reconoce honestamente que el riesgo permanece abierto y deberá evaluarse cuando exista evidencia de requisitos reales de volumen, no se propone ninguna solución aquí. |
| Múltiples Organizaciones por `Member` | Sin riesgo — cada `Membership` es independiente; `findByMemberId` retorna una colección, cuyo tamaño crece con el número de Organizaciones de ese `Member`, no con el tamaño de ninguna Organización. |
| Crecimiento del número de `Membership` en el tiempo | Sin riesgo estructural nuevo en escritura (mismo razonamiento que el riesgo de escritura ya mitigado); el riesgo de lectura a gran volumen es el mismo ya señalado arriba para `findByOrganizationId`, no uno adicional. |

---

## Exclusiones — confirmación explícita

*(Sin cambios respecto a v1.0.)*

Este documento **no diseña**: API, DTO, Controllers, Endpoints, Base de Datos física, ORM, Framework, Mensajería, Caché, Seguridad, Autenticación, Autorización, UI. Verificado línea por línea contra el texto completo de este documento — incluidas las dos correcciones I-01/I-02, ninguna de las cuales introduce alguno de estos elementos.

---

## Validación

Verificado contra los 8 documentos exigidos — **ninguna contradicción, incluidas ambas correcciones:**
- **Product Architecture, Organization Strategy, ADR-001:** sin cambio de dependencias entre módulos ni de la decisión de genericidad.
- **Scope v1.0:** las capacidades siguen siendo exactamente las mismas cinco.
- **Functional Specification v1.0:** ningún UC-OM nuevo.
- **Ubiquitous Language v1.0:** ningún término nuevo.
- **Domain Model v1.1:** los dos Aggregates (`Organization`, `Membership`) se traducen a Repository sin alterar su forma.
- **Application Model v1.1:** los 3 Commands, 2 Queries y 6 métodos de Repository se heredan exactamente, sin adición.

**Confirmado explícitamente:** no aparecen nuevas capacidades, nuevos Commands, nuevas Queries, nuevos Aggregates, nuevas reglas de negocio ni nuevos conceptos del dominio en ningún punto de este documento — incluidas las dos correcciones.

---

## Informe obligatorio

### 1. Archivos modificados
Ninguno modificado — solo creado: `organization-management-infrastructure-model-v1.1-2026-07-31.md`. El v1.0 se conserva íntegro por trazabilidad histórica.

### 2. Cambios realizados

**I-01 (Eventos):** se eliminó la afirmación especulativa de que el Audit Catalog del Platform Core sería un consumidor futuro de los Domain Events — ese consumidor nunca estuvo evidenciado por ningún documento (Platform Core Foundation solo evidencia a Mi Plan y Academia, nunca a Organization Management). Se reemplazó por una declaración explícita: no existe hoy ningún consumidor documentado; Infrastructure solo preserva la capacidad de publicación (vía el adaptador ya reutilizado); cualquier consumidor futuro deberá documentarse cuando exista evidencia real — sin nombrar ningún candidato hipotético.

**I-02 (Escalabilidad):** se separó la fila única de v1.0 en dos riesgos distintos y claramente etiquetados: el riesgo de **escritura** (ya mitigado por la promoción de `Membership` a Aggregate Root, Domain Model v1.1 C-01 — sin cambios, permanece correcto) y el riesgo de **lectura** (volumen elevado en `findByOrganizationId` para Organizaciones grandes — reconocido honestamente como abierto, sin diseñar paginación, streaming ni límites, sin proponer solución).

### 3. Cambios descartados
No se diseñó ningún mecanismo de paginación, streaming ni límite de resultados para `findByOrganizationId` (correspondería a una decisión técnica futura, fuera de un Infrastructure Model). No se diseñó ningún mecanismo de publicación/transporte externo de eventos (broker, cola) al no existir consumidor evidenciado. No se modificó ningún Repository, Adaptador, Unit of Work, Domain Event, exclusión ni dependencia ya definidos en v1.0.

### 4. Compatibilidad
Confirmada sin contradicciones con Product Architecture v1.0, Organization Strategy v1.0, ADR-001, Scope v1.0, Functional Specification v1.0, Ubiquitous Language v1.0, Domain Model v1.1, Application Model v1.1 y Academia (ver sección Validación) — ninguna de las dos correcciones introduce capacidad, vocabulario, Aggregate, Command, Query ni regla de negocio nueva.

### 5. Dictamen

**Infrastructure Model v1.1 listo para una nueva auditoría independiente.**

No se avanza al API Contract. Documento detenido.
