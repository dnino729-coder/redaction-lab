# ACP-002 — Registro de Ejecución (Documentation Synchronization)

**Rol:** Documentation Synchronization Engineer, Rédaction Lab. No arquitecto, no auditor, no diseñador. Ejecución mecánica del ACP-002 aprobado, sin reinterpretar requisitos ni ampliar alcance.
**Fecha de ejecución:** 2026-07-20.
**Origen:** Auditoría de Certificación (`academia-architecture-certification-2026-07-19.md`), dictamen `B) MINOR CHANGE REQUIRED` — tres residuos exclusivamente de sincronización documental en Application Model v1.1: `CMD-11`, `QRY-08`/`groupId`, `aiCommentary`.

---

## Documentos actualizados

| Documento | ¿Requería cambio? | Acción |
|---|---|---|
| **Application Model** | Sí — único documento con referencias residuales activas | Actualizado: v1.1 → **v1.2** |
| Functional Specification v1.2 | No — verificado sin referencias residuales a `Group`/`GroupId`/`aiCommentary`/`comparativeComment` (solo texto explicativo ya correcto, heredado de ACP-001-B/C) | Sin cambios |
| Infrastructure Model v1.1 | No — verificado sin referencias residuales; `TeacherRecommendationRepository` y el renombrado `curatorialComment` ya estaban correctamente documentados desde ACP-001-C | Sin cambios |
| API Contract v1.1 | No — verificado sin referencias residuales; `EP-08`, `EP-20` y `ModelExampleDTO.curatorialComment` ya estaban correctamente documentados desde ACP-001 | Sin cambios |
| Domain Model, Product Blueprint, Arquitectura General, Platform Core Foundation | No — fuera del alcance de ACP-002 por diseño | Sin cambios (confirmado, ver Validación) |

---

## Versiones finales

| Documento | Versión anterior | Versión nueva |
|---|---|---|
| Application Model | 1.1 | **1.2** |
| Functional Specification | 1.2 (FROZEN) | 1.2 (sin cambio) |
| Infrastructure Model | 1.1 | 1.1 (sin cambio) |
| API Contract | 1.1 | 1.1 (sin cambio) |

---

## Control de Cambios — Application Model v1.1 → v1.2

- **Versión anterior:** 1.1.
- **Nueva versión:** 1.2.
- **Secciones modificadas:** Historial de cambios (nueva fila); `CMD-11 — AssignUnitToStudent` (reescrita completa); Sección 4, fila `AssignUnitToStudent`; Sección 4, fila `CreateModelExample` (parámetro renombrado); `QRY-08` (reemplazada por nota de retiro); Sección 5, fila `GetGroupProgressSummary` (tachada/retirada) y fila `GetStudentProgressSummary` (nota añadida); Sección 6, `ModelExampleDTO` (campo renombrado); `CMD-13`, Propósito (frase corregida); Sección 12 (seguridad, referencia a `GetGroupProgressSummary` corregida); Sección 10 (paginación, nota corregida); checklist final (ítem `CMD-11`/`QRY-08` corregido); cierre del documento (nota "Fuera del alcance de ACP-001" reemplazada por confirmación de resolución + nueva nota "Fuera del alcance de ACP-002").
- **Motivo del cambio:** ejecución de ACP-002-A (alinear `CMD-11` con la decisión oficial de "recomendación pedagógica"), ACP-002-B (eliminar `Group`/`GroupId`/`groupId`, retirar `QRY-08`) y ACP-002-C (unificar `aiCommentary` → `curatorialComment`).
- **Compatibilidad hacia atrás:** total. Ningún Command, Query o DTO consumido por Infrastructure Model v1.1 o API Contract v1.1 cambia de firma — `CMD-11` pasa de "bloqueado" a "orquestable" usando un Repository (`TeacherRecommendationRepository`) que ya existía en el Infrastructure Model v1.1 sin modificación; `QRY-08` nunca tuvo un endpoint que la consumiera (verificado: ningún `EP-XX` la declaraba como dependencia real de "grupo"); el campo renombrado (`aiCommentary` → `curatorialComment`) ya coincidía con el nombre usado por Infrastructure Model v1.1 y API Contract v1.1 desde ACP-001-C — este cambio corrige el único documento que aún no lo reflejaba.
- **Confirmación de que el cambio deriva exclusivamente del ACP-002:** sí. Ninguna regla de negocio, Aggregate, Policy, Specification o Domain Event fue creado, alterado o eliminado; el Domain Model no fue tocado; no se crearon Commands, Queries, DTOs ni Endpoints nuevos — `CMD-11` y `QRY-08` ya existían como identificadores desde v1.0 (uno se completa, el otro se retira formalmente, sin reasignar su número).

