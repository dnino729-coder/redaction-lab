# INVESTIGACIÓN FORENSE — Reconstrucción de la cadena de gobernanza (ACP-008 / ACP-009)

**Versión:** 1.0
**Fecha:** 2026-08-02
**Autor:** Architecture Change Control Board (ACCB), Rédaction Lab
**Naturaleza de este documento:** investigación forense de repositorio, no una auditoría arquitectónica ni un Architecture Change Proposal. No evalúa contenido técnico, no propone ACP, no modifica ningún archivo.
**Estado documental:** `EMITIDA` — registro histórico de un relevamiento puntual del repositorio en la fecha indicada. Conforme al Architecture Change Management Standard v1.5.1, §2 (*"Documentos de auditoría/revisión ya emitidos... son registros históricos de un momento dado; nunca se editan, solo se superan mediante una auditoría nueva y posterior"*), este documento no requiere ACP para su emisión y es inmutable una vez emitido.

**Historial de cambios**

| Versión | Fecha | Origen | Cambio |
|---|---|---|---|
| 1.0 | 2026-08-02 | Emisión inicial | Investigación forense inicial, ejecutada tras la Auditoría de Gobernanza Global que detectó la ausencia física de ACP-008 y ACP-009 pese a ser citados por Architecture Change Management Standard v1.1 a v1.5.1. |

**Alcance de este documento:** determinar, exclusivamente mediante evidencia verificable del repositorio (`grep`/`find` directos), si existe una ruptura real de persistencia documental respecto de ACP-008 y ACP-009, o únicamente un problema de localización/nomenclatura de archivos. No evalúa si la ruptura debe corregirse ni cómo — eso corresponde a un documento posterior (Resolución de Gobernanza).

---

## 1. Inventario completo de ACP (archivos físicos reales)

| ACP | Archivo(s) físico(s) | Estado en el propio archivo |
|---|---|---|
| ACP-001 | `acp-001-registro-de-ejecucion-2026-07-19.md` | Ejecutado (APROBADO) |
| ACP-002 | `acp-002-registro-de-ejecucion-2026-07-20.md` | Ejecutado (APROBADO) |
| ACP-003 | `acp-003-registro-de-ejecucion-2026-07-20.md` | Ejecutado (APROBADO) |
| ACP-004 | `acp-004-confirmacion-productor-versioncount-2026-07-29.md` + `acp-004-registro-de-ejecucion-2026-07-29.md` | APROBADO / Ejecutado |
| ACP-005 | `acp-005-platform-core-synchronous-integration-pattern-2026-07-31.md` | PENDIENTE DE APROBACIÓN |
| ACP-006 | `acp-006-...-2026-08-02.md` (v1.0) + `acp-006-...-v1.1-2026-08-02.md` | PENDIENTE DE APROBACIÓN (ambos, en su propio texto) |
| ACP-007 | `acp-007-...-2026-08-02.md` (v1.0), `-v1.1-...md`, `-v1.2-...md` | PENDIENTE DE APROBACIÓN (las tres versiones) |
| **ACP-008** | **Ninguno** | No existe |
| **ACP-009** | **Ninguno** | No existe |

## 2. Referencias cruzadas (todas las ocurrencias reales, por archivo y línea)

**ACP-008** — 28 ocurrencias totales, distribuidas exclusivamente en:
- `redaction-lab-architecture-change-management-standard-v1.1-2026-08-02.md` (14 líneas)
- `-v1.2-...md` (4 líneas), `-v1.3-...md` (4 líneas), `-v1.4-...md` (3 líneas), `-v1.5-...md` (4 líneas), `-v1.5.1-...md` (4 líneas)

**Ninguna** ocurrencia de "ACP-008" aparece fuera de la propia familia de archivos del Standard — no aparece en ningún ACP real (005/006/007), ni en ningún documento de Academia u Organization Management.

**ACP-009** — 2 ocurrencias totales, ambas dentro de `redaction-lab-architecture-change-management-standard-v1.5.1-2026-08-02.md` (líneas 18 y 19 — las dos filas del Historial de cambios que el propio v1.5.1 añadió sobre sí mismo).

