# ORGANIZATION MANAGEMENT — INFRASTRUCTURE MODEL v1.0

**Fecha:** 2026-07-31
**Autor:** Software Architect / Infrastructure Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Domain Model Audit v1.1; Organization Management Application Model v1.1; Organization Management Application Model Audit v1.1; Infrastructure Model v1.2, API Contract v1.4 (Academia, releído solo para estilo).
**Alcance:** transformar el Domain Model v1.1 y el Application Model v1.1 en contratos de infraestructura. Sin API REST, sin Frontend, sin base de datos física, sin código, sin DTO.

---

## Repositories

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

| Command | ¿Requiere Unit of Work? | Justificación |
|---|---|---|
| `RegisterOrganization` | No | Escritura única sobre un Aggregate nuevo, sin lectura previa que coordinar (Application Model v1.1 §8). |
| `AddMembership` | **Sí** | La secuencia "leer `findByMemberId` → crear y guardar `Membership`" debe ejecutarse como unidad — ya establecido en Application Model v1.1 §8, con la precisión ya documentada allí de que la transacción, por sí sola, no basta bajo concurrencia (ver Consistencia, abajo). |
| `RemoveMembership` | No | Lectura y escritura únicas sobre el mismo Aggregate ya identificado por `membershipId`, sin condición de unicidad que proteger. |
| `VerifyAuthority` / `EnumerateAuthority` | No | Operaciones de solo lectura. |

---

## Eventos

**Domain Events que deben poder salir del dominio (sin diseñar broker, cola ni mensajería):** `OrganizationRegistered`, `MemberAdded`, `MemberRemoved` (Domain Model v1.1 §10).

**Hallazgo de disciplina de esta ronda:** ningún documento de esta cadena (Functional Specification v1.0, Scope v1.0) evidencia un **consumidor externo** para estos tres eventos en esta versión — Academia consume Organization Management exclusivamente vía consulta síncrona (`VerifyAuthority`/`EnumerateAuthority`), nunca vía suscripción a eventos. En consecuencia, y por el mismo criterio de exclusión por defecto ya aplicado en todo el proyecto (Platform Core Foundation §2: "nunca por anticipación especulativa"), **no se diseña ningún mecanismo de publicación externa** para estos eventos en esta versión — permanecen como registro conceptual del propio dominio (consumible, en el futuro, por el Audit Catalog ya reconocido como componente transversal del Platform Core, sin que eso exija hoy ninguna infraestructura de mensajería propia).

---

## Consistencia

- **Operaciones transaccionales:** únicamente `AddMembership` (Unit of Work, arriba).
- **Operaciones de solo lectura:** `VerifyAuthority`, `EnumerateAuthority`.
- **Dependencias entre Aggregates:** `Membership` referencia `OrganizationId` por identidad (Domain Model v1.1 §13) — la verificación de que la `Organization` referenciada exista (Invariante 3) ocurre mediante una lectura previa (`OrganizationRepository.findById`) dentro de la misma transacción de `AddMembership`, no mediante una transacción distribuida entre dos Aggregates. Dado que ningún documento define un mecanismo de eliminación física de `Organization` (Domain Model v1.1 §12: sin estado de desactivación), no existe riesgo de referencia colgante una vez verificada la existencia en el momento de creación.
- **Restricción de unicidad pendiente, ahora formalmente reconocida como responsabilidad de este documento (Application Model v1.1 §8 la remitió aquí):** la Aplicación por sí sola, incluso con Unit of Work, no impide que dos invocaciones concurrentes de `AddMembership` para el mismo par `(Organization, Member)` pasen ambas la verificación antes de escribir. Este Infrastructure Model **reconoce la necesidad de una restricción de unicidad a nivel de infraestructura** sobre la combinación `(OrganizationId, MemberId)` entre `Membership` activas — **sin especificar su forma concreta** (no se diseña un índice, una tabla ni una sintaxis SQL, tal como exige el encargo). Esta restricción es la única pieza de consistencia que este documento reconoce como necesaria pero deliberadamente no resuelta en detalle técnico.

---

## Integraciones externas

- **Perfil (`MemberId`):** Organization Management **no integra activamente con Perfil** — `MemberId` se trata, en todo momento, como un identificador externo opaco (Domain Model v1.1 §6, §14), sin verificación de existencia ni consulta alguna hacia Perfil/Authentication. **Contrato esperado:** ninguno más allá de que el identificador recibido sea estable en el tiempo — no se diseña ningún mecanismo de verificación.
- **Academia (consumidor):** **Contrato esperado** (ya definido en Application Model v1.1, no rediseñado aquí): Academia invocará `VerifyAuthority(memberIdA, role, memberIdB)` → booleano, y `EnumerateAuthority(memberIdA, role)` → colección de `MemberId`, sustituyendo el adaptador fail-closed hoy existente (`TeacherStudentRelationshipAdapter`). No se diseña el mecanismo de invocación (síncrono en proceso, HTTP interno, etc.) — eso pertenece, si acaso, a un futuro API Contract, explícitamente fuera de alcance de este documento.

---

## Persistencia

