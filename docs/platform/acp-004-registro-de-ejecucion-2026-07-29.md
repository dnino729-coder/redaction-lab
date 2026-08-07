# ACP-004 — Registro de Ejecución

**Rol:** Release Engineer / Documentation Integrator, Rédaction Lab. No arquitecto, no autor del ACP, no toma decisiones nuevas. Ejecución exacta de ACP-004 conforme al `Architecture Change Management Standard v1.0`.
**ACP ejecutado:** ACP-004 — Confirmación de productor de infraestructura para `versionCount` y corrección de URI de `EP-18` (Estado previo: `APROBADO`).
**Fecha de ejecución:** 2026-07-29.
**Marco de referencia:** `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md` — Sección 6 (Flujo oficial de aprobación), pasos 6 "Actualización" y 7 "Auditoría".
**Origen:** Hallazgo H-02 (parcial) de `academia-domain-model-v1.1-cross-consistency-audit-2026-07-20.md`; formalización retroactiva solicitada por AFR-038 (Resolución formal de hallazgos de la Auditoría Final de Implementación, Sprint 2.0), hallazgos H-02 y H-03.

Este documento certifica la ejecución completa de ACP-004 sobre los tres documentos que autoriza. Dos de las tres actualizaciones (Application Model, API Contract) **ya habían sido aplicadas antes de la existencia formal de este Registro** — se auditan aquí retroactivamente, confirmando que su contenido coincide exactamente con lo autorizado por el ACP. La tercera actualización (Infrastructure Model) se ejecuta como parte de este mismo Registro. No se tomó ninguna decisión nueva — cada cambio deriva exclusivamente de lo ya aprobado en `acp-004-confirmacion-productor-versioncount-2026-07-29.md`.

---

## CONTROL DE CAMBIOS POR DOCUMENTO

### `academia-application-model` — v1.4 → v1.5

| Campo | Valor |
|---|---|
| Versión anterior | 1.4 |
| Nueva versión | 1.5 |
| Estado de esta ejecución | **Ya aplicada** antes de este Registro (2026-07-29) — auditada aquí retroactivamente, sin modificación adicional |
| Secciones modificadas (confirmadas por lectura directa) | Encabezado (Historial de cambios, nueva fila); Sección 6 (`AttemptSummaryDTO`, nota de productor confirmado) |
| Impacto | Bajo — ningún Command, Query, DTO, Policy o Aggregate preexistente fue alterado en su forma; se añade únicamente la confirmación de productor de un campo ya existente desde v1.4 |
| Compatibilidad hacia atrás | Total — `versionCount` no cambia de tipo ni de presencia (ya era parte del DTO desde v1.4); solo se documenta su origen |
| Confirmación de origen | Deriva exclusivamente de ACP-004. `QRY-05 GetVersionFeedback` permanece exactamente igual, según cita el propio documento |

### `academia-api-contract` — v1.3 → v1.4

| Campo | Valor |
|---|---|
| Versión anterior | 1.3 |
| Nueva versión | 1.4 |
| Estado de esta ejecución | **Ya aplicada** antes de este Registro (2026-07-29) — auditada aquí retroactivamente, sin modificación adicional |
| Secciones modificadas (confirmadas por lectura directa) | Encabezado (Historial de cambios, nueva fila; referencia a Application Model actualizada a v1.5); Sección 4 (`EP-18`, URI corregida con `versionNumber`); Sección 5 (`AttemptSummaryDTO.versionCount`, nota de productor confirmado) |
| Impacto | Bajo — ningún endpoint, DTO, código HTTP o regla de seguridad preexistente fue alterado en su comportamiento; corrección puramente documental de una URI y de una nota de productor |
| Compatibilidad hacia atrás | Total — la URI real de `EP-18` siempre exigió `versionNumber` (confirmado contra la implementación real de `getVersionFeedback`); la v1.3 documentaba una URI incompleta por omisión editorial, no un comportamiento distinto |
| Confirmación de origen | Deriva exclusivamente de ACP-004 |

### `academia-infrastructure-model` — v1.1 → v1.2

