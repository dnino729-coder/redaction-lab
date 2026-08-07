# ADR-001 — Organization Management Vision v1.0

**Fecha:** 2026-07-31
**Autor:** Enterprise Architect / DDD Expert / Software Architect / Product Architect / Solution Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, Functional Specification v1.3, API Contract v1.4, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Naturaleza de este documento:** Architecture Decision Record — máxima autoridad arquitectónica del Bounded Context Organization Management. No diseña el dominio, no crea entidades ni código.

---

## 1. Estado

**Propuesto.**

**Justificación:** este ADR congela la visión y los principios irreversibles del nuevo Bounded Context, pero su aprobación formal está sujeta al mismo mecanismo de gobierno ya vigente en el proyecto para decisiones de este tipo. La propia investigación previa de esta sesión, al analizar el orden de creación de Organización Académica frente al Estándar de Gestión de Cambios Arquitectónicos, concluyó explícitamente que "el Estándar no determina el orden — necesaria decisión del ARB". Marcar este documento como "Aprobado" excedería la autoridad de quien lo redacta; se deja como **Propuesto**, a la espera de la ratificación formal ya exigida por el propio proceso de gobernanza del proyecto (mismo criterio, sin excepción, que ya se aplicó a la creación del Bounded Context en sí).

---

## 2. Contexto

**Por qué existe este ADR:** Organization Strategy v1.0 (§11, decisión crítica 1) dejó explícitamente sin congelar la decisión de mayor impacto sobre el futuro Bounded Context: si Organization Management modela "organización" de forma genérica o específica de instituciones educativas. Esa misma decisión condiciona, según el propio análisis de escenarios de esa estrategia (§9), 7 de los 9 escenarios de escalabilidad evaluados. Este ADR existe para resolver esa decisión de forma definitiva, antes de que cualquier Functional Specification o Domain Model puedan escribirse sin arrastrar una ambigüedad de fondo.

**Qué problema arquitectónico resuelve:** la indecisión entre dos modelos de dominio mutuamente incompatibles a nivel de diseño (uno acoplado a "profesor/estudiante", otro genérico de "organización/miembro/rol") — sin resolverla, cualquier avance hacia el Domain Model estaría, de hecho, tomando la decisión implícitamente, sin haberla congelado ni justificado, exactamente el riesgo que Organization Strategy v1.0 (§10, riesgo 1) ya señaló como crítico.

**Qué riesgos elimina:** el riesgo de que un Domain Model diseñado bajo el supuesto implícito de "solo instituciones educativas" tenga que reabrirse por completo al llegar el primer caso real de Empresa/ONG/organización gubernamental — coherente con el Contexto de esta sesión, que ya enumera explícitamente ocho a diez tipos de organización heterogéneos como escenarios igualmente válidos del Modo Institucional, no como casos hipotéticos remotos.

---

## 3. Decisión arquitectónica

**Organization Management será un Bounded Context genérico, nunca uno exclusivamente educativo.**

**Justificación exhaustiva:**

1. **Evidencia directa del propio encargo, no inferencia.** El Contexto de esta sesión (y el de la sesión anterior que produjo Organization Strategy v1.0) enumera explícitamente diez tipos de organización — Universidad, Colegio, Instituto, Academia de idiomas, Empresa, Organización pública, Organización privada, ONG, Centro de formación, "otro tipo de organización" — y exige literalmente, en dos ocasiones consecutivas y en dos documentos distintos: *"la arquitectura NO debe asumir un único modelo organizacional"* / *"NO debe asumir que todas funcionan igual"*. Esto no es una preferencia de diseño; es un requisito de producto ya declarado.

2. **Asimetría de costo de reversión, no preferencia estética.** Un modelo genérico (`Organización → Miembro → Rol`) puede expresar trivialmente el único caso real y ya operativo hoy (Academia: `Profesor` como un rol organizacional que ejerce autoridad sobre `Estudiantes` como miembros) sin ninguna pérdida de expresividad. Un modelo específico ("profesor de escuela") **no puede** expresar una Empresa, una ONG o una organización gubernamental sin rediseñar el Bounded Context desde cero. La asimetría es la justificación arquitectónica central: el costo de partir genérico y usarlo de forma acotada es bajo; el costo de partir específico y generalizar después es alto (migración completa de Aggregate, invariantes y contratos ya consumidos por Academia).

