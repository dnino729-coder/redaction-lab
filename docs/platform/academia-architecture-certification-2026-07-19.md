# ACADEMIA — Auditoría de Certificación Arquitectónica (post-ACP-001)

**Rol:** Chief Architecture Auditor, Rédaction Lab.
**Naturaleza:** auditoría de certificación — no de descubrimiento. No se diseña, no se propone arquitectura, no se optimiza, no se modifica ningún documento.
**Documentos verificados:** Product Blueprint, Arquitectura General, Platform Core Foundation (Frozen); Domain Model (Frozen); Application Model v1.1; Functional Specification v1.2; Infrastructure Model v1.1; API Contract v1.1; Architecture Change Management Standard v1.0; ACP-001 (Executed); `acp-001-registro-de-ejecucion-2026-07-19.md`.
**Método:** verificación directa contra el contenido íntegro de los cuatro documentos actualizados (no contra resúmenes ni contra el propio Registro de Ejecución del ACP-001, que se audita como cualquier otro artefacto, no se asume correcto).

---

## VALIDACIÓN 1 — Coverage Audit original → ACP-001 → Documentos actualizados

### F-01 — Pasos previos del recorrido (CU-02)

- **Verificado en Application Model v1.1:** `CMD-16 AdvanceStep` y `CMD-17 VerifyComprehension` existen, con precondiciones, flujo y errores documentados; cubren los 5 pasos de contenido y el paso de verificación de comprensión.
- **Verificado en Infrastructure Model v1.1:** nota explícita confirmando que `AttemptRepository.save` cubre la persistencia sin componente nuevo.
- **Verificado en API Contract v1.1:** `EP-21` y `EP-22` existen, con trazabilidad 1:1 a `CMD-16`/`CMD-17`.
- **Verificado en Functional Specification v1.2:** CU-02 permanece sin cambios (no requería cambio — ya describía correctamente el requisito desde v1.0).

**Conclusión: F-01 queda completamente resuelto en las cuatro capas, sin excepción.**

### F-02 — Representación de "grupo" (CU-09, CU-11)

- **Verificado en Functional Specification v1.2:** toda mención de "grupo" fue reemplazada por "selección múltiple de estudiantes"; ninguna referencia residual a `Group`/`GroupId` en el cuerpo del documento.
- **Verificado en API Contract v1.1:** la nota de `EP-07`/`EP-08` fue actualizada; el Pendiente #2 fue retirado; `EP-20` opera a nivel individual.
- **Verificado en Application Model v1.1 (evidencia directa del documento, no de un resumen):** `QRY-08 — GetGroupProgressSummary` **permanece sin modificar**, con filtro `groupId` y su propio marcador `PENDIENTE DE DECISIÓN DE ARQUITECTURA` intacto. `CMD-11 — AssignUnitToStudent` **permanece con su marcador `PENDIENTE DE DECISIÓN DE ARQUITECTURA` sin cambios**, incluyendo el texto literal "este caso de uso no puede orquestarse sobre el Domain Model congelado sin inventar comportamiento de dominio no aprobado" — sin actualizar pese a que la Functional Specification v1.2 y el API Contract v1.1 ya presentan CU-11 como un flujo resuelto y `EP-08` como un endpoint operativo.

**Conclusión: F-02 NO queda completamente resuelto.** Está resuelto en Functional Specification y API Contract (las dos capas que ACP-001-B autorizó tocar), pero el Application Model — que define si un Command es realmente orquestable — sigue afirmando literalmente que `CMD-11` no puede ejecutarse. Esto no es una omisión menor: significa que `EP-08` (API Contract) promete un endpoint que, según el propio Application Model, no tiene una orquestación válida detrás. Ver Validación 4 (Error Crítico preexistente).

### F-09 — Biblioteca de Modelos (contenido estático vs. IA)

- **Verificado en Functional Specification v1.2:** corregida — el comentario comparativo es contenido curatorial del Administrador; retirado de la lista de decisiones de IA.
- **Verificado en Infrastructure Model v1.1:** nota explícita del renombrado `aiCommentary → curatorialComment`.
- **Verificado en API Contract v1.1:** `ModelExampleDTO.curatorialComment` (renombrado), con nota explicando la naturaleza estática del campo.
- **Verificado en Application Model v1.1 (evidencia directa del documento):** el campo **permanece nombrado `aiCommentary`** tanto en la tabla consolidada de Commands (`CreateModelExample`, parámetro `aiCommentary`) como en la definición de `ModelExampleDTO` (Sección 6) — **sin renombrar**.

