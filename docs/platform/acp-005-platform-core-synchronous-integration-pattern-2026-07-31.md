# ACP-005 — Autorización para incorporar a Platform Core Foundation el patrón oficial de integración síncrona entre Bounded Contexts DDD

**Naturaleza de este documento:** Architecture Change Proposal, emitido siguiendo estrictamente la plantilla oficial de `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md`, §7. **Este ACP no modifica ningún documento** — únicamente solicita y, de aprobarse, autoriza la reapertura de Platform Core Foundation para **estudiar y documentar** el patrón, sin prescribir su diseño (Sección 6, "Recomendación").

---

## Plantilla oficial (Sección 7 del Estándar)

| Campo | Contenido |
|---|---|
| **ID** | ACP-005 |
| **Título** | Incorporar a Platform Core Foundation el patrón oficial de integración síncrona (request-response) entre Bounded Contexts DDD completos |
| **Fecha** | 2026-07-31 |
| **Autor** | Enterprise Architect / Platform Architect, Rédaction Lab (origen: auditoría arquitectónica independiente realizada durante la reapertura planificada de Academia tras el FROZEN de Organization Management) |
| **Tipo** | **Platform Core** (Estándar, §4: "Cambios en cualquier componente transversal... el tipo de mayor alcance posible") |
| **Clasificación de impacto** | **Alto** (Estándar, §5: no por número de documentos —1 documento afectado directamente— sino porque *"introduce un elemento nuevo de primera clase... sin eliminar ni romper nada existente"*: un componente/patrón nuevo del Core) |
| **Motivación** | Academia necesita reabrirse para consumir Organization Management (ya FROZEN) y resolver el bloqueador original (Blueprint §14, ítem 1; PND-04). Antes de decidir cómo debe hacerlo, una auditoría independiente determinó que el mecanismo concreto de esa integración no está documentado en ningún lugar del proyecto. |
| **Problema** | No existe, en ningún documento de la plataforma, un patrón oficial para una consulta síncrona pregunta-respuesta entre dos Bounded Contexts DDD completos (con Aggregates propios). Los patrones existentes cubren otros casos, ninguno este. |
| **Evidencia** *(ya demostrada, no reinvestigada — citada tal como fue entregada)* | 1. Project Structure Specification §8, cita literal: *"`features/*` nunca importa directamente de otro `features/*`. Toda comunicación pasa por `services/` compartidos o por eventos."* 2. Patrón para eventos: existente y documentado (`docs/modules/mi-plan.md` §2.10, `EXTERNAL_ACTIVITY_COMPLETED`). 3. Patrón para módulos agregadores: existente (Dashboard, Project Structure Specification §2/§6; `docs/modules/dashboard.md` §7), pero reservado explícitamente a módulos **sin** `domain/`/`application/`/`infrastructure/` propios. 4. Patrón para servicios transversales (AI, Database, etc.): existente (`services/ai`, `services/database`, `docs/modules/dashboard.md` §7). 5. Ausencia confirmada de cualquier patrón para consulta síncrona entre dos BC DDD completos — verificado por búsqueda exhaustiva en auditorías previas de esta misma investigación. 6. Platform Core Foundation §1-§2 es, por su propio criterio de pertenencia, el propietario de todo componente transversal reutilizable. 7. Platform Core Foundation está en estado `FROZEN` (su propia sección de Resultado). 8. Architecture Change Management Standard §2 exige ACP para modificar cualquier documento `FROZEN`, listando explícitamente *"Platform Core Foundation y todo componente individual derivado de él"*. |
| **Documentos afectados** | **Directo:** Platform Core Foundation (única reapertura que este ACP autoriza). **Indirecto, no modificado por este ACP:** Academia (Domain Model, Application Model, Infrastructure Model, API Contract, Blueprint) y Organization Management (Domain Model, Application Model, Infrastructure Model, API Contract) — ambos serán, en el futuro, consumidores del componente que se documente, pero **ninguno se reabre en este acto**. |
| **Dependencias** | Depende de: la declaración FROZEN de Organization Management (ya emitida, sin defecto arquitectónico) y de la cadena de auditorías independientes que demostraron el vacío (citadas en "Evidencia"). De este ACP dependerá, en el futuro, un ACP posterior de tipo Infraestructura/API que autorice a Academia a consumir el componente ya documentado — **no incluido en el alcance de este ACP**. |
| **Impacto** | Sobre Platform Core Foundation: adición de un componente nuevo a su inventario (§3), sin alterar ni retirar ninguno de los 16 componentes ya reconocidos. Sobre cualquier otro documento: **ninguno todavía** — ningún contrato ya consumido se modifica, porque el componente no existe aún. |
| **Riesgos** | (a) Evaluado contra el criterio 1 de pertenencia al Core (Platform Core Foundation §2: *"evidencia real de... más de un módulo... o lo necesitará con alta certeza"*) — hoy existe un único consumidor concreto evidenciado (Academia↔Organization Management); el criterio se apoya en la cláusula "con alta certeza" de necesidad futura, no en un segundo consumidor ya existente — riesgo a evaluar explícitamente durante la revisión, no resuelto por este ACP. (b) Riesgo de que el patrón, una vez documentado, no cubra adecuadamente casos futuros distintos al actual — mitigado por el propio proceso de estudio que este ACP autoriza, no por este documento. |
| **Alternativas** | (a) Resolver la integración de forma ad-hoc dentro del Infrastructure Model de Academia, sin pasar por el Platform Core — **descartada**: violaría el propio criterio de exclusión de Platform Core Foundation (§2, "regla de exclusión por defecto") en sentido inverso, dejando sin gobierno un mecanismo que, por su propia naturaleza, es reutilizable por cualquier futuro par de Bounded Contexts DDD, no exclusivo de Academia/Organization Management. (b) No definir ningún patrón formal y dejar que cada futura integración BC-a-BC resuelva el problema de manera distinta — **descartada**: contradice directamente la regla global ya vigente (Project Structure Specification §8) de que "toda comunicación pasa por `services/` compartidos o por eventos", que exige un mecanismo consistente, no ad-hoc. Ninguna alternativa de diseño concreto (HTTP, in-process, ACL, Gateway, Adapter) se evalúa en este ACP — **queda explícitamente abierta**, a resolver en el propio proceso de estudio autorizado. |
| **Recomendación** | Autorizar la reapertura de Platform Core Foundation **exclusivamente para estudiar y documentar** el patrón — sin prescribir aquí HTTP, llamadas in-process, Anti-Corruption Layer, Gateway, Adapter, ni ninguna otra alternativa de diseño. La decisión de diseño concreta queda para el propio proceso de estudio, evaluado contra los cinco criterios de pertenencia al Core (§2) y el checklist (§9) ya vigentes en Platform Core Foundation. |
| **Plan de actualización** | 1) Platform Core Foundation pasa a `MINOR REVISION` (Estándar §3). 2) Se evalúa el componente propuesto contra los cinco criterios de la Sección 2 y el checklist de la Sección 9 de Platform Core Foundation. 3) Si aprueba, se documenta como componente individual (mismo nivel de detalle ya usado para el Notification Catalog, Platform Core Foundation §4) y se incorpora al inventario (§3). 4) Platform Core Foundation pasa a una nueva versión `FROZEN` (v1.1, Minor — Estándar §8, "Platform Core... Minor si son aditivos"). Responsable: Architecture Review Board / Infrastructure Review Board (ver Plan de validación). |
| **Plan de validación** | Por Estándar §10: **Coverage Audit** obligatoria (el ACP se clasifica Alto). **Infrastructure Review (IRB)** obligatoria (ACP de tipo Platform Core que tocará, en el futuro, los Infrastructure Model ya existentes de Academia y de Organization Management). Ambas auditorías deben confirmar: que el nuevo componente cumple los cinco criterios de pertenencia al Core sin excepción, y que ningún componente ya existente del inventario queda alterado. |
| **Resultado esperado** | Platform Core Foundation v1.1 (FROZEN), con el nuevo patrón de integración síncrona documentado como componente individual de su inventario. Academia y Organization Management permanecen exactamente como están hoy (FROZEN, sin modificación) hasta que un ACP posterior autorice específicamente a Academia a consumir el nuevo componente. |
| **Estado del ACP** | **PENDIENTE DE APROBACIÓN** — la creación de un componente nuevo de Platform Core es, por su propia naturaleza, una decisión que excede la autoridad de quien redacta este documento; requiere ratificación formal (mismo criterio ya aplicado a ADR-001 de Organization Management, marcado "Propuesto" por la misma razón). |