---

## Evidencia de sincronización

Verificación por grep, ejecutada tras la edición, sobre el documento actualizado (`academia-application-model-v1.2-2026-07-19.md`):

- `groupId` / `GroupId`: **0 ocurrencias** como filtro o parámetro activo (las únicas menciones restantes son explicativas, dentro de la nota de retiro de `QRY-08` y del historial de cambios, describiendo la decisión ya tomada).
- `aiCommentary`: **0 ocurrencias** como nombre de campo activo (las únicas menciones restantes son explicativas, en el historial de cambios y en la nota "antes `aiCommentary`").
- `PENDIENTE DE DECISIÓN DE ARQUITECTURA` asociado a `CMD-11` o a "no puede orquestarse": **0 ocurrencias**.
- Referencias cruzadas verificadas por lectura directa (no por resumen) contra Functional Specification v1.2 (CU-11, CU-09), API Contract v1.1 (`EP-08`, `EP-20`, `ModelExampleDTO`) e Infrastructure Model v1.1 (`TeacherRecommendationRepository`, nota de renombrado de `ModelExampleRepository`): coinciden con el texto ahora vigente en Application Model v1.2.
- Sincronización de archivo confirmada mediante `diff -q` entre la copia del repositorio anidado (`redaction-lab/docs/audits/`) y la copia del directorio raíz espejo (`docs/audits/`): **idénticas**.

---

## CONSISTENCY VALIDATION (limitada a los 6 elementos indicados — no es una Coverage Audit)

| Elemento | Application Model v1.2 | Functional Spec v1.2 | Infrastructure Model v1.1 | API Contract v1.1 | Coherente entre los 4 |
|---|---|---|---|---|---|
| **CMD-11** | Recomendación pedagógica, sin efecto de estado, usa `TeacherRecommendationRepository`, sin Aggregate | CU-11: "recomendar unidad a uno o varios estudiantes", sin efecto de estado | No aplica directamente (repositorio ya definido) | `EP-08`: recomendar, sin efecto de estado, `TeacherRecommendationDTO` | **Sí** |
| **QRY-08** | Retirada; equivalencia funcional documentada vía `QRY-07` repetida | CU-09: "no existe un cálculo agregado nativo de grupo" | Sin referencia a `QRY-08` (nunca existió Repository de grupo) | Ningún endpoint expone `groupId`; `EP-20` es por estudiante | **Sí** |
| **EP-08** | `CMD-11` ahora orquestable, coincide con el contrato de `EP-08` (`unitId` + `studentId` por estudiante) | CU-11 coincide | `TeacherRecommendationRepository` ya soporta este flujo | Definido, `201 Created`, `TeacherRecommendationDTO` | **Sí** |
| **ModelExample** | `curatorialComment` (antes `aiCommentary`) en `CMD-12`/`CMD-13`/DTO | CU-08: contenido curatorial estático del Administrador | `ModelExampleRepository`: campo `curatorialComment` (renombrado desde ACP-001-C) | `ModelExampleDTO.curatorialComment`, `EP-09`/`EP-10` | **Sí** *(con una discrepancia de forma no cubierta por ACP-002 — ver Fuera del alcance: campos `rating`/`status` no coinciden entre Application Model y API Contract)* |
| **Terminología `curatorialComment`** | Único nombre usado en todo el documento | No aplica directamente (documento funcional, sin nombres de campo) | Único nombre usado | Único nombre usado | **Sí** |
| **Selección múltiple de `StudentId`** | `CMD-11` y `QRY-07` documentan invocación repetida por `studentId`, sin `Group`/`GroupId` | CU-09/CU-11: selección múltiple orquestada por el Frontend | Sin componente de dominio para "grupo" | `EP-07`/`EP-08`/`EP-20`: invocación por estudiante, sin parámetro de grupo | **Sí** |