**Conclusión: F-09 NO queda completamente resuelto.** Resuelto en Functional Specification, Infrastructure Model y API Contract; **no resuelto en Application Model**, que sigue usando el nombre de campo que originó la ambigüedad. Este residuo **no fue registrado** en la sección "Fuera del alcance de ACP-001" del `acp-001-registro-de-ejecucion-2026-07-19.md` — omisión del propio registro de ejecución, detectada en esta certificación.

---

## VALIDACIÓN 2 — Recálculo de cobertura

**Método:** idéntico al de la Coverage Audit original (conteo directo por capa, sin fórmulas nuevas); toda variación se explica por evidencia verificada en esta auditoría, no por reestimación.

| Capa | Original | Recalculada | Variación | Explicación |
|---|---|---|---|---|
| **Funcional** | 72.7% completa / 18.2% parcial / 9.1% sin cobertura | **90.9% completa / 9.1% parcial / 0% sin cobertura** | +18.2 pp completa | CU-02 pasa de "sin cobertura" a "completa" (F-01 cerrado). CU-09 pasa de "parcial" a "completa" (ya no requiere agregación de grupo). CU-11 permanece "parcial" — la Functional Specification lo describe completo, pero `CMD-11` en Application Model sigue bloqueado (ver F-02 arriba). |
| **Domain** | 89.8% (44 ✓ / 4 ⚠ / 1 ✗ de 49) | **89.8% (sin cambio)** | 0 | El Domain Model no fue tocado por ningún sub-ACP — verificado, ni una sección modificada. |
| **Application** | 100% (24/24, Matriz B+C) | **96.2% (25/26)** | −3.8 pp | Universo ampliado a 26 (24 originales + `CMD-16`/`CMD-17`). De los 26, `CMD-11` **falla Matriz B**: su propio texto declara que no puede ejecutarse sobre los Aggregates existentes sin inventar comportamiento de dominio — condición que la Coverage Audit original no detectó porque se auditó sin el texto íntegro del Application Model (evaluado entonces como "N/A por diseño", una lectura que esta auditoría, con el documento completo a la vista, corrige). Esta variación **no es una regresión causada por ACP-001** — es una corrección de una evaluación previa inexacta, hecha posible por el acceso al texto completo del documento durante la ejecución del ACP. |
| **Infrastructure** | 100% | **100% (sin cambio)** | 0 | `AttemptRepository`/`ModelExampleRepository` absorben los cambios de ACP-001-A/C sin extender su firma; ningún componente nuevo requerido; ninguna decisión del IRB reabierta. |
| **API** | 100% | **100% (sin cambio)** | 0 | Los 26 Commands/Queries de Application Model v1.1 tienen endpoint o exclusión deliberada — estructuralmente completo. (La contradicción de `CMD-11`/`EP-08` es un hallazgo de **consistencia entre documentos**, no de **cobertura de mapeo**; se reporta en Validación 4, no aquí, para no medir dos veces el mismo hallazgo con dos varas distintas.) |
| **TOTAL** | 92.5% | **95.4%** *(promedio simple de las cinco cifras anteriores, mismo método que la auditoría original)* | +2.9 pp | Mejora neta pese a la corrección a la baja en Application, por el cierre completo de F-01 y el cierre parcial de F-02/F-09. |

---

## VALIDACIÓN 3 — Elementos "FUERA DEL ALCANCE DE ACP-001"