---

## Determinaciones explícitas solicitadas

**1. Tipo de Change Proposal:** Platform Core (único tipo asignado — no se combina con otro, porque el cambio no toca todavía ninguna capa de Dominio/Aplicación/Infraestructura/API de ningún módulo consumidor).

**2. Clasificación de impacto:** Alto (justificación en la tabla — "elemento nuevo de primera clase", no por conteo de documentos).

**3. Alcance del ACP:** exclusivamente autorizar la reapertura de Platform Core Foundation para **estudiar y documentar** el patrón — ninguna decisión de diseño (HTTP, in-process, ACL, Gateway, Adapter) se toma en este acto.

**4. Justificación documental:** la evidencia de los 8 puntos ya demostrados (tabla "Evidencia"), sin investigación adicional.

**5. Documentos que deberán reabrirse:** únicamente Platform Core Foundation.

**6. Documentos que NO deberán modificarse:** Product Architecture, ADR-001, Organization Strategy, Project Structure Specification, y la totalidad de los documentos de Academia y de Organization Management (ambos Bounded Contexts permanecen FROZEN, sin tocar).

**7. Riesgos:** (a) el criterio de pertenencia al Core se apoya en "necesidad futura con alta certeza" más que en un segundo consumidor ya existente — riesgo a resolver explícitamente durante la revisión, no aquí; (b) el patrón, una vez definido, podría no cubrir adecuadamente necesidades futuras distintas — riesgo genérico de cualquier componente nuevo del Core, ya contemplado por el propio proceso de evolución de Platform Core Foundation (§8).

