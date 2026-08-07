# ACP-004 — Confirmación de productor de infraestructura para `versionCount` y corrección de URI de `EP-18`

**Naturaleza de este documento:** formalización retroactiva. La decisión que este ACP autoriza **ya fue aprobada y ejecutada parcialmente** — Application Model v1.5 (2026-07-29) y API Contract v1.4 (2026-07-29) ya citan "ACP-004" en su propia tabla de Historial de cambios, y el código de Infraestructura (`PrismaAcademyReadModelPort.ts`) ya implementa lo aquí descrito. Este documento no introduce ninguna decisión nueva ni reinterpreta la ya tomada — cierra el vacío detectado por la Auditoría Final de Implementación del Sprint 2.0 (AFI) y resuelto formalmente en AFR-038, hallazgos H-02/H-03: la ausencia de un artefacto de propuesta ACP-004 verificable, pese a estar ya citado como autorización en dos documentos Frozen. Emitido siguiendo la plantilla oficial de `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md`, Sección 7.

---

| Campo | Contenido |
|---|---|
| **ID** | ACP-004 |
| **Título** | Confirmación de productor de infraestructura para `versionCount` (`AttemptSummaryDTO`) y corrección de la URI documentada de `EP-18` |
| **Fecha** | 2026-07-29 |
| **Autor** | Equipo de implementación Frontend de Academia (origen: prerrequisito arquitectónico detectado durante la FASE 0 de Sprint 2.0, P-09 — "Recibir retroalimentación") |
| **Tipo** | Infraestructura + API (Sección 4 del Estándar: el cambio confirma un productor de datos en Infrastructure Model y corrige una omisión editorial en API Contract) |
| **Clasificación de impacto** | **Medio** (Sección 5 del Estándar: 3 documentos afectados — Application Model, API Contract, Infrastructure Model; cambio aditivo y compatible hacia atrás, ningún contrato ya consumido se rompe) |

---

## Contexto

La Reconciliación Documental de Sprint 4.2.2 (2026-07-20) unificó por primera vez, campo por campo, la forma de `AttemptSummaryDTO` entre el Application Model (v1.3→v1.4) y el API Contract (v1.2→v1.3), incorporando el campo `versionCount` a ambos documentos como parte de esa unificación (R-02). Esa reconciliación cerró la **divergencia de forma** señalada por el Hallazgo H-02 de la Auditoría de Consistencia Transversal (`academia-domain-model-v1.1-cross-consistency-audit-2026-07-20.md`), pero no confirmó **quién en Infraestructura produce realmente ese valor** — `versionCount` quedó documentado en ambos contratos de datos sin que el Infrastructure Model (todavía en v1.1, sin ninguna referencia al campo) declarara su origen. Esta confirmación de productor, junto con una corrección editorial menor de la URI de `EP-18`, es exactamente el "próximo paso" que la propia Auditoría de Consistencia Transversal recomendó bajo el nombre "ACP-004" (Sección 5, Veredicto: *"un ACP de alcance limitado y explícito"*) — con el alcance final, ya ejecutado, más acotado que la recomendación original (que también sugería una reconciliación DTO más amplia, ya resuelta separadamente por la Reconciliación Documental de Sprint 4.2.2, y una actualización de la Coverage Audit, que permanece fuera del alcance de este ACP).

## Problema

1. `AttemptSummaryDTO.versionCount` (Application Model v1.4, Sección 6; API Contract v1.3, Sección 5) carecía de un productor de Infraestructura confirmado — ningún documento declaraba si el campo era efectivamente calculado, ni cómo, ni por qué componente.
2. La URI documentada de `EP-18` en API Contract v1.3 (`GET /api/v1/academy/attempts/{attemptId}/feedback`) omitía el parámetro de query `versionNumber`, pese a que `QRY-05 GetVersionFeedback` (Application Model) lo exige como filtro obligatorio desde su definición original, y la implementación real de `getVersionFeedback` siempre lo requirió — omisión puramente editorial de la v1.3, sin relación con el punto 1.