**Confirmación:** los seis elementos son coherentes entre los cuatro documentos oficiales, con una única discrepancia de forma ya registrada como fuera de alcance (campos `rating`/`status` del `ModelExampleDTO`, ver abajo) — no relacionada con `Group`/`GroupId`/`aiCommentary`/`CMD-11`.

---

## FUERA DEL ALCANCE DE ACP-002 (registrado, no resuelto)

1. **`ModelExampleDTO.rating` vs. `ModelExampleDTO.status`:** Application Model v1.2 incluye `rating` (excelente/con errores), ausente en el `ModelExampleDTO` del API Contract v1.1; API Contract v1.1 incluye `status` (`ACTIVE`/`RETIRED`), ausente en Application Model. Discrepancia de forma preexistente a ACP-001 y ACP-002, ya señalada como OBSERVACIÓN en la Auditoría de Certificación. No es una referencia a `Group`/`GroupId`/`aiCommentary`/`CMD-11` — fuera del alcance autorizado de este ACP.
2. **Referencia desactualizada de conteo en API Contract v1.1** (Sección 1, "Qué resuelve" y nota de trazabilidad de `EP-08`): cita "Application Model v1.0" y "15 Commands/9 Queries" — cifras ya superadas por Application Model v1.1/v1.2 (17 Commands, 8 Queries activas tras el retiro de `QRY-08`). Es un cambio sobre el API Contract, no autorizado por ACP-002. Registrado para un futuro ACP editorial.
3. **Etiquetas de dependencia `QRY-XX` posiblemente desalineadas en API Contract v1.1 (`EP-17` a `EP-20`):** se observó, al verificar la Consistency Validation, que `EP-19` ("Consultar Biblioteca de Modelos") declara como dependencia `QRY-08` — identificador que en Application Model corresponde a `ListModelExamplesByTextType` es en realidad `QRY-06`, no `QRY-08` (ahora retirada). De forma similar, `EP-18` cita `QRY-07` y `EP-20` cita `QRY-09`, ninguno de los cuales coincide con el nombre funcional del endpoint descrito. Esto sugiere un desfase sistemático de numeración en las "Dependencias" de `EP-17`–`EP-20` del API Contract, preexistente a ACP-001 y ACP-002 (no causado por esta ejecución). No fue autorizado por ACP-002, que no incluye al API Contract en su alcance salvo verificación. Se registra como hallazgo nuevo para un futuro ACP de corrección editorial — de impacto bajo (no afecta la URI, el método ni el contrato de datos de ningún endpoint, solo la etiqueta de trazabilidad interna).

Ninguno de los tres bloquea Frontend Contract ni la implementación de Backend de los elementos ya sincronizados por ACP-002.

---

## VALIDACIÓN