**8. Compatibilidad:** ningún documento ya `FROZEN` se modifica por este ACP; ningún contrato ya consumido se rompe; verificado explícitamente contra Product Architecture, ADR-001, Project Structure Specification, Academia y Organization Management — sin contradicción en ninguno, porque ninguno se toca todavía.

**9. Criterios de aprobación** *(verificados uno por uno contra el checklist oficial, Estándar §13)*:
- [x] Completo según la plantilla de la Sección 7.
- [x] Evidencia trazable a documentos Frozen y auditorías ya emitidas (citada punto por punto, sin reinvestigación).
- [x] Tipo y Clasificación de impacto asignados según las Secciones 4 y 5.
- [x] Documentos afectados, directos e indirectos, identificados.
- [x] Ninguna resolución arquitectónica ya aprobada (tipo A-01–A-10) se reinterpreta.
- [x] El Plan de actualización no excede el alcance de la Motivación/Problema (limitado a estudiar y documentar, no a implementar).
- [x] El Plan de validación especifica las auditorías de la Sección 10 (Coverage Audit + IRB).
- [x] Ningún criterio de rechazo automático de la Sección 11 aplica — en particular: no asume que Platform Core Foundation ya fue modificado; no introduce funcionalidad no solicitada por ningún documento Funcional (la necesidad ya está evidenciada por la cadena Blueprint→PND-04→Organization Management); no duplica ningún componente ya existente del Core (verificado: ninguno de los 16 componentes ya reconocidos cubre este caso).
- [x] Versión objetivo (Minor, Platform Core Foundation v1.0 → v1.1) coherente con un cambio aditivo (Estándar §8).

---

**No se ha modificado ningún documento.** No se ha diseñado ningún patrón. Este ACP queda formalmente emitido, en estado `PENDIENTE DE APROBACIÓN`, a la espera de ratificación antes de proceder con su Plan de actualización.
