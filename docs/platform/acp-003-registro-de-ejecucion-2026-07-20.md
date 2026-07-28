# ACP-003 — Registro de Ejecución (Teacher Review Visibility)

**Rol:** Release Engineer y Documentation Integrator, Rédaction Lab. No arquitecto, no autor del ACP, no debe tomar decisiones nuevas. Ejecución exacta de ACP-003 conforme al `Architecture Change Management Standard v1.0`.
**Fecha de ejecución:** 2026-07-20.
**Origen:** inconsistencia detectada durante la elaboración de `academia-frontend-contract-v1.0-2026-07-20.md` (dictamen `B) REQUIRES FRONTEND REVIEW`) — la Functional Specification describía narrativamente una capacidad del Profesor sin Query en Application Model ni endpoint en API Contract.
**Decisión arquitectónica ya aprobada (no reabierta aquí):** la capacidad de revisión del historial académico de un estudiante es parte oficial del producto; amplía exclusivamente el lado de lectura (Query Side de CQRS); no modifica Domain Model, Aggregates, Value Objects, Domain Events ni reglas de negocio.

---

## 1. Documentos actualizados

| Documento | Versión anterior | Versión nueva |
|---|---|---|
| Application Model | 1.2 | **1.3** |
| API Contract | 1.1 | **1.2** |
| Functional Specification | 1.2 (FROZEN) | **1.3 (FROZEN)** |
| Frontend Contract | 1.0 (Review) | **1.1** |

**No modificados (confirmado):** Product Blueprint, Arquitectura General, Platform Core Foundation, Domain Model, Infrastructure Model, Architecture Change Management Standard v1.0, ACP-001, ACP-002.

---

## 2. Control de Cambios por documento

### Application Model v1.2 → v1.3
- **Secciones modificadas:** Historial de cambios (nueva fila); nueva entrada `QRY-10 — GetStudentUnitHistory` (tras `QRY-09`); Sección 5 (fila consolidada de Queries); Sección 6 (nuevo DTO `StudentUnitHistoryDTO`); Sección 12/Seguridad (lista de operaciones permitidas al Profesor).
- **Motivo del cambio:** ACP-003 — incorporar el Query de lectura necesario para exponer producciones, versiones, retroalimentación, estado y progreso de una unidad de un estudiante al Profesor.
- **Compatibilidad hacia atrás:** total. Ningún Command, Query, DTO, Repository o Policy existente cambia de firma o comportamiento; `QRY-10` reutiliza exclusivamente `AcademyUnitRepository` y `AttemptRepository`, ya definidos.
- **Referencia explícita a ACP-003:** sí, en cada elemento añadido.

### API Contract v1.1 → v1.2
- **Secciones modificadas:** Historial de cambios (nueva fila); Sección 3 (nuevo recurso `academy/students/{id}/units/{id}/history`); Sección 4 (nuevo `EP-23`); Sección 5 (nuevo DTO `StudentUnitHistoryDTO`).
- **Motivo del cambio:** ACP-003 — exponer `QRY-10` como endpoint REST accesible al rol `TEACHER`.
- **Compatibilidad hacia atrás:** total. Ningún endpoint, código HTTP, envoltorio de error o convención global (Sección 2) fue modificado; `EP-23` reutiliza exactamente el mismo patrón de autorización ya usado por `EP-07`/`EP-08`/`EP-20`.
- **Referencia explícita a ACP-003:** sí.

### Functional Specification v1.2 → v1.3 (FROZEN → FROZEN)
- **Secciones modificadas:** Historial de cambios (nueva fila); Sección 2 (fila Profesor); Sección 6 (punto 2 del flujo); Sección 7 (nueva `CU-12`); Evaluación final y Certificado de Congelación (versión bumped).
- **Motivo del cambio:** ACP-003 — eliminar la contradicción entre el texto narrativo (ya presente desde v1.0) y la ausencia de una definición formal de Caso de Uso para esa misma capacidad.
- **Compatibilidad hacia atrás:** total. Ninguna regla funcional previa (Sección 8), criterio de aceptación (Sección 16) o caso de uso existente (CU-01 a CU-11) fue alterado; `CU-12` es puramente aditivo.
- **Referencia explícita a ACP-003:** sí. Reemitida como FROZEN conforme al `Architecture Change Management Standard v1.0` (modificación de un documento Frozen únicamente vía ACP aprobado).

### Frontend Contract v1.0 → v1.1
- **Secciones modificadas:** Historial de cambios (nueva, primera vez que este documento la incluye); Sección 3 (nueva ruta); Sección 4 (P-13 actualizado, nueva `P-15`); Sección 5 (dos componentes nuevos); Sección 7 (fila `EP-23`); Sección 13.3 (diagrama del Profesor); Sección 14 (checklist); Validación Final, nueva Consistency Validation, Resultado y Dictamen (actualizados de B a A).
- **Motivo del cambio:** ACP-003 — completar la pantalla pendiente identificada en la v1.0 de este mismo documento.
- **Compatibilidad hacia atrás:** total. Ninguna de las 14 pantallas, rutas o componentes de v1.0 fue rediseñada o eliminada.
- **Referencia explícita a ACP-003:** sí.

---

## 3. Evidencia de trazabilidad

```
Functional Specification v1.3 — CU-12 (Sección 7)
        ↓
Application Model v1.3 — QRY-10 GetStudentUnitHistory (reutiliza AcademyUnitRepository + AttemptRepository)
        ↓
API Contract v1.2 — EP-23 GET /api/v1/academy/students/{studentId}/units/{unitId}/history
        ↓
Frontend Contract v1.1 — P-15 (ruta /academy/teacher/students/{studentId}/units/{unitId}/history)
        ↓
StudentUnitHistoryContainer → EP-23 → StudentUnitHistoryDTO
```