3. **Consistencia con el único principio ya congelado de separación pedagógica.** Domain Model v1.1 de Academia (§1) ya declara: *"Academia nunca escribe directamente sobre datos de otro Bounded Context"*. Un Organization Management genérico refuerza esa separación (la estructura organizacional nunca sabe qué es una `AcademyUnit`); uno acoplado a "profesor/estudiante" la debilitaría, al importar vocabulario pedagógico dentro de su propio Ubiquitous Language.

4. **La necesidad real y ya operativa (Academia) no exige ni prohíbe genericidad.** El único consumidor real hoy, Academia, solo necesita un contrato mínimo (verificar/enumerar autoridad de un rol sobre otros miembros) — ya aislado a nivel de Application (Product Architecture v1.0 §3). Un modelo genérico satisface esa necesidad exactamente igual que uno específico, sin costo adicional para Academia. La genericidad no se paga con la única necesidad real existente; solo se gana con las necesidades futuras ya explícitamente anticipadas por el producto.

**Esta decisión queda completamente congelada** (ver Sección 10) — no es revisable por un futuro Domain Model sin reabrir este ADR.

---

## 4. Principios inmutables

| # | Principio | Justificación |
|---|---|---|
| 1 | **Independencia del Modo Individual.** Organization Management nunca es precondición de arranque de ningún módulo. | Ya verdadero hoy por evidencia de código (Product Architecture v1.0 §3: ninguna Query/Command de las 11 pantallas de Estudiante de Academia importa `TeacherStudentRelationshipPort`); se congela como invariante, no se introduce. |
| 2 | **Desacoplamiento entre Bounded Contexts.** Ningún contexto importa entidades internas de otro. | Mismo principio ya vigente y demostrado en Academia, Mi Plan y Dashboard (comunicación exclusiva por eventos de dominio o puertos de lectura, nunca por acceso directo a Aggregates). |
| 3 | **Configurabilidad organizacional.** La estructura interna de cada organización es definida por la propia organización, no fija en el sistema. | Exigencia explícita y repetida del encargo; única lectura consistente con soportar diez tipos de organización heterogéneos sin ramificación de código por tipo. |
| 4 | **Independencia del núcleo pedagógico.** Organization Management nunca decide ni conoce contenido, progreso o reglas pedagógicas; el núcleo pedagógico (Academia, Mi Plan, Evolución) nunca decide ni conoce estructura organizacional. | Aplicación simétrica del principio ya congelado en Application Model v1.5/PND-04 ("Academia no debe poseer datos de membresía"), extendido ahora en ambas direcciones. |
| 5 | **Consumo exclusivamente mediante contratos.** Ningún módulo accede a datos organizacionales salvo a través de un contrato de lectura expuesto explícitamente. | Único patrón de integración ya demostrado y funcional en todo el producto (`TeacherStudentRelationshipPort` en Academia; eventos de dominio en Mi Plan/Dashboard) — no se introduce un mecanismo nuevo. |
| 6 | **Extensibilidad sin reapertura del dominio.** Nuevos tipos de organización se incorporan como configuración, nunca como cambio de esquema del Aggregate raíz. | Consecuencia directa de la Decisión de la Sección 3 — es la razón de ser de optar por un modelo genérico. |
| 7 | **Reutilización del patrón ya validado, no invención de uno nuevo.** Organization Management sigue el mismo patrón de puerto/contrato + evento de dominio ya usado por el resto del producto. | Evita introducir un segundo mecanismo de integración cross-contexto en el mismo producto, lo cual violaría el criterio de consistencia ya exigido implícitamente por el Platform Core Foundation (una sola forma de hacer cada cosa transversal). |
| 8 | **Separación de responsabilidades: rol de plataforma vs. rol organizacional.** El rol de plataforma (`STUDENT`/`TEACHER`/`ADMIN`, Permission Catalog) permanece exclusivo del Platform Core; el rol organizacional ("profesor de la organización X") es exclusivo de Organization Management — son dos preguntas distintas ("¿es profesor?" vs. "¿profesor de quién, en qué organización?"). | Ya distinguido explícitamente en Organization Strategy v1.0 §3; se congela aquí como principio, no como detalle de implementación. |