| Elemento | Documento afectado | Impacto | ¿Bloquea implementación? | ¿Requiere ACP-002? |
|---|---|---|---|---|
| `CMD-11 AssignUnitToStudent` sin actualizar (texto de bloqueo intacto) | Application Model v1.1 | Alto — contradice directamente a `EP-08` (API Contract) y a CU-11 (Functional Specification), ambos ya presentados como resueltos | **Bloquea la implementación del Backend de `CMD-11`/`EP-08`** específicamente (un ingeniero que siga el Application Model al pie de la letra no podría implementarlo); **no bloquea Frontend Contract**, que consume el API Contract, no el Application Model | **Sí — requiere ACP-002** antes de implementar el Backend de este Command |
| `QRY-08 GetGroupProgressSummary` con filtro `groupId` sin retirar | Application Model v1.1 | Medio — contradice la decisión oficial de que no existe `GroupId`; la Query queda vestigial (ninguna capa superior la referencia ya) | No bloquea Frontend Contract (ningún endpoint de API Contract la expone); podría inducir a un desarrollador de Backend a implementar una Query que ya no corresponde al diseño vigente | **Sí — requiere ACP-002** (retirar o reformular la Query) |
| `ModelExampleDTO.aiCommentary` / `CMD-12` parámetro `aiCommentary` sin renombrar | Application Model v1.1 | Medio — contradice el nombre ya vigente (`curatorialComment`) en Infrastructure Model v1.1 y API Contract v1.1 | No bloquea Frontend Contract (API Contract ya usa el nombre correcto); si el Backend implementa literalmente el Application Model, el campo persistido tendría un nombre distinto al expuesto por la API, exigiendo un mapeo manual no documentado | **Sí — requiere ACP-002** (renombrado, cambio editorial de bajo riesgo) |
| Pendiente #3 — Umbrales de rate limiting | API Contract v1.1 | Bajo — no definido en ningún documento Frozen | No bloquea Frontend Contract ni Backend; es un parámetro operativo, no estructural | No obligatorio antes de Frontend Contract — recomendado a nivel de Platform Core en su propio ciclo |
| Pendiente #4 — Vocabulario del campo `code` de error | API Contract v1.1 | Bajo — depende del Error Catalog del Platform Core, aún no diseñado como documento individual | No bloquea; el envoltorio de error ya está definido, solo falta el vocabulario final de códigos | No obligatorio antes de Frontend Contract |
| F-03, F-04, F-05, F-06, F-08, F-10 (hallazgos DOCUMENTACIÓN/AMBIGÜEDAD de bajo impacto, Coverage Audit original) | Functional Specification, Domain Model, Application Model, Platform Core Foundation (según cada hallazgo) | Bajo, en todos los casos (ya clasificados así en la Coverage Audit original) | Ninguno bloquea | No obligatorios; agrupables en un futuro ACP de mantenimiento documental si se desea, sin urgencia |

**Nota de certificación:** de los seis elementos "fuera de alcance" con impacto Medio/Alto, los tres primeros (`CMD-11`, `QRY-08`, `aiCommentary`) comparten la misma causa raíz — el Application Model fue excluido, en el propio ACP-001 tal como fue aprobado, de los documentos afectados por ACP-001-B y ACP-001-C. Esta auditoría no cuestiona esa decisión de alcance (no le corresponde rediseñar nada), pero certifica que, como consecuencia directa de ella, el Application Model quedó desalineado del resto del contrato en esos tres puntos específicos.

---

## VALIDACIÓN 4 — Consistencia entre documentos