| Verificación | Resultado |
|---|---|
| ✓ No se modificó el Domain Model | **Cumple** — cero ediciones al archivo del Domain Model. |
| ✓ No se modificó Platform Core | **Cumple** — cero ediciones a Platform Core Foundation ni al Notification Catalog. |
| ✓ No se modificó Infrastructure | **Cumple** — Infrastructure Model v1.1 no requería cambios (verificado, sin residuos); no fue editado. |
| ✓ No aparecieron nuevos Commands | **Cumple** — `CMD-11` ya existía desde v1.0; se completó su definición, no se creó un Command nuevo. |
| ✓ No aparecieron nuevos DTOs | **Cumple** — no se creó `TeacherRecommendationDTO` en Application Model (ya existía únicamente en API Contract v1.1); se referenció por nombre, sin definirlo como entrada nueva de la Sección 6. |
| ✓ No aparecieron nuevos Endpoints | **Cumple** — API Contract v1.1 no fue modificado. |
| ✓ No aparecieron nuevos casos de uso | **Cumple** — Functional Specification v1.2 no fue modificada; CU-11/CU-09 ya existían. |
| ✓ No se alteró ningún flujo funcional | **Cumple** — el comportamiento de `CMD-11` (recomendación, sin efecto de estado) y de la consulta de progreso por selección múltiple (invocación repetida por estudiante) ya estaba definido en Functional Specification v1.2 y API Contract v1.1 desde ACP-001; Application Model solo se puso al día con ese comportamiento ya vigente. |
| ✓ No existe ninguna referencia residual a `GroupId` | **Cumple** — verificado por grep, 0 ocurrencias activas. |
| ✓ No existe ninguna referencia residual a `aiCommentary` | **Cumple** — verificado por grep, 0 ocurrencias activas. |
| ✓ `CMD-11` queda completamente alineado con la Functional Specification y el API Contract | **Cumple** — ver Consistency Validation, fila `CMD-11`/`EP-08`. |

---

## RESULTADO

**Documentos actualizados:** Application Model (único).
**Versiones finales:** Application Model v1.2; Functional Specification v1.2 (sin cambio); Infrastructure Model v1.1 (sin cambio); API Contract v1.1 (sin cambio).
**Historial de cambios:** registrado en la cabecera de Application Model v1.2 (fila 1.2, ACP-002-A/B/C) y en este documento.
**Evidencia de sincronización:** verificada por grep y por `diff -q` entre repositorio anidado y espejo raíz — ver sección correspondiente arriba.
**Confirmación:** ACP-002 quedó **completamente ejecutado** dentro de su alcance autorizado (ACP-002-A, ACP-002-B, ACP-002-C). Los tres hallazgos de la Auditoría de Certificación (F-02/F-09 residuales en Application Model, y el gap de registro del propio Registro de Ejecución de ACP-001) quedan cerrados. Se registraron tres hallazgos nuevos, no autorizados por este ACP, como "Fuera del alcance de ACP-002" — ninguno bloquea Frontend Contract.

---

## DICTAMEN FINAL

**A) ACP-002 EXECUTED SUCCESSFULLY — ACADEMIA ARCHITECTURE CERTIFIED — READY FOR FRONTEND CONTRACT**

**Justificación con evidencia documental:** los tres cambios autorizados por ACP-002 fueron ejecutados en su totalidad y verificados por grep directo sobre el documento resultante: cero referencias activas a `groupId`/`GroupId`, cero referencias activas a `aiCommentary`, cero marcadores `PENDIENTE DE DECISIÓN DE ARQUITECTURA` asociados a `CMD-11`. La Consistency Validation confirma que los seis elementos exigidos (`CMD-11`, `QRY-08`, `EP-08`, `ModelExample`, terminología `curatorialComment`, selección múltiple de `StudentId`) son coherentes entre los cuatro documentos oficiales. Los tres hallazgos nuevos detectados durante la ejecución (discrepancia `rating`/`status` del DTO, referencia desactualizada de conteo en API Contract, y el desfase de numeración `QRY-XX` en `EP-17`–`EP-20`) son, por su propia naturaleza, de impacto bajo, no afectan ningún endpoint, Command o Query ya certificado como coherente, y no bloquean el inicio de Frontend Contract — quedan registrados para un futuro ACP de mantenimiento editorial, no como condición de esta certificación.