---

## 5. Lenguaje ubicuo estratégico

**Términos que SÍ pertenecen al Ubiquitous Language de Organization Management** (vocabulario conceptual, sin definir entidades):

- **Organización** — la unidad raíz de agrupación; genérica por diseño (Sección 3), puede representar cualquiera de los diez tipos ya enumerados en el Contexto.
- **Miembro** — cualquier persona asociada a una Organización, sin prejuzgar su rol pedagógico externo (un Miembro puede ser, en otro Bounded Context, un `STUDENT` o un `TEACHER` de plataforma — Organization Management no lo nombra así).
- **Rol (organizacional)** — la función que un Miembro ejerce dentro de una Organización específica; distinto del rol de plataforma (Principio 8).
- **Unidad organizacional** — cualquier subdivisión configurable que una Organización defina para sí misma (equivalente conceptual, sin comprometerse a un nombre fijo, de "departamento"/"facultad"/"sede"/"equipo" — el nombre exacto de cada nivel es configuración de la organización, no vocabulario fijo del dominio).
- **Jerarquía / Estructura** — la relación configurable entre Unidades organizacionales de una misma Organización.
- **Pertenencia** — la relación entre un Miembro y una Organización (y, dentro de ella, entre un Miembro y una Unidad organizacional).

**Por qué pertenecen aquí:** los seis conceptos son, por diseño deliberado (Decisión de la Sección 3), agnósticos de dominio pedagógico — se aplican igual a una Universidad que a una Empresa. Son el vocabulario mínimo necesario para expresar "quién pertenece a qué, con qué autoridad, dentro de qué estructura", sin nombrar nunca una actividad de aprendizaje.

**Términos que NUNCA deben pertenecer al Ubiquitous Language de Organization Management:**

- **Profesor / Estudiante** — son roles de **plataforma** (`TEACHER`/`STUDENT`, Permission Catalog) y, a la vez, vocabulario propio del Ubiquitous Language ya Frozen de Academia (Domain Model v1.1 §2). Introducirlos aquí colisionaría con el Principio 8 y con la separación ya vigente en el Domain Model de Academia.
- **Curso DELF / Unidad didáctica** — pertenecen exclusivamente al Ubiquitous Language de Academia (`AcademyUnit`, Domain Model v1.1 §2) — son contenido pedagógico, prohibido por el Principio 4.
- **Retroalimentación** — pertenece exclusivamente a Academia/Coach IA (retroalimentación formativa sobre una producción escrita, Functional Specification v1.3) — ninguna relación con estructura organizacional.
- **Producción escrita** — pertenece exclusivamente a Academia (`Version`/`Attempt`, Domain Model v1.1) — mismo razonamiento.

**Justificación general:** los cuatro términos prohibidos son, sin excepción, vocabulario ya Frozen de otro Bounded Context (Academia). Su presencia en el Ubiquitous Language de Organization Management sería, por definición, una violación del límite de contexto (Principio 4) y del principio de que un mismo término debe significar una sola cosa dentro de un mismo contexto (regla DDD ya aplicada de forma idéntica en ACP-001-B, que retiró "Group" del vocabulario de Academia precisamente por la misma razón de pureza de Ubiquitous Language).

---

## 6. Límites del contexto

**Pertenece exclusivamente a Organization Management** (responsabilidades, no entidades ni procesos):
- Determinar qué Organizaciones existen.
- Determinar qué Miembros pertenecen a cada Organización.
- Determinar qué Rol organizacional ejerce cada Miembro.
- Determinar la Estructura/Jerarquía configurable de cada Organización.
- Exponer contratos de consulta (verificación y enumeración de autoridad/pertenencia) a cualquier Bounded Context autorizado.

**Nunca deberá asumir:**
- Ninguna regla, estado, progreso o contenido pedagógico de ningún otro contexto (Principio 4).
- Ningún mecanismo transversal ya cubierto por el Platform Core (notificaciones, catálogo de errores, permisos de plataforma, telemetría, IA, colas, observabilidad) — Organization Management los consume igual que cualquier otro módulo, nunca los redefine.
- Ninguna responsabilidad de facturación, licenciamiento o suscripción — NO DOCUMENTADO en ningún documento del producto; fuera de alcance salvo decisión futura explícita (ya señalado en Organization Strategy v1.0 §1).

