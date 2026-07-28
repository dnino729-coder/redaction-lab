# ACP-001 — Registro de Ejecución

**Rol:** Release Engineer / Documentation Integrator, Rédaction Lab.
**ACP ejecutado:** ACP-001 — Academia Coverage Completion (Estado previo: `APPROVED`).
**Fecha de ejecución:** 2026-07-19.
**Marco de referencia:** `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md` — Sección 6 (Flujo oficial de aprobación), pasos 6 "Actualización" y 7 "Auditoría".

Este documento certifica la ejecución completa de ACP-001-A, ACP-001-B y ACP-001-C sobre los documentos autorizados. No se tomó ninguna decisión nueva — cada cambio aplicado deriva exclusivamente de lo ya aprobado en `redaction-lab-architecture-change-management-standard-v1.0-2026-07-19.md`, Sección 14.

---

## CONTROL DE CAMBIOS POR DOCUMENTO

### `academia-application-model` — v1.0 → v1.1

| Campo | Valor |
|---|---|
| Versión anterior | 1.0 |
| Nueva versión | 1.1 |
| Motivo del cambio | ACP-001-A |
| Secciones modificadas | Encabezado (Historial de cambios); Sección 3 (Commands — añadidos `CMD-16 AdvanceStep`, `CMD-17 VerifyComprehension`); Sección 4 (tabla consolidada de Commands); Sección 9 (Transacciones); Sección 10 (Idempotencia); Sección 16 (Checklist) |
| Impacto | Alto (introduce dos Commands nuevos; ningún Command, Query, DTO, Policy o Aggregate preexistente fue alterado) |
| Compatibilidad hacia atrás | Total — cambio puramente aditivo, ningún consumidor existente (Infrastructure Model v1.0, API Contract v1.0) se rompe |
| Confirmación de origen | Deriva exclusivamente de ACP-001-A. `CMD-11` y `QRY-08` **no fueron tocados** — registrados como `FUERA DEL ALCANCE DE ACP-001` (ver más abajo) |

### `academia-infrastructure-model` — v1.0 → v1.1

| Campo | Valor |
|---|---|
| Versión anterior | 1.0 |
| Nueva versión | 1.1 |
| Motivo del cambio | ACP-001-A, ACP-001-C |
| Secciones modificadas | Encabezado (Historial de cambios, referencia a Application Model v1.1); Sección 5 (nota sobre `AttemptRepository` cubriendo `CMD-16`/`CMD-17` sin componente nuevo; nota sobre renombrado de campo en `ModelExampleRepository`) |
| Impacto | Bajo — ninguna decisión del IRB de Infraestructura (Circuit Breaker, Outbox, cola, feature flags) fue reabierta ni modificada |
| Compatibilidad hacia atrás | Total |
| Confirmación de origen | Deriva exclusivamente de ACP-001-A (confirmación de no-nuevo-componente) y ACP-001-C (renombrado de campo, sin cambio de firma de `save`) |

### `academia-functional-specification` — v1.1 → v1.2

| Campo | Valor |
|---|---|
| Versión anterior | 1.1 (FROZEN → pasa a `SUPERSEDED`) |
| Nueva versión | 1.2 (FROZEN) |
| Motivo del cambio | ACP-001-B, ACP-001-C |
| Secciones modificadas | Encabezado (Historial de cambios, Documentos dependientes); Sección 2 (Usuarios — fila Profesor); Sección 4 (Estructura funcional — Biblioteca de Modelos); Sección 6 (Flujo del profesor, puntos 1 y 4); Sección 7 (CU-08, CU-09, CU-11); Sección 10 (IA); Sección 15 (Dependencias); Sección 17 (Checklist); Evaluación final; Certificado de Congelación |
| Impacto | Medio — ninguna regla funcional fue alterada en su efecto; se corrigieron dos imprecisiones (F-02, F-09) sin introducir funcionalidad nueva |
| Compatibilidad hacia atrás | Total — ningún criterio de aceptación, regla funcional ni caso de uso cambió su comportamiento; solo se precisó su alcance |
| Confirmación de origen | Deriva exclusivamente de ACP-001-B (decisión oficial: no existe `Group`/`GroupId`) y ACP-001-C (decisión oficial: separación estático/IA) |

### `academia-api-contract` — v1.0 → v1.1