## Evidencia

- `academia-domain-model-v1.1-cross-consistency-audit-2026-07-20.md`, Sección 3, Hallazgo H-02 (divergencia de DTOs Application↔API) y Sección 5 (Veredicto, recomendación de "ACP-004 — alcance limitado").
- `academia-application-model-v1.4-2026-07-20.md`, Sección 6 (`versionCount` ya documentado, sin nota de productor).
- `academia-api-contract-v1.3-2026-07-20.md`, Sección 4 (`EP-18`, URI sin `versionNumber`) y Sección 5 (`versionCount` ya documentado).
- Código real, verificado por lectura directa y por `git diff` durante la FASE 0 de Sprint 2.0 P-09: `features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort.ts` — las tres rutas de lectura de intento (`getContinuationState`, `listAttemptsByUnit`, dentro de `getStudentUnitHistory`) ya incluyen `_count: { select: { versions: true } }` en su consulta Prisma y ya mapean `versionCount: _count.versions` en `toAttemptSummaryDto`.
- `features/academy/api/response-mappers/attemptResponseMappers.ts` y `features/academy/application/dto/AttemptDto.ts` — ambos ya propagan `versionCount` end-to-end hasta el DTO HTTP consumido por el Frontend.

## Análisis

El campo `versionCount` no requiere ningún concepto de dominio nuevo: se deriva de la relación `Attempt.versions`, ya definida en el Domain Model v1.1 (Sección 3) desde su versión original — ningún Aggregate, Value Object, Policy, Specification, Command o Query nuevo es necesario para producirlo. La confirmación de su productor es, por tanto, una decisión de **infraestructura pura** (qué consulta Prisma lo calcula y cómo), no una decisión de dominio ni de aplicación. La corrección de la URI de `EP-18` es, de forma independiente, una corrección editorial (la URI real siempre exigió `versionNumber`; el texto de la v1.3 no lo reflejaba). Ninguna de las dos acciones reabre, contradice o reinterpreta ninguna resolución arquitectónica ya aprobada (A-01 a A-10) ni ningún Invariante del Domain Model.

## Documentos afectados

| Documento | Versión anterior | Versión nueva | Estado de la actualización |
|---|---|---|---|
| Application Model | 1.4 | 1.5 | **Ya ejecutada** (2026-07-29, previa a este documento) |
| API Contract | 1.3 | 1.4 | **Ya ejecutada** (2026-07-29, previa a este documento) |
| Infrastructure Model | 1.1 | 1.2 | Ejecutada por el Registro de Ejecución que acompaña a este ACP (`acp-004-registro-de-ejecucion-2026-07-29.md`) |

**No afectados (confirmado):** Domain Model (`versionCount` es un campo derivado de lectura, no una invariante ni un concepto de dominio nuevo), Functional Specification (ningún caso de uso ni regla funcional cambia), Frontend Contract, Frontend Implementation Blueprint (el consumo de `versionCount` por el Frontend ya estaba previsto desde antes de este ACP, sin cambio de diseño de pantalla).

## Dependencias

Depende de la Reconciliación Documental de Sprint 4.2.2 (Application Model v1.4, API Contract v1.3), que unificó por primera vez la forma de `AttemptSummaryDTO` entre ambos documentos — este ACP no reabre esa unificación, solo confirma el productor de uno de sus campos ya unificados. No depende de ningún otro ACP en curso.

## Impacto

Cierra el único productor de datos no confirmado que quedaba pendiente en `AttemptSummaryDTO` tras la Reconciliación Documental. Sin este cierre, el Frontend de Academia (Sprint 2.0, P-09 — "Recibir retroalimentación") no podría justificar documentalmente su derivación de `versionNumber` a partir de `matchedAttempt.versionCount` para invocar `useFeedback(attemptId, versionNumber)`. La corrección de la URI de `EP-18` no tiene impacto de comportamiento — documenta lo que la implementación ya hacía.