---

## 7. Relación con otros Bounded Contexts

| Contexto | Dependencia permitida | Dependencia prohibida | Puede consumir | Nunca debe conocer |
|---|---|---|---|---|
| **Academia** | Sí — únicamente el contrato de verificación/enumeración de autoridad (ya previsto: `TeacherStudentRelationshipPort`), circunscrito a las 4 piezas ya identificadas (`ApplyTeacherOverride`, `AssignUnitToStudent`, `GetStudentProgressSummary`, `GetTeacherOverrideHistory`). | Que Organization Management acceda a `AcademyUnit`/`Attempt`/`Version` — o que Academia posea datos de membresía organizacional. | El resultado del contrato de autoridad, nada más. | La Estructura/Jerarquía interna completa de la Organización — Academia solo necesita "¿autoridad sobre quién?". |
| **Dashboard** | Ninguna real hoy (especulativa, sin evidencia — Organization Strategy v1.0 §6). | Cualquier lógica de autorización organizacional (Dashboard "nunca llama directamente a otro ecosistema", regla ya vigente). | Un indicador de pertenencia, si en el futuro se demuestra necesidad real. | Cualquier dato de Estructura/Jerarquía. |
| **Mi Plan** | Ninguna — módulo exclusivamente individual por diseño ya Frozen. | Cualquier dependencia. | Nada. | Todo. |
| **Coach IA** | Ninguna — capacidad transversal que opera sobre el individuo, sin conocer su organización. | Cualquier dependencia. | Nada. | Todo. |
| **Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento** | Ninguna — todos placeholder, sin evidencia de necesidad real. | Cualquier dependencia hasta que exista evidencia real (mismo criterio de exclusión por defecto del Platform Core). | Nada, hoy. | Todo, hoy. |
| **Platform Core** | Bidireccional según el patrón universal: Organization Management → Platform Core permitida (Notification/Error/Permission/Audit/Telemetry Catalog, Logging, Configuration, Secrets, Observability); Platform Core → Organization Management **siempre prohibida**, sin excepción (mismo principio universal ya vigente para todo módulo, Platform Core Foundation §6). | Platform Core nunca depende de ningún módulo funcional, incluido este. | Cualquier componente ya reconocido del Core, igual que cualquier otro módulo. | El Core nunca conoce el estado interno de Organization Management. |

---

## 8. Compatibilidad futura

| Escenario | ¿Soportado sin rediseño, dada la Decisión de la Sección 3? |
|---|---|
| Universidades, Colegios | Sí — caso ya cubierto por el único consumidor real (Academia). |
| Empresas, ONG, Organizaciones públicas/privadas, Organizaciones gubernamentales | Sí, en el nivel de modelo (Organización/Miembro/Rol genéricos) — pendiente únicamente de que exista evidencia real de un consumidor concreto para diseñar su Functional Specification, no de un cambio de Bounded Context. |
| Marketplace de docentes, Franquicias, Redes de colegios, Múltiples sedes | Sí, en el nivel de modelo — todos son variaciones de "Miembro con Rol dentro de una Estructura configurable"; el nivel exacto de soporte (p. ej. relaciones organización-a-organización) sigue siendo una decisión de Domain Model, no resuelta ni necesaria de resolver en este ADR. |
| Certificaciones internacionales | Parcialmente NO DOCUMENTADO — ninguna evidencia de relación entre Organization Management y un futuro módulo de Certificaciones; la decisión genérica no lo impide, pero tampoco lo garantiza sin especificación futura. |
| **Multi-tenant institucional (aislamiento de datos entre organizaciones)** | **NO resuelto por este ADR — es una decisión de Infrastructure, ortogonal a la Decisión de la Sección 3.** El único patrón de aislamiento documentado en todo el producto es por estudiante (confirmado en Academia, Mi Plan y Dashboard, Organization Strategy v1.0, hallazgo transversal) — optar por un modelo de dominio genérico no resuelve, por sí solo, cómo se aíslan los datos entre dos organizaciones clientes. Riesgo real, explícitamente no cerrado aquí (ver Sección 11). |
| Nuevos módulos aún no existentes | Sí, en el nivel de principio — cualquier módulo futuro consumirá Organization Management por el mismo contrato ya definido (Principio 5), sin acoplamiento adicional. |