| Campo | Valor |
|---|---|
| Versión anterior | 1.1 |
| Nueva versión | 1.2 |
| Estado de esta ejecución | **Ejecutada por este Registro** (2026-07-29) |
| Secciones modificadas | Encabezado (Fecha de esta revisión; Historial de cambios, nueva fila); Sección 5, `AttemptRepository` (nota sobre producción de `versionCount` vía `_count.versions`) |
| Impacto | Bajo — ningún adaptador, Repository, patrón de eventos ni decisión ya resuelta por el IRB (Circuit Breaker, Outbox, cola, feature flags) fue modificado; se documenta un mecanismo ya implementado en el código, sin alterarlo |
| Compatibilidad hacia atrás | Total — `AttemptRepository.save`/lecturas no cambian de firma; `versionCount` se deriva de una relación (`Attempt.versions`) ya existente en el Domain Model v1.1 desde su versión original |
| Confirmación de origen | Deriva exclusivamente de ACP-004. Verificado contra el código real: `features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort.ts` ya incluye `_count: { select: { versions: true } }` en sus tres rutas de lectura de intento y ya mapea `versionCount: _count.versions` |

### Documentos **no modificados** (correctamente fuera de alcance)

- **Domain Model v1.1** — no listado como afectado por ACP-004; ninguna sección tocada. `Attempt.versions` ya existía sin modificación.
- **Functional Specification v1.3** — ACP-004 es de naturaleza técnica (Infraestructura + API), no funcional; ningún caso de uso ni regla funcional cambia.
- **Frontend Contract v1.1, Frontend Implementation Blueprint** — no listados como afectados por ACP-004; el consumo de `versionCount` por el Frontend de Academia ya estaba previsto en el diseño de P-09 antes de este ACP.
- **Resoluciones A-01 a A-10** — no reinterpretadas ni modificadas.

---

## EVIDENCIA DE TRAZABILIDAD

```
academia-domain-model-v1.1-cross-consistency-audit-2026-07-20.md — Hallazgo H-02 (productor de versionCount no confirmado)
        ↓
ACP-004 (acp-004-confirmacion-productor-versioncount-2026-07-29.md) — APROBADO
        ↓
Application Model v1.5 — AttemptSummaryDTO.versionCount, productor confirmado (Sección 6)
        ↓
API Contract v1.4 — AttemptSummaryDTO.versionCount (Sección 5) + EP-18 URI corregida (Sección 4)
        ↓
Infrastructure Model v1.2 — AttemptRepository/PrismaAcademyReadModelPort produce versionCount vía _count.versions (Sección 5)
        ↓
Código real (ya implementado, verificado): PrismaAcademyReadModelPort.ts, attemptResponseMappers.ts, AttemptDto.ts
        ↓
Frontend (Sprint 2.0, P-09): AttemptStepContainer.tsx deriva versionNumber = matchedAttempt.versionCount para useFeedback()
```

Verificación cruzada (lectura directa de los tres documentos y del código real durante esta ejecución):
- `versionCount` aparece con productor confirmado en Application Model v1.5 (Sección 6) e Infrastructure Model v1.2 (Sección 5), y como campo ya presente en API Contract v1.4 (Sección 5).
- `EP-18` en API Contract v1.4 (Sección 4) documenta `versionNumber` en su URI, coincidente con `QRY-05` (Application Model) y con la implementación real de `getVersionFeedback`.
- `PrismaAcademyReadModelPort.ts` produce `versionCount` en sus tres rutas de lectura de intento (`getContinuationState`, `listAttemptsByUnit`, dentro de `getStudentUnitHistory`), coincidente exactamente con lo descrito en Infrastructure Model v1.2.

Ningún otro Command, Query, Endpoint, DTO, Aggregate o componente preexistente fue tocado en ninguno de los tres documentos.

---

## VALIDACIÓN

| Verificación | Resultado |
|---|---|
| ✓ El Domain Model permanece idéntico | **Cumple.** Cero ediciones al archivo del Domain Model; `Attempt.versions` ya existía sin modificación. |
| ✓ No se agregaron Aggregates, Commands ni Queries | **Cumple.** `versionCount` se deriva de una relación ya existente; `QRY-05 GetVersionFeedback` permanece exactamente igual. |
| ✓ El productor de `versionCount` queda confirmado en Infraestructura | **Cumple.** Infrastructure Model v1.2, Sección 5, documenta `_count: { select: { versions: true } }` como mecanismo exacto, coincidente con el código real. |
| ✓ La URI de `EP-18` queda corregida sin cambio de comportamiento | **Cumple.** La implementación real siempre exigió `versionNumber`; solo se corrige la documentación. |
| ✓ Los tres documentos citan ACP-004 de forma mutuamente consistente | **Cumple.** Verificado por lectura directa de los tres encabezados/Historial de cambios. |
| ✓ Ningún documento fuera de alcance fue modificado | **Cumple.** Domain Model, Functional Specification, Frontend Contract, Frontend Implementation Blueprint y las resoluciones A-01–A-10 permanecen sin cambios. |
| ✓ Ninguna versión anterior fue editada in situ | **Cumple.** `academia-infrastructure-model-v1.1-2026-07-19.md` permanece intacto (pasa a `SUPERSEDED`); toda edición ocurrió sobre el archivo nuevo `academia-infrastructure-model-v1.2-2026-07-29.md`. |