| Campo | Valor |
|---|---|
| Versión anterior | 1.0 (Review) |
| Nueva versión | 1.1 |
| Motivo del cambio | ACP-001-A, ACP-001-B, ACP-001-C |
| Secciones modificadas | Encabezado (Historial de cambios); Sección 4 (nuevos `EP-21`, `EP-22`; nota de "grupo" en EP-07/EP-08 actualizada); Sección 5 (`ModelExampleDTO.curatorialComment`, renombrado); "PENDIENTES DE DECISIÓN DE API" (#1 y #2 cerrados); Validación final; Dictamen final (`REQUIRES API REVIEW` → `READY FOR FRONTEND CONTRACT`) |
| Impacto | Alto — dos endpoints nuevos, dos pendientes estructurales cerrados |
| Compatibilidad hacia atrás | Total — ningún endpoint, DTO o código HTTP ya documentado en v1.0 cambió su contrato; `ModelExampleDTO` gana un campo con nombre corregido antes de que existiera ningún consumidor real (el documento nunca llegó a Frozen en v1.0) |
| Confirmación de origen | Deriva exclusivamente de ACP-001-A (EP-21/EP-22), ACP-001-B (grupo) y ACP-001-C (renombrado de campo) |

### Documentos **no modificados** (correctamente fuera de alcance)

- **Domain Model v1.1** — no listado como afectado por ningún sub-ACP; ninguna sección tocada. `UnitStep`, `Attempt`, `TeacherOverride` y demás elementos permanecen idénticos.
- **Product Blueprint, Arquitectura General, Platform Core Foundation** — no listados como afectados por ACP-001; sin cambios.
- **Resoluciones A-01 a A-10** — no reinterpretadas ni modificadas.

---

## FUERA DEL ALCANCE DE ACP-001 (registrado, no resuelto)

1. **`CMD-11 AssignUnitToStudent`** conserva su marcador `PENDIENTE DE DECISIÓN DE ARQUITECTURA` en el Application Model v1.1, pese a que la Functional Specification v1.2 y el API Contract v1.1 ya reflejan la resolución ARB de "recomendar" (metadato, sin efecto de estado). El Application Model no fue listado como documento afectado por ACP-001-B.
2. **`QRY-08 GetGroupProgressSummary`** conserva su filtro `groupId` en el Application Model v1.1, pese a la decisión oficial de ACP-001-B de que no existe `GroupId` en el proyecto. Mismo motivo que el punto anterior.
3. **Umbrales de rate limiting** y **vocabulario completo del campo `code` de error** (API Contract, Pendientes #3 y #4) — no forman parte de los tres hallazgos que originaron ACP-001 (F-01, F-02, F-09); permanecen abiertos, sin cambio.
4. **Hallazgos F-03, F-04, F-05, F-06, F-08, F-10** de la Coverage Audit (clasificación DOCUMENTACIÓN/AMBIGÜEDAD de bajo impacto) — ninguno forma parte del alcance autorizado de ACP-001; ninguno fue tocado.

Estos cuatro puntos quedan registrados para un futuro ACP independiente (previsiblemente ACP-002), consistente con la regla "no crear nuevos ACP" de este encargo — se documentan, no se resuelven.

---

## VALIDACIÓN

| Verificación | Resultado |
|---|---|
| ✓ Ningún documento fuera del alcance fue modificado | **Cumple.** Domain Model, Product Blueprint, Arquitectura General, Platform Core Foundation y las resoluciones A-01–A-10 permanecen bit-a-bit idénticos a su versión previa a este ACP. |
| ✓ El Domain Model permanece idéntico | **Cumple.** `CMD-16`/`CMD-17` (ACP-001-A) operan sobre la capacidad de transición de `UnitStep` que el Aggregate `Attempt` ya debía sostener desde v1.0 (la precondición de `CMD-02` ya referenciaba "puerta de comprensión satisfecha, RN-2" antes de este ACP) — no se agregó ningún método, evento, Policy ni Value Object nuevo al Domain Model. |
| ✓ La Functional Specification elimina la ambigüedad de grupo | **Cumple.** Ninguna mención residual de "grupo" queda sin la aclaración de selección múltiple (verificado por búsqueda exhaustiva sobre el documento v1.2). |
| ✓ El Application Model cubre completamente la Verificación de Comprensión | **Cumple.** `CMD-16`/`CMD-17` cubren los 6 pasos previamente sin orquestación (Hallazgo F-01 de la Coverage Audit). |
| ✓ El API Contract refleja exactamente los nuevos Commands y DTOs | **Cumple.** `EP-21`↔`CMD-16`, `EP-22`↔`CMD-17`, ambos con trazabilidad 1:1 declarada explícitamente. |
| ✓ Infrastructure continúa siendo compatible | **Cumple.** Ningún adaptador, Repository ni patrón ya resuelto por el IRB fue alterado; `AttemptRepository`/`ModelExampleRepository` absorben los cambios sin extender su firma. |
| ✓ Platform Core no requiere cambios | **Cumple.** Ninguno de los tres sub-ACP toca Notification Catalog, Permission Catalog ni ningún otro componente del Platform Core Foundation. |

---

## AUDITORÍA FINAL — Matriz de trazabilidad

### ACP-001-A

```
ACP-001-A
   ↓
Documentos modificados: Application Model (v1.1), Infrastructure Model (v1.1), API Contract (v1.1)
   ↓
Elementos añadidos: CMD-16 AdvanceStep, CMD-17 VerifyComprehension, EP-21, EP-22
   ↓
Cobertura obtenida: CU-02 (Functional Spec v1.2) con orquestación 100% completa —
UnitStep (11 valores) íntegramente cubierto por Application/Infrastructure/API — cierra F-01
```

### ACP-001-B

```
ACP-001-B
   ↓
Documentos modificados: Functional Specification (v1.2), API Contract (v1.1)
   ↓
Elementos modificados: Sección 2/6/7 (CU-09, CU-11) de Functional Spec;
nota de "grupo" y Pendiente #2 en API Contract (EP-07/EP-08/EP-20)
   ↓
Cobertura obtenida: alcance de CU-09 y CU-11 100% definido a nivel de estudiante individual
(selección múltiple orquestada por Frontend) — cierra F-02
```

### ACP-001-C

```
ACP-001-C
   ↓
Documentos modificados: Functional Specification (v1.2), Infrastructure Model (v1.1), API Contract (v1.1)
   ↓
Elementos modificados: Sección 4/7/10 de Functional Spec (comentario curatorial, no IA);
nota de ModelExampleRepository en Infrastructure Model;
ModelExampleDTO.curatorialComment (renombrado) en API Contract
   ↓
Cobertura obtenida: origen del comentario comparativo de la Biblioteca de Modelos
inequívocamente estático/Administrador en los tres documentos — cierra F-09
```

---

## RESULTADO

**1. ACP-001 ejecutado correctamente.**

**2. Lista exacta de documentos actualizados:**
- `academia-application-model-v1.1-2026-07-19.md`
- `academia-infrastructure-model-v1.1-2026-07-19.md`
- `academia-functional-specification-v1.2-2026-07-19.md`
- `academia-api-contract-v1.1-2026-07-19.md`

**3. Nuevas versiones oficiales:**

| Documento | Versión anterior | Versión nueva |
|---|---|---|
| Application Model | 1.0 | **1.1** |
| Infrastructure Model | 1.0 (DRAFT) | **1.1** (DRAFT — pendiente de aprobación ARB, sin cambio de estado por este ACP) |
| Functional Specification | 1.1 (FROZEN) | **1.2** (FROZEN — v1.1 pasa a `SUPERSEDED`) |
| API Contract | 1.0 (Review) | **1.1** (Review → dictamen actualizado a `READY FOR FRONTEND CONTRACT`) |

**4. Confirmación de que el proyecto está listo para ejecutar una Coverage Audit final: SÍ.**

Los tres hallazgos que originaron ACP-001 (F-01, F-02, F-09) fueron cerrados en las cuatro capas correspondientes, sin modificar el Domain Model ni ninguna resolución A-01–A-10. Los elementos registrados como `FUERA DEL ALCANCE DE ACP-001` (CMD-11/QRY-08 sin actualizar, Pendientes #3/#4 de API, y los seis hallazgos DOCUMENTACIÓN/AMBIGÜEDAD de bajo impacto) no impidieron la ejecución de este ACP y quedan correctamente documentados como trabajo pendiente para un ciclo posterior — una nueva Coverage Audit debe ejecutarse para confirmar formalmente el cierre de F-01/F-02/F-09 y para volver a evaluar si esos elementos fuera de alcance ameritan un ACP-002.