## Riesgos

Ningún riesgo de ruptura: cambio aditivo, ningún consumidor pierde compatibilidad (`versionCount` es opcional en el DTO desde su incorporación en v1.4/v1.3). El riesgo real —de proceso, no de arquitectura— ya se materializó y es la motivación de este mismo documento: Application Model v1.5 y API Contract v1.4 citaron "ACP-004" antes de que existiera como artefacto verificable, en tensión con la Sección 11 del Estándar ("propone o asume que un documento Frozen ya fue modificado... sin pasar por este proceso"). Se mitiga con esta formalización retroactiva y con su Registro de Ejecución, cerrando la cadena de trazabilidad completa exigida por la Sección 9 del Estándar.

## Alternativas

(a) Dejar `versionCount` documentado sin productor confirmado indefinidamente — descartada, deja abierto el riesgo señalado por H-02 de la Auditoría de Consistencia Transversal. (b) Confirmar el productor únicamente en el Infrastructure Model, sin registrar formalmente el ACP que lo autoriza — descartada, es precisamente la situación que originó este vacío de gobernanza. (c) Formalizar retroactivamente el ACP-004 completo (propuesta + registro de ejecución) y cerrar la actualización pendiente del Infrastructure Model — **adoptada**.

## Recomendación

Aprobar esta formalización retroactiva sin reabrir ni ampliar la decisión ya vigente y ya parcialmente ejecutada; ejecutar de inmediato la única actualización documental pendiente (Infrastructure Model v1.1→v1.2) mediante el Registro de Ejecución que acompaña a este documento.

## Plan de actualización (Plan de implementación)

Único paso pendiente: actualizar `academia-infrastructure-model-v1.1-2026-07-19.md` → v1.2, exclusivamente en: portada (versión, fecha de revisión), Historial de cambios (nueva fila citando ACP-004) y Sección 5 (nota sobre `AttemptRepository` produciendo `versionCount` vía `_count.versions`). Ningún otro contenido del Infrastructure Model se modifica. Responsable: Release Engineer / Documentation Integrator (mismo rol que ejecutó ACP-001/002/003).

## Plan de validación

Verificación editorial simple (Sección 10 del Estándar: no exige una nueva Coverage Audit completa, dado que este ACP no afecta Domain, Application ni Functional Specification) — confirmar que Infrastructure Model v1.2 cita ACP-004 y que su contenido coincide exactamente con el código ya implementado en `PrismaAcademyReadModelPort.ts` (verificable por lectura directa y `git diff`).

## Resultado esperado

Los tres documentos afectados (Application Model v1.5, API Contract v1.4, Infrastructure Model v1.2) citan ACP-004 de forma mutuamente consistente; existe un `acp-004-registro-de-ejecucion` verificable, con el mismo formato ya usado por ACP-001/002/003; la cadena de trazabilidad de la Sección 9 del Estándar queda completa, sin eslabones faltantes.

## Estado del ACP

**APROBADO** — formalización retroactiva de una decisión ya aprobada e implementada. La Actualización pendiente (Infrastructure Model) se ejecuta en el Registro de Ejecución que acompaña a este documento.

## Referencias cruzadas

- `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md` (marco de referencia, Secciones 6, 7, 9).
- `academia-domain-model-v1.1-cross-consistency-audit-2026-07-20.md` (origen de la recomendación, Hallazgo H-02, Sección 5).
- `academia-application-model-v1.5-2026-07-29.md` (ya cita ACP-004).
- `academia-api-contract-v1.4-2026-07-29.md` (ya cita ACP-004).
- `academia-infrastructure-model-v1.2-2026-07-29.md` (ejecución de este ACP).
- `acp-004-registro-de-ejecucion-2026-07-29.md` (Registro de Ejecución que acompaña a esta propuesta).
- Informe AFR-038 (Resolución formal de hallazgos de la AFI, Sprint 2.0), hallazgos H-02 y H-03.