---

## 9. Restricciones permanentes (normativas para todo documento futuro)

1. Ningún documento futuro de Organization Management (Functional Specification, Domain Model, Application Model, Infrastructure Model, API Contract) podrá modelar el dominio asumiendo un único tipo de organización.
2. Ningún documento futuro podrá introducir vocabulario pedagógico (Profesor, Estudiante, Curso, Unidad, Retroalimentación, Producción) dentro del Ubiquitous Language de Organization Management.
3. Ninguna entidad de Organization Management podrá residir dentro de `features/academy` ni de ningún otro módulo funcional existente.
4. Ningún módulo funcional distinto de Academia podrá depender de Organization Management sin evidencia real documentada (mismo criterio de exclusión por defecto ya vigente para el Platform Core).
5. Organization Management nunca podrá exponer sus entidades internas completas a otro contexto — solo contratos de consulta acotados (Principio 5).
6. Toda decisión de estructura/jerarquía deberá preservar la configurabilidad por organización (Principio 3) — ningún nivel jerárquico fijo podrá codificarse como parte del esquema central sin pasar por una extensión de este mismo ADR.
7. La decisión de multi-tenancy institucional (Sección 8) deberá resolverse en un documento de Infrastructure separado, nunca asumida implícitamente dentro del Domain Model.

---

## 10. Decisiones congeladas

| Decisión | Clasificación | Justificación |
|---|---|---|
| Organization Management es un Bounded Context **genérico**, no específico de educación (Sección 3) | **Irreversible** | Cambiarla después de que exista un Domain Model implicaría rediseñar el Aggregate raíz y todos sus contratos ya consumidos por Academia — el costo de reversión es total. |
| Independencia del Modo Individual (Principio 1) | **Irreversible** | Ya verdadera por evidencia de código en todo el producto; romperla degradaría una garantía ya observable por usuarios reales del Modo Individual. |
| Desacoplamiento vía contratos, nunca acceso directo (Principios 2, 5) | **Muy difícil de cambiar** | Es la convención arquitectónica ya usada por todo el producto (Academia, Mi Plan, Dashboard) — cambiarla exigiría revisar la integración de todos los módulos existentes, no solo de Organization Management. |
| Estructura organizacional configurable, no jerarquía fija (Principio 3) | **Muy difícil de cambiar** | Ya es consecuencia directa de la Decisión de la Sección 3 (Irreversible); revertirla exigiría revertir primero esa decisión. |
| Nombre del módulo: "Organization Management" (vs. "Organización Académica" de la investigación previa) | **Cambiable** | Es una decisión de nomenclatura documental, ya señalada como pendiente de unificar en Organization Strategy v1.0 (§11, decisión importante 5) — bajo costo de corrección antes de la Functional Specification. |
| Nivel exacto de flexibilidad de la jerarquía (árbol estricto vs. estructura libre, número de niveles) | **Cambiable** | Explícitamente no resuelto por ningún documento hasta ahora (Organization Strategy v1.0 §5) — pertenece al Domain Model, no a este ADR. |
| Mecanismo de multi-tenancy institucional | **Cambiable, pendiente de documento propio** | Es una decisión de Infrastructure ortogonal a este ADR (Sección 8) — no se congela aquí en ningún sentido. |

---

## 11. Riesgos residuales

Decisiones que **todavía no pueden tomarse**, porque requieren documentación futura no existente hoy — no se inventan aquí:

1. **Nivel exacto de flexibilidad de la Estructura/Jerarquía** (Sección 5 de Organization Strategy v1.0) — requiere un Domain Model que explore casos reales de al menos dos tipos de organización distintos antes de fijarlo.
2. **Mecanismo de multi-tenancy institucional** — requiere una decisión de Infrastructure Model separada; el patrón actual (aislamiento por estudiante) no lo resuelve.
3. **Mecanismo de activación/transición entre Modo Individual y Modo Institucional** — NO DOCUMENTADO en ningún documento del producto; sin él, Organization Management no tiene un punto de entrada funcional definido.
4. **Unificación de nombre** ("Organización Académica" vs. "Organization Management") — pendiente desde Organization Strategy v1.0, no resuelta por este ADR (que adopta el segundo nombre por continuidad con el encargo, sin declarar formalmente que ambos son el mismo Bounded Context).
5. **Proceso de gobierno/ownership de Organization Management** — no existe, a diferencia del ya definido para Platform Core.
6. **Resolución de inconsistencias terminológicas heredadas** (`hasRelationship()` vs. `.exists()`; terminología `Group*` obsoleta) — deben cerrarse antes de que cualquier Functional Specification las herede.

