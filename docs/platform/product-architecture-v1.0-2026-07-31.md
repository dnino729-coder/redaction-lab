# RÉDACTION LAB — PRODUCT ARCHITECTURE v1.0

**Estado:** DRAFT (documento padre de producto — precede a cualquier diseño del Bounded Context "Organización Académica")
**Fecha:** 2026-07-31
**Autor:** Product Architect / Enterprise Architect, Rédaction Lab
**Origen:** solicitado explícitamente para definir dónde encaja "Organización Académica" en la arquitectura de producto completa, antes de diseñar ese Bounded Context.
**Documentos Frozen respetados sin modificación:** Domain Model, Application Model, Infrastructure Model, Functional Specification, API Contract y Blueprint de Academia (todos en sus versiones vigentes); ACP-001 a ACP-004; Platform Core Foundation v1.0; Project Structure Specification v1.0.
**Alcance:** este documento no diseña ningún Bounded Context nuevo, no crea entidades, Commands, Queries, endpoints, tablas ni código. Es exclusivamente arquitectura funcional de producto.

---

## 1. Visión general del producto

**Propósito** (evidencia: Platform Core Foundation §1; Project Structure Specification §6; `metadata.description` de `app/[locale]/layout.tsx`): Rédaction Lab es una plataforma de entrenamiento de la producción escrita en francés (nivel DELF B2) mediante Inteligencia Artificial, compuesta por múltiples módulos funcionales independientes (Dashboard, Mi Plan, Academia, Laboratorio, Coach IA, Centro de Entrenamiento, Simulador DELF, Evolución, Perfil, Gamificación) que comparten un Platform Core transversal (catálogos, RBAC, observabilidad, IA, jobs).

**Alcance documentado hoy:** los 11 módulos funcionales listados arriba, más el Platform Core (16 componentes formalmente reconocidos, Platform Core Foundation §3). Ningún documento existente antes de esta sesión modelaba explícitamente dos "escenarios" de uso (individual vs. institucional) como una dimensión arquitectónica propia — esa distinción es la que este documento debe introducir por primera vez a nivel de producto, sin diseñar aún el Bounded Context que la resuelve.