---

## FUERA DEL ALCANCE DE ACP-004 (registrado, no resuelto)

Los siguientes elementos, mencionados en el origen de este ACP (Hallazgo H-02 de la Auditoría de Consistencia Transversal) o detectados durante su ejecución, no forman parte de su alcance autorizado y permanecen sin cambio:

1. **Reconciliación DTO más amplia** originalmente sugerida junto con "ACP-004" en el Veredicto de la Auditoría de Consistencia Transversal — ya resuelta separadamente por la Reconciliación Documental de Sprint 4.2.2 (Application Model v1.4, API Contract v1.3, R-02/R-03/R-04), antes de la ejecución de este ACP-004. No se reabre ni se reevalúa aquí.
2. **Hallazgo H-01** (Coverage Audit desactualizada), **H-03** (redacción ambigua de `EP-05` sobre `MASTERED`) y **H-04** (momento de emisión de `RevisionStarted`) de la misma Auditoría de Consistencia Transversal — ninguno forma parte del alcance de ACP-004; permanecen registrados y sin resolver, pendientes de un ciclo posterior.
3. **Estado `DRAFT` no resuelto del Infrastructure Model** — esta ejecución no cambia el Estado del documento (permanece `DRAFT (pendiente de aprobación ARB antes de congelarse)`, sin relación con el alcance de ACP-004).
4. **Pendientes #3/#4 del API Contract** (rate limiting, vocabulario del Error Catalog) — sin relación con ACP-004, sin cambio.

---

## RESULTADO

1. **Documentos actualizados:** Application Model (v1.5, ya aplicado — auditado aquí), API Contract (v1.4, ya aplicado — auditado aquí), Infrastructure Model (v1.1 → v1.2, ejecutado por este Registro).
2. **Documentos creados:** `acp-004-confirmacion-productor-versioncount-2026-07-29.md` (propuesta formal), este mismo Registro de Ejecución.
3. **Nuevas versiones oficiales:**

| Documento | Versión anterior | Versión nueva |
|---|---|---|
| Application Model | 1.4 | 1.5 (sin cambio adicional — auditado) |
| API Contract | 1.3 | 1.4 (sin cambio adicional — auditado) |
| Infrastructure Model | 1.1 (DRAFT) | **1.2** (DRAFT — sin cambio de estado por este ACP) |

4. **Confirmación de que la cadena de trazabilidad de la Sección 9 del Estándar queda completa: SÍ.** Documento original (Application Model v1.4 / API Contract v1.3 / Infrastructure Model v1.1, Frozen/DRAFT según corresponda) → ACP-004 (evidencia citada, Hallazgo H-02) → Documentos actualizados → Nueva versión (v1.5 / v1.4 / v1.2) — sin eslabones faltantes.

---

## DICTAMEN FINAL

**A) ACP-004 EJECUTADO CORRECTAMENTE — TRAZABILIDAD COMPLETA**

**Justificación con evidencia documental:** los tres documentos exigidos por el alcance de ACP-004 citan la misma autorización de forma mutuamente consistente; el único documento cuya actualización estaba pendiente (Infrastructure Model) queda cerrado por este Registro, con contenido verificado exacto contra el código real ya implementado (`PrismaAcademyReadModelPort.ts`). Ninguna decisión nueva fue tomada en esta ejecución — se formalizó retroactivamente una decisión ya aprobada e implementada, cerrando el vacío de gobernanza señalado por AFR-038 (hallazgos H-02/H-03) sin reabrir, ampliar ni reinterpretar ningún Aggregate, Policy, Command, Query o resolución arquitectónica ya vigente.