Verificación cruzada (grep sobre los cuatro documentos ya sincronizados):
- `QRY-10` aparece en Application Model v1.3 (definición + tabla consolidada + DTO).
- `EP-23` aparece en API Contract v1.2 (endpoint + recurso + DTO) y es citado como dependencia única de `QRY-10`.
- `CU-12` aparece en Functional Specification v1.3 (definición formal + referencias en Secciones 2 y 6).
- `P-15`/`EP-23` aparecen en Frontend Contract v1.1 (pantalla, ruta, componente, integración, diagrama, checklist, dictamen).

Ningún otro Command, Query, Endpoint, DTO, pantalla o componente preexistente fue tocado en ninguno de los cuatro documentos — verificado por revisión directa de cada diff aplicado durante esta ejecución.

---

## 4. VALIDACIÓN

| Verificación | Resultado |
|---|---|
| ✓ El Domain Model permanece idéntico | **Cumple.** Cero ediciones al archivo del Domain Model. |
| ✓ No se agregaron Aggregates | **Cumple.** `QRY-10` opera exclusivamente sobre `AcademyUnit` y `Attempt`, ya existentes. |
| ✓ No se agregaron Domain Events | **Cumple.** `EP-23`/`QRY-10` son de solo lectura; ninguno publica evento. |
| ✓ No se agregaron Commands | **Cumple.** Ningún Command nuevo en Application Model v1.3. |
| ✓ Solo se agregó un Query de lectura | **Cumple.** Exactamente uno: `QRY-10 GetStudentUnitHistory`. |
| ✓ El nuevo endpoint deriva directamente del nuevo Query | **Cumple.** `EP-23` declara `QRY-10` como su única dependencia, sin intermediarios. |
| ✓ El Frontend Contract consume exclusivamente ese endpoint | **Cumple.** `P-15` tiene una única dependencia de API: `EP-23`. |
| ✓ Desaparece completamente la inconsistencia detectada durante Frontend Review | **Cumple.** La Nota de alcance de P-13 (v1.0) fue reemplazada por la resolución explícita vía `P-15`; el dictamen del Frontend Contract pasa de `B) REQUIRES FRONTEND REVIEW` a `A) READY FOR IMPLEMENTATION`. |

---

## 5. CONSISTENCY VALIDATION — "Teacher Review Visibility"

| Capa | Estado |
|---|---|
| Functional Specification → Application Model | `CU-12` ↔ `QRY-10`: mismo actor (Profesor), mismas precondiciones (relación docente-estudiante), mismo resultado (vista de solo lectura). Coherente. |
| Application Model → API Contract | `QRY-10` ↔ `EP-23`: mapeo 1:1, mismo DTO (`StudentUnitHistoryDTO`), mismos filtros (`studentId`, `unitId`). Coherente. |
| API Contract → Frontend Contract | `EP-23` ↔ `P-15`: única dependencia de API declarada; misma forma de datos consumida sin transformación no documentada. Coherente. |

**No se ejecutó una auditoría completa** — validación limitada exclusivamente a esta capacidad, conforme a la instrucción explícita de este ACP.

---

## FUERA DEL ALCANCE DE ACP-003 (registrado, no resuelto)

Ningún hallazgo nuevo ajeno al alcance fue detectado durante esta ejecución. Los residuos ya registrados por auditorías/ejecuciones previas (discrepancia `rating`/`status` en `ModelExampleDTO`; numeración `QRY-XX` desalineada en `EP-17`–`EP-20`; conteo desactualizado en la Sección 1 del API Contract; rate limiting; vocabulario del Error Catalog) permanecen sin cambios — no fueron tocados por esta ejecución, no forman parte del alcance de ACP-003.

---

## RESULTADO

1. **Documentos actualizados:** Application Model, API Contract, Functional Specification, Frontend Contract (los cuatro exigidos por el alcance de ACP-003; ningún otro documento fue tocado).
2. **Nuevas versiones:** Application Model v1.3; API Contract v1.2; Functional Specification v1.3 (FROZEN); Frontend Contract v1.1.
3. **Evidencia de trazabilidad:** cadena completa CU-12 → QRY-10 → EP-23 → P-15, verificada por grep cruzado sobre los cuatro documentos ya sincronizados (repositorio anidado y espejo raíz, `diff -q` idéntico en los cuatro casos).
4. **Confirmación:** ACP-003 quedó **completamente ejecutado** dentro de su alcance autorizado. Las ocho verificaciones obligatorias de la Sección VALIDACIÓN se cumplen sin excepción; la Consistency Validation confirma alineación completa en las cuatro capas; la inconsistencia que originó el ACP desapareció por completo.

---

## DICTAMEN FINAL

**A) ACP-003 EXECUTED SUCCESSFULLY — FRONTEND CONTRACT READY FOR IMPLEMENTATION**

**Justificación con evidencia documental:** los cuatro documentos exigidos por el alcance fueron actualizados exactamente como fue autorizado — un único Query de lectura (`QRY-10`), un único endpoint derivado de él (`EP-23`), un único Caso de Uso formalizado (`CU-12`) y una única pantalla nueva (`P-15`), sin tocar ningún Aggregate, Value Object, Domain Event, Command, Endpoint, pantalla o componente preexistente. La verificación por grep confirma cero residuos y trazabilidad 1:1 en las cuatro capas. El propio Frontend Contract v1.1, auditado como parte de esta ejecución, actualiza su dictamen de `B) REQUIRES FRONTEND REVIEW` a `A) READY FOR IMPLEMENTATION` con evidencia directa de que la única causa de la revisión pendiente fue resuelta.