**Tipos de usuario ya documentados** (evidencia: Permission Catalog, Platform Core Foundation §3, citando Domain Model §12.5–12.6): `STUDENT`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`, `REVIEWER`, `AI_SERVICE`, `SYSTEM`. Es decir: **los roles `TEACHER` y `ADMIN` ya existen en el RBAC de toda la plataforma**, de forma previa e independiente a cualquier decisión sobre Organización Académica — lo que falta no es el rol, sino el dato de **a qué estudiantes tiene autoridad un `TEACHER` concreto**.

**Modos de operación:** NO DOCUMENTADO como concepto arquitectónico formal antes de este documento. Lo que sí está documentado es evidencia parcial y fragmentada: (a) Academia ya diseñó pantallas para los tres roles (Estudiante: P-01–P-11; Profesor: P-12/P-13/P-15; Administrador: P-14); (b) el Contexto de negocio de esta sesión (Escenario A/B) exige que ambos modos convivan en el mismo producto, no en aplicaciones separadas. Este documento formaliza esa distinción por primera vez (Sección 4).

---

## 2. Módulos del producto

Clasificación construida cruzando el inventario ya existente (Project Structure Specification §6: Dashboard, Mi Plan, Academia, Laboratorio, Editor, Corrector IA/Coach IA, Centro de Entrenamiento, Simulador DELF, Evolución, Perfil, Gamificación) contra el nuevo criterio individual/institucional exigido en esta sesión. Ningún módulo existente fue redefinido; solo se les asigna una categoría según evidencia de para quién funcionan hoy.

### Core Platform (existen siempre, para todo usuario, en ambos escenarios)

| Módulo/Componente | Evidencia |
|---|---|
| **Perfil** (`features/profile`) | Todo usuario, individual o institucional, tiene identidad, nivel, idioma nativo, preferencias (Functional Specification de Academia, tabla de relaciones: "Academia referencia la identidad del estudiante... sin poseerla"). |
| **Dashboard** (`features/dashboard`) | Patrón agregador de solo lectura ya implementado; agrega estado de otros módulos para cualquier usuario (Project Structure Specification §6, §7). |
| **Platform Core** (16 componentes: Notification/Domain Event/Error/Permission Catalog, Feature Flag Registry, Audit Catalog, Telemetry Catalog, Logging, Configuration, Secrets, Observability, File Storage, AI Provider, Background Jobs, Health Checks, RLS+UnitOfWork) | Por definición (Platform Core Foundation §1–§2): "ningún módulo funcional lo posee en exclusiva"; se consumen sin distinción de escenario. |
| **Coach IA** (`features/coach`) | Capacidad transversal de corrección/mentoría IA, consumida por Academia hoy y candidata de otros módulos (Laboratorio, Simulador) mañana — no depende de si el usuario es individual o institucional. |

**Justificación de la categoría:** estos módulos/componentes no tienen ninguna regla, dato ni flujo documentado que dependa de si el usuario pertenece a una institución. Son universales por diseño ya existente, no por inferencia de este documento.

### Optional Modules (existen bajo condición, pero la condición NO es "individual vs. institucional")

| Módulo | Condición de existencia (evidencia) |
|---|---|
| **Academia** (`features/academy`) — capacidades de Estudiante (P-01 a P-11) | Condición: el usuario está matriculado/inscrito en el recorrido de Academia (mecanismo de matriculación: NO DOCUMENTADO — Blueprint §14 ítem 8 solo cubre contenido de reflexión, no matriculación). Disponible igual para un usuario individual que para uno perteneciente a una institución — ningún documento de Academia (Domain/Application Model) hace referencia a una institución para las Aggregates `AcademyUnit`/`Attempt`. |
| **Laboratorio, Centro de Entrenamiento, Simulador DELF, Evolución, Gamificación** | Todos "Placeholder" (Project Structure Specification §6) — sin lógica implementada. Ningún documento los condiciona a un escenario institucional. |

**Justificación de la categoría:** su existencia depende de si el producto habilita esa funcionalidad para el usuario (opt-in/matriculación), no de si el usuario pertenece a una institución. Un usuario individual (Escenario A) puede usar Academia exactamente igual que un estudiante institucional (Escenario B) — confirmado por el hecho de que ninguna Query/Command de Academia para P-01–P-11 referencia `teacherId`, institución o relación alguna (verificado en el código: `AcademyUnitRepository`, `AttemptRepository`, y los Commands/Queries de esas 11 pantallas no importan `TeacherStudentRelationshipPort`).

### Institutional Modules (exclusivos de organizaciones educativas)

| Módulo | Evidencia |
|---|---|
| **Academia — capacidades de Profesor/Administrador** (P-12, P-13, P-15) | Blueprint §12: estas tres pantallas solo tienen sentido si existe un Profesor con estudiantes asignados — un usuario individual (Escenario A) nunca las usa ni las necesita. Ya viven dentro de `features/academy` (decisión ya Frozen, Project Structure Specification §6, nota de resolución), no como módulo aparte. |
| **"Organización Académica"** (no construido) | Es, por definición del propio problema que originó esta investigación, exclusivamente institucional: sin institución, no hay "profesor de quién" que resolver — un usuario individual (Escenario A) no tiene ni necesita esta capacidad en absoluto. |

**Justificación de la categoría:** ambas filas dejan de tener sentido funcional si se elimina la existencia de una institución. Es la única categoría de las tres cuya condición de existencia es exactamente "modo institucional".

**Nota de honestidad documental:** P-14 (Gestión de Biblioteca de Modelos, Administrador) técnicamente requiere un rol `ADMIN`, pero el rol `ADMIN` en el RBAC actual (Permission Catalog) es una gestión editorial de contenido —no de estudiantes de una institución— y no depende de Organización Académica en ningún documento leído (P-14 ya está implementado y aprobado sin esa dependencia). Por eso P-14 no se incluye en Institutional Modules: es Optional (condicionado a rol editorial, no a existencia de institución).

---

## 3. Dependencias entre módulos

| Origen | Destino | ¿Permitida? | Evidencia |
|---|---|---|---|
| Cualquier módulo funcional | Platform Core | **Permitida** | Platform Core Foundation §6: "Módulo funcional → Core... permitidas". |
| Platform Core | Cualquier módulo funcional | **Prohibida** | Platform Core Foundation §6: "Core → cualquier módulo funcional... prohibidas". |
| Módulo funcional A | Módulo funcional B (acceso directo a Aggregates/estado interno) | **Prohibida** | Ya vigente (Feature-Driven Architecture, citada en Platform Core Foundation §2, criterio 5: "una feature nunca accederá directamente a otra"). |
| Academia (P-01–P-11, capacidades de Estudiante) | Organización Académica | **Prohibida en modo individual — y confirmada como NO EXISTENTE incluso en modo institucional hoy** | Verificado en el código real: ningún Command/Query de P-01–P-11 (`StartUnit`, `RepeatUnit`, `AutosaveDraft`, `AdvanceStep`, `VerifyComprehension`, `SubmitVersion`, `SubmitRevision`, `AdvanceToReflection`, `ListAcademyUnitsForStudent`, `GetAcademyUnitDetail`, `GetAttemptHistory`, `ListModelExamplesByTextType`) importa `TeacherStudentRelationshipPort`. Academia funciona en modo individual hoy, de punta a punta, sin ninguna referencia a Organización Académica. |
| Academia (P-12/P-13/P-15, capacidades de Profesor) | Organización Académica | **Permitida y ya prevista** (puerto Frozen `TeacherStudentRelationshipPort`), **pero hoy no operable** (adaptador fail-closed) | `ApplyTeacherOverride` (CMD-10), `AssignUnitToStudent` (CMD-11), `GetStudentProgressSummary` (QRY-07), `GetTeacherOverrideHistory` (QRY-09) — las únicas 4 piezas de Academia que dependen de esta relación, ya aisladas a nivel de Application, nunca en Domain. |
| Organización Académica | Academia (acceso a Aggregates internos) | **Prohibida** | Mismo principio de Feature-Driven Architecture; Domain Model v1.1 §1: "Academia nunca escribe directamente sobre datos de otro Bounded Context" — principio simétrico exigible en la dirección inversa. |

**Punto de atención explícito del encargo — verificado:** *"Academia NO debe terminar dependiendo de Organización Académica para funcionar en modo individual."* **Confirmado por evidencia de código, no por diseño nuevo**: la dependencia de Academia hacia el futuro dominio ya está, desde el propio Application Model v1.5/Application Layer Specification v1.0, circunscrita exclusivamente a 4 Commands/Queries de las 18+9 totales, todas exclusivas del rol `TEACHER`. Las 11 pantallas de Estudiante (P-01–P-11), ya implementadas y aprobadas, **no tienen ni una sola línea de dependencia hacia esa relación**. La arquitectura actual ya cumple, sin cambios, la restricción pedida.

---

## 4. Modos de operación

**Modo Individual**
- **Módulos activos:** Perfil, Dashboard, Platform Core, Coach IA (Core Platform); Academia (solo capacidades de Estudiante, P-01–P-11), y cualquier Optional Module que se habilite (Laboratorio, Centro de Entrenamiento, Simulador, Evolución, Gamificación, cuando dejen de ser placeholder).
- **Módulos deshabilitados:** Academia — capacidades de Profesor/Administrador (P-12/P-13/P-15/P-14); Organización Académica en su totalidad.
- **Capacidades disponibles:** el recorrido completo de aprendizaje de Academia, de punta a punta, sin ninguna limitación — ya verificado como cierto hoy (Sección 3).

**Modo Institucional**
- **Módulos activos:** todo lo del Modo Individual, **más** Academia — capacidades de Profesor/Administrador, **más** Organización Académica (una vez exista).
- **Módulos deshabilitados:** NO DOCUMENTADO — ningún documento indica que algún módulo deba deshabilitarse para un usuario institucional; la lectura más consistente con la evidencia es que el Modo Institucional es un superconjunto del Modo Individual, nunca una versión reducida.
- **Capacidades disponibles:** todo lo del Modo Individual, más las facultades docentes/administrativas ya diseñadas (CU-09 a CU-12) — hoy bloqueadas únicamente por la ausencia de Organización Académica, no por ninguna limitación de Academia en sí.

**Hallazgo NO DOCUMENTADO relevante para este punto:** ningún documento define **cómo un usuario individual se convierte en institucional** (o viceversa), ni si esa transición es posible, ni quién la autoriza. Es una pregunta de producto abierta, no respondida por ningún documento leído.

---

## 5. Responsabilidades de Academia

**Pertenece a Academia** (evidencia: Domain Model v1.1 §1, invariantes; Functional Specification v1.3 completa): el recorrido guiado de 11 pasos por unidad y tipo de texto; el ciclo de vida de `AcademyUnit`/`Attempt`; el autoguardado, envío y reescritura de versiones; la verificación de comprensión; la solicitud y recepción de retroalimentación (vía Coach IA); la reflexión de cierre; la Biblioteca de Modelos (consulta y CRUD editorial); y —ya diseñado aunque hoy bloqueado— la ejecución de las facultades docentes (anular, recomendar, revisar historial) una vez la relación docente-estudiante sea consultable.

**NO pertenece a Academia** (mismas fuentes, más PND-04 ya citado en la investigación previa de esta sesión): la identidad/autoridad de qué Profesor tiene autoridad sobre qué Estudiante; cualquier dato de matriculación, institución, curso, cohorte o membresía; el cálculo de recompensas (Gamificación); la agregación de indicadores de competencia entre unidades (Evolución); la corrección lingüística en sí (Coach IA); la identidad del estudiante más allá de su `StudentId` (Perfil).

---

## 6. Responsabilidades de Organización Académica (sin diseñar el dominio)

**Qué problemas resolverá** (inferido exclusivamente de la ausencia ya documentada, nunca inventado): dado un `teacherId`, producir la colección de `studentId` sobre los que ese profesor tiene autoridad — la capacidad de **enumeración** que hoy no existe en ningún documento ni código (Blueprint §14, ítem 1; PND-04). Es, en esencia, la fuente de verdad de la relación docente-estudiante que Academia hoy solo puede *consultar* como booleano, nunca *enumerar*.

**Qué problemas NO resolverá** (por exclusión directa, ya documentada): ninguna regla de negocio de Academia (Domain Model v1.1 §1: invariante transversal ya vigente); ningún dato de progreso, unidad o intento (eso permanece en Academia); ningún mecanismo de notificación, error, permiso o telemetría propios (esos ya pertenecen al Platform Core, y Organización Académica los consumiría igual que cualquier otro módulo, sin duplicarlos).

---

## 7. Fronteras entre ambos contextos

**Qué información cruza:** únicamente un contrato de lectura mínimo — la respuesta a "¿tiene este profesor autoridad sobre este estudiante?" (hoy, booleano vía `TeacherStudentRelationshipPort.hasRelationship()`) y, cuando se resuelva el gap, la colección de estudiantes de un profesor. Ninguna otra información cruza hoy, según toda la evidencia revisada.

**Qué información nunca debe cruzar** (Domain Model v1.1 §1, invariante ya vigente, aplicable simétricamente): Academia nunca debe exponer sus Aggregates (`AcademyUnit`, `Attempt`) directamente a Organización Académica; Organización Académica nunca debe escribir sobre datos de Academia. Ninguna entidad de Organización Académica debe migrar hacia Academia (mismo principio que ya impidió, en PND-04, que Academia "posea datos de membresía de grupo").

**Qué responsabilidades permanecen aisladas:** todo el ciclo de vida académico (unidades, intentos, versiones, retroalimentación) permanece exclusivo de Academia; toda la administración de la relación docente-estudiante (su origen, quién la crea, su ciclo de vida) permanecería exclusiva de Organización Académica — Academia seguiría siendo, como ya lo es hoy, un **consumidor puro** (Customer-Supplier, mismo patrón de relación ya usado con Coach IA en el Context Mapping del Domain Model v1.1 §1).

---

## 8. Escalabilidad futura

Análisis exclusivamente arquitectónico, sin proponer solución — para cada capacidad futura mencionada en el encargo, se indica si la arquitectura actual (Feature-Driven + Platform Core + Bounded Contexts aislados) la permitiría sin romperse, según la evidencia ya documentada:

| Capacidad futura | ¿La arquitectura actual lo permite sin romperse? | Evidencia/razonamiento |
|---|---|---|
| **Marketplace** (de contenido, ejemplos, cursos) | Plausible sin romper nada, si se modela como un nuevo módulo funcional que consuma Platform Core (File Storage, Notification Catalog) — mismo patrón que cualquier módulo existente. NO DOCUMENTADO ningún detalle. |
| **Suscripciones** | NO DOCUMENTADO en ningún documento leído — ningún componente de billing/planes existe hoy, ni en Platform Core ni en ningún módulo. Requeriría un componente de Platform Core nuevo (evaluado contra los 5 criterios de Platform Core Foundation §2) o un módulo propio. |
| **Empresas** (B2B, más allá de instituciones educativas) | Mismo patrón conceptual que "Organización Académica" (una entidad-organización con miembros) — si Organización Académica se diseña de forma genérica (organización → miembros → roles), podría reutilizarse; si se diseña acoplada específicamente a "profesor/estudiante", no. **Esta es precisamente la decisión de diseño que este documento NO debe tomar todavía** (Sección 10). |
| **Certificaciones** | NO DOCUMENTADO. Nota de riesgo ya existente en el propio Domain Model de Academia (A-05): "Academia nunca aplica la rúbrica oficial DELF ni almacena puntuación de certificación" — cualquier módulo de Certificaciones futuro tendría, por diseño ya congelado, que ser un módulo aparte, nunca parte de Academia. |
| **Multi-tenant** (por institución, no por estudiante) | El único patrón multi-tenant documentado hoy (Platform Core Foundation §3) es **"Row-Level Security + Unit of Work, multi-tenant por estudiante"** — aísla datos por `studentId`, no por institución. Un multi-tenant institucional real (aislar datos entre dos universidades clientes) **no está cubierto por el patrón actual** y exigiría una dimensión de aislamiento nueva, no solo una extensión del patrón existente. Riesgo real, no solución propuesta aquí. |
| **Marketplace de docentes** | Mismo razonamiento que "Empresas": depende de si Organización Académica termina modelando "profesor" como un rol dentro de una institución cerrada, o como una entidad más flexible. NO DOCUMENTADO, decisión futura. |

**Conclusión de la sección (sin proponer solución):** la arquitectura Feature-Driven + Platform Core, tal como existe hoy, es estructuralmente compatible con añadir módulos nuevos sin romper los existentes (ya demostrado 11 veces con los módulos actuales). La incógnita real no es la arquitectura general, sino **cómo se modele internamente Organización Académica** — si se modela de forma demasiado específica ("profesor de escuela"/"estudiante"), varias de las capacidades de esta tabla (Empresas, Multi-tenant, Marketplace de docentes) quedarían más difíciles de incorporar después sin reabrir ese Bounded Context.

---

## 9. Riesgos

| # | Riesgo | Naturaleza |
|---|---|---|
| 1 | Modelar Organización Académica de forma acoplada específicamente a "profesor de una escuela" en vez de a un concepto más general de "organización con miembros y roles" limitaría la reutilización futura para Empresas/Marketplace de docentes (Sección 8). | Arquitectónico, de diseño futuro. |
| 2 | No existe, en ningún documento, un mecanismo de multi-tenancy institucional (aislamiento de datos entre instituciones clientes) — el único patrón multi-tenant documentado aísla por estudiante, no por institución (Sección 8). | Arquitectónico, de infraestructura. |
| 3 | No existe documentación de cómo un usuario transiciona entre modo Individual e Institucional, ni de quién autoriza esa transición (Sección 4) — sin resolver, cualquier diseño de Organización Académica tendría que asumir una respuesta no verificada. | Funcional/de producto, no técnico. |
| 4 | Ya identificado en la investigación previa de esta sesión: inconsistencia terminológica entre documentos técnicos (`hasRelationship()` vs. `.exists()`; `GroupTeacher`/`GroupStudent` vs. terminología ya retirada por ACP-001-B) — riesgo de que un futuro Domain Model de Organización Académica herede nombres ya inconsistentes sin resolverlos primero. | Documental. |
| 5 | El Project Structure Specification v1.0 §6 ya resolvió que no existe (ni se planea) una carpeta transversal de "Panel del Profesor"/"Panel Administrativo" — si Organización Académica introdujera, sin coordinarse con ese documento, un panel propio, entraría en conflicto directo con una decisión ya Frozen. | Arquitectónico, de gobernanza documental. |
| 6 | Ningún documento define aún el "propietario" (owner) organizacional de Organización Académica — a diferencia de Platform Core, que sí tiene un proceso de gobierno explícito (Sección 8 de ese documento), Organización Académica no tiene, hoy, un proceso equivalente definido. | De gobernanza. |

---

## 10. Decisiones que deben congelarse

1. **Organización Académica es un Bounded Context nuevo, propio, no una extensión de Academia** — ya implícito en toda la evidencia (Domain Model, Application Model, Infrastructure Model, todos coinciden en delegar, nunca en modelar internamente).
2. **Academia permanece 100% funcional en Modo Individual sin ninguna dependencia de Organización Académica** — ya verdadero hoy por evidencia de código (Sección 3); debe congelarse como invariante para que ninguna futura extensión de Academia la rompa.
3. **La relación entre Academia y Organización Académica es Customer-Supplier de solo lectura** (Academia consume, nunca escribe ni posee) — coherente con el principio ya vigente en el Domain Model v1.1 §1 y con PND-04.
4. **El Modo Institucional es un superconjunto del Modo Individual, nunca una versión restringida** — según la única lectura consistente con toda la evidencia (Sección 4); si se decidiera lo contrario, cambiaría radicalmente el diseño de permisos de todos los módulos.
5. **Ninguna entidad de Organización Académica debe residir dentro de `features/academy`** (coherente con Project Structure Specification §6, que ya trató la ambigüedad de paneles transversales con el mismo criterio de exclusión por defecto del Platform Core).
6. **Decisión explícitamente NO tomada por este documento, y que debe congelarse antes de diseñar el Domain Model**: si Organización Académica modela "institución/profesor/estudiante" de forma específica o de forma genérica ("organización/miembro/rol") pensando en Empresas/Marketplace de docentes futuros. Esta es la decisión de mayor impacto de escalabilidad (Sección 8, riesgo 1) y no debe tomarse implícitamente durante el diseño del Domain Model.

---

## RESULTADO

Este documento no diseña Organización Académica. Establece que: (a) es un Bounded Context institucional nuevo, sin equivalente hoy; (b) Academia ya está correctamente aislada de él para el Modo Individual, por evidencia de código, no por diseño nuevo; (c) existen 6 riesgos y 6 decisiones a congelar antes de proceder; (d) persisten preguntas NO DOCUMENTADAS (transición individual↔institucional, multi-tenancy institucional, alcance genérico vs. específico del dominio) que un Domain Model de Organización Académica no podría resolver por sí solo — requieren decisión de producto previa.