---

## 12. Impacto sobre el Roadmap

- **Functional Specification:** deberá redactar sus Casos de Uso exclusivamente en el vocabulario genérico congelado en la Sección 5 (Organización/Miembro/Rol/Unidad/Jerarquía/Pertenencia), nunca en términos de "profesor"/"estudiante" — y deberá, como precondición propia, resolver el riesgo residual 3 (mecanismo de activación) antes de poder describir un flujo de usuario completo.
- **Domain Model:** deberá modelar la Estructura/Jerarquía como configurable (Principio 3, Restricción 6), sin asumir un árbol fijo — y deberá resolver explícitamente el riesgo residual 1 (nivel de flexibilidad) como parte de su propio proceso de diseño, no heredarlo sin resolver.
- **Application Model:** deberá exponer, como mínimo, el contrato ya previsto por Academia (verificación/enumeración de autoridad), sin filtrar hacia Academia ningún concepto propio de Organization Management más allá de ese contrato (Principio 5, Restricción 5).
- **Infrastructure Model:** deberá abordar, como documento separado o sección propia, el riesgo residual 2 (multi-tenancy institucional) — este ADR no lo resuelve ni lo asume implícitamente.
- **API Contract:** cualquier endpoint que exponga a Academia deberá nombrarse en términos neutrales de autoridad/pertenencia, nunca en términos de "profesor"/"estudiante" a nivel de Organization Management (aunque Academia, en su propio consumo, sí traduzca el resultado a esos términos).
- **Frontend:** ninguna pantalla de Organization Management podrá construirse dentro de `features/academy` (Restricción 3) ni asumir que su estructura de UI replica la de P-12/P-13/P-15 de Academia — son un frontera de producto nueva, aún no explorada por ningún Frontend Contract.

---

## Validación final obligatoria

1. **¿Contradicción con Product Architecture v1.0?** Ninguna. Este ADR resuelve exactamente la decisión que ese documento dejó explícitamente pendiente (§10, decisión 6), sin contradecir ninguna de sus clasificaciones de módulos ni su matriz de dependencias.
2. **¿Contradicción con Organization Strategy v1.0?** Ninguna. Este ADR resuelve la decisión crítica 1 de esa estrategia (§11) y es consistente con sus 6 principios (§2) y su análisis de escenarios (§9).
3. **¿Contradicción con el Blueprint?** Ninguna. El Blueprint nunca modeló Organization Management; solo declaró la dependencia de Academia hacia él (§14, ítem 1) — este ADR no modifica esa dependencia, la respeta tal como está aislada hoy.
4. **¿Contradicción con el Domain Model actual (Academia)?** Ninguna. Domain Model v1.1 §1 ya declara que Academia nunca posee datos de otro Bounded Context — este ADR aplica el mismo principio en sentido inverso (Principio 4), reforzándolo, no contradiciéndolo.
5. **¿Permite que Rédaction Lab funcione completamente en Modo Individual e Institucional?** Sí — el Principio 1 lo congela como invariante, y ya es cierto hoy por evidencia de código.
6. **¿Mantiene desacoplado el núcleo pedagógico?** Sí — Principios 2, 4 y 5, y la Sección 6 (límites del contexto), lo garantizan explícitamente.
7. **¿Deja suficiente libertad para diseñar el Domain Model sin rehacer la arquitectura?** Sí — este ADR congela únicamente la decisión genérico/específico y los principios de integración; deja explícitamente abiertos (Sección 11) el nivel de flexibilidad de la jerarquía, el mecanismo de multi-tenancy, y el mecanismo de activación — ninguno de los cuales se resuelve ni se prejuzga aquí.

**No se detectó ninguna contradicción.** Este ADR queda emitido en estado Propuesto, a la espera de ratificación formal. No se avanza al diseño del dominio.