| Verificación | Resultado |
|---|---|
| ✓ Application Model v1.1 es consistente con Domain | **Cumple**, con una salvedad: `CMD-11` declara no poder ejecutarse sobre los Aggregates ya definidos por el Domain Model — no es una inconsistencia *con* el Domain Model (no lo contradice ni le exige nada), sino una declaración de imposibilidad de orquestación que el propio Application Model reconoce. `CMD-16`/`CMD-17` sí son plenamente consistentes: operan sobre una capacidad que el Domain Model (enum `UnitStep` de 11 valores, precondición de `CMD-02` ya referenciando RN-2 desde v1.0) ya sostenía implícitamente. |
| ✓ Functional Specification v1.2 es consistente con Application | **NO cumple, en un punto puntual.** CU-11 (Functional Specification v1.2) describe un flujo de recomendación plenamente operativo; `CMD-11` (Application Model v1.1) declara que ese mismo flujo no puede orquestarse. Es una **contradicción directa, no una imprecisión**. El resto de la Functional Specification (CU-01 a CU-10) es consistente con el Application Model. |
| ✓ Infrastructure Model v1.1 es consistente con Application | **Cumple**, con la misma salvedad de `CMD-11`: `TeacherRecommendationRepository` fue diseñado asumiendo que `CMD-11` es "recomendar, metadato" (ya resuelto por el ciclo ARB), sin depender del texto bloqueado del Application Model — Infrastructure Model es internamente coherente consigo mismo y con la Functional Specification/API Contract, pero no con el Application Model en este punto específico. |
| ✓ API Contract v1.1 es consistente con Application | **NO cumple, en el mismo punto.** `EP-08` se documenta como un endpoint operativo con dependencia declarada en `CMD-11`, pero `CMD-11` (Application Model) declara explícitamente que no es orquestable. Esta es la inconsistencia de mayor severidad detectada en esta certificación — clasificada **ERROR CRÍTICO** (preexistente a ACP-001, no causada por él; ver Resultado #4). |
| ✓ Platform Core continúa siendo válido | **Cumple.** Ningún sub-ACP tocó Notification Catalog, Permission Catalog ni ningún otro componente del Platform Core Foundation. `ACADEMY_FEEDBACK_READY` sigue siendo el único tipo de notificación referenciado, sin cambios, en Infrastructure Model v1.1 y API Contract v1.1. |

---

## VALIDACIÓN 5 — Integridad general del contrato

| Verificación | Resultado |
|---|---|
| No existen requisitos funcionales sin representación técnica | **Cumple, salvo CU-11** (representación técnica existente en Functional Spec/API Contract/Infrastructure, pero no válida en Application Model — ver arriba). |
| No existen Commands sin endpoint | **Cumple.** Los 3 Commands internos (`CMD-04`, `CMD-08`, `CMD-15`) están documentados como exclusión deliberada; los 14 restantes (incluidos `CMD-16`/`CMD-17`) tienen endpoint. |
| No existen endpoints sin caso de uso | **Cumple.** Los 22 endpoints (incluidos `EP-21`/`EP-22`) trazan a un caso de uso de la Functional Specification v1.2. |
| No existen DTOs huérfanos | **Cumple en cuanto a propósito**, con una **observación** no ligada a F-01/F-02/F-09: `ModelExampleDTO` en Application Model v1.1 incluye un campo `rating` ausente del `ModelExampleDTO` de API Contract v1.1, y el API Contract incluye `status` (`ACTIVE`/`RETIRED`) ausente del DTO de Application Model. Es una discrepancia de forma preexistente a ACP-001 (no originada por este ciclo), fuera del alcance de F-01/F-02/F-09; se registra como **OBSERVACIÓN**, no bloquea nada, no se resuelve aquí. |
| No existen referencias contradictorias entre documentos | **NO cumple de forma absoluta** — ver `CMD-11`/`EP-08` (ERROR CRÍTICO), `QRY-08`/`GroupId` (INCONSISTENCIA) y `aiCommentary`/`curatorialComment` (INCONSISTENCIA), todas ya detalladas arriba. |

---

## CLASIFICACIÓN CONSOLIDADA DE HALLAZGOS DE ESTA CERTIFICACIÓN

| ID | Hallazgo | Clasificación |
|---|---|---|
| C-01 | `CMD-11` (Application Model) contradice a `EP-08` (API Contract) y a CU-11 (Functional Specification) — el primero declara imposible lo que los otros dos presentan como resuelto | **ERROR CRÍTICO** (preexistente, no causado por ACP-001; expuesto por esta certificación) |
| C-02 | `QRY-08 GetGroupProgressSummary` (Application Model) conserva `groupId`, contradiciendo la decisión oficial de que no existe `GroupId` | **INCONSISTENCIA** |
| C-03 | `ModelExampleDTO.aiCommentary`/`CMD-12.aiCommentary` (Application Model) no fueron renombrados a `curatorialComment`, contradiciendo Infrastructure Model v1.1 y API Contract v1.1 | **INCONSISTENCIA** |
| C-04 | El Registro de Ejecución de ACP-001 no incluyó C-03 en su lista de "Fuera del alcance" | **OBSERVACIÓN** (defecto del propio registro de ejecución, no del contrato arquitectónico) |
| C-05 | `ModelExampleDTO` difiere en campos (`rating` vs. `status`) entre Application Model y API Contract | **OBSERVACIÓN** (preexistente, no ligada a F-01/F-02/F-09) |
| C-06 | Corrección de la evaluación de Matriz B para `CMD-11` respecto a la Coverage Audit original | **OBSERVACIÓN** (corrección metodológica, no un defecto nuevo del contrato) |
| C-07 | F-01 verificado cerrado en las cuatro capas | **NO PROBLEMA** |
| C-08 | Platform Core Foundation verificado sin cambios ni afectación | **NO PROBLEMA** |

---

## RESULTADO

### 1. ¿ACP-001 resolvió completamente F-01?
**SI.** `CMD-16`, `CMD-17`, `EP-21`, `EP-22` y la nota de Infrastructure Model están verificados, presentes y consistentes entre sí en las cuatro capas. Ninguna referencia residual al vacío original.

### 2. ¿ACP-001 resolvió completamente F-02?
**NO.** Resuelto en Functional Specification v1.2 y API Contract v1.1. **No resuelto en Application Model v1.1**, donde `CMD-11` conserva su marcador de bloqueo original y `QRY-08` conserva `groupId` — ambos en contradicción directa con la decisión oficial ya vigente en el resto del contrato.

### 3. ¿ACP-001 resolvió completamente F-09?
**NO.** Resuelto en Functional Specification v1.2, Infrastructure Model v1.1 y API Contract v1.1. **No resuelto en Application Model v1.1**, donde el campo permanece nombrado `aiCommentary` en `CMD-12` y en `ModelExampleDTO`.

### 4. ¿Existe algún nuevo ERROR CRÍTICO como consecuencia de ACP-001?
**NO, ninguno nuevo.** El único ERROR CRÍTICO detectado en esta certificación (`CMD-11` vs. `EP-08`/CU-11, hallazgo C-01) **ya existía antes de ACP-001** — tanto Application Model v1.0 como API Contract v1.0 ya presentaban esta misma contradicción. ACP-001 no lo creó; tampoco lo cerró, porque el Application Model quedó fuera del alcance autorizado de ACP-001-B. Se certifica su persistencia, no su origen en este ciclo.

### 5. ¿Los elementos "Fuera del alcance" bloquean el Frontend Contract?
**NO.** Frontend Contract se construye contra el API Contract v1.1, que es internamente coherente y no expone `groupId` ni `aiCommentary`. Los tres residuos con impacto Alto/Medio (`CMD-11`, `QRY-08`, `aiCommentary`) afectan exclusivamente la implementación del **Backend** cuando este siga el Application Model al pie de la letra — no afectan el diseño ni la construcción de pantallas de Frontend.

### 6. ¿Es necesario un ACP-002 antes de implementar?
**RECOMENDADO.**
**Justificación:** no es `OBLIGATORIO` para iniciar Frontend Contract (pregunta 5, NO bloquea) ni para continuar la implementación de Backend de los Commands/Queries ya consistentes (`CMD-01` a `CMD-10`, `CMD-16`, `CMD-17`, `CMD-12` a `CMD-14` una vez corregido el nombre de campo). Tampoco es `NO NECESARIO`, porque existe un ERROR CRÍTICO verificado (C-01) que bloquearía específicamente la implementación de Backend de `CMD-11`/`EP-08` si se abordara antes de resolverlo. Se recomienda un ACP-002 acotado (tipo Aplicación, impacto Bajo-Medio, tres cambios puramente aditivos/editoriales sobre Application Model: resolver `CMD-11`, retirar o reformular `QRY-08`, renombrar `aiCommentary`) antes de que el Backend llegue a esos tres componentes específicos — no antes de iniciar Frontend Contract ni antes de continuar con el resto del Backend.

---

## DICTAMEN FINAL

**B) MINOR CHANGE REQUIRED**

**Justificación con evidencia:** F-01 está certificado como completamente cerrado en las cuatro capas (Validación 1). F-02 y F-09 están cerrados en tres de las cuatro capas cada uno — Functional Specification, Infrastructure Model (donde aplica) y API Contract son plenamente consistentes entre sí y con las decisiones oficiales de ACP-001-B/C — pero el Application Model v1.1, verificado directamente contra su texto íntegro, conserva tres elementos sin actualizar (`CMD-11`, `QRY-08`, `aiCommentary`) que contradicen ese consenso ya alcanzado en el resto del contrato. Esto no constituye una falla estructural del ciclo de documentación — no invalida el Domain Model, no reabre ninguna resolución A-01–A-10, y no impide iniciar Frontend Contract (pregunta 5) — pero tampoco permite certificar cobertura arquitectónica completa (opción A) mientras el propio Application Model se contradiga con el resto del contrato en un Command que el API Contract ya expone como operativo (`EP-08`). El defecto es de alcance, no de diseño: una corrección **menor** (tres cambios editoriales/aditivos, sin tocar Domain Model, sin rediseñar nada) sobre un único documento (Application Model) cierra por completo F-02 y F-09, habilitando entonces sí una certificación plena en la próxima Coverage Audit.