**En ambos casos: 100% de las referencias son auto-citas del Standard sobre sí mismo.** Ningún archivo *distinto* del Standard menciona ni ACP-008 ni ACP-009.

## 3. Evidencia encontrada (búsquedas adicionales solicitadas)

| Término buscado | Resultado |
|---|---|
| "Hallazgo heredado" | **0 archivos** |
| "Diseño del mecanismo" | **0 archivos** |
| "tres criterios" / "siete criterios" | Solo dentro de `redaction-lab-architecture-change-management-standard-v1.5*` (auto-cita) |
| "C-12", "C-13", "C-14" | Solo dentro de `standard-v1.5-...md` y `standard-v1.5.1-...md` (auto-cita, describiendo su propio Historial de cambios) |
| "Investigación" + "Gobernanza" (co-ocurrencia) | 1 archivo: `acp-007-...-2026-08-02.md` (v1.0) — verificado que es una mención genérica dentro de su propio texto, no una copia de la "Investigación de Gobernanza — Hallazgo heredado en VALIDACIÓN FINAL" citada por ACP-009 (esa investigación específica no existía, al momento de este relevamiento, como archivo en ningún lugar) |
| Archivos modificados en la misma ventana temporal que v1.5.1 (posible archivo hermano mal nombrado) | Ninguno, salvo el propio v1.5.1 |

**No se encontró ningún archivo cuyo contenido corresponda, con otro nombre, a ACP-008 o ACP-009.** No se encontró ningún duplicado. No se encontró ningún archivo sobrescrito (los tamaños y timestamps de `redaction-lab-architecture-change-management-standard-v1.1` a `v1.5.1` son todos distintos y progresivos, consistente con archivos separados, no con sobrescrituras).

## 4. ACP faltantes reales

**ACP-008 y ACP-009, en su totalidad.** No existe ningún artefacto físico — ni con ese nombre, ni con nombre distinto, ni como sección dentro de otro documento, ni como versión de otro ACP.

## 5. Cadena documental reconstruida

```
ACP-005 (archivo real, PENDIENTE DE APROBACIÓN)
   ↓
[Investigación de Gobernanza sobre patrón de integración — solo existió como respuesta conversacional, nunca persistida]
   ↓
ACP-006 → ACP-006 v1.1 (archivos reales, ambos PENDIENTE DE APROBACIÓN en su propio texto)
   ↓
ACP-007 → v1.1 → v1.2 (archivos reales, los tres PENDIENTE DE APROBACIÓN)
   ↓
["Diseño del mecanismo" — solo existió como respuesta conversacional, nunca persistido]
   ↓
"ACP-008" — citado por Standard v1.1 en adelante como "(FROZEN)" — NUNCA CREADO COMO ARCHIVO
   ↓
["Investigación de Gobernanza — Hallazgo heredado en VALIDACIÓN FINAL" — solo existió como respuesta conversacional, nunca persistida]
   ↓
"ACP-009" (v1.0 y v1.1) — citado por Standard v1.5.1 como "(APROBADO)" — NUNCA CREADO COMO ARCHIVO
   ↓
Standard v1.5.1 — declarado FROZEN citando ACP-009 v1.1 como autorización
```

## 6. Causa de la ruptura

**D. Archivo nunca persistido.**

Se descartan explícitamente, por evidencia directa: (B) cambio de nombre — no existe ningún archivo con contenido equivalente bajo otro nombre; (C) consolidación — ningún otro ACP o documento contiene el texto de ACP-008/009; sobrescritura/duplicado — los tamaños y timestamps de todos los archivos de la familia Standard son consistentes y progresivos, sin indicio de pérdida de un archivo intermedio.

## 7. Dictamen final

**Confirmada.**

La ruptura detectada por la Auditoría de Gobernanza Global queda **confirmada, no descartada**: ACP-008 y ACP-009 —junto con sus dos documentos de estudio previos ("Diseño del mecanismo" e "Investigación de Gobernanza — Hallazgo heredado")— fueron redactados como respuestas de una conversación de trabajo pero **nunca escritos a disco**. El Standard v1.5.1, en ese momento marcado `FROZEN`, citaba como autorización dos artefactos que no existían físicamente en el repositorio.