**Qué necesita persistirse (derivado exclusivamente del Domain Model v1.1) — sin tablas, índices, motores, SQL ni ORM:**
- **`Organization`:** su identidad y los datos mínimos de identificación aún no especificados por ningún documento (Domain Model v1.1 §6 ya señaló esto como pendiente, no inventado aquí tampoco).
- **`Membership`:** su identidad, la referencia a `OrganizationId`, la referencia a `MemberId`, su `Role`, y su estado de lifecycle (activa/Removida, Domain Model v1.1 §12) — nunca una eliminación física, consistente con el principio ya vigente en todo el proyecto.

---

## Errores

**Categorías de infraestructura posibles (sin diseñar excepciones concretas):**
- Indisponibilidad temporal del mecanismo de persistencia (fallo de conectividad).
- Violación de la restricción de unicidad reconocida en la sección de Consistencia (si se implementa como tal) — de infraestructura, a traducir por Application, no diseñada aquí.
- Conflicto de concurrencia optimista (posible, no diseñado) al guardar una `Membership`/`Organization` ya modificada por otra operación concurrente.

---

## Escalabilidad

| Escenario | Evaluación (sin proponer optimizaciones) |
|---|---|
| Organizaciones pequeñas | Sin ningún riesgo — volumen de `Membership` trivial. |
| Universidades, Empresas (volumen grande de `Membership`) | Ya mitigado a nivel de Domain Model (Domain Model v1.1, corrección de C-01): `Membership` como Aggregate propio evita cargar una colección completa por operación — el Infrastructure Model hereda ese beneficio sin necesitar una decisión adicional propia. |
| Múltiples Organizaciones por `Member` | Sin riesgo — cada `Membership` es independiente; `findByMemberId` retorna una colección, cuyo tamaño crece con el número de Organizaciones de ese `Member`, no con el tamaño de ninguna Organización. |
| Crecimiento del número de `Membership` en el tiempo | Sin riesgo estructural nuevo — mismo razonamiento; el crecimiento es distribuido entre instancias independientes de `Membership`, no concentrado en un único Aggregate. |

---

## Exclusiones — confirmación explícita

Este documento **no diseña**: API, DTO, Controllers, Endpoints, Base de Datos física, ORM, Framework, Mensajería, Caché, Seguridad, Autenticación, Autorización, UI. Verificado línea por línea contra el texto completo de este documento.

---

## Validación

Verificado contra los 8 documentos exigidos — **ninguna contradicción:**
- **Product Architecture, Organization Strategy, ADR-001:** sin cambio de dependencias entre módulos ni de la decisión de genericidad.
- **Scope v1.0:** las capacidades siguen siendo exactamente las mismas cinco.
- **Functional Specification v1.0:** ningún UC-OM nuevo.
- **Ubiquitous Language v1.0:** ningún término nuevo.
- **Domain Model v1.1:** los dos Aggregates (`Organization`, `Membership`) se traducen a Repository sin alterar su forma.
- **Application Model v1.1:** los 3 Commands, 2 Queries y 6 métodos de Repository se heredan exactamente, sin adición.

**Confirmado explícitamente:** no aparecen nuevas capacidades, nuevos Commands, nuevas Queries, nuevos Aggregates, nuevas reglas de negocio ni nuevos conceptos del dominio en ningún punto de este documento.

---

## Informe obligatorio

### 1. Componentes de infraestructura definidos
`OrganizationRepository`, `MembershipRepository` (interfaces); adaptadores de persistencia para ambos; reutilización de `UuidGenerator`, `DomainEventPublisher`/Outbox y `Logger` ya existentes del Platform Core; Unit of Work para `AddMembership`.

### 2. Responsabilidades
Traducir los dos Aggregates del Domain Model v1.1 a contratos de persistencia; sostener la única operación transaccional (`AddMembership`); reconocer (sin resolver en detalle) la restricción de unicidad complementaria ya anticipada por Application Model v1.1; documentar el contrato de consumo esperado por Academia sin rediseñarlo.

### 3. Dependencias
Platform Core (`UuidGenerator`, Outbox/`DomainEventPublisher`, `Logger`, Audit Catalog como consumidor futuro y opcional de los Domain Events) — consumidos, nunca al revés. Ninguna dependencia hacia Academia ni hacia Perfil (ambas son, respectivamente, un consumidor externo y una referencia opaca, no integraciones activas).

### 4. Exclusiones
API, DTO, Controllers, Endpoints, Base de Datos física, ORM, Framework, Mensajería, Caché, Seguridad, Autenticación, Autorización, UI — ninguno diseñado, confirmado explícitamente arriba.

### 5. Compatibilidad
Sin contradicciones con Product Architecture, Organization Strategy, ADR-001, Scope, Functional Specification, Ubiquitous Language, Domain Model v1.1 ni Application Model v1.1 — verificado documento por documento en la sección Validación.

### 6. Riesgos abiertos
- La restricción de unicidad complementaria sobre `(OrganizationId, MemberId)` queda reconocida como necesaria pero sin forma concreta — deliberadamente, por estar fuera del alcance de un Infrastructure Model que no diseña base de datos física.
- La política de `Authority` tras retirar una `Membership` (ya señalada en Application Model v1.1) sigue sin resolverse — no es responsabilidad de este documento.
- El mecanismo exacto de invocación entre Academia y Organization Management (síncrono en proceso vs. otro medio) no está definido — pertenece a un futuro API Contract, si acaso.

### 7. Dictamen

**Infrastructure Model v1.0 listo para una auditoría independiente.**

No se avanza al API Contract. Documento detenido.
